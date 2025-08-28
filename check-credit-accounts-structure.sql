-- Check Credit Accounts Table Structure
-- Run this in your Supabase SQL Editor

-- 1. Check what columns exist in credit_accounts table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;

-- 2. Check if credit_accounts table exists and has any data
SELECT 
  'Credit accounts table info:' as info,
  COUNT(*) as total_records
FROM credit_accounts;

-- 3. Show sample data from credit_accounts (if any)
SELECT 
  'Sample credit accounts data:' as info,
  *
FROM credit_accounts 
LIMIT 5;

-- 4. Check customers table structure for comparison
SELECT 
  'Customers table columns:' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name LIKE '%balance%' OR column_name LIKE '%credit%'
ORDER BY ordinal_position;
