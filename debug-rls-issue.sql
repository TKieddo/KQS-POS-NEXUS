-- Debug RLS Issue - Step by Step Fix
-- Run this in your Supabase SQL Editor

-- Step 1: Check current authentication status
SELECT 
  '=== STEP 1: AUTHENTICATION STATUS ===' as step,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
    WHEN auth.role() = 'anon' THEN '❌ User is anonymous (not logged in)'
    WHEN auth.role() = 'service_role' THEN '✅ Service role (admin)'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- Step 2: Check current RLS policies
SELECT 
  '=== STEP 2: CURRENT RLS POLICIES ===' as step,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Step 3: Test current access to customers table
SELECT 
  '=== STEP 3: TESTING CURRENT ACCESS ===' as step,
  CASE 
    WHEN auth.role() = 'authenticated' THEN 'Should work'
    WHEN auth.role() = 'service_role' THEN 'Should work'
    ELSE 'Will fail'
  END as expected_result;

-- Step 4: Try to read from customers table
SELECT 
  '=== STEP 4: TESTING READ ACCESS ===' as step,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- Step 5: Drop ALL existing policies and create a simple one
SELECT '=== STEP 5: DROPPING ALL POLICIES ===' as step;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON customers;

-- Step 6: Create a single, simple policy
SELECT '=== STEP 6: CREATING SIMPLE POLICY ===' as step;

CREATE POLICY "simple_auth_policy" ON customers
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Step 7: Verify the new policy
SELECT 
  '=== STEP 7: VERIFYING NEW POLICY ===' as step,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Step 8: Test access again
SELECT 
  '=== STEP 8: TESTING ACCESS WITH NEW POLICY ===' as step,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- Step 9: Test insert capability (this will show if we can insert)
SELECT 
  '=== STEP 9: TESTING INSERT CAPABILITY ===' as step,
  'If you see this, read access works. Insert will be tested by the frontend.' as note;

-- Step 10: Show final status
SELECT 
  '=== STEP 10: FINAL STATUS ===' as step,
  'RLS policies updated. Try creating a customer now.' as instruction,
  auth.role() as current_role,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ Ready to test customer creation'
    WHEN auth.role() = 'service_role' THEN '✅ Ready to test customer creation'
    ELSE '❌ Need to authenticate first'
  END as status;
