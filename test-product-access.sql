-- Test Product Access and RLS Policies
-- Run this in your Supabase SQL editor to debug product visibility issues

-- 1. Check if products exist in the database (bypassing RLS)
SELECT 
  id,
  name,
  sku,
  is_active,
  created_at,
  updated_at
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check RLS policies on products table
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
WHERE tablename = 'products';

-- 3. Check if RLS is enabled on products table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 4. Test product access with current user context
-- This will show what the current user can see
SELECT 
  id,
  name,
  sku,
  is_active,
  created_at
FROM products 
WHERE is_active = true
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check categories table as well
SELECT 
  id,
  name,
  is_active,
  created_at
FROM categories 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check if there are any products with categories
SELECT 
  p.id,
  p.name,
  p.sku,
  p.is_active,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC 
LIMIT 10;

-- 7. Test inserting a simple product to see if RLS blocks it
-- Uncomment the line below to test (will create a test product)
-- INSERT INTO products (name, price, is_active) VALUES ('Test Product', 10.00, true);

-- 8. Check authentication status
-- This will show if you're authenticated and what role you have
SELECT 
  auth.role() as current_role,
  auth.uid() as current_user_id; 