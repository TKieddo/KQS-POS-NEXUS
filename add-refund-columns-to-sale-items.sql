-- Add Refund Columns to sale_items Table
-- This script adds the missing columns needed for refund tracking

-- ========================================
-- ADD MISSING COLUMNS TO sale_items TABLE
-- ========================================

-- Add refunded column (boolean flag to mark if item has been refunded)
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false;

-- Add refund_amount column (amount that was refunded)
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0;

-- Add refund_date column (when the refund was processed)
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP WITH TIME ZONE;

-- ========================================
-- CREATE INDEX FOR REFUND QUERIES
-- ========================================

-- Create index for refunded items queries
CREATE INDEX IF NOT EXISTS idx_sale_items_refunded ON sale_items(refunded);

-- Create index for refund date queries
CREATE INDEX IF NOT EXISTS idx_sale_items_refund_date ON sale_items(refund_date);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if columns were added successfully
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('refunded', 'refund_amount', 'refund_date') 
        THEN '✅ Added' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'sale_items'
  AND column_name IN ('refunded', 'refund_amount', 'refund_date')
ORDER BY column_name;

-- Check if indexes were created
SELECT 
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_sale_items_refund%'
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'sale_items'
  AND indexname LIKE 'idx_sale_items_refund%';

-- Show current sale_items table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'sale_items'
ORDER BY ordinal_position;
