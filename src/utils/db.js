/**
 * db.js — Supabase data layer
 * All reads/writes go to the `jobs` table.
 * Planned dates and delay hours are calculated using the working-hours engine.
 */
import { supabase } from './supabase.js';
import { syncJobToSheets } from './sync.js';
import {
  calcS2Planned,
  calcS3Planned,
  calcS4Planned,
  calcS5JamaPlanned,
  calcDelay,
} from './workingHours.js';

/** Serialize a Date (or null) to an ISO string for Supabase. */
function toISO(d) {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function snakeToCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v ?? '';
  }
  return out;
}

async function fetchAndSync(jobNo) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_no', String(jobNo).trim())
    .maybeSingle();

  if (!error && data) {
    const job = snakeToCamel(data);
    // Background sync to Sheets
    syncJobToSheets(job).catch(err => console.error('Sync error:', err));
  }
}

// ─── 1. Get all jobs (Dashboard, Reports) ────────────────────────────────────
export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('job_no', { ascending: false });

  if (error) throw new Error(`getAllJobs: ${error.message}`);
  return (data ?? []).map(snakeToCamel).filter(Boolean);
}

// ─── 2. Get single job by job_no (Steps 2-6 form fetch) ──────────────────────
export async function getJobFromFMS(jobNumber) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_no', String(jobNumber).trim())
    .maybeSingle();

  if (error) throw new Error(`getJobFromFMS: ${error.message}`);
  return snakeToCamel(data);
}

// ─── 3. Create new job — Step 1 ──────────────────────────────────────────────
export async function createJob({ progBy, item, itemGroup, size, qty, reason, specialInstruction }) {
  // Auto-generate a professional prefix-based job number
  const jobNoString = await getNextJobNo(itemGroup);

  // Stage 1 actual = exact submission timestamp
  const stage1Actual = new Date();

  // Pre-compute s2_planned from this submission time
  const s2Planned = calcS2Planned(stage1Actual);

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      job_no:              jobNoString,
      date:                toISO(stage1Actual),       // exact submission timestamp
      prog_by:             progBy,
      item,
      item_group:          itemGroup,
      size,
      qty:                 Number(qty) || null,
      reason,
      special_instruction: specialInstruction || null,
      s2_planned:          toISO(s2Planned),          // pre-computed planned due
    })
    .select()
    .single();

  if (error) throw new Error(`createJob: ${error.message}`);

  const job = snakeToCamel(data);
  syncJobToSheets(job).catch(err => console.error('Initial sync error:', err));
  return job;
}

// ─── 4. Update step 2 — Production Approval ──────────────────────────────────
export async function updateStep2(jobNo, { yesNo, instructions, inhouseCutting }) {
  // Fetch existing job to read s2_planned for delay calculation
  const { data: existing } = await supabase
    .from('jobs')
    .select('s2_planned')
    .eq('job_no', String(jobNo).trim())
    .maybeSingle();

  const s2Actual  = new Date();                        // exact submission timestamp
  const s2Planned = existing?.s2_planned ?? null;
  const s2Delay   = calcDelay(s2Planned, s2Actual);    // working hours of delay

  // Compute next stage's planned date
  const s3Planned = calcS3Planned(s2Actual);

  const { error } = await supabase
    .from('jobs')
    .update({
      s2_actual:       toISO(s2Actual),
      s2_yes_no:       yesNo ? 'Yes' : 'No',
      s2_instructions: instructions || null,
      s2_inhouse:      inhouseCutting ? 'Yes' : 'No',
      s2_delay:        s2Delay > 0 ? s2Delay : null,
      s3_planned:      toISO(s3Planned),               // plan for next stage
    })
    .eq('job_no', String(jobNo).trim());

  if (error) throw new Error(`updateStep2: ${error.message}`);
  fetchAndSync(jobNo);
}

// ─── 5. Update step 3 — Inhouse Cutting ──────────────────────────────────────
export async function updateStep3(jobNo, { cuttingPcs, sizeDetails, name }) {
  const { data: existing } = await supabase
    .from('jobs')
    .select('s3_planned, s3_actual')
    .eq('job_no', String(jobNo).trim())
    .maybeSingle();

  if (existing?.s3_actual) {
    throw new Error(`Cutting for Job #${jobNo} has already been logged.`);
  }

  const s3Actual  = new Date();
  const s3Planned = existing?.s3_planned ?? null;
  const s3Delay   = calcDelay(s3Planned, s3Actual);

  // Compute next stage's planned date
  const s4Planned = calcS4Planned(s3Actual);

  const { error } = await supabase
    .from('jobs')
    .update({
      s3_actual:         toISO(s3Actual),
      s3_dukan_cutting:  Number(cuttingPcs) || null,
      s3_size_details:   sizeDetails || null,
      s3_cutting_person: name,
      s3_delay:          s3Delay > 0 ? s3Delay : null,
      s4_planned:        toISO(s4Planned),
    })
    .eq('job_no', String(jobNo).trim());

  if (error) throw new Error(`updateStep3: ${error.message}`);
  fetchAndSync(jobNo);
}

// ─── 6. Update step 4 — Naame ────────────────────────────────────────────────
export async function updateStep4(jobNo, { thekedarName, cutToPack, leadTime, cuttingPcs }) {
  const { data: existing } = await supabase
    .from('jobs')
    .select('s4_planned, s5_lead_time_hours')
    .eq('job_no', String(jobNo).trim())
    .maybeSingle();

  const s4Actual   = new Date();
  const s4Planned  = existing?.s4_planned ?? null;
  const s4Delay    = calcDelay(s4Planned, s4Actual);

  // leadTime provided in the form is in HOURS (for Jama planning)
  // Note: s5_lead_time_hours may have been set to a prior default;
  // the form's leadTime field here is the TAT in hours for Jama.
  const leadTimeHours = Number(leadTime) || Number(existing?.s5_lead_time_hours) || null;
  const s5JamaPlanned = calcS5JamaPlanned(s4Actual, leadTimeHours);

  const { error } = await supabase
    .from('jobs')
    .update({
      s4_start_date:       toISO(s4Actual),
      s4_thekedar:         thekedarName,
      s4_cut_to_pack:      cutToPack ? 'Yes' : 'No',
      s4_lead_time:        Number(leadTime) || null,
      s4_cutting_pcs:      Number(cuttingPcs) || null,
      s4_delay:            s4Delay > 0 ? s4Delay : null,
      s5_lead_time_hours:  leadTimeHours,
      s5_jama_planned:     toISO(s5JamaPlanned),       // Jama planned deadline
    })
    .eq('job_no', String(jobNo).trim());

  if (error) throw new Error(`updateStep4: ${error.message}`);
  fetchAndSync(jobNo);
}

// ─── 7. Update step 5 — Finished Maal Jama ───────────────────────────────────
export async function updateStep5(jobNo, { jamaQty, pressHua }) {
  const { data: existing } = await supabase
    .from('jobs')
    .select('s5_jama_planned')
    .eq('job_no', String(jobNo).trim())
    .maybeSingle();

  const s5Actual    = new Date();
  const s5Planned   = existing?.s5_jama_planned ?? null;
  const s5Delay     = calcDelay(s5Planned, s5Actual);

  const { error } = await supabase
    .from('jobs')
    .update({
      s5_jama_qty: Number(jamaQty) || null,
      s5_press:    pressHua ? 'Yes' : 'No',
      s5_status:   'Complete',
      s5_delay:    s5Delay > 0 ? s5Delay : null,      // working-hour delay
    })
    .eq('job_no', String(jobNo).trim());

  if (error) throw new Error(`updateStep5: ${error.message}`);
  fetchAndSync(jobNo);
}

// ─── 8. Update step 6 — Settle ───────────────────────────────────────────────
export async function updateStep6(jobNo, { settleQty, reason, yourName }) {
  const { error } = await supabase
    .from('jobs')
    .update({
      s6_settle_qty: Number(settleQty) || null,
      s6_reason:     reason || null,
      s6_name:       yourName,
    })
    .eq('job_no', String(jobNo).trim());

  if (error) throw new Error(`updateStep6: ${error.message}`);
  fetchAndSync(jobNo);
}

// ─── 9. Suggest next job number ──────────────────────────────────────────────
export async function getNextJobNo() {
  // Fetch all job numbers to find the true max integer
  // (Since job_no is text, string sorting wouldn't work for numeric values)
  const { data, error } = await supabase
    .from('jobs')
    .select('job_no');

  if (error) throw new Error(`getNextJobNo: ${error.message}`);
  
  let maxJobNo = 0;
  if (data && data.length > 0) {
    data.forEach(j => {
      // Allow for purely numeric job numbers like "494"
      const num = parseInt(j.job_no, 10);
      if (!isNaN(num) && num > maxJobNo) {
         maxJobNo = num;
      }
    });
  }

  // If no numeric job numbers exist, default to 1, else max + 1
  const newJobNo = maxJobNo > 0 ? maxJobNo + 1 : 1;
  return String(newJobNo);
}

// ─── 10. Admin raw update — Data Correction ──────────────────────────────────
/**
 * adminUpdateJob — allows the admin to overwrite any fields on a job.
 * `updates` should be a plain object with **snake_case** column names.
 * No cascade recalculation is performed — this is intentional for corrections.
 */
export async function adminUpdateJob(jobNo, updates) {
  if (!jobNo || !updates || Object.keys(updates).length === 0) {
    throw new Error('adminUpdateJob: jobNo and at least one update field are required.');
  }

  const { error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('job_no', String(jobNo).trim());

  if (error) throw new Error(`adminUpdateJob: ${error.message}`);

  // Trigger background sync to Google Sheets
  fetchAndSync(jobNo);
}
