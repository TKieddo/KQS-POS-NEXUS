-- Secure RLS Setup with Service Role Access
-- This keeps RLS enabled for security while allowing service role access

-- Check current RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';

-- Keep RLS enabled for security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Remove any existing problematic policies
DROP POLICY IF EXISTS "pos_customer_read_access" ON public.customers;
DROP POLICY IF EXISTS "pos_customer_full_access" ON public.customers;
DROP POLICY IF EXISTS "pos_customer_access" ON public.customers;

-- Create secure policies that work with your POS system
-- Policy 1: Allow read access for authenticated users (your POS users)
CREATE POLICY "pos_customer_read_access" ON public.customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Allow insert for authenticated users (creating new customers)
CREATE POLICY "pos_customer_insert_access" ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 3: Allow update for authenticated users (updating customer info)
CREATE POLICY "pos_customer_update_access" ON public.customers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow delete for authenticated users (deleting customers)
CREATE POLICY "pos_customer_delete_access" ON public.customers
    FOR DELETE
    TO authenticated
    USING (true);

-- Verify the policies
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

-- Test the policies
SELECT COUNT(*) as customer_count FROM public.customers;
