-- Check Users Table and Authentication Status
-- Run this in your Supabase SQL Editor

-- Step 1: Check current authentication
SELECT 
  '=== CURRENT AUTHENTICATION ===' as section,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ Logged in as authenticated user'
    WHEN auth.role() = 'anon' THEN '❌ Not logged in (anonymous)'
    WHEN auth.role() = 'service_role' THEN '✅ Using service role'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- Step 2: Check users table structure
SELECT 
  '=== USERS TABLE STRUCTURE ===' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 3: Show current users
SELECT 
  '=== CURRENT USERS ===' as section,
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  branch_id,
  created_at
FROM users 
WHERE is_active = true
ORDER BY created_at DESC;

-- Step 4: Check if current user exists in users table
SELECT 
  '=== CURRENT USER IN USERS TABLE ===' as section,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text
    ) THEN '✅ Current user found in users table'
    ELSE '❌ Current user NOT found in users table'
  END as user_exists,
  CASE 
    WHEN auth.role() = 'authenticated' THEN 'This is normal - Supabase Auth user'
    ELSE 'Not authenticated'
  END as note;

-- Step 5: Show user roles
SELECT 
  '=== USER ROLES ===' as section,
  role,
  COUNT(*) as user_count
FROM users 
WHERE is_active = true
GROUP BY role
ORDER BY user_count DESC;

-- Step 6: Test customer access with current user
SELECT 
  '=== CUSTOMER ACCESS TEST ===' as section,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ Should be able to access customers'
    WHEN auth.role() = 'service_role' THEN '✅ Should be able to access customers'
    ELSE '❌ Will be blocked by RLS'
  END as access_status,
  COUNT(*) as existing_customers
FROM customers 
WHERE status = 'active';
