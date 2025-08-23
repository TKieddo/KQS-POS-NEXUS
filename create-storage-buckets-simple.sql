-- Simplified Storage Buckets Migration
-- This script creates storage buckets using the Supabase client API approach
-- Run this in your Supabase SQL Editor

-- =====================================================
-- GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant storage permissions to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- =====================================================
-- VERIFY CURRENT BUCKETS
-- =====================================================

-- Check what buckets currently exist
SELECT 
    'Current storage buckets' as status,
    COUNT(*) as total_buckets
FROM storage.buckets;

-- Show existing bucket details
SELECT 
    name as bucket_name,
    public,
    file_size_limit,
    created_at
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- CREATE STORAGE POLICIES (if buckets exist)
-- =====================================================

-- Enable RLS on storage objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can access backups" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access exports" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access documents" ON storage.objects;

-- Create policies for existing buckets
CREATE POLICY "Authenticated users can access backups" ON storage.objects
    FOR ALL USING (
        bucket_id = 'backups' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can access exports" ON storage.objects
    FOR ALL USING (
        bucket_id = 'exports' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Public can view product images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images'
    );

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can access receipts" ON storage.objects
    FOR ALL USING (
        bucket_id = 'receipts' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can access documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'documents' AND auth.role() = 'authenticated'
    );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify policies were created
SELECT 
    'Storage policies created successfully' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Show all storage policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname; 