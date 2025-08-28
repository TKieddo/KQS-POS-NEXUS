-- Fix Laybye Quantity Logic
-- This script ensures quantities are only deducted when creating laybye orders, not when completing them

-- ========================================
-- STEP 1: CREATE FUNCTION TO DEDUCT QUANTITIES ON LAYBYE CREATION
-- ========================================

-- Function to deduct quantities when laybye order is created
CREATE OR REPLACE FUNCTION deduct_quantities_on_laybye_creation(
    p_laybye_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_laybye_item RECORD;
    v_branch_id UUID;
    v_updated_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get branch_id from laybye order
    SELECT branch_id INTO v_branch_id
    FROM laybye_orders
    WHERE id = p_laybye_id;
    
    IF v_branch_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Branch ID not found for laybye order'
        );
    END IF;
    
    -- Process each laybye item
    FOR v_laybye_item IN 
        SELECT 
            li.product_id,
            li.quantity,
            li.variant_id
        FROM laybye_items li
        WHERE li.laybye_id = p_laybye_id
    LOOP
        BEGIN
            -- Deduct quantity from branch stock
            IF v_laybye_item.variant_id IS NOT NULL THEN
                -- Update variant stock in branch_stock table
                UPDATE branch_stock 
                SET 
                    stock_quantity = GREATEST(0, stock_quantity - v_laybye_item.quantity),
                    updated_at = NOW()
                WHERE product_id = v_laybye_item.product_id 
                  AND branch_id = v_branch_id 
                  AND variant_id = v_laybye_item.variant_id;
            ELSE
                -- Update main product stock in branch_stock table
                UPDATE branch_stock 
                SET 
                    stock_quantity = GREATEST(0, stock_quantity - v_laybye_item.quantity),
                    updated_at = NOW()
                WHERE product_id = v_laybye_item.product_id 
                  AND branch_id = v_branch_id 
                  AND variant_id IS NULL;
            END IF;
            
            v_updated_count := v_updated_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error processing item: ' || SQLERRM);
        END;
    END LOOP;
    
    -- Create stock movement records for laybye creation
    INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes
    )
    SELECT 
        li.product_id,
        'out',
        -li.quantity,
        'laybye_creation',
        p_laybye_id,
        'Laybye creation - items reserved'
    FROM laybye_items li
    WHERE li.laybye_id = p_laybye_id;
    
    RETURN json_build_object(
        'success', true,
        'updated_count', v_updated_count,
        'errors', v_errors,
        'message', 'Quantities deducted successfully on laybye creation'
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: CREATE FUNCTION TO COMPLETE LAYBYE WITHOUT DEDUCTING QUANTITIES
-- ========================================

-- Function to complete laybye order without deducting quantities (they were already deducted)
CREATE OR REPLACE FUNCTION complete_laybye_without_quantity_deduction(
    p_laybye_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_laybye_order RECORD;
BEGIN
    -- Get laybye order details
    SELECT * INTO v_laybye_order
    FROM laybye_orders
    WHERE id = p_laybye_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Laybye order not found'
        );
    END IF;
    
    -- Update laybye order status to completed
    UPDATE laybye_orders
    SET 
        status = 'completed',
        updated_at = NOW()
    WHERE id = p_laybye_id;
    
    -- Create stock movement records for laybye completion (no quantity change, just status change)
    INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes
    )
    SELECT 
        li.product_id,
        'none',
        0,
        'laybye_completion',
        p_laybye_id,
        'Laybye completion - items already reserved'
    FROM laybye_items li
    WHERE li.laybye_id = p_laybye_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Laybye order completed successfully (quantities already deducted during creation)'
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 3: FIX ANY EXISTING LAYBYE ORDERS WITH DOUBLE DEDUCTION
-- ========================================

-- Function to restore quantities for laybye orders that were double-deducted
CREATE OR REPLACE FUNCTION fix_double_deducted_laybye_orders()
RETURNS JSON AS $$
DECLARE
    v_laybye_order RECORD;
    v_laybye_item RECORD;
    v_restored_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Find completed laybye orders that might have been double-deducted
    FOR v_laybye_order IN 
        SELECT id, branch_id
        FROM laybye_orders
        WHERE status = 'completed'
    LOOP
        -- Process each laybye item
        FOR v_laybye_item IN 
            SELECT 
                li.product_id,
                li.quantity,
                li.variant_id
            FROM laybye_items li
            WHERE li.laybye_id = v_laybye_order.id
        LOOP
            BEGIN
                -- Restore quantity to branch stock (add back what was double-deducted)
                IF v_laybye_item.variant_id IS NOT NULL THEN
                    -- Update variant stock in branch_stock table
                    UPDATE branch_stock 
                    SET 
                        stock_quantity = stock_quantity + v_laybye_item.quantity,
                        updated_at = NOW()
                    WHERE product_id = v_laybye_item.product_id 
                      AND branch_id = v_laybye_order.branch_id 
                      AND variant_id = v_laybye_item.variant_id;
                ELSE
                    -- Update main product stock in branch_stock table
                    UPDATE branch_stock 
                    SET 
                        stock_quantity = stock_quantity + v_laybye_item.quantity,
                        updated_at = NOW()
                    WHERE product_id = v_laybye_item.product_id 
                      AND branch_id = v_laybye_order.branch_id 
                      AND variant_id IS NULL;
                END IF;
                
                v_restored_count := v_restored_count + 1;
                
            EXCEPTION WHEN OTHERS THEN
                v_errors := array_append(v_errors, 'Error restoring item: ' || SQLERRM);
            END;
        END LOOP;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'restored_count', v_restored_count,
        'errors', v_errors,
        'message', 'Fixed double-deducted laybye orders'
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 4: EXECUTE THE FIXES
-- ========================================

-- Fix any existing double-deducted laybye orders
SELECT fix_double_deducted_laybye_orders();

-- ========================================
-- STEP 5: VERIFY THE FIXES
-- ========================================

-- Show completed laybye orders
SELECT 
    'Completed Laybye Orders' as info,
    order_number,
    total_amount,
    remaining_balance,
    status,
    (SELECT COUNT(*) FROM laybye_items WHERE laybye_id = lo.id) as item_count
FROM laybye_orders lo
WHERE status = 'completed'
ORDER BY updated_at DESC
LIMIT 5;

-- Show sample branch stock for verification
SELECT 
    'Sample Branch Stock' as info,
    product_id,
    branch_id,
    stock_quantity,
    updated_at
FROM branch_stock
ORDER BY updated_at DESC
LIMIT 10;
