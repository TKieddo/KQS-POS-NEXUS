-- Temporarily disable RLS for data management tables during development
-- This will allow backups to work without authentication issues

-- Disable RLS on data management tables
ALTER TABLE data_management_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE export_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_history DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('data_management_settings', 'backup_history', 'export_history', 'cleanup_history');

-- Show current status
SELECT 
    'RLS disabled for data management tables' as status,
    COUNT(*) as tables_affected
FROM pg_tables 
WHERE tablename IN ('data_management_settings', 'backup_history', 'export_history', 'cleanup_history')
AND rowsecurity = false; 