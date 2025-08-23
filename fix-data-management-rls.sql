-- Fix RLS policies for data management tables
-- This script updates the RLS policies to allow authenticated users to create backups

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('backup_history', 'export_history', 'cleanup_history', 'data_management_settings');

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can create backup history for their branch" ON backup_history;
DROP POLICY IF EXISTS "Users can create export history for their branch" ON export_history;
DROP POLICY IF EXISTS "Users can create cleanup history for their branch" ON cleanup_history;
DROP POLICY IF EXISTS "Admins can manage data management settings for their branch" ON data_management_settings;

-- Create more permissive policies for authenticated users
CREATE POLICY "Allow authenticated users to create backup history" ON backup_history
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update backup history" ON backup_history
    FOR UPDATE USING (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to create export history" ON export_history
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update export history" ON export_history
    FOR UPDATE USING (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to create cleanup history" ON cleanup_history
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update cleanup history" ON cleanup_history
    FOR UPDATE USING (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to manage data management settings" ON data_management_settings
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

-- Keep the existing SELECT policies for viewing data
-- These are already working fine

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('backup_history', 'export_history', 'cleanup_history', 'data_management_settings')
ORDER BY tablename, policyname; 