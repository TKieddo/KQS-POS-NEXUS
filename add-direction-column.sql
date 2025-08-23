-- Add update_direction column to bulk_price_updates table
-- This allows users to specify whether they want to increase or decrease prices

-- Add the column if it doesn't exist
ALTER TABLE bulk_price_updates 
ADD COLUMN IF NOT EXISTS update_direction VARCHAR(20) DEFAULT 'increase' CHECK (update_direction IN ('increase', 'decrease'));

-- Update existing records to have 'increase' as default
UPDATE bulk_price_updates 
SET update_direction = 'increase' 
WHERE update_direction IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE bulk_price_updates 
ALTER COLUMN update_direction SET NOT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN bulk_price_updates.update_direction IS 'Direction of price update: increase or decrease'; 