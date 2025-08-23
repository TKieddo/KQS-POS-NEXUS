-- =====================================================
-- Disable All RLS Temporarily for Testing
-- =====================================================

-- Disable RLS on all user management tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY; 