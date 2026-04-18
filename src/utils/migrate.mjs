/**
 * migrate.mjs — One-time migration: Google Sheets FMS → Supabase jobs table
 *
 * Run once from the project root:
 *   node src/utils/migrate.mjs
 *
 * Requirements: Your .env.local must have all 5 keys filled in.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Load .env.local manually ────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const SHEET_ID  = env['VITE_SHEET_ID'];
const API_KEY   = env['VITE_API_KEY'];
const SUPABASE_URL  = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY  = env['VITE_SUPABASE_ANON_KEY'];

if (!SHEET_ID || !API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing env vars. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Column indices (matching FMS sheet exactly) ──────────────────────────────
const C = {
  jobNo: 0, date: 1, progBy: 2, item: 3, size: 4, qty: 5,
  reason: 6, specialInstruction: 7, itemGroup: 8,
  s2Planned: 9, s2Actual: 10, s2YesNo: 11, s2Instructions: 12, s2Inhouse: 13, s2Delay: 14,
  s3Planned: 15, s3Actual: 16, s3DukanCutting: 17, s3SizeDetails: 18, s3CuttingPerson: 19, s3Delay: 20,
  s4Planned: 23, s4StartDate: 24, s4Thekedar: 25, s4CuttingPcs: 26, s4CutToPack: 27,
  s4LeadTime: 28, s4VastraJob: 29, s4Delay: 33,
  s5LeadTimeHours: 35, s5JamaPlanned: 36, s5JobslipStatus: 37, s5Status: 38,
  s5Balance: 39, s5JamaQty: 40, s5GivenQty: 41, s5Press: 42, s5Delay: 43,
  s6SettleQty: 44, s6Reason: 45, s6Name: 46,
};

function col(row, idx) {
  const v = row[idx];
  return (v === undefined || v === null || v === '') ? null : String(v).trim();
}

function colInt(row, idx) {
  const v = col(row, idx);
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function safeISO(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const d = new Date(s);
  // Reject invalid dates and Excel/Sheets epoch artifacts (years before 1990)
  if (isNaN(d.getTime()) || d.getFullYear() < 1990) return null;
  return d.toISOString();
}

function colDate(row, idx) {
  const v = col(row, idx);
  const iso = safeISO(v);
  return iso ? iso.slice(0, 10) : null;
}

// ─── Fetch from Google Sheets ────────────────────────────────────────────────
async function fetchRows() {
  const range = encodeURIComponent('FFMS!A1:AV');
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  const res   = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Sheets API [${res.status}]: ${body?.error?.message ?? res.statusText}`);
  }
  const data  = await res.json();
  return (data.values ?? []).slice(3); // skip 3 header rows
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function migrate() {
  console.log('📥  Fetching from Google Sheets FMS…');
  const rows = await fetchRows();
  const dataRows = rows.filter(r => r[C.jobNo]?.trim());
  console.log(`✅  Found ${dataRows.length} jobs to migrate.`);

  let success = 0, skipped = 0, failed = 0;

  for (const row of dataRows) {
    const jobNo = col(row, C.jobNo);
    if (!jobNo) { skipped++; continue; }

    const record = {
      job_no:              jobNo,
      date:                safeISO(col(row, C.date)),
      prog_by:             col(row, C.progBy),
      item:                col(row, C.item),
      item_group:          col(row, C.itemGroup),
      size:                col(row, C.size),
      qty:                 colInt(row, C.qty),
      reason:              col(row, C.reason),
      special_instruction: col(row, C.specialInstruction),

      s2_planned:          colDate(row, C.s2Planned),
      s2_actual:           colDate(row, C.s2Actual),
      s2_yes_no:           col(row, C.s2YesNo),
      s2_instructions:     col(row, C.s2Instructions),
      s2_inhouse:          col(row, C.s2Inhouse),
      s2_delay:            col(row, C.s2Delay),

      s3_planned:          colDate(row, C.s3Planned),
      s3_actual:           colDate(row, C.s3Actual),
      s3_dukan_cutting:    colInt(row, C.s3DukanCutting),
      s3_size_details:     col(row, C.s3SizeDetails),
      s3_cutting_person:   col(row, C.s3CuttingPerson),
      s3_delay:            col(row, C.s3Delay),

      s4_planned:          colDate(row, C.s4Planned),
      s4_start_date:       colDate(row, C.s4StartDate),
      s4_thekedar:         col(row, C.s4Thekedar),
      s4_cutting_pcs:      colInt(row, C.s4CuttingPcs),
      s4_cut_to_pack:      col(row, C.s4CutToPack),
      s4_lead_time:        colInt(row, C.s4LeadTime),
      s4_vastra_job:       col(row, C.s4VastraJob),
      s4_delay:            col(row, C.s4Delay),

      s5_lead_time_hours:  colInt(row, C.s5LeadTimeHours),
      s5_jama_planned:     colDate(row, C.s5JamaPlanned),
      s5_jobslip_status:   colDate(row, C.s5JobslipStatus),
      s5_status:           col(row, C.s5Status),
      s5_balance:          colInt(row, C.s5Balance),
      s5_jama_qty:         colInt(row, C.s5JamaQty),
      s5_given_qty:        colInt(row, C.s5GivenQty),
      s5_press:            col(row, C.s5Press),
      s5_delay:            col(row, C.s5Delay),

      s6_settle_qty:       colInt(row, C.s6SettleQty),
      s6_reason:           col(row, C.s6Reason),
      s6_name:             col(row, C.s6Name),
    };

    const { error } = await supabase
      .from('jobs')
      .upsert(record, { onConflict: 'job_no' });

    if (error) {
      console.error(`  ❌  Job #${jobNo}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓  Job #${jobNo} — ${record.item ?? '(no item)'}`);
      success++;
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`✅  Migrated: ${success}  |  ⏭️  Skipped: ${skipped}  |  ❌  Failed: ${failed}`);
  console.log('─────────────────────────────────────────');
}

migrate().catch(e => { console.error('Migration crashed:', e); process.exit(1); });
