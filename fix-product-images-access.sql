-- Fix product images access issue
-- Run this in your Supabase SQL editor

-- Enable RLS on product_images table (if not already enabled)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read product_images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated insert product_images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated update product_images" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated delete product_images" ON product_images;

-- Create policies for product_images
CREATE POLICY "Allow authenticated read product_images" ON product_images
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert product_images" ON product_images
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update product_images" ON product_images
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete product_images" ON product_images
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Also ensure product_variants table has proper policies
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow authenticated insert product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow authenticated update product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow authenticated delete product_variants" ON product_variants;

CREATE POLICY "Allow authenticated read product_variants" ON product_variants
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert product_variants" ON product_variants
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update product_variants" ON product_variants
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete product_variants" ON product_variants
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Ensure product_variant_options table has proper policies
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read product_variant_options" ON product_variant_options;
DROP POLICY IF EXISTS "Allow authenticated insert product_variant_options" ON product_variant_options;
DROP POLICY IF EXISTS "Allow authenticated update product_variant_options" ON product_variant_options;
DROP POLICY IF EXISTS "Allow authenticated delete product_variant_options" ON product_variant_options;

CREATE POLICY "Allow authenticated read product_variant_options" ON product_variant_options
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert product_variant_options" ON product_variant_options
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update product_variant_options" ON product_variant_options
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete product_variant_options" ON product_variant_options
    FOR DELETE
    USING (auth.role() = 'authenticated'); 