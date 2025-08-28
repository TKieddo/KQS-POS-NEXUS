-- Simple duplicate refund cleanup script
-- Run this step by step to clean up duplicate refunds

-- Step 1: Check current state
SELECT 'Current refunds count:' as info, COUNT(*) as count FROM refunds
UNION ALL
SELECT 'Current refund items count:' as info, COUNT(*) as count FROM refund_items
UNION ALL
SELECT 'Duplicate sale item refunds:' as info, COUNT(*) as count FROM (
    SELECT original_sale_item_id
    FROM refund_items
    GROUP BY original_sale_item_id
    HAVING COUNT(*) > 1
) duplicates;

-- Step 2: Show which items have duplicates
SELECT 
    original_sale_item_id,
    COUNT(*) as duplicate_count
FROM refund_items
GROUP BY original_sale_item_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 3: Remove duplicate refund items (keep the oldest one)
WITH duplicate_items AS (
    SELECT 
        id,
        original_sale_item_id,
        ROW_NUMBER() OVER (
            PARTITION BY original_sale_item_id 
            ORDER BY created_at ASC
        ) as rn
    FROM refund_items
    WHERE original_sale_item_id IN (
        SELECT original_sale_item_id
        FROM refund_items
        GROUP BY original_sale_item_id
        HAVING COUNT(*) > 1
    )
)
DELETE FROM refund_items 
WHERE id IN (
    SELECT id 
    FROM duplicate_items 
    WHERE rn > 1
);

-- Step 4: Remove orphaned refunds (refunds without items)
DELETE FROM refunds 
WHERE id NOT IN (
    SELECT DISTINCT refund_id 
    FROM refund_items
);

-- Step 5: Check final state
SELECT 'Final refunds count:' as info, COUNT(*) as count FROM refunds
UNION ALL
SELECT 'Final refund items count:' as info, COUNT(*) as count FROM refund_items
UNION ALL
SELECT 'Remaining duplicates:' as info, COUNT(*) as count FROM (
    SELECT original_sale_item_id
    FROM refund_items
    GROUP BY original_sale_item_id
    HAVING COUNT(*) > 1
) duplicates;

-- Step 6: Add constraint to prevent future duplicates (optional)
-- Uncomment the lines below if you want to add the constraint
/*
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_sale_item_refund' 
        AND table_name = 'refund_items'
    ) THEN
        ALTER TABLE refund_items 
        ADD CONSTRAINT unique_sale_item_refund 
        UNIQUE (original_sale_item_id);
        RAISE NOTICE 'Constraint added successfully';
    ELSE
        RAISE NOTICE 'Constraint already exists';
    END IF;
END $$;
*/
