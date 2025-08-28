-- Quick RLS Disable for Testing
-- This temporarily disables RLS on all main tables to allow operations

-- Disable RLS on all main tables
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE cashup_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE refunds DISABLE ROW LEVEL SECURITY;
ALTER TABLE refund_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credit_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credit_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE till_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE till_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_branch_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE branch_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON app_settings TO authenticated;
GRANT ALL ON sales TO authenticated;
GRANT ALL ON sale_items TO authenticated;
GRANT ALL ON cashup_sessions TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON branches TO authenticated;
GRANT ALL ON laybye_orders TO authenticated;
GRANT ALL ON laybye_order_items TO authenticated;
GRANT ALL ON refunds TO authenticated;
GRANT ALL ON refund_items TO authenticated;
GRANT ALL ON product_categories TO authenticated;
GRANT ALL ON product_variants TO authenticated;
GRANT ALL ON product_variant_options TO authenticated;
GRANT ALL ON product_variant_types TO authenticated;
GRANT ALL ON product_images TO authenticated;
GRANT ALL ON customer_credit_accounts TO authenticated;
GRANT ALL ON customer_credit_transactions TO authenticated;
GRANT ALL ON till_operations TO authenticated;
GRANT ALL ON till_settings TO authenticated;
GRANT ALL ON user_branch_access TO authenticated;
GRANT ALL ON branch_settings TO authenticated;
GRANT ALL ON global_settings TO authenticated;

-- Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN (
  'app_settings', 'sales', 'sale_items', 'cashup_sessions', 'products', 
  'customers', 'branches', 'laybye_orders', 'laybye_order_items', 
  'refunds', 'refund_items', 'product_categories', 'product_variants',
  'product_variant_options', 'product_variant_types', 'product_images',
  'customer_credit_accounts', 'customer_credit_transactions', 'till_operations',
  'till_settings', 'user_branch_access', 'branch_settings', 'global_settings'
)
ORDER BY tablename;
