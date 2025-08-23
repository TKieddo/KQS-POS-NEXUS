-- Configure Storage Buckets Migration
-- This script configures existing buckets with proper policies
-- Run this AFTER manually creating the buckets in Supabase Dashboard

-- =====================================================
-- STEP 1: VERIFY BUCKETS EXIST
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
-- STEP 2: CONFIGURE STORAGE OBJECTS
-- =====================================================

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: CREATE POLICIES FOR EACH BUCKET
-- =====================================================

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can access backups" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access exports" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can access documents" ON storage.objects;

-- Create policies for each bucket type
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
-- STEP 4: VERIFICATION
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

-- Show bucket configuration summary
SELECT 
    b.name as bucket_name,
    b.public,
    CASE WHEN p.policyname IS NOT NULL THEN 'Configured' ELSE 'No Policy' END as policy_status,
    b.created_at
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.qual LIKE '%' || b.name || '%' AND p.schemaname = 'storage'
WHERE b.name IN ('backups', 'exports', 'product-images', 'receipts', 'documents')
ORDER BY b.name;

-- =====================================================
-- STEP 5: FINAL STATUS
-- =====================================================

-- Show final configuration status
SELECT 
    'Configuration Complete' as status,
    'All storage buckets are now configured with proper policies' as message,
    NOW() as configured_at; 