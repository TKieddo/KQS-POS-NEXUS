-- Debug script to check branches table and user assignments
-- Run this in your Supabase SQL editor

-- Check branches table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'branches' 
ORDER BY ordinal_position;

-- Check branches data
SELECT 
  id,
  name,
  is_active,
  created_at
FROM branches 
ORDER BY name;

-- Check users table structure for branch_id
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'branch_id';

-- Check current user branch assignments
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.branch_id,
  b.name as branch_name
FROM users u
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.full_name;

-- Check if there are any foreign key constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'users'
  AND kcu.column_name = 'branch_id'; 