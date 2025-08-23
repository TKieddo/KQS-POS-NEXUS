-- =====================================================
-- Simple Fix for Receipt Templates Constraint Issue
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop the problematic constraint if it exists
DROP INDEX IF EXISTS idx_receipt_templates_branch_default;

-- Check for any duplicate default templates per branch
SELECT 
    branch_id,
    COUNT(*) as default_count
FROM receipt_templates 
WHERE is_default = true 
GROUP BY branch_id 
HAVING COUNT(*) > 1;

-- If the above query returns results, run this to fix them:
-- (Keep only the first default template per branch)

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

-- Verify the fix (should return no results)
SELECT 
    branch_id,
    COUNT(*) as default_count
FROM receipt_templates 
WHERE is_default = true 
GROUP BY branch_id 
HAVING COUNT(*) > 1; 