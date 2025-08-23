-- Simple test to check if user updates work
-- Run this in your Supabase SQL editor

-- First, let's see what users we have
SELECT 
  id,
  full_name,
  email,
  branch_id,
  is_active
FROM users 
LIMIT 3;

-- Test a simple update (replace with an actual user ID from above)
-- UPDATE users SET updated_at = now() WHERE id = 'paste-user-id-here';

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Check current policies
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'users';

-- If RLS is enabled and blocking updates, temporarily disable it for testing:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable it:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY; 