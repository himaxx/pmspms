-- ============================================================
-- PMS Pro: Excel Import Schema Migration
-- Run in Supabase → SQL Editor BEFORE importing data
-- ============================================================
-- Adds columns needed by the Excel data that don't exist yet.
-- All new columns are nullable to avoid breaking existing data.
-- ============================================================

-- New columns for Excel import tracking
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS imported_from_excel BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS import_batch_id TEXT;

-- Step 4 extras from Excel FMS
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS s4_vastra_job TEXT;

-- Step 5 extras from Excel FMS
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS s5_balance NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS s5_given_qty NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS s5_jobslip_status TIMESTAMPTZ;

-- Approver field for Step 2 (if not already present)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS s2_approver TEXT;

-- Verify: show all columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs' AND table_schema = 'public'
ORDER BY ordinal_position;
