-- Fix RLS policies for customers table to allow POS access
-- This script will create proper policies that allow authenticated users to read customers

-- First, let's check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- Disable RLS temporarily to see if that's the issue
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Now let's create proper RLS policies for POS access
-- Re-enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to read customers (for POS operations)
DROP POLICY IF EXISTS "Allow authenticated users to read customers" ON public.customers;
CREATE POLICY "Allow authenticated users to read customers" ON public.customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Allow users to read customers from their branch (if branch_id is set)
DROP POLICY IF EXISTS "Allow users to read customers from their branch" ON public.customers;
CREATE POLICY "Allow users to read customers from their branch" ON public.customers
    FOR SELECT
    TO authenticated
    USING (
        branch_id IS NULL 
        OR branch_id IN (
            SELECT branch_id FROM public.user_branch_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 3: Allow users to read customers they created
DROP POLICY IF EXISTS "Allow users to read customers they created" ON public.customers;
CREATE POLICY "Allow users to read customers they created" ON public.customers
    FOR SELECT
    TO authenticated
    USING (created_by = auth.uid());

-- Policy 4: Allow users to insert customers
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON public.customers;
CREATE POLICY "Allow authenticated users to insert customers" ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 5: Allow users to update customers they created or from their branch
DROP POLICY IF EXISTS "Allow users to update customers" ON public.customers;
CREATE POLICY "Allow users to update customers" ON public.customers
    FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR branch_id IN (
            SELECT branch_id FROM public.user_branch_assignments 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        created_by = auth.uid()
        OR branch_id IN (
            SELECT branch_id FROM public.user_branch_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 6: Allow users to delete customers they created or from their branch
DROP POLICY IF EXISTS "Allow users to delete customers" ON public.customers;
CREATE POLICY "Allow users to delete customers" ON public.customers
    FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR branch_id IN (
            SELECT branch_id FROM public.user_branch_assignments 
            WHERE user_id = auth.uid()
        )
    );

-- Alternative: Simple policy that allows all authenticated users to read customers
-- This is more permissive but ensures POS functionality works
DROP POLICY IF EXISTS "Simple POS customer access" ON public.customers;
CREATE POLICY "Simple POS customer access" ON public.customers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;
