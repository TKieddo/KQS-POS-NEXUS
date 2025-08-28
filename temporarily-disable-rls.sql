-- Temporarily Disable RLS for Testing
-- Run this in your Supabase SQL Editor
-- WARNING: This is for testing only. Re-enable RLS in production.

-- 1. Disable RLS on all customer-related tables
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT 
  'RLS Status:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('customers', 'credit_accounts', 'credit_transactions');

-- 3. Test message
SELECT 
  'Testing mode:' as info,
  'RLS temporarily disabled for testing' as status,
  'Customer creation should now work without permission errors' as note;

-- 4. Show current customers count
SELECT 
  'Current customers:' as info,
  COUNT(*) as total_customers
FROM customers; 