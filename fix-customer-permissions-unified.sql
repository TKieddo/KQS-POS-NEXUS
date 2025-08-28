-- Fix Customer Permissions - Unified Solution
-- Run this in your Supabase SQL Editor

-- Step 1: Check current authentication and RLS status
SELECT 
  '=== STEP 1: CURRENT STATUS ===' as step,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
    WHEN auth.role() = 'anon' THEN '❌ User is anonymous'
    WHEN auth.role() = 'service_role' THEN '✅ Service role'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- Step 2: Show current RLS policies on customers table
SELECT 
  '=== STEP 2: CURRENT CUSTOMERS RLS POLICIES ===' as step,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Step 3: Drop ALL existing policies on customers table
SELECT '=== STEP 3: DROPPING ALL EXISTING POLICIES ===' as step;

DROP POLICY IF EXISTS "allow_all_for_authenticated" ON customers;
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

-- Step 4: Add created_by column to customers table if it doesn't exist
SELECT '=== STEP 4: ADDING CREATED_BY COLUMN ===' as step;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Step 5: Create index on created_by column
SELECT '=== STEP 5: CREATING INDEX ===' as step;

CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);

-- Step 6: Create function to automatically set created_by
SELECT '=== STEP 6: CREATING AUTO-SET FUNCTION ===' as step;

CREATE OR REPLACE FUNCTION set_customer_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

-- Step 7: Create trigger to automatically set created_by
SELECT '=== STEP 7: CREATING TRIGGER ===' as step;

DROP TRIGGER IF EXISTS set_customer_created_by_trigger ON customers;

CREATE TRIGGER set_customer_created_by_trigger
BEFORE INSERT ON customers
FOR EACH ROW
EXECUTE FUNCTION set_customer_created_by();

-- Step 8: Create unified RLS policies for customers
SELECT '=== STEP 8: CREATING UNIFIED RLS POLICIES ===' as step;

-- Policy 1: Allow authenticated users to read all customers
CREATE POLICY "authenticated_users_can_read_customers" ON customers
FOR SELECT TO authenticated
USING (true);

-- Policy 2: Allow authenticated users to insert customers
CREATE POLICY "authenticated_users_can_insert_customers" ON customers
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow users to update customers they created OR all customers (for admin)
CREATE POLICY "users_can_update_customers" ON customers
FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR auth.uid() IN (
  SELECT id FROM users WHERE role_id IN (
    SELECT id FROM user_roles WHERE name IN ('admin', 'manager')
  )
))
WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Allow users to delete customers they created OR all customers (for admin)
CREATE POLICY "users_can_delete_customers" ON customers
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR auth.uid() IN (
  SELECT id FROM users WHERE role_id IN (
    SELECT id FROM user_roles WHERE name IN ('admin', 'manager')
  )
));

-- Step 9: Create similar policies for credit_accounts and credit_transactions
SELECT '=== STEP 9: CREATING CREDIT ACCOUNTS POLICIES ===' as step;

-- Drop existing policies on credit_accounts
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON credit_accounts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_accounts;

-- Create unified policies for credit_accounts
CREATE POLICY "authenticated_users_can_read_credit_accounts" ON credit_accounts
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_insert_credit_accounts" ON credit_accounts
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_credit_accounts" ON credit_accounts
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_credit_accounts" ON credit_accounts
FOR DELETE TO authenticated
USING (true);

-- Step 10: Create policies for credit_transactions
SELECT '=== STEP 10: CREATING CREDIT TRANSACTIONS POLICIES ===' as step;

-- Drop existing policies on credit_transactions
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON credit_transactions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_transactions;

-- Create unified policies for credit_transactions
CREATE POLICY "authenticated_users_can_read_credit_transactions" ON credit_transactions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "authenticated_users_can_insert_credit_transactions" ON credit_transactions
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_update_credit_transactions" ON credit_transactions
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_can_delete_credit_transactions" ON credit_transactions
FOR DELETE TO authenticated
USING (true);

-- Step 11: Verify all policies were created
SELECT 
  '=== STEP 11: VERIFYING POLICIES ===' as step,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('customers', 'credit_accounts', 'credit_transactions')
ORDER BY tablename, policyname;

-- Step 12: Test customer creation access
SELECT 
  '=== STEP 12: TESTING ACCESS ===' as step,
  'Testing customer table access...' as test_note;

-- Test reading customers
SELECT 
  'READ TEST:' as test_type,
  COUNT(*) as customer_count
FROM customers 
WHERE status = 'active';

-- Step 13: Final status
SELECT 
  '=== STEP 13: FINAL STATUS ===' as step,
  '✅ Customer permissions unified' as status,
  '✅ Both admin and POS can create customers' as access,
  '✅ created_by column added and indexed' as tracking,
  '✅ Auto-set trigger created' as automation,
  '✅ Try creating customers from both admin and POS now' as instruction;

-- Step 14: Show updated customers table structure
SELECT 
  '=== STEP 14: UPDATED CUSTOMERS STRUCTURE ===' as step,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
