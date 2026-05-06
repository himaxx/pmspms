-- Migration: Add s5_jama_trail column for multi-trail Jama support
-- Run this in Supabase SQL Editor before deploying the new app version.
--
-- s5_jama_trail stores a JSON array of jama entries:
--   [{ qty: number, date: ISO string, pressHua: boolean, entryNo: number }, ...]
--
-- s5_jama_qty continues to store the CUMULATIVE total (backward compat).

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS s5_jama_trail TEXT DEFAULT NULL;

-- (Optional) Seed existing single-entry jama records into the trail format
-- so old jobs display correctly in the new UI:
UPDATE jobs
SET s5_jama_trail = jsonb_build_array(
  jsonb_build_object(
    'qty',      s5_jama_qty,
    'date',     COALESCE(s5_actual, updated_at),
    'pressHua', (s5_press = 'Yes'),
    'entryNo',  1
  )
)::text
WHERE s5_jama_qty IS NOT NULL
  AND s5_jama_trail IS NULL;
