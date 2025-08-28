-- Check Customer Branch IDs
-- Run this in your Supabase SQL Editor

-- 1. Check total customers
SELECT 
  'Total customers:' as info,
  COUNT(*) as total_customers
FROM customers;

-- 2. Check customers by branch_id
SELECT 
  branch_id,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active'
GROUP BY branch_id
ORDER BY branch_id NULLS FIRST;

-- 3. Show customers with null branch_id
SELECT 
  'Customers with NULL branch_id:' as info,
  COUNT(*) as count
FROM customers 
WHERE status = 'active' AND branch_id IS NULL;

-- 4. Show sample customers with null branch_id
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  branch_id,
  status
FROM customers 
WHERE status = 'active' AND branch_id IS NULL
ORDER BY first_name
LIMIT 5;

-- 5. Show sample customers with branch_id
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  branch_id,
  status
FROM customers 
WHERE status = 'active' AND branch_id IS NOT NULL
ORDER BY first_name
LIMIT 5;

-- 6. Check if there are any branches in the system
SELECT 
  'Branches in system:' as info,
  COUNT(*) as branch_count
FROM branches;

-- 7. Show branches
SELECT 
  id,
  name,
  is_active
FROM branches
ORDER BY name;

-- 8. Test query that should work (no branch filtering)
SELECT 
  'Test query - all active customers:' as info,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- 9. Show all active customers
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  branch_id,
  account_balance,
  credit_limit,
  status
FROM customers 
WHERE status = 'active'
ORDER BY first_name;
