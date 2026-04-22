import { workingHoursBetween } from './workingHours';

// Delay thresholds mapped from existing business logic (previously in days)
// Converted to working hours (9 hr/day):
export const DELAY_THRESHOLDS_HOURS = {
  2: 27,   // Pending Approval (3 days)
  3: 18,   // Pending Cutting (2 days)
  4: 18,   // Pending Naame (2 days)
  5: 126,  // Pending Jama (14 days)
  6: 27    // Pending Settle (3 days)
};

const s = (val) => (val !== null && val !== undefined && String(val).trim()) ? String(val).trim() : '';

const isYes = (v) => v === true || String(v).trim().toLowerCase() === 'yes';

/**
 * Evaluates the definitive Next Pending Step for a given job.
 * 2: Pending Approval
 * 3: Pending Inhouse Cutting
 * 4: Pending Naame (In Production)
 * 5: Pending Jama
 * 6: Pending Settle
 * 7: Done (Completed or Rejected)
 */
export function getPendingStep(job) {
  if (!job) return 1;
  const jamaQty   = Number(job.s5JamaQty || 0);
  const settleQty = Number(job.s6SettleQty || 0);
  const reqQty    = Number(job.qty || 0);

  // Step 7: Done (Requires both Jama AND Settle entries, and total accounted >= Requirement)
  if (s(job.s5JamaQty) && s(job.s6SettleQty) && (jamaQty + settleQty >= reqQty)) return 7; 
  
  if (s(job.s5JamaQty) || s(job.s5Status).toLowerCase() === 'complete' || s(job.s6SettleQty)) return 6;
  if (s(job.s4StartDate)) return 5;
  if (s(job.s3Actual) || s(job.s3DukanCutting)) return 4;
  if (s(job.s2Actual)) {
    if (isYes(job.s2YesNo)) {
      return isYes(job.s2Inhouse) ? 3 : 4;
    }
    return 7; // Rejected is Done
  }
  return 2;
}

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
    2: job.date || job.created_at, 
    3: job.s2Actual,
    4: job.s3Actual || job.s2Actual, // Uses s2Actual if cutting was skipped
    5: job.s4StartDate, 
    6: job.updatedAt || job.s4StartDate // Fallback if no specific s5 date is tracked
  };
  
  const d = parseDate(dateFields[step]);
  if (!d) return false;

  const thresholdHours = DELAY_THRESHOLDS_HOURS[step] || 27; // Default 3 days
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
    2: job.date || job.created_at, 
    3: job.s2Actual,
    4: job.s3Actual || job.s2Actual,
    5: job.s4StartDate, 
    6: job.updatedAt || job.s4StartDate
  };
  const d = parseDate(dateFields[step]);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
