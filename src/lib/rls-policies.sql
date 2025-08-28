-- KQS POS Row Level Security (RLS) Policies for Production
-- Run these policies in your Supabase SQL editor to enable proper access control

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
-- SALES TABLE POLICIES
-- ========================================

-- Allow authenticated users to view sales from their branch
CREATE POLICY "Users can view sales from their branch" ON sales
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create sales in their branch
CREATE POLICY "Users can create sales in their branch" ON sales
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update sales in their branch
CREATE POLICY "Users can update sales in their branch" ON sales
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- SALE_ITEMS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view sale items from their branch
CREATE POLICY "Users can view sale items from their branch" ON sale_items
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  sale_id IN (
    SELECT id FROM sales 
    WHERE branch_id IN (
      SELECT branch_id FROM user_branches 
      WHERE user_id = auth.uid()
    )
  )
);

-- Allow authenticated users to create sale items for sales in their branch
CREATE POLICY "Users can create sale items in their branch" ON sale_items
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  sale_id IN (
    SELECT id FROM sales 
    WHERE branch_id IN (
      SELECT branch_id FROM user_branches 
      WHERE user_id = auth.uid()
    )
  )
);

-- ========================================
-- CASHUP_SESSIONS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view cashup sessions from their branch
CREATE POLICY "Users can view cashup sessions from their branch" ON cashup_sessions
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create cashup sessions in their branch
CREATE POLICY "Users can create cashup sessions in their branch" ON cashup_sessions
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update cashup sessions in their branch
CREATE POLICY "Users can update cashup sessions in their branch" ON cashup_sessions
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- CUSTOMERS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view customers from their branch
CREATE POLICY "Users can view customers from their branch" ON customers
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create customers in their branch
CREATE POLICY "Users can create customers in their branch" ON customers
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update customers in their branch
CREATE POLICY "Users can update customers in their branch" ON customers
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- PRODUCTS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view products from their branch
CREATE POLICY "Users can view products from their branch" ON products
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create products in their branch
CREATE POLICY "Users can create products in their branch" ON products
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update products in their branch
CREATE POLICY "Users can update products in their branch" ON products
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- CATEGORIES TABLE POLICIES
-- ========================================

-- Allow authenticated users to view categories from their branch
CREATE POLICY "Users can view categories from their branch" ON categories
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create categories in their branch
CREATE POLICY "Users can create categories in their branch" ON categories
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- LAYBYE_ORDERS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view laybye orders from their branch
CREATE POLICY "Users can view laybye orders from their branch" ON laybye_orders
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create laybye orders in their branch
CREATE POLICY "Users can create laybye orders in their branch" ON laybye_orders
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- LAYBYE_PAYMENTS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view laybye payments from their branch
CREATE POLICY "Users can view laybye payments from their branch" ON laybye_payments
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  laybye_id IN (
    SELECT id FROM laybye_orders 
    WHERE branch_id IN (
      SELECT branch_id FROM user_branches 
      WHERE user_id = auth.uid()
    )
  )
);

-- Allow authenticated users to create laybye payments for orders in their branch
CREATE POLICY "Users can create laybye payments in their branch" ON laybye_payments
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  laybye_id IN (
    SELECT id FROM laybye_orders 
    WHERE branch_id IN (
      SELECT branch_id FROM user_branches 
      WHERE user_id = auth.uid()
    )
  )
);

-- ========================================
-- REFUNDS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view refunds from their branch
CREATE POLICY "Users can view refunds from their branch" ON refunds
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create refunds in their branch
CREATE POLICY "Users can create refunds in their branch" ON refunds
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- RECEIPT_TEMPLATES TABLE POLICIES
-- ========================================

-- Allow authenticated users to view receipt templates from their branch
CREATE POLICY "Users can view receipt templates from their branch" ON receipt_templates
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to create receipt templates in their branch
CREATE POLICY "Users can create receipt templates in their branch" ON receipt_templates
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update receipt templates in their branch
CREATE POLICY "Users can update receipt templates in their branch" ON receipt_templates
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- BRANCHES TABLE POLICIES
-- ========================================

-- Allow authenticated users to view branches they have access to
CREATE POLICY "Users can view their accessible branches" ON branches
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- BUSINESS_SETTINGS TABLE POLICIES
-- ========================================

-- Allow authenticated users to view business settings from their branch
CREATE POLICY "Users can view business settings from their branch" ON business_settings
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update business settings in their branch
CREATE POLICY "Users can update business settings in their branch" ON business_settings
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  branch_id IN (
    SELECT branch_id FROM user_branches 
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- USER_BRANCHES TABLE (if it doesn't exist, create it)
-- ========================================

-- Create user_branches table if it doesn't exist
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

-- Allow users to create their own branch assignments (for initial setup)
CREATE POLICY "Users can create their own branch assignments" ON user_branches
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- TEMPORARY BYPASS FOR INITIAL SETUP
-- ========================================

-- If you need to bypass RLS temporarily for initial setup, run this:
-- (Remove this after initial setup is complete)

-- Temporarily disable RLS for testing (REMOVE IN PRODUCTION)
-- ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE cashup_sessions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS after setup:
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cashup_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
