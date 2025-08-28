-- Comprehensive RLS Policy Fix for KQS POS System
-- This script fixes RLS policies for all main tables to allow authenticated users to perform operations

-- ========================================
-- 1. FIX APP_SETTINGS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users full access to app settings" ON app_settings;

-- Disable RLS temporarily
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policy for authenticated users
CREATE POLICY "Allow authenticated users full access to app settings" ON app_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON app_settings TO authenticated;

-- ========================================
-- 2. FIX SALES TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sales;
DROP POLICY IF EXISTS "Enable update for users based on email" ON sales;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON sales;

-- Disable RLS temporarily
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for sales
CREATE POLICY "Allow authenticated users to read sales" ON sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert sales" ON sales
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update sales" ON sales
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete sales" ON sales
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON sales TO authenticated;

-- ========================================
-- 3. FIX CASHUP_SESSIONS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON cashup_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON cashup_sessions;
DROP POLICY IF EXISTS "Enable update for users based on email" ON cashup_sessions;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON cashup_sessions;

-- Disable RLS temporarily
ALTER TABLE cashup_sessions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE cashup_sessions ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for cashup_sessions
CREATE POLICY "Allow authenticated users to read cashup_sessions" ON cashup_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert cashup_sessions" ON cashup_sessions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update cashup_sessions" ON cashup_sessions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete cashup_sessions" ON cashup_sessions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON cashup_sessions TO authenticated;

-- ========================================
-- 4. FIX PRODUCTS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for users based on email" ON products;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON products;

-- Disable RLS temporarily
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for products
CREATE POLICY "Allow authenticated users to read products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON products TO authenticated;

-- ========================================
-- 5. FIX CUSTOMERS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for users based on email" ON customers;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON customers;

-- Disable RLS temporarily
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for customers
CREATE POLICY "Allow authenticated users to read customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert customers" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update customers" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete customers" ON customers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON customers TO authenticated;

-- ========================================
-- 6. FIX BRANCHES TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON branches;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON branches;
DROP POLICY IF EXISTS "Enable update for users based on email" ON branches;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON branches;

-- Disable RLS temporarily
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for branches
CREATE POLICY "Allow authenticated users to read branches" ON branches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert branches" ON branches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update branches" ON branches
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete branches" ON branches
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON branches TO authenticated;

-- ========================================
-- 7. FIX LAYBYE_ORDERS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON laybye_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON laybye_orders;
DROP POLICY IF EXISTS "Enable update for users based on email" ON laybye_orders;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON laybye_orders;

-- Disable RLS temporarily
ALTER TABLE laybye_orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE laybye_orders ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for laybye_orders
CREATE POLICY "Allow authenticated users to read laybye_orders" ON laybye_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert laybye_orders" ON laybye_orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update laybye_orders" ON laybye_orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete laybye_orders" ON laybye_orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON laybye_orders TO authenticated;

-- ========================================
-- 8. FIX REFUNDS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON refunds;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON refunds;
DROP POLICY IF EXISTS "Enable update for users based on email" ON refunds;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON refunds;

-- Disable RLS temporarily
ALTER TABLE refunds DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for refunds
CREATE POLICY "Allow authenticated users to read refunds" ON refunds
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert refunds" ON refunds
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update refunds" ON refunds
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete refunds" ON refunds
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON refunds TO authenticated;

-- ========================================
-- 9. VERIFY POLICIES
-- ========================================

-- Check all policies for the main tables
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('app_settings', 'sales', 'cashup_sessions', 'products', 'customers', 'branches', 'laybye_orders', 'refunds')
ORDER BY tablename, policyname;

-- ========================================
-- 10. TEST DATA ACCESS
-- ========================================

-- Test if we can read from main tables (this will show if policies are working)
SELECT 'app_settings' as table_name, COUNT(*) as record_count FROM app_settings
UNION ALL
SELECT 'sales' as table_name, COUNT(*) as record_count FROM sales
UNION ALL
SELECT 'cashup_sessions' as table_name, COUNT(*) as record_count FROM cashup_sessions
UNION ALL
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'branches' as table_name, COUNT(*) as record_count FROM branches
UNION ALL
SELECT 'laybye_orders' as table_name, COUNT(*) as record_count FROM laybye_orders
UNION ALL
SELECT 'refunds' as table_name, COUNT(*) as record_count FROM refunds;
