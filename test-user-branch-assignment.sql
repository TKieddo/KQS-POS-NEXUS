-- Test script for user branch assignment
-- Run this in your Supabase SQL editor

-- First, let's see what users we have
SELECT 
  id,
  full_name,
  email,
  branch_id,
  is_active,
  created_at
FROM users 
ORDER BY full_name;

-- Check what branches we have
SELECT 
  id,
  name,
  is_active
FROM branches 
ORDER BY name;

-- Test updating a user's branch_id (replace with actual user ID)
-- Uncomment and modify the line below with a real user ID
-- UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Main Branch' LIMIT 1) WHERE id = 'your-user-id-here';

-- Check if there are any RLS policies that might be blocking updates
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
WHERE tablename = 'users';

-- Check if the users table has the branch_id column
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('id', 'branch_id', 'full_name', 'email')
ORDER BY ordinal_position; 