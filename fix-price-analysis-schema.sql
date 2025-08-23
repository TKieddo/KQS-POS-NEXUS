-- Fix Price Analysis Schema
-- This script updates the price_analysis_data table to allow nullable product_id for calculator data

-- Check if the table exists and has the constraint
DO $$
BEGIN
    -- Drop the existing foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'price_analysis_data_product_id_fkey' 
        AND table_name = 'price_analysis_data'
    ) THEN
        ALTER TABLE price_analysis_data DROP CONSTRAINT price_analysis_data_product_id_fkey;
    END IF;
END $$;

-- Modify the product_id column to allow NULL values
ALTER TABLE price_analysis_data ALTER COLUMN product_id DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE CASCADE
ALTER TABLE price_analysis_data 
ADD CONSTRAINT price_analysis_data_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Add a comment to explain the nullable product_id
COMMENT ON COLUMN price_analysis_data.product_id IS 'Product ID for specific product analysis, NULL for calculator/general analysis';

-- Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'price_analysis_data' 
AND column_name = 'product_id'; 