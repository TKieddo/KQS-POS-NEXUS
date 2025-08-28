-- Simple RLS fix for receipt_templates table
-- This temporarily disables RLS to allow POS operations

-- Disable RLS temporarily
ALTER TABLE receipt_templates DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON receipt_templates TO authenticated;

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'receipt_templates';

-- Show current permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'receipt_templates' 
AND grantee = 'authenticated';
