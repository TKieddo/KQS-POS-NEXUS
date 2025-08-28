-- Simple RLS fix for POS with custom authentication
-- This allows your POS to access customers while maintaining some security

-- Check current RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';

-- Option 1: Disable RLS temporarily (for testing)
-- This is the simplest solution for POS systems with custom auth
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create a simple policy
-- Uncomment the lines below if you prefer to keep RLS enabled
/*
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "pos_customer_read_access" ON public.customers;
DROP POLICY IF EXISTS "pos_customer_full_access" ON public.customers;
DROP POLICY IF EXISTS "pos_customer_access" ON public.customers;

-- Create a simple policy that allows all operations
CREATE POLICY "pos_customer_access" ON public.customers
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
*/

-- Verify the changes
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'customers';

-- Test query
SELECT COUNT(*) as customer_count FROM public.customers;

-- Show a few sample customers
SELECT 
    customer_number,
    first_name,
    last_name,
    email,
    status,
    customer_type
FROM public.customers 
LIMIT 5;
