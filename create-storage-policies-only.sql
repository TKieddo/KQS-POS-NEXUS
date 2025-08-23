-- Minimal Storage Policies Migration
-- This script only creates policies for existing buckets
-- Run this AFTER creating buckets manually in Supabase Dashboard

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
-- CREATE STORAGE POLICIES ONLY
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

-- Create policies for existing buckets (only if they exist)
DO $$
BEGIN
    -- Check if backups bucket exists and create policy
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'backups') THEN
        CREATE POLICY "Authenticated users can access backups" ON storage.objects
            FOR ALL USING (
                bucket_id = 'backups' AND auth.role() = 'authenticated'
            );
        RAISE NOTICE 'Created policy for backups bucket';
    ELSE
        RAISE NOTICE 'backups bucket does not exist - skipping policy';
    END IF;

    -- Check if exports bucket exists and create policy
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'exports') THEN
        CREATE POLICY "Authenticated users can access exports" ON storage.objects
            FOR ALL USING (
                bucket_id = 'exports' AND auth.role() = 'authenticated'
            );
        RAISE NOTICE 'Created policy for exports bucket';
    ELSE
        RAISE NOTICE 'exports bucket does not exist - skipping policy';
    END IF;

    -- Check if product-images bucket exists and create policies
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'product-images') THEN
        CREATE POLICY "Public can view product images" ON storage.objects
            FOR SELECT USING (
                bucket_id = 'product-images'
            );
        CREATE POLICY "Authenticated users can upload product images" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'product-images' AND auth.role() = 'authenticated'
            );
        RAISE NOTICE 'Created policies for product-images bucket';
    ELSE
        RAISE NOTICE 'product-images bucket does not exist - skipping policies';
    END IF;

    -- Check if receipts bucket exists and create policy
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'receipts') THEN
        CREATE POLICY "Authenticated users can access receipts" ON storage.objects
            FOR ALL USING (
                bucket_id = 'receipts' AND auth.role() = 'authenticated'
            );
        RAISE NOTICE 'Created policy for receipts bucket';
    ELSE
        RAISE NOTICE 'receipts bucket does not exist - skipping policy';
    END IF;

    -- Check if documents bucket exists and create policy
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'documents') THEN
        CREATE POLICY "Authenticated users can access documents" ON storage.objects
            FOR ALL USING (
                bucket_id = 'documents' AND auth.role() = 'authenticated'
            );
        RAISE NOTICE 'Created policy for documents bucket';
    ELSE
        RAISE NOTICE 'documents bucket does not exist - skipping policy';
    END IF;
END $$;

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

-- Show which buckets have policies
SELECT 
    b.name as bucket_name,
    CASE WHEN p.policyname IS NOT NULL THEN 'Has Policy' ELSE 'No Policy' END as policy_status
FROM storage.buckets b
LEFT JOIN pg_policies p ON p.qual LIKE '%' || b.name || '%' AND p.schemaname = 'storage'
WHERE b.name IN ('backups', 'exports', 'product-images', 'receipts', 'documents')
ORDER BY b.name; 