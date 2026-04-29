-- ─── 1. Create System Logs Table ──────────────────────────
DROP TABLE IF EXISTS public.system_logs CASCADE;
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    entity_type TEXT NOT NULL, -- Table name (e.g., 'JOBS', 'BILTY_FMS')
    entity_id TEXT NOT NULL,
    entity_identifier TEXT, -- User-friendly ID like Job No or Bill No
    old_data JSONB,
    new_data JSONB,
    description TEXT
);

-- Force the column to be TEXT in case the table already existed and wasn't dropped
ALTER TABLE public.system_logs ALTER COLUMN entity_id TYPE TEXT;

-- Turn on RLS and allow all access (since it's internal dashboard)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for system_logs" ON public.system_logs;
CREATE POLICY "Enable all access for system_logs" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);

-- ─── 2. Create Generic Trigger Function ───────────────────
CREATE OR REPLACE FUNCTION public.log_system_action()
RETURNS TRIGGER AS $$
DECLARE
    entity_name TEXT;
    ident TEXT;
    rec_data JSONB;
    old_rec_data JSONB;
BEGIN
    entity_name := TG_TABLE_NAME;
    
    IF TG_OP = 'DELETE' THEN
        rec_data := to_jsonb(OLD);
        old_rec_data := to_jsonb(OLD);
    ELSE
        rec_data := to_jsonb(NEW);
        IF TG_OP = 'UPDATE' THEN
            old_rec_data := to_jsonb(OLD);
        END IF;
    END IF;

    -- Extract a human-readable identifier if it exists in the row
    ident := COALESCE(
        rec_data->>'job_no',
        rec_data->>'vastra_order_no',
        rec_data->>'requirement_no',
        rec_data->>'bilty_no',
        rec_data->>'bill_no',
        'ID: ' || left(rec_data->>'id', 8)
    );

    INSERT INTO public.system_logs (
        action_type, entity_type, entity_id, entity_identifier, old_data, new_data, description
    ) VALUES (
        TG_OP,
        UPPER(entity_name),
        (rec_data->>'id')::TEXT,
        ident,
        old_rec_data,
        CASE WHEN TG_OP != 'DELETE' THEN rec_data ELSE NULL END,
        TG_OP || ' on ' || UPPER(entity_name) || ' (' || COALESCE(ident, 'unknown') || ')'
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Attach Triggers to Key Tables ─────────────────────
-- Drop existing triggers if they exist to allow clean re-runs
DROP TRIGGER IF EXISTS log_jobs_trigger ON public.jobs;
DROP TRIGGER IF EXISTS log_bilty_fms_trigger ON public.bilty_fms;
DROP TRIGGER IF EXISTS log_purchase_fms_trigger ON public.purchase_fms;
DROP TRIGGER IF EXISTS log_o2d_orders_trigger ON public.fms_o2d_orders;
DROP TRIGGER IF EXISTS log_o2d_dispatches_trigger ON public.fms_o2d_dispatches;

-- Create triggers
CREATE TRIGGER log_jobs_trigger AFTER INSERT OR UPDATE OR DELETE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.log_system_action();
CREATE TRIGGER log_bilty_fms_trigger AFTER INSERT OR UPDATE OR DELETE ON public.bilty_fms FOR EACH ROW EXECUTE FUNCTION public.log_system_action();
CREATE TRIGGER log_purchase_fms_trigger AFTER INSERT OR UPDATE OR DELETE ON public.purchase_fms FOR EACH ROW EXECUTE FUNCTION public.log_system_action();
CREATE TRIGGER log_o2d_orders_trigger AFTER INSERT OR UPDATE OR DELETE ON public.fms_o2d_orders FOR EACH ROW EXECUTE FUNCTION public.log_system_action();
CREATE TRIGGER log_o2d_dispatches_trigger AFTER INSERT OR UPDATE OR DELETE ON public.fms_o2d_dispatches FOR EACH ROW EXECUTE FUNCTION public.log_system_action();

NOTIFY pgrst, 'reload schema';
