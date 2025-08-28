-- Add Foreign Key Constraint for Laybye Orders to Customers
-- This ensures referential integrity between laybye_orders and customers tables

-- ========================================
-- STEP 1: CHECK EXISTING CONSTRAINTS
-- ========================================

-- Check if foreign key constraint already exists
SELECT 
    'Checking for existing foreign key constraints' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'laybye_orders'
    AND kcu.column_name = 'customer_id';

-- ========================================
-- STEP 2: ADD FOREIGN KEY CONSTRAINT
-- ========================================

-- Add foreign key constraint if it doesn't exist
-- This ensures that customer_id in laybye_orders references id in customers
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'laybye_orders_customer_id_fkey'
        AND table_name = 'laybye_orders'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE laybye_orders 
        ADD CONSTRAINT laybye_orders_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key constraint laybye_orders_customer_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint laybye_orders_customer_id_fkey already exists';
    END IF;
END $$;

-- ========================================
-- STEP 3: VERIFY THE CONSTRAINT
-- ========================================

-- Verify the constraint was added
SELECT 
    'Verification: Foreign Key Constraint' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'laybye_orders'
    AND kcu.column_name = 'customer_id';

-- ========================================
-- STEP 4: TEST CUSTOMER JOIN
-- ========================================

-- Test the join between laybye_orders and customers
SELECT 
    'Test: Laybye Orders with Customer Data' as info,
    lo.order_number,
    lo.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
ORDER BY lo.created_at DESC
LIMIT 5;

-- ========================================
-- STEP 5: SUMMARY
-- ========================================

SELECT 
    'FOREIGN KEY CONSTRAINT SUMMARY' as info,
    '✅ Checked existing constraints' as action_1,
    '✅ Added foreign key constraint (if missing)' as action_2,
    '✅ Verified constraint exists' as action_3,
    '✅ Tested customer join' as action_4;
