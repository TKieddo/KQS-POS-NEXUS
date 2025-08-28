-- Manual RLS Fix for Known Tables
-- This script only targets tables we know exist and are causing 401 errors

-- Disable RLS on core tables that we know exist
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE cashup_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- Grant permissions on core tables
GRANT ALL ON app_settings TO authenticated;
GRANT ALL ON sales TO authenticated;
GRANT ALL ON sale_items TO authenticated;
GRANT ALL ON cashup_sessions TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON branches TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the fix worked
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS STILL ENABLED' ELSE 'RLS DISABLED' END as status
FROM pg_tables 
WHERE tablename IN ('app_settings', 'sales', 'sale_items', 'cashup_sessions', 'products', 'customers', 'branches')
ORDER BY tablename;
