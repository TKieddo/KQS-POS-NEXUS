-- Fix RLS policies for storage buckets
-- This script disables RLS on storage buckets to allow bucket creation

-- First, let's see what storage buckets exist and their RLS status
SELECT 
    name as bucket_name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Disable RLS on storage buckets (if they exist)
-- Note: Storage buckets don't have traditional RLS like tables, but there are policies

-- Check if there are any storage policies that might be blocking bucket creation
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
WHERE tablename LIKE '%storage%' OR schemaname = 'storage';

-- For Supabase storage, we need to ensure the authenticated user has proper permissions
-- Let's create a simple bucket creation policy if needed

-- Grant storage permissions to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- If there are any restrictive storage policies, we can drop them
-- (This is usually not needed for storage buckets, but just in case)

-- Verify the changes
SELECT 
    'Storage permissions updated' as status,
    COUNT(*) as buckets_count
FROM storage.buckets; 