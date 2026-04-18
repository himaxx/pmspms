import { findRowIndex, updateRow, appendRow, getAllJobs as getSheetsJobs } from './sheets.js';
import { FMS_COLUMNS } from './constants.js';
import { supabase } from './supabase.js';

/**
 * Maps a job object (camelCase) to a raw row array for Google Sheets
 */
function jobToRow(job) {
  const row = new Array(48).fill(''); // Adjust size based on FMS_COLUMNS max index
  
  for (const [key, colIndex] of Object.entries(FMS_COLUMNS)) {
    let val = job[key] ?? '';
    
    // Format dates to YYYY-MM-DD for sheets
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('planned') || key.toLowerCase().includes('actual')) {
        if (val && typeof val === 'string' && val.includes('T')) {
            val = val.slice(0, 10);
        }
    }
    
    row[colIndex] = val;
  }
  return row;
}

/**
 * Synchronize a single job to Google Sheets (Upsert logic).
 * If job number exists, updates the row. Otherwise appends.
 */
export async function syncJobToSheets(job) {
  if (!job.jobNo) return;

  try {
    const rowIndex = await findRowIndex(job.jobNo);
    const rowData = jobToRow(job);

    if (rowIndex !== -1) {
      console.log(`Sync: Updating row ${rowIndex} for Job #${job.jobNo}`);
      await updateRow(rowIndex, rowData);
    } else {
      console.log(`Sync: Appending new row disabled for Job #${job.jobNo} (FFMS freeze)`);
      // await appendRow('FFMS', rowData);
    }
  } catch (err) {
    console.error('Failed to sync to Google Sheets:', err);
    // We don't throw here to avoid blocking the main App flow, 
    // but in a production app we might want a retry queue.
  }
}

/**
 * Bulk sync all jobs to Google Sheets.
 * Caution: This fetches all jobs and updates them one by one.
 */
export async function bulkSyncJobs(jobs) {
  console.log(`Starting bulk sync for ${jobs.length} jobs…`);
  let success = 0;
  for (const job of jobs) {
    try {
      await syncJobToSheets(job);
      success++;
    } catch (e) {
      console.error(`Bulk sync failed for Job #${job.jobNo}:`, e);
    }
  }
  return success;
}
/**
 * Pull all data from Google Sheets and update Supabase.
 * Useful if the user makes manual edits in the spreadsheet.
 */
export async function pullSheetsToDatabase() {
  console.log('Sync: Pulling data from Google Sheets…');
  const sheetsJobs = await getSheetsJobs(); // This returns an array of camelCase objects
  
  if (!sheetsJobs || sheetsJobs.length === 0) return 0;

  // Map camelCase back to snake_case for Supabase
  const records = sheetsJobs.map(job => {
    const rec = {};
    const camelToSnake = (s) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    for (const [k, v] of Object.entries(job)) {
      if (k === 'jobNo') rec['job_no'] = String(v);
      else rec[camelToSnake(k)] = (v === '' ? null : v);
    }
    return rec;
  });

  const { error } = await supabase
    .from('jobs')
    .upsert(records, { onConflict: 'job_no' });

  if (error) throw new Error(`Pull sync failed: ${error.message}`);
  return sheetsJobs.length;
}
