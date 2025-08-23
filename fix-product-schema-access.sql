-- Fix Product Schema Access and RLS Policies
-- This script ensures all product-related tables have proper RLS policies

-- Enable RLS on all product-related tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_option_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_variant_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON products;

DROP POLICY IF EXISTS "Enable read access for all users" ON product_variants;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON product_variants;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON product_variants;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON product_variants;

DROP POLICY IF EXISTS "Enable read access for all users" ON product_images;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON product_images;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON product_images;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON product_images;

DROP POLICY IF EXISTS "Enable read access for all users" ON product_variant_options;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON product_variant_options;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON product_variant_options;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON product_variant_options;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON variant_option_types;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON variant_option_types;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON variant_option_types;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON variant_option_types;

DROP POLICY IF EXISTS "Enable read access for all users" ON variant_options;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON variant_options;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON variant_options;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON variant_options;

DROP POLICY IF EXISTS "Enable read access for all users" ON category_variant_configs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON category_variant_configs;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON category_variant_configs;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON category_variant_configs;

-- Create policies for products table
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_variants table
CREATE POLICY "Enable read access for all users" ON product_variants
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON product_variants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON product_variants
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON product_variants
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_images table
CREATE POLICY "Enable read access for all users" ON product_images
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON product_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON product_images
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON product_images
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_variant_options table
CREATE POLICY "Enable read access for all users" ON product_variant_options
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON product_variant_options
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON product_variant_options
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON product_variant_options
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for categories table
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for variant_option_types table
CREATE POLICY "Enable read access for all users" ON variant_option_types
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON variant_option_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON variant_option_types
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON variant_option_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for variant_options table
CREATE POLICY "Enable read access for all users" ON variant_options
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON variant_options
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON variant_options
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON variant_options
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for category_variant_configs table
CREATE POLICY "Enable read access for all users" ON category_variant_configs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON category_variant_configs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON category_variant_configs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON category_variant_configs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the products table structure
-- This will show you the exact columns that exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Verify the product_variants table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

-- Verify the product_images table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- Test insert permissions
-- You can run this to test if the policies work (will fail if not authenticated)
-- INSERT INTO categories (name, description, color, is_active) VALUES ('Test Category', 'Test Description', '#3B82F6', true); 