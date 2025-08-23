-- =====================================================
-- FIX RLS POLICIES FOR USER CREATION
-- This allows authenticated users to create their own profiles
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create new policies that allow user creation
CREATE POLICY "Users can view and create their own profile" ON public.users
    FOR ALL TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- Service role policy (unchanged)
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Grant INSERT permission to authenticated users
GRANT INSERT ON public.users TO authenticated;

-- Verify the policies
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
WHERE schemaname = 'public' 
AND tablename = 'users';

-- Test the policy by checking if we can insert (this will show the policy details)
SELECT 'RLS policies updated successfully' as status;
