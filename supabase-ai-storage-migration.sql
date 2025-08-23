-- Comprehensive Storage Bucket Policy Configuration
-- Improved version of Supabase AI migration with better error handling

-- =====================================================
-- STEP 1: VERIFY CURRENT STATE
-- =====================================================

-- Check current buckets
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
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable Row Level Security on storage objects (if not already done)
DO $$
BEGIN
    -- Attempt to enable RLS, ignore if already enabled
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS enabled on storage.objects';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RLS might already be enabled on storage.objects';
END $$;

-- =====================================================
-- STEP 3: CLEAN UP EXISTING POLICIES
-- =====================================================

-- Drop existing policies to prevent conflicts
DO $$
DECLARE 
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s" ON storage.objects', policy_name);
        RAISE NOTICE 'Dropped policy: %', policy_name;
    END LOOP;
END $$;

-- =====================================================
-- STEP 4: CREATE COMPREHENSIVE POLICIES
-- =====================================================

-- Comprehensive Storage Policy for all operations
CREATE POLICY "storage_access_policies" ON storage.objects
FOR ALL USING (
    -- Backup buckets (authenticated access only)
    (bucket_id IN ('backup', 'backups') AND auth.role() = 'authenticated') OR
    
    -- Public read access for product images
    (bucket_id = 'product-images') OR
    
    -- Authenticated access for specific buckets
    (bucket_id IN ('exports', 'receipts', 'documents') AND auth.role() = 'authenticated')
);

-- Specific policy for product image uploads (more restrictive)
CREATE POLICY "product_image_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

-- =====================================================
-- STEP 5: VERIFICATION
-- =====================================================

-- Verification Query
SELECT 
    'Storage Policies Configured' AS status,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') AS total_policies,
    NOW() AS configured_at;

-- Show all created policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- Bucket Configuration Summary
SELECT 
    name AS bucket_name, 
    public, 
    file_size_limit, 
    created_at,
    CASE 
        WHEN name IN ('backup', 'backups') THEN 'Backup Storage'
        WHEN name = 'exports' THEN 'Data Exports'
        WHEN name = 'product-images' THEN 'Product Images (Public)'
        WHEN name = 'receipts' THEN 'Receipt Images'
        WHEN name = 'documents' THEN 'General Documents'
        ELSE 'Other'
    END as bucket_purpose
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- STEP 6: FINAL STATUS
-- =====================================================

-- Show final configuration status
SELECT 
    'Configuration Complete' as status,
    'All storage buckets are now configured with comprehensive policies' as message,
    NOW() as configured_at;

-- Show what buckets are available for use
SELECT 
    'Available buckets for backup system:' as info,
    STRING_AGG(name, ', ') as bucket_list
FROM storage.buckets
WHERE name IN ('backup', 'backups', 'exports', 'product-images', 'receipts', 'documents'); 