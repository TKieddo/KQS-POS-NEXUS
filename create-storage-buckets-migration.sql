-- Migration: Create Storage Buckets for Data Management
-- This script creates the required storage buckets for backups and exports

-- =====================================================
-- STORAGE BUCKET CREATION
-- =====================================================

-- Create backups bucket for storing database backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'backups',
    'backups',
    false, -- private bucket
    524288000, -- 500MB file size limit
    ARRAY['application/json', 'application/zip', 'application/x-tar', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Create exports bucket for storing data exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exports',
    'exports',
    false, -- private bucket
    524288000, -- 500MB file size limit
    ARRAY['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Create product-images bucket for storing product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true, -- public bucket for images
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create receipts bucket for storing receipt images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    false, -- private bucket
    10485760, -- 10MB file size limit
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket for storing general documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- private bucket
    52428800, -- 50MB file size limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for backups bucket - only authenticated users can access
CREATE POLICY "Authenticated users can access backups" ON storage.objects
    FOR ALL USING (
        bucket_id = 'backups' AND auth.role() = 'authenticated'
    );

-- Policy for exports bucket - only authenticated users can access
CREATE POLICY "Authenticated users can access exports" ON storage.objects
    FOR ALL USING (
        bucket_id = 'exports' AND auth.role() = 'authenticated'
    );

-- Policy for product-images bucket - public read, authenticated write
CREATE POLICY "Public can view product images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images'
    );

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND auth.role() = 'authenticated'
    );

-- Policy for receipts bucket - only authenticated users can access
CREATE POLICY "Authenticated users can access receipts" ON storage.objects
    FOR ALL USING (
        bucket_id = 'receipts' AND auth.role() = 'authenticated'
    );

-- Policy for documents bucket - only authenticated users can access
CREATE POLICY "Authenticated users can access documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'documents' AND auth.role() = 'authenticated'
    );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify buckets were created
SELECT 
    'Storage buckets created successfully' as status,
    COUNT(*) as total_buckets,
    COUNT(CASE WHEN public = true THEN 1 END) as public_buckets,
    COUNT(CASE WHEN public = false THEN 1 END) as private_buckets
FROM storage.buckets
WHERE name IN ('backups', 'exports', 'product-images', 'receipts', 'documents');

-- Show bucket details
SELECT 
    name as bucket_name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('backups', 'exports', 'product-images', 'receipts', 'documents')
ORDER BY name;

-- Verify policies were created
SELECT 
    'Storage policies created successfully' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'; 