-- Check Customers Table Structure
-- Run this in your Supabase SQL Editor

-- 1. Check current table structure
SELECT 
  'Current customers table columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- 2. Check if date_of_birth and gender columns exist
SELECT 
  'Checking for missing columns:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'date_of_birth'
    ) THEN 'date_of_birth EXISTS'
    ELSE 'date_of_birth MISSING'
  END as date_of_birth_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'gender'
    ) THEN 'gender EXISTS'
    ELSE 'gender MISSING'
  END as gender_status;

-- 3. Show sample customer data
SELECT 
  'Sample customer data:' as info,
  id,
  customer_number,
  first_name,
  last_name,
  email,
  phone,
  account_balance,
  credit_limit,
  status,
  branch_id
FROM customers 
WHERE status = 'active'
LIMIT 3;
