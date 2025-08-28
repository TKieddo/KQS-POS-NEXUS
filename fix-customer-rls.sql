-- Fix Customer RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. First, let's temporarily disable RLS to see if that's the issue
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- 2. Check if we can see customers now
SELECT 
  'Customers after disabling RLS:' as info,
  COUNT(*) as total_customers
FROM customers;

-- 3. Show some customers
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  account_balance,
  credit_limit,
  status
FROM customers 
WHERE status = 'active'
ORDER BY first_name
LIMIT 5;

-- 4. If we can see customers, then RLS was the issue
-- Let's re-enable RLS and create proper policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 5. Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Customers are viewable by authenticated users" ON customers;
DROP POLICY IF EXISTS "Customers are insertable by authenticated users" ON customers;
DROP POLICY IF EXISTS "Customers are updatable by authenticated users" ON customers;

-- 6. Create new, simple policies
CREATE POLICY "Allow all operations for authenticated users" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. Test the query again
SELECT 
  'Customers after fixing RLS:' as info,
  COUNT(*) as total_customers
FROM customers 
WHERE status = 'active';

-- 8. Show active customers
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  account_balance,
  credit_limit,
  status
FROM customers 
WHERE status = 'active'
ORDER BY first_name;

-- 9. Verify the policy was created
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'customers';
