-- Create pos_settings table for storing POS configuration per branch
CREATE TABLE IF NOT EXISTS public.pos_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    laybye_duration_months INTEGER NOT NULL DEFAULT 3,
    laybye_duration_days INTEGER NOT NULL DEFAULT 0,
    auto_print_receipts BOOLEAN NOT NULL DEFAULT true,
    default_payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    show_customer_selection BOOLEAN NOT NULL DEFAULT true,
    require_customer_for_laybye BOOLEAN NOT NULL DEFAULT true,
    max_discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    allow_negative_inventory BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT pos_settings_pkey PRIMARY KEY (id),
    CONSTRAINT pos_settings_branch_id_key UNIQUE (branch_id),
    CONSTRAINT pos_settings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE,
    CONSTRAINT pos_settings_laybye_duration_months_check CHECK (laybye_duration_months >= 0 AND laybye_duration_months <= 12),
    CONSTRAINT pos_settings_laybye_duration_days_check CHECK (laybye_duration_days >= 0 AND laybye_duration_days <= 365),
    CONSTRAINT pos_settings_max_discount_percentage_check CHECK (max_discount_percentage >= 0 AND max_discount_percentage <= 100),
    CONSTRAINT pos_settings_default_payment_method_check CHECK (
        default_payment_method IN ('cash', 'card', 'bank_transfer', 'mpesa', 'ecocash', 'other')
    )
);

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
    auto_print_receipts,
    default_payment_method,
    show_customer_selection,
    require_customer_for_laybye,
    max_discount_percentage,
    allow_negative_inventory
)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    3,
    0,
    true,
    'cash',
    true,
    true,
    20.00,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.pos_settings 
    WHERE branch_id = '00000000-0000-0000-0000-000000000001'
);

-- Add comment to table
COMMENT ON TABLE public.pos_settings IS 'Stores POS configuration settings per branch including laybye duration, payment defaults, and interface preferences';
