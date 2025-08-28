-- Simple RLS fix for customers table - POS access
-- This creates a basic policy that allows all authenticated users to read customers

-- First, let's see what we're working with
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'customers';

-- Check if RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';

-- Check existing policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'customers';

-- Option 1: Disable RLS completely (temporary fix)
-- ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a simple policy that allows all authenticated users to read
-- This is the recommended approach for POS systems
DROP POLICY IF EXISTS "pos_customer_read_access" ON public.customers;
CREATE POLICY "pos_customer_read_access" ON public.customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Option 3: Most permissive - allow all operations for authenticated users
-- Use this only if the above options don't work
DROP POLICY IF EXISTS "pos_customer_full_access" ON public.customers;
CREATE POLICY "pos_customer_full_access" ON public.customers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verify the new policy
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Test query to see if it works
-- This should return customers if the policy is working
SELECT COUNT(*) as customer_count FROM public.customers;
