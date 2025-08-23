-- Fix RLS policies for security_settings table
-- This script temporarily disables RLS and then sets up proper policies

-- Step 1: Temporarily disable RLS to allow operations
ALTER TABLE security_settings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view security settings for their branch" ON security_settings;
DROP POLICY IF EXISTS "Admins can manage security settings for their branch" ON security_settings;
DROP POLICY IF EXISTS "Authenticated users can view security settings" ON security_settings;
DROP POLICY IF EXISTS "Admins can manage security settings" ON security_settings;

-- Step 3: Create simpler, more permissive policies for now
-- Allow all authenticated users to view security settings
CREATE POLICY "Allow authenticated users to view security settings" ON security_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert security settings
CREATE POLICY "Allow authenticated users to insert security settings" ON security_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update security settings
CREATE POLICY "Allow authenticated users to update security settings" ON security_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete security settings
CREATE POLICY "Allow authenticated users to delete security settings" ON security_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Re-enable RLS
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'security_settings';

-- Step 6: Test access by counting records
SELECT 
    'RLS test' as status,
    COUNT(*) as security_settings_count
FROM security_settings; 