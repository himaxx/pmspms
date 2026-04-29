-- ─── 1. Order to Delivery (Main Orders Table) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.fms_o2d_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    vastra_order_no TEXT NOT NULL,
    customer_name TEXT,
    agent_name TEXT,
    order_qty NUMERIC DEFAULT 0,
    order_type TEXT, -- Phone, Regular, Self Selection Visit
    dispatch_requirement TEXT,
    product_ordered TEXT,
    lead_time_hrs NUMERIC DEFAULT 0,
    planned_dispatch_time TIMESTAMPTZ,
    status TEXT DEFAULT 'Pending' -- 'Pending', 'Partial Qty Pending', 'Completed', 'Over Delivered'
);

-- ─── 2. Order to Delivery (Dispatches Table) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fms_o2d_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_id UUID NOT NULL REFERENCES public.fms_o2d_orders(id) ON DELETE CASCADE,
    dispatch_date TIMESTAMPTZ DEFAULT NOW(),
    bill_no TEXT,
    customer_name_cross_check BOOLEAN DEFAULT false,
    dispatch_qty NUMERIC DEFAULT 0,
    delay_hrs NUMERIC DEFAULT 0
);

-- Turn on Row Level Security (RLS) but allow all access for anon (since app uses anon key mostly without RLS for internal tools)
ALTER TABLE public.fms_o2d_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fms_o2d_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for fms_o2d_orders" ON public.fms_o2d_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for fms_o2d_dispatches" ON public.fms_o2d_dispatches FOR ALL USING (true) WITH CHECK (true);
NOTIFY pgrst, 'reload schema'; 
