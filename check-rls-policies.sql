-- Check RLS policies that might be blocking user updates
-- Run this in your Supabase SQL editor

-- Check if RLS is enabled on users table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Check all RLS policies on users table
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
WHERE tablename = 'users'
ORDER BY policyname;

-- Check if there are any policies that might block UPDATE operations
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' 
  AND (cmd = 'UPDATE' OR cmd = 'ALL')
ORDER BY policyname;

-- Check current user context
SELECT 
  current_user,
  session_user,
  current_setting('role'),
  current_setting('request.jwt.claims', true)::json;

-- Test a simple update to see if it works
-- Replace 'your-user-id-here' with an actual user ID from your database
-- UPDATE users SET updated_at = now() WHERE id = 'your-user-id-here';

-- Check if the user exists and their current data
SELECT 
  id,
  full_name,
  email,
  branch_id,
  role_id,
  is_active
FROM users 
LIMIT 5; 