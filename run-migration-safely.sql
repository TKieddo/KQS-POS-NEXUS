-- Safe Migration Runner for Data Management Schema Fixes
-- This script runs the migration safely by handling existing policies and constraints

-- First, let's check what policies already exist
SELECT 'Checking existing policies...' as status;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('inventory_movements', 'user_activities', 'backup_history', 'export_history', 'cleanup_history')
ORDER BY tablename, policyname;

-- Now run the main migration
\i fix-backup-schema-issues.sql

-- Verify the migration completed successfully
SELECT 'Migration completed. Verifying results...' as status;

-- Check that all tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
    VALUES 
        ('backup_history'),
        ('export_history'), 
        ('cleanup_history'),
        ('inventory_movements'),
        ('user_activities')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables t ON t.table_name = expected_tables.table_name;

-- Check that all required columns exist
SELECT 
    table_name,
    column_name,
    CASE WHEN column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
    VALUES 
        ('backup_history', 'file_path'),
        ('backup_history', 'file_size'),
        ('backup_history', 'error_message'),
        ('export_history', 'file_path'),
        ('export_history', 'file_size'),
        ('export_history', 'error_message'),
        ('cleanup_history', 'file_path'),
        ('cleanup_history', 'file_size'),
        ('cleanup_history', 'error_message')
) AS expected_columns(table_name, column_name)
LEFT JOIN information_schema.columns c ON c.table_name = expected_columns.table_name AND c.column_name = expected_columns.column_name;

-- Check that foreign key constraints are properly set
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('backup_history', 'export_history', 'cleanup_history')
  AND kcu.column_name = 'user_id';

-- Show final summary
SELECT 'Migration verification completed successfully!' as status; 