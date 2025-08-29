-- FIX SALES STOCK DEDUCTION ISSUE
-- This script ensures that product and variant quantities are properly deducted when sales are made

-- ========================================
-- STEP 1: CHECK CURRENT TRIGGER STATUS
-- ========================================

-- Check if the stock update trigger exists and is working
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_stock_on_sale_item'
AND event_object_table = 'sale_items';

-- ========================================
-- STEP 2: DROP AND RECREATE THE STOCK UPDATE FUNCTION
-- ========================================

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS update_stock_on_sale_item ON sale_items;
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;

-- Create a robust stock update function with comprehensive logging
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_product_name TEXT;
    v_variant_name TEXT;
    v_old_product_stock INTEGER;
    v_new_product_stock INTEGER;
    v_old_variant_stock INTEGER;
    v_new_variant_stock INTEGER;
    v_sale_branch_id UUID;
BEGIN
    -- Get the branch_id from the sale record
    SELECT branch_id INTO v_sale_branch_id
    FROM sales
    WHERE id = NEW.sale_id;
    
    -- Get product name for logging
    SELECT name INTO v_product_name
    FROM products
    WHERE id = NEW.product_id;
    
    -- Get variant details for logging (if applicable)
    IF NEW.variant_id IS NOT NULL THEN
        SELECT CONCAT('Variant ID: ', id::text) INTO v_variant_name
        FROM product_variants
        WHERE id = NEW.variant_id;
    END IF;
    
    -- Log the trigger execution
    RAISE NOTICE '🔧 STOCK UPDATE TRIGGER: Processing sale item for product: %, variant: %, quantity: %, branch: %', 
        v_product_name, COALESCE(v_variant_name, 'N/A'), NEW.quantity, v_sale_branch_id;
    
    -- Handle products with variants
    IF NEW.variant_id IS NOT NULL THEN
        -- Get current variant stock
        SELECT stock_quantity INTO v_old_variant_stock
        FROM product_variants
        WHERE id = NEW.variant_id;
        
        IF FOUND THEN
            v_new_variant_stock := v_old_variant_stock - NEW.quantity;
            
            -- Update variant stock
            UPDATE product_variants 
            SET 
                stock_quantity = v_new_variant_stock,
                updated_at = NOW()
            WHERE id = NEW.variant_id;
            
            RAISE NOTICE '✅ VARIANT STOCK UPDATED: % (ID: %) - Old: %, New: %, Deducted: %', 
                v_variant_name, NEW.variant_id, v_old_variant_stock, v_new_variant_stock, NEW.quantity;
        ELSE
            RAISE EXCEPTION '❌ Variant with ID % not found', NEW.variant_id;
        END IF;
        
        -- DO NOT update main product stock for variants
        -- The main product stock should remain unchanged for variant-based products
        RAISE NOTICE 'ℹ️ Skipping main product stock update for variant-based product';
        
    ELSE
        -- Handle products without variants
        -- Get current product stock
        SELECT stock_quantity INTO v_old_product_stock
        FROM products
        WHERE id = NEW.product_id;
        
        IF FOUND THEN
            v_new_product_stock := v_old_product_stock - NEW.quantity;
            
            -- Update main product stock
            UPDATE products 
            SET 
                stock_quantity = v_new_product_stock,
                updated_at = NOW()
            WHERE id = NEW.product_id;
            
            RAISE NOTICE '✅ PRODUCT STOCK UPDATED: % (ID: %) - Old: %, New: %, Deducted: %', 
                v_product_name, NEW.product_id, v_old_product_stock, v_new_product_stock, NEW.quantity;
        ELSE
            RAISE EXCEPTION '❌ Product with ID % not found', NEW.product_id;
        END IF;
    END IF;
    
    -- Update branch stock if branch_stock table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_stock') THEN
        IF NEW.variant_id IS NOT NULL THEN
            -- Update variant stock in branch_stock
            UPDATE branch_stock 
            SET 
                stock_quantity = stock_quantity - NEW.quantity,
                updated_at = NOW()
            WHERE product_id = NEW.product_id 
              AND branch_id = v_sale_branch_id 
              AND variant_id = NEW.variant_id;
            
            RAISE NOTICE '✅ BRANCH VARIANT STOCK UPDATED: product_id=%, variant_id=%, branch_id=%', 
                NEW.product_id, NEW.variant_id, v_sale_branch_id;
        ELSE
            -- Update main product stock in branch_stock
            UPDATE branch_stock 
            SET 
                stock_quantity = stock_quantity - NEW.quantity,
                updated_at = NOW()
            WHERE product_id = NEW.product_id 
              AND branch_id = v_sale_branch_id 
              AND variant_id IS NULL;
            
            RAISE NOTICE '✅ BRANCH PRODUCT STOCK UPDATED: product_id=%, branch_id=%', 
                NEW.product_id, v_sale_branch_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 3: CREATE THE TRIGGER
-- ========================================

-- Create the trigger to update stock when sale items are inserted
CREATE TRIGGER update_stock_on_sale_item 
    AFTER INSERT ON sale_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_stock();

-- ========================================
-- STEP 4: CREATE FUNCTION TO MANUALLY UPDATE STOCK
-- ========================================

-- Function to manually update stock for testing and debugging
CREATE OR REPLACE FUNCTION manual_update_stock_for_sale(
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_result JSON;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_success_count INTEGER := 0;
BEGIN
    -- Loop through all sale items for the given sale
    FOR v_item IN 
        SELECT 
            si.*,
            p.name as product_name,
            CONCAT('Variant ID: ', pv.id::text) as variant_name
        FROM sale_items si
        JOIN products p ON p.id = si.product_id
        LEFT JOIN product_variants pv ON pv.id = si.variant_id
        WHERE si.sale_id = p_sale_id
    LOOP
        BEGIN
            -- Update stock based on whether it's a variant or not
            IF v_item.variant_id IS NOT NULL THEN
                -- Update variant stock
                UPDATE product_variants 
                SET 
                    stock_quantity = stock_quantity - v_item.quantity,
                    updated_at = NOW()
                WHERE id = v_item.variant_id;
                
                RAISE NOTICE '✅ Manually updated variant stock: % (ID: %) - Deducted: %', 
                    v_item.variant_name, v_item.variant_id, v_item.quantity;
            ELSE
                -- Update main product stock
                UPDATE products 
                SET 
                    stock_quantity = stock_quantity - v_item.quantity,
                    updated_at = NOW()
                WHERE id = v_item.product_id;
                
                RAISE NOTICE '✅ Manually updated product stock: % (ID: %) - Deducted: %', 
                    v_item.product_name, v_item.product_id, v_item.quantity;
            END IF;
            
            v_success_count := v_success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error updating stock for item ' || v_item.product_name || ': ' || SQLERRM);
            RAISE NOTICE '❌ Error updating stock for item %: %', v_item.product_name, SQLERRM;
        END;
    END LOOP;
    
    RETURN json_build_object(
        'success', array_length(v_errors) = 0,
        'sale_id', p_sale_id,
        'items_processed', v_success_count,
        'errors', v_errors,
        'message', CASE 
            WHEN array_length(v_errors) = 0 THEN 'All stock updates completed successfully'
            ELSE 'Some stock updates failed: ' || array_to_string(v_errors, '; ')
        END
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: VERIFY THE FIX
-- ========================================

-- Check if the trigger was created successfully
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_stock_on_sale_item'
AND event_object_table = 'sale_items';

-- Show recent sales to test with
SELECT 
    s.id as sale_id,
    s.transaction_number,
    s.created_at,
    COUNT(si.id) as item_count,
    SUM(si.quantity) as total_quantity
FROM sales s
LEFT JOIN sale_items si ON si.sale_id = s.id
WHERE s.created_at >= NOW() - INTERVAL '1 hour'
GROUP BY s.id, s.transaction_number, s.created_at
ORDER BY s.created_at DESC
LIMIT 5;

-- Show current stock levels for products with variants
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.stock_quantity as main_product_stock,
    pv.id as variant_id,
    CONCAT('Variant ID: ', pv.id::text) as variant_name,
    pv.stock_quantity as variant_stock
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE pv.id IS NOT NULL
ORDER BY p.name, pv.id
LIMIT 10;
