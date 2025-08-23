-- =====================================================
-- Check Table Structure
-- Run this to see what columns exist in the tables
-- =====================================================

-- Check if user_activity_logs table exists and its structure
SELECT 
    'user_activity_logs table exists' as check_type,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activity_logs') as result;

-- If table exists, show its columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_activity_logs'
ORDER BY ordinal_position;

-- Check if security_settings table exists and its structure
SELECT 
    'security_settings table exists' as check_type,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_settings') as result;

-- If table exists, show its columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'security_settings'
ORDER BY ordinal_position;

-- Check users table for new auth columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
    'failed_login_attempts',
    'locked_until',
    'password_changed_at',
    'last_password_reset',
    'two_factor_secret',
    'two_factor_enabled',
    'force_password_change'
)
ORDER BY column_name; 