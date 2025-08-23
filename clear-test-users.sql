-- =====================================================
-- Clear Test Users (Use with caution!)
-- =====================================================

-- Delete all users (this will also delete related activity logs due to CASCADE)
DELETE FROM users;

-- Reset the sequence if you're using auto-increment IDs
-- (Not needed for UUID primary keys)

-- Alternative: Delete only specific test users
-- DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%';

-- To see what users exist before deleting:
-- SELECT id, email, full_name, created_at FROM users ORDER BY created_at; 