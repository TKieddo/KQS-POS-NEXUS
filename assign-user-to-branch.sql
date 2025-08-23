-- =====================================================
-- Assign User to Branch Script
-- =====================================================

-- This script helps assign users to branches when they don't have a branch_id

-- First, let's see the current state
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

-- Show available branches
SELECT 'Available Branches:' as info;
SELECT 
    id,
    name,
    is_active
FROM branches 
WHERE is_active = true
ORDER BY name;

-- Show users without branch assignment
SELECT 'Users Without Branch Assignment:' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.is_active,
    ur.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.role_id = ur.id
WHERE u.branch_id IS NULL
ORDER BY u.full_name;

-- =====================================================
-- ASSIGNMENT OPTIONS
-- =====================================================

-- Option 1: Assign all users without a branch to the first active branch
-- Uncomment the line below to execute this assignment
-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE is_active = true ORDER BY name LIMIT 1)
-- WHERE branch_id IS NULL;

-- Option 2: Assign specific user to specific branch (replace with actual IDs)
-- Uncomment and modify the lines below to execute specific assignments
-- UPDATE users 
-- SET branch_id = 'your-branch-id-here'
-- WHERE email = 'user@example.com';

-- Option 3: Assign users based on role
-- Uncomment and modify the lines below to execute role-based assignments
-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE name = 'Main Store' LIMIT 1)
-- WHERE role_id = (SELECT id FROM user_roles WHERE name = 'admin' LIMIT 1)
-- AND branch_id IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- After running assignments, verify the results
SELECT 'After Assignment - Users and Their Branches:' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.is_active,
    ur.name as role_name,
    b.name as branch_name,
    b.id as branch_id
FROM users u
LEFT JOIN user_roles ur ON u.role_id = ur.id
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.full_name;

-- Show summary by branch
SELECT 'Branch Assignment Summary:' as info;
SELECT 
    b.name as branch_name,
    COUNT(u.id) as user_count
FROM branches b
LEFT JOIN users u ON b.id = u.branch_id
WHERE b.is_active = true
GROUP BY b.id, b.name
ORDER BY b.name;

-- Show any remaining users without branch assignment
SELECT 'Remaining Users Without Branch Assignment:' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.is_active,
    ur.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.role_id = ur.id
WHERE u.branch_id IS NULL
ORDER BY u.full_name; 