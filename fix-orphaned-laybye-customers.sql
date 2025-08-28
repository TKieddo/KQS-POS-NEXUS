-- Fix Orphaned Laybye Customer References
-- This script identifies laybye orders with customer IDs that don't exist in the customers table

-- ========================================
-- STEP 1: IDENTIFY ORPHANED CUSTOMER REFERENCES
-- ========================================

-- Find laybye orders with customer IDs that don't exist in customers table
SELECT 
    'Orphaned Customer References in Laybye Orders' as info,
    lo.id as laybye_id,
    lo.order_number,
    lo.customer_id,
    lo.created_at,
    lo.status
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL
ORDER BY lo.created_at DESC;

-- Count orphaned references
SELECT 
    'Summary: Orphaned Customer References' as info,
    COUNT(*) as orphaned_count,
    COUNT(CASE WHEN lo.status = 'active' THEN 1 END) as active_orphaned,
    COUNT(CASE WHEN lo.status = 'completed' THEN 1 END) as completed_orphaned
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL;

-- ========================================
-- STEP 2: OPTIONS TO FIX ORPHANED REFERENCES
-- ========================================

-- Option A: Set customer_id to NULL for orphaned references
-- (Uncomment and run if you want to remove orphaned customer references)
/*
UPDATE laybye_orders 
SET customer_id = NULL
WHERE customer_id IN (
    SELECT lo.customer_id
    FROM laybye_orders lo
    LEFT JOIN customers c ON lo.customer_id = c.id
    WHERE lo.customer_id IS NOT NULL 
      AND c.id IS NULL
);
*/

-- Option B: Create placeholder customers for orphaned references
-- (Uncomment and run if you want to create placeholder customers)
/*
INSERT INTO customers (id, first_name, last_name, email, phone, created_at, updated_at)
SELECT 
    lo.customer_id,
    'Unknown',
    'Customer',
    'unknown@deleted.com',
    '000-000-0000',
    NOW(),
    NOW()
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL
  AND lo.customer_id NOT IN (SELECT id FROM customers);
*/

-- ========================================
-- STEP 3: VERIFY THE FIX
-- ========================================

-- Check if any orphaned references remain
SELECT 
    'Verification: Remaining Orphaned References' as info,
    COUNT(*) as remaining_orphaned
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL;

-- Show sample of fixed laybye orders
SELECT 
    'Sample Fixed Laybye Orders' as info,
    lo.order_number,
    lo.customer_id,
    CASE 
        WHEN c.id IS NOT NULL THEN 'Customer Found'
        WHEN lo.customer_id IS NULL THEN 'No Customer Reference'
        ELSE 'Still Orphaned'
    END as status,
    COALESCE(c.first_name || ' ' || c.last_name, 'Unknown Customer') as customer_name
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
ORDER BY lo.created_at DESC
LIMIT 10;

-- ========================================
-- STEP 4: PREVENTION FUNCTION
-- ========================================

-- Function to validate customer references before creating laybye orders
CREATE OR REPLACE FUNCTION validate_customer_reference(
    p_customer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_customer_exists BOOLEAN;
BEGIN
    -- Check if customer exists
    SELECT EXISTS(
        SELECT 1 FROM customers WHERE id = p_customer_id
    ) INTO v_customer_exists;
    
    RETURN v_customer_exists;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: SUMMARY
-- ========================================

SELECT 
    'FIX SUMMARY' as info,
    '✅ Identified orphaned customer references' as action_1,
    '✅ Provided options to fix orphaned references' as action_2,
    '✅ Created prevention function' as action_3,
    '✅ Verification queries provided' as action_4;
