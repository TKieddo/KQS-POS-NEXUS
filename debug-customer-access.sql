-- Debug Customer Access Issues
-- Run this in your Supabase SQL Editor

-- 1. Check if customers exist
SELECT 
  'Customer count:' as info,
  COUNT(*) as total_customers
FROM customers;

-- 2. Show sample customers
SELECT 
  id,
  customer_number,
  first_name,
  last_name,
  email,
  status,
  account_balance,
  credit_limit
FROM customers
LIMIT 5;

-- 3. Check RLS policies on customers table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'customers';

-- 5. Test query as authenticated user (this simulates what your app does)
-- First, let's see what the current user context is
SELECT 
  current_user,
  session_user,
  auth.uid() as current_auth_uid,
  auth.role() as current_auth_role;

-- 6. Check if there are any RLS policies that might be blocking access
-- If no policies exist, we need to create them
SELECT 
  'RLS Policies for customers table:' as info,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'customers';

-- 7. If no policies exist, create them
DO $$
BEGIN
  -- Check if policies exist
  IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'customers') = 0 THEN
    RAISE NOTICE 'No RLS policies found. Creating policies...';
    
    -- Create policies for authenticated users
    EXECUTE 'CREATE POLICY "Enable read access for authenticated users" ON customers FOR SELECT USING (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Enable insert access for authenticated users" ON customers FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Enable update access for authenticated users" ON customers FOR UPDATE USING (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Enable delete access for authenticated users" ON customers FOR DELETE USING (auth.role() = ''authenticated'')';
    
    RAISE NOTICE 'RLS policies created successfully!';
  ELSE
    RAISE NOTICE 'RLS policies already exist.';
  END IF;
END $$;

-- 8. Show the policies again after creation
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'customers';

-- 9. Test a simple query that should work
SELECT 
  'Test query result:' as info,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- 10. Show active customers
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  account_balance,
  credit_limit,
  status
FROM customers 
WHERE status = 'active'
ORDER BY first_name;
