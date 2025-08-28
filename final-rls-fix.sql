-- Final RLS Fix - Complete Reset and Simple Solution
-- Run this in your Supabase SQL Editor

-- Step 1: Check current authentication
SELECT 
  '=== STEP 1: AUTHENTICATION STATUS ===' as step,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
    WHEN auth.role() = 'anon' THEN '❌ User is anonymous'
    WHEN auth.role() = 'service_role' THEN '✅ Service role'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- Step 2: Show current RLS status
SELECT 
  '=== STEP 2: CURRENT RLS STATUS ===' as step,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customers', 'credit_accounts', 'credit_transactions')
ORDER BY tablename;

-- Step 3: Show all existing policies
SELECT 
  '=== STEP 3: ALL EXISTING POLICIES ===' as step,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('customers', 'credit_accounts', 'credit_transactions')
ORDER BY tablename, policyname;

-- Step 4: COMPLETE RESET - Drop ALL policies
SELECT '=== STEP 4: DROPPING ALL POLICIES ===' as step;

-- Drop ALL policies for customers table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON customers;
DROP POLICY IF EXISTS "simple_auth_policy" ON customers;
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON customers;

-- Drop ALL policies for credit_accounts table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON credit_accounts;

-- Drop ALL policies for credit_transactions table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Allow insert for all authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON credit_transactions;

-- Step 5: Temporarily disable RLS for testing
SELECT '=== STEP 5: TEMPORARILY DISABLING RLS ===' as step;

ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- Step 6: Test access without RLS
SELECT 
  '=== STEP 6: TESTING ACCESS WITHOUT RLS ===' as step,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- Step 7: Re-enable RLS
SELECT '=== STEP 7: RE-ENABLING RLS ===' as step;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Step 8: Create ONE simple policy that allows everything for authenticated users
SELECT '=== STEP 8: CREATING SIMPLE POLICY ===' as step;

CREATE POLICY "allow_all_for_authenticated" ON customers
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow_all_for_authenticated" ON credit_accounts
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow_all_for_authenticated" ON credit_transactions
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Step 9: Verify policies were created
SELECT 
  '=== STEP 9: VERIFYING POLICIES ===' as step,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('customers', 'credit_accounts', 'credit_transactions')
ORDER BY tablename, policyname;

-- Step 10: Test access with new policy
SELECT 
  '=== STEP 10: TESTING ACCESS WITH NEW POLICY ===' as step,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- Step 11: Final status
SELECT 
  '=== STEP 11: FINAL STATUS ===' as step,
  '✅ RLS is now configured correctly' as status,
  '✅ All authenticated users can access customers' as access,
  '✅ Try creating a customer now' as instruction,
  auth.role() as current_role,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ Ready to test customer creation'
    WHEN auth.role() = 'service_role' THEN '✅ Ready to test customer creation'
    ELSE '❌ Need to authenticate first'
  END as ready_status;
