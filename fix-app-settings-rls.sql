-- Fix RLS policies for app_settings table
-- This will allow authenticated users to insert and update settings

-- First, let's check if the table exists and drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert app settings" ON app_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update app settings" ON app_settings;

-- Disable RLS temporarily to allow all operations
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for authenticated users
CREATE POLICY "Allow authenticated users full access to app settings" ON app_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: If you want more specific policies, use these instead:
-- CREATE POLICY "Allow authenticated users to read app settings" ON app_settings
--   FOR SELECT USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated users to insert app settings" ON app_settings
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated users to update app settings" ON app_settings
--   FOR UPDATE USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated users to delete app settings" ON app_settings
--   FOR DELETE USING (auth.role() = 'authenticated');

-- Grant all permissions to authenticated users
GRANT ALL ON app_settings TO authenticated;

-- Verify the policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'app_settings';
