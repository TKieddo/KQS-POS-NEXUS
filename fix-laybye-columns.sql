-- Fix missing columns in laybye_orders table
-- Run this to ensure all required columns exist

-- Add discount_amount column if it doesn't exist
ALTER TABLE public.laybye_orders 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- Add remaining_amount column if it doesn't exist (just in case)
ALTER TABLE public.laybye_orders 
ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Laybye table columns verified and fixed!' as result;
