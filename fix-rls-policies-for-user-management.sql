-- =====================================================
-- Fix RLS Policies for User Management
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;

-- Create simplified RLS policies that allow proper user management

-- Allow all authenticated users to view users
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

-- Also fix security_settings policies
DROP POLICY IF EXISTS "Authenticated users can view security settings" ON security_settings;
DROP POLICY IF EXISTS "Admins can manage security settings" ON security_settings;

CREATE POLICY "Allow authenticated users to view security settings" ON security_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert security settings" ON security_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update security settings" ON security_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete security settings" ON security_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Fix user_activity_logs policies
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON user_activity_logs;

CREATE POLICY "Allow authenticated users to view activity logs" ON user_activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert activity logs" ON user_activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update activity logs" ON user_activity_logs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete activity logs" ON user_activity_logs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'user_roles', 'permissions', 'role_permissions', 'security_settings', 'user_activity_logs')
ORDER BY tablename, policyname; 