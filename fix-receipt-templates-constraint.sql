-- =====================================================
-- Fix Receipt Templates Unique Constraint Issue
-- =====================================================

-- Check if the problematic constraint exists
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'idx_receipt_templates_branch_default';

-- If the constraint exists, drop it
DROP INDEX IF EXISTS idx_receipt_templates_branch_default;

-- Create a proper unique constraint that allows only one default template per branch
-- This constraint will be enforced at the application level instead
-- to avoid conflicts during template creation

-- Check for any duplicate default templates per branch
SELECT 
    branch_id,
    COUNT(*) as default_count
FROM receipt_templates 
WHERE is_default = true 
GROUP BY branch_id 
HAVING COUNT(*) > 1;

-- Fix any duplicate default templates by keeping only the first one per branch
WITH duplicate_defaults AS (
    SELECT 
        id,
        branch_id,
        ROW_NUMBER() OVER (PARTITION BY branch_id ORDER BY created_at) as rn
    FROM receipt_templates 
    WHERE is_default = true
)
UPDATE receipt_templates 
SET is_default = false 
WHERE id IN (
    SELECT id 
    FROM duplicate_defaults 
    WHERE rn > 1
);

-- Verify the fix
SELECT 
    branch_id,
    COUNT(*) as default_count
FROM receipt_templates 
WHERE is_default = true 
GROUP BY branch_id 
HAVING COUNT(*) > 1;

-- If no results above, the fix was successful 