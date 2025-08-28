-- Add Missing Customer Columns
-- Run this in your Supabase SQL Editor

-- 1. Add missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));

-- 2. Update existing customers to have proper default values for new columns
UPDATE customers 
SET 
  date_of_birth = NULL,
  gender = NULL
WHERE date_of_birth IS NULL;

-- 3. Verify the table structure now includes all admin modal fields
SELECT 
  'Updated customers table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('date_of_birth', 'gender', 'notes', 'tags', 'account_balance', 'credit_limit')
ORDER BY ordinal_position;

-- 4. Show current customers with new structure
SELECT 
  'Current customers with new structure:' as info,
  customer_number,
  first_name || ' ' || last_name as full_name,
  email,
  phone,
  account_balance,
  credit_limit,
  date_of_birth,
  gender,
  notes,
  tags
FROM customers 
WHERE status = 'active' AND branch_id IS NULL
ORDER BY first_name
LIMIT 5;
