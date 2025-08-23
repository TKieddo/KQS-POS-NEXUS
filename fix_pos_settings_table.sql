-- Fix pos_settings table and RLS policies
-- Run this in Supabase SQL Editor

-- 1. Create the pos_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pos_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    
    -- Laybye Settings
    laybye_duration_months INTEGER NOT NULL DEFAULT 3,
    laybye_duration_days INTEGER NOT NULL DEFAULT 0,
    require_customer_for_laybye BOOLEAN NOT NULL DEFAULT true,
    min_laybye_deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    max_laybye_duration_months INTEGER NOT NULL DEFAULT 6,
    allow_laybye_extensions BOOLEAN NOT NULL DEFAULT true,
    laybye_reminder_days INTEGER NOT NULL DEFAULT 7,
    
    -- Payment Settings
    auto_print_receipts BOOLEAN NOT NULL DEFAULT true,
    default_payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    max_discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    allow_cash_rounding BOOLEAN NOT NULL DEFAULT true,
    require_receipt_printing BOOLEAN NOT NULL DEFAULT false,
    
    -- Customer Settings
    show_customer_selection BOOLEAN NOT NULL DEFAULT true,
    require_customer_for_credit BOOLEAN NOT NULL DEFAULT true,
    auto_create_loyalty_account BOOLEAN NOT NULL DEFAULT false,
    
    -- Inventory Settings
    allow_negative_inventory BOOLEAN NOT NULL DEFAULT false,
    show_stock_warnings BOOLEAN NOT NULL DEFAULT true,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT pos_settings_pkey PRIMARY KEY (id),
    CONSTRAINT pos_settings_branch_id_key UNIQUE (branch_id),
    CONSTRAINT pos_settings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches (id) ON DELETE CASCADE,
    CONSTRAINT pos_settings_laybye_duration_months_check CHECK (laybye_duration_months >= 0 AND laybye_duration_months <= 12),
    CONSTRAINT pos_settings_laybye_duration_days_check CHECK (laybye_duration_days >= 0 AND laybye_duration_days <= 365),
    CONSTRAINT pos_settings_max_discount_percentage_check CHECK (max_discount_percentage >= 0 AND max_discount_percentage <= 100),
    CONSTRAINT pos_settings_default_payment_method_check CHECK (
        default_payment_method IN ('cash', 'card', 'bank_transfer', 'mpesa', 'ecocash', 'other')
    )
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_settings_branch_id ON public.pos_settings USING btree (branch_id);
CREATE INDEX IF NOT EXISTS idx_pos_settings_created_at ON public.pos_settings USING btree (created_at);

-- 3. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pos_settings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_pos_settings_updated_at ON public.pos_settings;

CREATE TRIGGER update_pos_settings_updated_at
    BEFORE UPDATE ON public.pos_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_pos_settings_updated_at_column();

-- 4. Enable Row Level Security
ALTER TABLE public.pos_settings ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.pos_settings;
DROP POLICY IF EXISTS "Allow anon read access to pos_settings" ON public.pos_settings;
DROP POLICY IF EXISTS "Allow authenticated access to pos_settings" ON public.pos_settings;

-- 6. Create RLS policies that allow both authenticated and anonymous access
-- This is needed for POS public users
CREATE POLICY "Allow anon read access to pos_settings"
    ON public.pos_settings FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated access to pos_settings"
    ON public.pos_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Grant permissions
GRANT SELECT ON TABLE public.pos_settings TO anon;
GRANT ALL ON TABLE public.pos_settings TO authenticated;
GRANT ALL ON TABLE public.pos_settings TO service_role;

-- 8. Insert default settings for existing branches
INSERT INTO public.pos_settings (
    branch_id,
    laybye_duration_months,
    laybye_duration_days,
    auto_print_receipts,
    default_payment_method,
    show_customer_selection,
    require_customer_for_laybye,
    max_discount_percentage,
    allow_negative_inventory
)
SELECT 
    b.id,
    3,
    0,
    true,
    'cash',
    true,
    true,
    20.00,
    false
FROM public.branches b
WHERE NOT EXISTS (
    SELECT 1 FROM public.pos_settings ps 
    WHERE ps.branch_id = b.id
);

-- 9. Add comment to table
COMMENT ON TABLE public.pos_settings IS 'Stores POS configuration settings per branch including laybye duration, payment defaults, and interface preferences';

-- 10. Verify the setup
SELECT 
    'pos_settings table created' as status,
    COUNT(*) as total_settings,
    COUNT(DISTINCT branch_id) as branches_with_settings
FROM public.pos_settings;
