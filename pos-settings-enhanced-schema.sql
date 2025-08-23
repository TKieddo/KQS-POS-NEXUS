-- Enhanced pos_settings table with all new fields
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
    CONSTRAINT pos_settings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE,
    CONSTRAINT pos_settings_laybye_duration_months_check CHECK (laybye_duration_months >= 0 AND laybye_duration_months <= 12),
    CONSTRAINT pos_settings_laybye_duration_days_check CHECK (laybye_duration_days >= 0 AND laybye_duration_days <= 365),
    CONSTRAINT pos_settings_max_discount_percentage_check CHECK (max_discount_percentage >= 0 AND max_discount_percentage <= 100),
    CONSTRAINT pos_settings_min_laybye_deposit_percentage_check CHECK (min_laybye_deposit_percentage >= 5 AND min_laybye_deposit_percentage <= 100),
    CONSTRAINT pos_settings_max_laybye_duration_months_check CHECK (max_laybye_duration_months >= 1 AND max_laybye_duration_months <= 12),
    CONSTRAINT pos_settings_laybye_reminder_days_check CHECK (laybye_reminder_days >= 1 AND laybye_reminder_days <= 30),
    CONSTRAINT pos_settings_low_stock_threshold_check CHECK (low_stock_threshold >= 0 AND low_stock_threshold <= 1000),
    CONSTRAINT pos_settings_default_payment_method_check CHECK (
        default_payment_method IN ('cash', 'card', 'bank_transfer', 'mpesa', 'ecocash', 'other')
    )
);

-- Add missing columns to existing table (run this if table already exists)
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS min_laybye_deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS max_laybye_duration_months INTEGER NOT NULL DEFAULT 6;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS allow_laybye_extensions BOOLEAN NOT NULL DEFAULT true;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS laybye_reminder_days INTEGER NOT NULL DEFAULT 7;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS allow_cash_rounding BOOLEAN NOT NULL DEFAULT true;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS require_receipt_printing BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS require_customer_for_credit BOOLEAN NOT NULL DEFAULT true;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS auto_create_loyalty_account BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS show_stock_warnings BOOLEAN NOT NULL DEFAULT true;
-- ALTER TABLE public.pos_settings ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pos_settings_branch_id ON public.pos_settings USING btree (branch_id);
CREATE INDEX IF NOT EXISTS idx_pos_settings_created_at ON public.pos_settings USING btree (created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pos_settings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_pos_settings_updated_at ON pos_settings;

CREATE TRIGGER update_pos_settings_updated_at
    BEFORE UPDATE ON pos_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_pos_settings_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.pos_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON pos_settings;

CREATE POLICY "Allow all operations for authenticated users"
    ON pos_settings FOR ALL
    USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON TABLE public.pos_settings TO authenticated;
GRANT ALL ON TABLE public.pos_settings TO service_role;

-- Insert default settings for main branch if it doesn't exist
INSERT INTO public.pos_settings (
    branch_id,
    laybye_duration_months,
    laybye_duration_days,
    require_customer_for_laybye,
    min_laybye_deposit_percentage,
    max_laybye_duration_months,
    allow_laybye_extensions,
    laybye_reminder_days,
    auto_print_receipts,
    default_payment_method,
    max_discount_percentage,
    allow_cash_rounding,
    require_receipt_printing,
    show_customer_selection,
    require_customer_for_credit,
    auto_create_loyalty_account,
    allow_negative_inventory,
    show_stock_warnings,
    low_stock_threshold
)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    3,
    0,
    true,
    20.00,
    6,
    true,
    7,
    true,
    'cash',
    20.00,
    true,
    false,
    true,
    true,
    false,
    false,
    true,
    5
WHERE NOT EXISTS (
    SELECT 1 FROM public.pos_settings 
    WHERE branch_id = '00000000-0000-0000-0000-000000000001'
);

-- Add comment to table
COMMENT ON TABLE public.pos_settings IS 'Enhanced POS configuration settings per branch including laybye duration, payment defaults, customer management, and inventory preferences';
