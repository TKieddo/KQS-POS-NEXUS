-- Fix RLS Policies Without Disabling - Proper Security
-- Run this in your Supabase SQL Editor

-- 1. First, let's check what policies currently exist
SELECT 
  'Current RLS policies for customers:' as info,
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

-- 2. Drop only the problematic policies and create better ones
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;

-- 3. Create a single comprehensive policy that allows all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON customers
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Also create specific policies for better granular control
CREATE POLICY "Enable read for authenticated users" ON customers
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON customers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON customers
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON customers
FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Fix credit_accounts table with the same approach
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_accounts;

CREATE POLICY "Enable all operations for authenticated users" ON credit_accounts
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON credit_accounts
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON credit_accounts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON credit_accounts
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON credit_accounts
FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Fix credit_transactions table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_transactions;

CREATE POLICY "Enable all operations for authenticated users" ON credit_transactions
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON credit_transactions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON credit_transactions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON credit_transactions
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON credit_transactions
FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Ensure RLS is enabled on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Verify the new policies were created
SELECT 
  'Updated RLS policies for customers:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- 9. Test the authentication context
SELECT 
  'Authentication test:' as info,
  auth.role() as current_role,
  CASE 
    WHEN auth.role() = 'authenticated' THEN 'User is authenticated - should work'
    WHEN auth.role() = 'anon' THEN 'User is anonymous - will be blocked'
    ELSE 'Unknown role - may be blocked'
  END as status;

-- 10. Show RLS status for all tables
SELECT 
  'RLS Status for all tables:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customers', 'credit_accounts', 'credit_transactions')
ORDER BY tablename;
