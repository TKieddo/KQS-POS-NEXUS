-- Check Authentication Status
-- Run this in your Supabase SQL Editor

-- 1. Check current authentication context
SELECT 
  'Current Authentication Status:' as info,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
    WHEN auth.role() = 'anon' THEN '❌ User is anonymous (not logged in)'
    WHEN auth.role() = 'service_role' THEN '✅ Service role (admin)'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- 2. Check if we can access the customers table with current permissions
SELECT 
  'Testing customer table access:' as info,
  CASE 
    WHEN auth.role() = 'authenticated' THEN 'Should be able to access customers'
    WHEN auth.role() = 'service_role' THEN 'Should be able to access customers'
    ELSE 'Will be blocked by RLS'
  END as access_status;

-- 3. Check RLS policies on customers table
SELECT 
  'RLS Policies on customers table:' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- 4. Test if we can read from customers table
SELECT 
  'Testing customer table read access:' as info,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- 5. Check if there are any existing customers
SELECT 
  'Existing customers:' as info,
  COUNT(*) as total_customers,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
  COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as pos_customers
FROM customers;

-- 6. Show sample customer data (if any)
SELECT 
  'Sample customer data:' as info,
  customer_number,
  first_name || ' ' || last_name as full_name,
  email,
  phone,
  account_balance,
  credit_limit,
  status,
  branch_id
FROM customers 
WHERE status = 'active'
ORDER BY first_name
LIMIT 3;
