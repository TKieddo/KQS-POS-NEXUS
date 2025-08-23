-- Fix duplicate pricing settings records
-- This script will clean up duplicates and add a unique constraint

-- Step 1: Delete duplicate records, keeping only the most recent one per branch
DELETE FROM product_pricing_settings 
WHERE id NOT IN (
  SELECT DISTINCT ON (branch_id) id 
  FROM product_pricing_settings 
  ORDER BY branch_id, created_at DESC
);

-- Step 2: Add a unique constraint on branch_id to prevent future duplicates
-- First, drop any existing constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_pricing_settings_branch_id_key'
  ) THEN
    ALTER TABLE product_pricing_settings DROP CONSTRAINT product_pricing_settings_branch_id_key;
  END IF;
END $$;

-- Add the unique constraint
ALTER TABLE product_pricing_settings 
ADD CONSTRAINT product_pricing_settings_branch_id_key 
UNIQUE (branch_id);

-- Step 3: Verify the cleanup
SELECT 
  branch_id, 
  COUNT(*) as record_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM product_pricing_settings 
GROUP BY branch_id 
ORDER BY record_count DESC;

-- Step 4: Show current settings
SELECT 
  id,
  branch_id,
  default_markup_percentage,
  min_profit_margin,
  competitive_pricing_enabled,
  auto_price_adjustment,
  bulk_update_enabled,
  discount_management_enabled,
  price_optimization_enabled,
  created_at,
  updated_at
FROM product_pricing_settings 
ORDER BY created_at DESC; 