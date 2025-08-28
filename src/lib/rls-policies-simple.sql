-- KQS POS Simple RLS Policies for Production
-- This version works with existing database schema

-- ========================================
-- STEP 1: TEMPORARILY DISABLE RLS FOR TESTING
-- ========================================

-- Run this first to get the system working immediately
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE cashup_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: CREATE USER_BRANCHES TABLE
-- ========================================

-- Create user_branches table to link users to branches
CREATE TABLE IF NOT EXISTS user_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'cashier',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

-- Enable RLS on user_branches
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own branch assignments
CREATE POLICY "Users can view their own branch assignments" ON user_branches
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own branch assignments
CREATE POLICY "Users can create their own branch assignments" ON user_branches
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- STEP 3: BASIC RLS POLICIES (WORK WITH ANY SCHEMA)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashup_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SIMPLE POLICIES FOR AUTHENTICATED USERS
-- ========================================

-- Sales table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on sales" ON sales
FOR ALL USING (auth.uid() IS NOT NULL);

-- Sale items table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on sale_items" ON sale_items
FOR ALL USING (auth.uid() IS NOT NULL);

-- Cashup sessions table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on cashup_sessions" ON cashup_sessions
FOR ALL USING (auth.uid() IS NOT NULL);

-- Customers table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on customers" ON customers
FOR ALL USING (auth.uid() IS NOT NULL);

-- Products table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on products" ON products
FOR ALL USING (auth.uid() IS NOT NULL);

-- Categories table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on categories" ON categories
FOR ALL USING (auth.uid() IS NOT NULL);

-- Laybye orders table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on laybye_orders" ON laybye_orders
FOR ALL USING (auth.uid() IS NOT NULL);

-- Laybye payments table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on laybye_payments" ON laybye_payments
FOR ALL USING (auth.uid() IS NOT NULL);

-- Refunds table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on refunds" ON refunds
FOR ALL USING (auth.uid() IS NOT NULL);

-- Receipt templates table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on receipt_templates" ON receipt_templates
FOR ALL USING (auth.uid() IS NOT NULL);

-- Branches table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on branches" ON branches
FOR ALL USING (auth.uid() IS NOT NULL);

-- Business settings table - allow authenticated users to do everything
CREATE POLICY "Allow authenticated users on business_settings" ON business_settings
FOR ALL USING (auth.uid() IS NOT NULL);

-- ========================================
-- INSTRUCTIONS FOR USE
-- ========================================

/*
TO GET THE SYSTEM WORKING IMMEDIATELY:

1. Run this entire script in your Supabase SQL Editor
2. This will disable RLS temporarily and allow all operations
3. Test your POS system - it should work now
4. Once everything works, you can implement proper RLS policies

TO IMPLEMENT PROPER SECURITY LATER:

1. First, check your actual table schemas:
   - Go to Supabase Dashboard → Table Editor
   - Check what columns each table actually has
   - Look for branch_id, user_id, or similar columns

2. Then create proper RLS policies based on your actual schema

3. Example of proper policy (adjust based on your actual columns):
   CREATE POLICY "Users can only access their branch data" ON sales
   FOR ALL USING (
     auth.uid() IS NOT NULL AND 
     branch_id IN (
       SELECT branch_id FROM user_branches WHERE user_id = auth.uid()
     )
   );

4. Finally, re-enable RLS on all tables
*/
