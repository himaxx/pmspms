-- ============================================================
-- PMS Pro: Working-Hours Time Engine Migration
-- Run in Supabase → SQL Editor
-- ============================================================
-- Converts date-only fields to timestamptz so we can store
-- exact submission datetimes and compute working-hour delays.
-- All new columns are nullable to avoid breaking existing data.
-- ============================================================

-- 1. Stage 1 – convert `date` to timestamp (was TEXT/DATE)
ALTER TABLE jobs
  ALTER COLUMN date TYPE timestamptz USING date::timestamptz;

-- 2. Stage 2 – planned (already exists, ensure type)
ALTER TABLE jobs
  ALTER COLUMN s2_planned TYPE timestamptz USING s2_planned::timestamptz;

-- Stage 2 actual → full timestamp
ALTER TABLE jobs
  ALTER COLUMN s2_actual TYPE timestamptz USING s2_actual::timestamptz;

-- Stage 2 delay (working hours, numeric)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s2_delay numeric;

-- 3. Stage 3 – planned
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s3_planned timestamptz;

ALTER TABLE jobs
  ALTER COLUMN s3_actual TYPE timestamptz USING s3_actual::timestamptz;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s3_delay numeric;

-- 4. Stage 4 – planned
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s4_planned timestamptz;

-- s4_start_date → full timestamp
ALTER TABLE jobs
  ALTER COLUMN s4_start_date TYPE timestamptz USING s4_start_date::timestamptz;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s4_delay numeric;

-- 5. Stage 5 – jama planned (was s5_jama_planned)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s5_jama_planned timestamptz;

-- s5_lead_time_hours – the dynamic TAT offset in working hours
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s5_lead_time_hours numeric;

-- s5_delay (working-hour delay)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s5_delay numeric;
