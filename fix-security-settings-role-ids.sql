-- Fix security settings that have invalid role IDs
-- This script corrects any records where default_user_role is a string instead of UUID

-- First, let's see what we have
SELECT 
    'Current security settings with role issues' as status,
    id,
    branch_id,
    default_user_role,
    CASE 
        WHEN default_user_role::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'Valid UUID' 
        ELSE 'Invalid UUID' 
    END as uuid_status
FROM security_settings;

-- Fix records where default_user_role is not a valid UUID
UPDATE security_settings 
SET default_user_role = (
    SELECT id FROM user_roles WHERE name = 'cashier' LIMIT 1
)
WHERE default_user_role IS NOT NULL 
  AND default_user_role::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Set NULL for records where we couldn't find the cashier role
UPDATE security_settings 
SET default_user_role = NULL
WHERE default_user_role IS NOT NULL 
  AND default_user_role::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Verify the fix
SELECT 
    'After fixing role IDs' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN default_user_role IS NULL THEN 1 END) as null_role_records,
    COUNT(CASE WHEN default_user_role IS NOT NULL THEN 1 END) as valid_role_records
FROM security_settings; 