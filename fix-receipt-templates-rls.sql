-- Fix RLS policies for receipt_templates table
-- This will allow POS users to read and create receipt templates

-- First, let's check the current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'receipt_templates';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON receipt_templates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON receipt_templates;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON receipt_templates;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON receipt_templates;

-- Create new policies that allow proper access
-- Policy for reading receipt templates (users can read templates for their branch)
CREATE POLICY "Enable read access for authenticated users" ON receipt_templates
    FOR SELECT
    TO authenticated
    USING (
        branch_id IN (
            SELECT branch_id 
            FROM user_branch_access 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for inserting receipt templates (users can create templates for their branch)
CREATE POLICY "Enable insert for authenticated users" ON receipt_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        branch_id IN (
            SELECT branch_id 
            FROM user_branch_access 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for updating receipt templates (users can update templates for their branch)
CREATE POLICY "Enable update for authenticated users" ON receipt_templates
    FOR UPDATE
    TO authenticated
    USING (
        branch_id IN (
            SELECT branch_id 
            FROM user_branch_access 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        branch_id IN (
            SELECT branch_id 
            FROM user_branch_access 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for deleting receipt templates (users can delete templates for their branch)
CREATE POLICY "Enable delete for authenticated users" ON receipt_templates
    FOR DELETE
    TO authenticated
    USING (
        branch_id IN (
            SELECT branch_id 
            FROM user_branch_access 
            WHERE user_id = auth.uid()
        )
    );

-- Also create a policy that allows reading templates by branch_id for POS operations
CREATE POLICY "Enable read access for POS operations" ON receipt_templates
    FOR SELECT
    TO authenticated
    USING (true); -- Allow reading all templates for POS operations

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON receipt_templates TO authenticated;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'receipt_templates';
