-- ─── Create Sizewise Details Table ──────────────────────────
DROP TABLE IF EXISTS public.sizewise_details CASCADE;

CREATE TABLE IF NOT EXISTS public.sizewise_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    category TEXT NOT NULL,           -- e.g., 'Tops', 'Full Bottoms'
    design_name TEXT NOT NULL,        -- e.g., '152 RIB TOP'
    pieces TEXT,                      -- Fallback pieces for design
    sizes JSONB NOT NULL DEFAULT '[]', -- Array of objects: [{"size": "22/32", "pieces": "12", "lengths": {"51": 1.61, ...}}, ...]
    UNIQUE(category, design_name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sizewise_category ON public.sizewise_details(category);
CREATE INDEX IF NOT EXISTS idx_sizewise_design_name ON public.sizewise_details(design_name);

-- Turn on RLS and allow all access for internal dashboard
ALTER TABLE public.sizewise_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for sizewise_details" ON public.sizewise_details;
CREATE POLICY "Enable all access for sizewise_details" ON public.sizewise_details FOR ALL USING (true) WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sizewise_updated_at BEFORE UPDATE ON public.sizewise_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Attach system logging trigger (from setup_system_logs.sql)
DROP TRIGGER IF EXISTS log_sizewise_trigger ON public.sizewise_details;
CREATE TRIGGER log_sizewise_trigger AFTER INSERT OR UPDATE OR DELETE ON public.sizewise_details FOR EACH ROW EXECUTE FUNCTION public.log_system_action();

NOTIFY pgrst, 'reload schema';
