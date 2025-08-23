-- =====================================================
-- Test Branch Assignment Functionality
-- =====================================================

-- First, let's see what branches we have
SELECT 'Current Branches:' as info;
SELECT id, name, address, is_active FROM branches ORDER BY name;

-- See what users we have and their current branch assignments
SELECT 'Current Users and Their Branches:' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.is_active,
    b.name as branch_name,
    b.id as branch_id
FROM users u
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.full_name;

-- Assign a user to a specific branch (replace with actual user ID and branch ID)
-- Example: Assign user to Main Store
-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE name = 'Main Store' LIMIT 1)
-- WHERE email = 'user@example.com';

-- Show users after assignment
SELECT 'Users After Assignment:' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.is_active,
    b.name as branch_name,
    b.id as branch_id
FROM users u
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.full_name; 