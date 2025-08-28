-- Check Current User Management Tables
-- Run this in your Supabase SQL Editor

-- Step 1: Check what user-related tables exist
SELECT 
  '=== STEP 1: EXISTING USER TABLES ===' as step,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%user%'
ORDER BY table_name;

-- Step 2: Check if user_roles table exists and its structure
SELECT 
  '=== STEP 2: USER_ROLES TABLE STRUCTURE ===' as step,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') 
    THEN '✅ user_roles table exists'
    ELSE '❌ user_roles table does not exist'
  END as status;

-- If user_roles exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check if users table exists and its structure
SELECT 
  '=== STEP 3: USERS TABLE STRUCTURE ===' as step,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ users table exists'
    ELSE '❌ users table does not exist'
  END as status;

-- If users exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check current RLS policies on customers table
SELECT 
  '=== STEP 4: CURRENT CUSTOMERS RLS POLICIES ===' as step,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Step 5: Check current authentication status
SELECT 
  '=== STEP 5: CURRENT AUTHENTICATION STATUS ===' as step,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✅ User is authenticated'
    WHEN auth.role() = 'anon' THEN '❌ User is anonymous'
    WHEN auth.role() = 'service_role' THEN '✅ Service role'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- Step 6: Show sample data from existing tables
SELECT 
  '=== STEP 6: SAMPLE DATA ===' as step;

-- Show users if table exists
SELECT 
  'USERS TABLE DATA:' as table_name,
  COUNT(*) as record_count
FROM users 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');

-- Show user_roles if table exists
SELECT 
  'USER_ROLES TABLE DATA:' as table_name,
  COUNT(*) as record_count
FROM user_roles 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles');

-- Show customers data
SELECT 
  'CUSTOMERS TABLE DATA:' as table_name,
  COUNT(*) as record_count
FROM customers;
