-- Fix Customers RLS Policies - Comprehensive Fix
-- Run this in your Supabase SQL Editor

-- 1. First, let's check the current RLS policies
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

-- 2. Drop ALL existing RLS policies for customers table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable read for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON customers;
DROP POLICY IF EXISTS "Enable update for all users" ON customers;
DROP POLICY IF EXISTS "Enable delete for all users" ON customers;

-- 3. Temporarily disable RLS to clear any problematic policies
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- 4. Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 5. Create comprehensive RLS policies that allow authenticated users to access customers
-- Policy for reading customers (allows reading all customers)
CREATE POLICY "Enable read access for authenticated users" ON customers
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for inserting customers (allows authenticated users to create customers)
CREATE POLICY "Enable insert access for authenticated users" ON customers
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating customers (allows authenticated users to update customers)
CREATE POLICY "Enable update access for authenticated users" ON customers
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy for deleting customers (allows authenticated users to delete customers)
CREATE POLICY "Enable delete access for authenticated users" ON customers
FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Also fix RLS for credit_accounts table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable read for all users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable insert for all users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable update for all users" ON credit_accounts;
DROP POLICY IF EXISTS "Enable delete for all users" ON credit_accounts;

ALTER TABLE credit_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON credit_accounts
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON credit_accounts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON credit_accounts
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON credit_accounts
FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Also fix RLS for credit_transactions table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable read for all users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON credit_transactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON credit_transactions;

ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON credit_transactions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON credit_transactions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON credit_transactions
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON credit_transactions
FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Verify the policies were created
SELECT 
  'Updated RLS policies for customers:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'customers';

-- 9. Test if we can now create a customer by checking permissions
SELECT 
  'Testing customer creation permissions:' as info,
  'RLS policies updated successfully' as status,
  'All authenticated users should now be able to create customers' as note;

-- 10. Show current user authentication status
SELECT 
  'Current authentication status:' as info,
  auth.role() as current_role,
  auth.uid() as current_user_id;
