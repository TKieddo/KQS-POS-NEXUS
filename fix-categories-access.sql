-- Quick fix for categories access issue
-- Run this in your Supabase SQL editor

-- Enable RLS on categories table (if not already enabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated insert categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated update categories" ON categories;

-- Create policies for categories
CREATE POLICY "Allow anonymous read categories" ON categories
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow authenticated insert categories" ON categories
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update categories" ON categories
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Also fix variant options access
ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read variant_options" ON variant_options;
CREATE POLICY "Allow anonymous read variant_options" ON variant_options
    FOR SELECT
    USING (is_active = true);

-- Fix variant option types access
ALTER TABLE variant_option_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read variant_option_types" ON variant_option_types;
CREATE POLICY "Allow anonymous read variant_option_types" ON variant_option_types
    FOR SELECT
    USING (is_active = true);

SELECT 'Categories access fixed!' as status; 