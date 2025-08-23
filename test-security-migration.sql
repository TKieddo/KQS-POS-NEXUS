-- =====================================================
-- Test Security Migration
-- Run this after the main migration to verify everything works
-- =====================================================

-- Check if security_settings table exists
SELECT 'security_settings table exists' as status, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_settings') as result;

-- Check if user_activity_logs table exists
SELECT 'user_activity_logs table exists' as status, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activity_logs') as result;

-- Check if authentication fields were added to users table
SELECT 'users table has auth fields' as status,
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'failed_login_attempts') as result;

-- Check if cashier role exists
SELECT 'cashier role exists' as status,
       EXISTS (SELECT FROM user_roles WHERE name = 'cashier') as result;

-- Check if security settings were created
SELECT 'security settings created' as status,
       COUNT(*) > 0 as result
FROM security_settings;

-- Show current security settings
SELECT 
    password_min_length,
    password_complexity,
    session_timeout,
    max_login_attempts,
    lockout_duration,
    password_expiry_days,
    two_factor_auth,
    account_lockout,
    audit_log_access,
    require_password_change,
    enable_user_activity_logging,
    default_user_role
FROM security_settings
LIMIT 1;

-- Show the default user role details
SELECT 
    s.default_user_role,
    r.name as role_name,
    r.description as role_description
FROM security_settings s
LEFT JOIN user_roles r ON s.default_user_role = r.id
LIMIT 1; 