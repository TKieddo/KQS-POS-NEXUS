-- Fix Cashier Customer Access - Allow All Authenticated Users
-- Run this in your Supabase SQL Editor

-- Step 1: Check current authentication status
SELECT 
  '=== STEP 1: AUTHENTICATION STATUS ===' as step,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated (cashier/admin)'
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

-- Step 3: Drop ALL existing policies to start fresh
SELECT '=== STEP 3: DROPPING ALL EXISTING POLICIES ===' as step;

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

-- Step 4: Create comprehensive policies for all authenticated users
SELECT '=== STEP 4: CREATING CASHIER-FRIENDLY POLICIES ===' as step;

-- Policy for reading customers (all authenticated users can read all customers)
CREATE POLICY "Allow read for all authenticated users" ON customers
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for creating customers (all authenticated users can create customers)
CREATE POLICY "Allow insert for all authenticated users" ON customers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating customers (all authenticated users can update customers)
CREATE POLICY "Allow update for all authenticated users" ON customers
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy for deleting customers (all authenticated users can delete customers)
CREATE POLICY "Allow delete for all authenticated users" ON customers
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Also fix credit_accounts table
SELECT '=== STEP 5: FIXING CREDIT_ACCOUNTS TABLE ===' as step;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON credit_accounts;

CREATE POLICY "Allow read for all authenticated users" ON credit_accounts
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for all authenticated users" ON credit_accounts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for all authenticated users" ON credit_accounts
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for all authenticated users" ON credit_accounts
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Also fix credit_transactions table
SELECT '=== STEP 6: FIXING CREDIT_TRANSACTIONS TABLE ===' as step;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON credit_transactions;

CREATE POLICY "Allow read for all authenticated users" ON credit_transactions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for all authenticated users" ON credit_transactions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for all authenticated users" ON credit_transactions
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for all authenticated users" ON credit_transactions
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 7: Ensure RLS is enabled on all tables
SELECT '=== STEP 7: ENSURING RLS IS ENABLED ===' as step;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Step 8: Verify the new policies
SELECT 
  '=== STEP 8: VERIFYING NEW POLICIES ===' as step,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Step 9: Test access to customers table
SELECT 
  '=== STEP 9: TESTING CUSTOMER ACCESS ===' as step,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- Step 10: Show final status
SELECT 
  '=== STEP 10: FINAL STATUS ===' as step,
  '✅ Cashiers and all authenticated users can now:' as capability,
  '  • Read all customers' as read_access,
  '  • Create new customers' as create_access,
  '  • Update customer data' as update_access,
  '  • Delete customers' as delete_access,
  auth.role() as current_role,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ Ready to test customer creation'
    WHEN auth.role() = 'service_role' THEN '✅ Ready to test customer creation'
    ELSE '❌ Need to authenticate first'
  END as status;

-- Step 11: Show current users table structure (for reference)
SELECT 
  '=== STEP 11: USERS TABLE INFO ===' as step,
  'Current users in system:' as info,
  COUNT(*) as total_users
FROM users 
WHERE is_active = true;
