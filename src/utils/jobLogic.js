import { workingHoursBetween } from './workingHours';

// Delay thresholds mapped from existing business logic (previously in days)
// Converted to working hours (9 hr/day):
export const DELAY_THRESHOLDS_HOURS = {
  2: 63,   // Pending Approval (7 days)
  3: 36,   // Pending Cutting (4 days)
  4: 18,   // Pending Naame (2 days)
  5: 126,  // Fallback for Pending Jama
  6: 27    // Pending Settle (3 days)
};

/** Threshold (pcs): if |desiredQty - cumulativeJama| ≤ this, auto-advance to Settle */
export const JAMA_SETTLE_THRESHOLD = 15;

/**
 * Parses the jama trail stored as a JSON string in s5JamaTrail.
 * Each entry: { qty: number, date: string (ISO), pressHua: boolean }
 * @returns {Array<{qty:number, date:string, pressHua:boolean}>}
 */
export function getJamaTrail(job) {
  if (!job) return [];
  const raw = job.s5JamaTrail;
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Returns the cumulative Jama quantity across all trail entries */
export function getCumulativeJama(job) {
  const trail = getJamaTrail(job);
  if (trail.length > 0) {
    return trail.reduce((sum, e) => sum + (Number(e.qty) || 0), 0);
  }
  // Fallback to legacy s5JamaQty field for backward compatibility
  return Number(job?.s5JamaQty || 0);
}

/**
 * Returns the target (desired) quantity for this job:
 * - In-house cutting (s2Inhouse=Yes): target = actual cut pieces (s3DukanCutting)
 * - Open cutting (s2Inhouse=No):      target = original requirement (qty)
 */
export function getDesiredQty(job) {
  if (!job) return 0;
  const isInhouse = String(job.s2Inhouse || '').trim().toLowerCase() === 'yes';
  if (isInhouse) {
    // Use the cutting quantity from step 3 if available, else step 4 cutting pcs
    return Number(job.s3DukanCutting || job.s4CuttingPcs || job.qty || 0);
  }
  // Open cutting: thekedar delivers to original requirement
  return Number(job.qty || 0);
}

/**
 * Returns true if this job's cumulative Jama is within JAMA_SETTLE_THRESHOLD
 * of the desired quantity — meaning it should be advanced to Settle.
 */
export function isJamaComplete(job) {
  const desired = getDesiredQty(job);
  const jama    = getCumulativeJama(job);
  if (jama === 0) return false; // No jama at all yet
  return Math.abs(desired - jama) <= JAMA_SETTLE_THRESHOLD;
}

const s = (val) => (val !== null && val !== undefined && String(val).trim()) ? String(val).trim() : '';

const isYes = (v) => v === true || String(v).trim().toLowerCase() === 'yes';

/**
 * Evaluates the definitive Next Pending Step for a given job.
 * 2: Pending Approval
 * 3: Pending Inhouse Cutting
 * 4: Pending Naame (In Production)
 * 5: Pending Jama  (multi-trail, advances to 6 when within JAMA_SETTLE_THRESHOLD)
 * 6: Pending Settle
 * 7: Done (Completed or Rejected)
 */
export function getPendingStep(job) {
  if (!job) return 1;
  const settleQty = Number(job.s6SettleQty || 0);
  const reqQty    = Number(job.qty || 0);
  const desired   = getDesiredQty(job);
  const cumJama   = getCumulativeJama(job);

  // Step 7: Done — settle exists and total (jama+settle) >= requirement
  if (s(job.s6SettleQty) && (cumJama + settleQty >= reqQty)) return 7;

  // Step 6: Settle — jama is within threshold of desired (auto-advance) OR explicitly settled
  if (s(job.s6SettleQty)) return 6;
  if (cumJama > 0 && isJamaComplete(job)) return 6; // auto-advance to settle

  // Step 5: Jama pending — in production (naame) but jama not yet complete
  if (s(job.s4StartDate)) {
    // If some jama exists but not yet complete, stay at step 5 for more jama
    return 5;
  }

  if (s(job.s3Actual) || s(job.s3DukanCutting)) return 4;
  if (s(job.s2Actual)) {
    if (isYes(job.s2YesNo)) {
      return isYes(job.s2Inhouse) ? 3 : 4;
    }
    return 7; // Rejected is Done
  }
  return 2;
}

/** Alias exported for backward-compatible imports (e.g. AnalyticsHub) */
export const detectStep = getPendingStep;

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Checks if a job has exceeded its working-hour allowance for the CURRENT pending step.
 */
export function isJobDelayed(job) {
  const step = getPendingStep(job);
  if (step === 7 || step === 1) return false;
  
  // Measure time spent from the date the previous step completed
  const dateFields = {
    2: job.date || job.createdAt, 
    3: job.s2Actual,
    4: job.s3Actual || job.s2Actual, // Uses s2Actual if cutting was skipped
    5: job.s4StartDate, 
    6: job.s5Actual || job.updatedAt || job.s4StartDate // Fallback if no specific s5 date is tracked
  };
  
  const d = parseDate(dateFields[step]);
  if (!d) return false;

  let thresholdHours = DELAY_THRESHOLDS_HOURS[step] || 27;

  // Special case for Step 5: Pending Jama
  // Uses Lead Time from Step 4 (entered in days, converted to 9-hr working days)
  if (step === 5) {
    const leadTimeDays = Number(job.s4LeadTime || 14); // Default to 14 days if missing
    thresholdHours = leadTimeDays * 9;
  }

  const hoursSpent = workingHoursBetween(d, new Date());
  
  return hoursSpent > thresholdHours;
}

/**
 * Returns the high-level health status of a job.
 */
export function getJobStatus(job) {
  if (!job) return 'on-track';
  const step = getPendingStep(job);
  if (step === 7) return 'complete';
  return isJobDelayed(job) ? 'late' : 'on-track';
}

/**
 * Returns integer days elapsed in current step (for UI display).
 */
export function getDaysInStep(job) {
  const step = getPendingStep(job);
  if (step === 7 || step === 1) return null;
  const dateFields = {
    2: job.date || job.createdAt, 
    3: job.s2Actual,
    4: job.s3Actual || job.s2Actual,
    5: job.s4StartDate, 
    6: job.s5Actual || job.updatedAt || job.s4StartDate
  };
  const d = parseDate(dateFields[step]);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
