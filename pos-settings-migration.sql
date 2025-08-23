-- Migration script to add new columns to existing pos_settings table
-- This script safely adds new columns without affecting existing data

-- Add new Laybye Settings columns
ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS min_laybye_deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 20.00;

ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS max_laybye_duration_months INTEGER NOT NULL DEFAULT 6;

ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS allow_laybye_extensions BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS laybye_reminder_days INTEGER NOT NULL DEFAULT 7;

-- Add new Payment Settings columns
ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS allow_cash_rounding BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS require_receipt_printing BOOLEAN NOT NULL DEFAULT false;

-- Add new Customer Settings columns
ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS require_customer_for_credit BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS auto_create_loyalty_account BOOLEAN NOT NULL DEFAULT false;

-- Add new Inventory Settings columns
ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS show_stock_warnings BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.pos_settings 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;

-- Add constraints for new columns (drop first if they exist to avoid conflicts)
DO $$ 
BEGIN
    -- Drop constraints if they exist, then add them
    BEGIN
        ALTER TABLE public.pos_settings DROP CONSTRAINT pos_settings_min_laybye_deposit_percentage_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.pos_settings DROP CONSTRAINT pos_settings_max_laybye_duration_months_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.pos_settings DROP CONSTRAINT pos_settings_laybye_reminder_days_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE public.pos_settings DROP CONSTRAINT pos_settings_low_stock_threshold_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
END $$;

-- Add the constraints
ALTER TABLE public.pos_settings 
ADD CONSTRAINT pos_settings_min_laybye_deposit_percentage_check 
CHECK (min_laybye_deposit_percentage >= 5 AND min_laybye_deposit_percentage <= 100);

ALTER TABLE public.pos_settings 
ADD CONSTRAINT pos_settings_max_laybye_duration_months_check 
CHECK (max_laybye_duration_months >= 1 AND max_laybye_duration_months <= 12);

ALTER TABLE public.pos_settings 
ADD CONSTRAINT pos_settings_laybye_reminder_days_check 
CHECK (laybye_reminder_days >= 1 AND laybye_reminder_days <= 30);

ALTER TABLE public.pos_settings 
ADD CONSTRAINT pos_settings_low_stock_threshold_check 
CHECK (low_stock_threshold >= 0 AND low_stock_threshold <= 1000);

-- Update existing records with default values for new columns
UPDATE public.pos_settings 
SET 
  min_laybye_deposit_percentage = COALESCE(min_laybye_deposit_percentage, 20.00),
  max_laybye_duration_months = COALESCE(max_laybye_duration_months, 6),
  allow_laybye_extensions = COALESCE(allow_laybye_extensions, true),
  laybye_reminder_days = COALESCE(laybye_reminder_days, 7),
  allow_cash_rounding = COALESCE(allow_cash_rounding, true),
  require_receipt_printing = COALESCE(require_receipt_printing, false),
  require_customer_for_credit = COALESCE(require_customer_for_credit, true),
  auto_create_loyalty_account = COALESCE(auto_create_loyalty_account, false),
  show_stock_warnings = COALESCE(show_stock_warnings, true),
  low_stock_threshold = COALESCE(low_stock_threshold, 5)
WHERE id IS NOT NULL;

-- Update comment on table
COMMENT ON TABLE public.pos_settings IS 'Enhanced POS configuration settings per branch including laybye duration, payment defaults, customer management, and inventory preferences';

-- Success message
SELECT 'POS Settings migration completed successfully!' as result;
