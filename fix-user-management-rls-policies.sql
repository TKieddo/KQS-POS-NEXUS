-- =====================================================
-- Fix User Management RLS Policies - Remove Infinite Recursion
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;

-- Create simplified RLS policies that don't cause recursion

-- Allow all authenticated users to view users (for now - you can restrict this later)
CREATE POLICY "Allow authenticated users to view users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert users (for user creation)
CREATE POLICY "Allow authenticated users to insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update users (for user management)
CREATE POLICY "Allow authenticated users to update users" ON users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete users (for user management)
CREATE POLICY "Allow authenticated users to delete users" ON users
    FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for user_roles table
CREATE POLICY "Allow authenticated users to view roles" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert roles" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update roles" ON user_roles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete roles" ON user_roles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for permissions table
CREATE POLICY "Allow authenticated users to view permissions" ON permissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert permissions" ON permissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update permissions" ON permissions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete permissions" ON permissions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Simple policies for role_permissions table
CREATE POLICY "Allow authenticated users to view role_permissions" ON role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert role_permissions" ON role_permissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update role_permissions" ON role_permissions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete role_permissions" ON role_permissions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Alternative: If you want to disable RLS temporarily for testing
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY; 