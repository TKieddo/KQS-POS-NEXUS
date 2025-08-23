-- Fix Cashflow RLS Policies
-- This script fixes the RLS policies that are blocking automatic daily summary creation

-- 1. Drop existing RLS policies for daily_summaries
DROP POLICY IF EXISTS "Allow authenticated users to read daily summaries" ON public.daily_summaries;

-- 2. Create new RLS policies for daily_summaries
-- Allow authenticated users to read daily summaries
CREATE POLICY "Allow authenticated users to read daily summaries" ON public.daily_summaries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert daily summaries (needed for triggers)
CREATE POLICY "Allow authenticated users to insert daily summaries" ON public.daily_summaries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update daily summaries (needed for triggers)
CREATE POLICY "Allow authenticated users to update daily summaries" ON public.daily_summaries
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Also ensure cashflow_entries policies are correct
-- Drop and recreate cashflow_entries policies to be more permissive
DROP POLICY IF EXISTS "Allow authenticated users to read cashflow entries" ON public.cashflow_entries;
DROP POLICY IF EXISTS "Allow authenticated users to insert cashflow entries" ON public.cashflow_entries;
DROP POLICY IF EXISTS "Allow authenticated users to update cashflow entries" ON public.cashflow_entries;
DROP POLICY IF EXISTS "Allow authenticated users to delete cashflow entries" ON public.cashflow_entries;

-- Recreate cashflow_entries policies
CREATE POLICY "Allow authenticated users to read cashflow entries" ON public.cashflow_entries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert cashflow entries" ON public.cashflow_entries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update cashflow entries" ON public.cashflow_entries
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete cashflow entries" ON public.cashflow_entries
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Verify the policies
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
WHERE tablename IN ('cashflow_entries', 'daily_summaries', 'cashflow_categories')
ORDER BY tablename, policyname;

-- 5. Test the function again
SELECT 'RLS policies updated successfully' as status;
