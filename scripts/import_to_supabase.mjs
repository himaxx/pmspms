/**
 * import_to_supabase.mjs — Imports cleaned Excel data into Supabase jobs table
 *
 * Usage:  node scripts/import_to_supabase.mjs
 *
 * Prerequisites:
 *   1. Run `python scripts/extract_data.py` first to generate cleaned_jobs.json
 *   2. Run `scripts/schema_migration.sql` in Supabase SQL Editor
 *   3. .env.local must have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env.local ────────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      const key = l.slice(0, idx).trim();
      const val = l.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      return [key, val];
    })
);

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Discover actual DB columns ─────────────────────────────────────
async function getDbColumns() {
  // Try inserting an empty object to get the schema error, or just list known safe cols
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (data && data.length > 0) {
    return new Set(Object.keys(data[0]));
  }
  // Fallback: only use columns we know from the existing migrate.mjs
  return new Set([
    'job_no', 'date', 'prog_by', 'item', 'item_group', 'size', 'qty',
    'reason', 'special_instruction',
    's2_planned', 's2_actual', 's2_yes_no', 's2_instructions', 's2_inhouse', 's2_delay',
    's3_planned', 's3_actual', 's3_dukan_cutting', 's3_size_details', 's3_cutting_person', 's3_delay',
    's4_planned', 's4_start_date', 's4_thekedar', 's4_cutting_pcs', 's4_cut_to_pack',
    's4_lead_time', 's4_vastra_job', 's4_delay',
    's5_lead_time_hours', 's5_jama_planned', 's5_jobslip_status', 's5_status',
    's5_balance', 's5_jama_qty', 's5_given_qty', 's5_press', 's5_delay',
    's6_settle_qty', 's6_reason', 's6_name',
  ]);
}

// ─── Main ────────────────────────────────────────────────────────────
async function importData() {
  // Load cleaned data
  const dataPath = resolve(__dirname, 'cleaned_jobs.json');
  let jobs;
  try {
    jobs = JSON.parse(readFileSync(dataPath, 'utf-8'));
  } catch (e) {
    console.error('❌ Cannot read cleaned_jobs.json. Run extract_data.py first.');
    process.exit(1);
  }

  console.log(`📥 Loaded ${jobs.length} jobs from cleaned_jobs.json`);
  console.log(`🔗 Target: ${SUPABASE_URL}`);

  // Discover actual DB columns
  const VALID_COLUMNS = await getDbColumns();
  console.log(`📋 DB columns found: ${VALID_COLUMNS.size}`);
  
  // Show which columns from data will be skipped
  const allDataKeys = new Set(jobs.flatMap(j => Object.keys(j)));
  const skippedCols = [...allDataKeys].filter(k => !VALID_COLUMNS.has(k));
  if (skippedCols.length > 0) {
    console.log(`⏭️  Skipping columns not in DB: ${skippedCols.join(', ')}`);
  }

  // Filter to only valid columns
  const cleanedJobs = jobs.map(job => {
    const clean = {};
    for (const [k, v] of Object.entries(job)) {
      if (VALID_COLUMNS.has(k) && v !== null && v !== undefined) {
        clean[k] = v;
      }
    }
    return clean;
  });

  // Import in batches of 50
  const BATCH_SIZE = 50;
  let success = 0, failed = 0, errors = [];

  for (let i = 0; i < cleanedJobs.length; i += BATCH_SIZE) {
    const batch = cleanedJobs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(cleanedJobs.length / BATCH_SIZE);

    const { error } = await supabase
      .from('jobs')
      .upsert(batch, { onConflict: 'job_no' });

    if (error) {
      console.error(`  ❌ Batch ${batchNum}/${totalBatches}: ${error.message}`);
      failed += batch.length;
      errors.push({ batch: batchNum, error: error.message, jobs: batch.map(j => j.job_no) });
    } else {
      success += batch.length;
      const first = batch[0]?.job_no;
      const last = batch[batch.length - 1]?.job_no;
      console.log(`  ✓ Batch ${batchNum}/${totalBatches}: Jobs #${first}–#${last} (${batch.length} records)`);
    }

    // Brief pause between batches
    if (i + BATCH_SIZE < cleanedJobs.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Imported: ${success}  |  ❌ Failed: ${failed}`);
  console.log('═'.repeat(50));

  if (errors.length > 0) {
    console.log('\n⚠️  Failed batches:');
    for (const e of errors) {
      console.log(`  Batch ${e.batch}: ${e.error}`);
      console.log(`    Jobs: ${e.jobs.join(', ')}`);
    }
  }

  // Verification query
  console.log('\n🔍 Verifying import...');
  const { count, error: countErr } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('imported_from_excel', true);

  if (countErr) {
    console.log(`  ⚠️ Verification query failed: ${countErr.message}`);
  } else {
    console.log(`  ✅ Total imported records in DB: ${count}`);
  }
}

importData().catch(e => {
  console.error('Import crashed:', e);
  process.exit(1);
});
