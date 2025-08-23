-- =====================================================
-- Assign Existing Users to Branches
-- =====================================================

-- First, let's see the current state
SELECT 'Before Assignment - Users and Their Branches:' as info;
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

-- Assign users to branches based on email or other criteria
-- You can customize these assignments based on your needs

-- Option 1: Assign all users without a branch to Main Store
UPDATE users 
SET branch_id = (SELECT id FROM branches WHERE name = 'Main Store' LIMIT 1)
WHERE branch_id IS NULL;

-- Option 2: Assign specific users to specific branches (uncomment and modify as needed)
-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE name = 'North Branch' LIMIT 1)
-- WHERE email LIKE '%north%' OR full_name LIKE '%north%';

-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE name = 'South Branch' LIMIT 1)
-- WHERE email LIKE '%south%' OR full_name LIKE '%south%';

-- Option 3: Assign users based on role (uncomment and modify as needed)
-- Assign admins to Main Store
-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE name = 'Main Store' LIMIT 1)
-- WHERE role_id = (SELECT id FROM user_roles WHERE name = 'admin' LIMIT 1);

-- Assign cashiers to different branches (example)
-- UPDATE users 
-- SET branch_id = (SELECT id FROM branches WHERE name = 'North Branch' LIMIT 1)
-- WHERE role_id = (SELECT id FROM user_roles WHERE name = 'cashier' LIMIT 1)
-- AND id IN (SELECT id FROM users ORDER BY created_at LIMIT 2);

-- Show the results after assignment
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

-- Show summary
SELECT 'Assignment Summary:' as info;
SELECT 
    b.name as branch_name,
    COUNT(u.id) as user_count
FROM branches b
LEFT JOIN users u ON b.id = u.branch_id
GROUP BY b.id, b.name
ORDER BY b.name;

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