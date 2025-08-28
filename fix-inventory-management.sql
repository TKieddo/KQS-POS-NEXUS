-- Fix Inventory Management System
-- This script ensures product quantities are properly updated during all transactions

-- ========================================
-- STEP 1: VERIFY AND FIX TRIGGER FUNCTION
-- ========================================

-- Drop and recreate the trigger function to ensure it works properly
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;

CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the trigger execution for debugging
    RAISE NOTICE 'Trigger update_product_stock executed for product_id: %, variant_id: %, quantity: %', 
        NEW.product_id, NEW.variant_id, NEW.quantity;
    
    -- Update main product stock quantity
    UPDATE products 
    SET 
        stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Log the update
    RAISE NOTICE 'Updated product stock for product_id: %', NEW.product_id;
    
    -- Update variant stock if variant exists
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE product_variants 
        SET 
            stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.variant_id;
        
        -- Log the variant update
        RAISE NOTICE 'Updated variant stock for variant_id: %', NEW.variant_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: RECREATE THE TRIGGER
-- ========================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_stock_on_sale_item ON sale_items;

-- Create the trigger to update stock when sale items are inserted
CREATE TRIGGER update_stock_on_sale_item 
    AFTER INSERT ON sale_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_stock();

-- ========================================
-- STEP 3: CREATE TRIGGER FOR REFUNDS
-- ========================================

-- Function to restore product stock when items are refunded
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the trigger execution for debugging
    RAISE NOTICE 'Trigger restore_product_stock executed for product_id: %, variant_id: %, quantity: %', 
        NEW.product_id, NEW.variant_id, NEW.quantity;
    
    -- Restore main product stock quantity
    UPDATE products 
    SET 
        stock_quantity = stock_quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Log the update
    RAISE NOTICE 'Restored product stock for product_id: %', NEW.product_id;
    
    -- Restore variant stock if variant exists
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE product_variants 
        SET 
            stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.variant_id;
        
        -- Log the variant update
        RAISE NOTICE 'Restored variant stock for variant_id: %', NEW.variant_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for refund items
DROP TRIGGER IF EXISTS restore_stock_on_refund_item ON refund_items;
CREATE TRIGGER restore_stock_on_refund_item 
    AFTER INSERT ON refund_items 
    FOR EACH ROW 
    EXECUTE FUNCTION restore_product_stock();

-- ========================================
-- STEP 4: ENHANCE THE UPDATE_PRODUCT_QUANTITIES FUNCTION
-- ========================================

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS update_product_quantities(JSONB);

CREATE OR REPLACE FUNCTION update_product_quantities(
    p_sale_items JSONB
)
RETURNS JSON AS $$
DECLARE
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_variant_id UUID;
    v_updated_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Loop through each sale item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
    LOOP
        BEGIN
            v_product_id := (v_item->>'product_id')::UUID;
            v_quantity := (v_item->>'quantity')::INTEGER;
            v_variant_id := CASE 
                WHEN v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null'
                THEN (v_item->>'variant_id')::UUID 
                ELSE NULL 
            END;
            
            -- Validate inputs
            IF v_product_id IS NULL THEN
                RAISE EXCEPTION 'Product ID is required';
            END IF;
            
            IF v_quantity IS NULL OR v_quantity <= 0 THEN
                RAISE EXCEPTION 'Quantity must be greater than 0';
            END IF;
            
            -- Update product quantity
            IF v_variant_id IS NOT NULL THEN
                -- Update variant quantity
                UPDATE product_variants 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE id = v_variant_id;
                
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Variant with ID % not found', v_variant_id;
                END IF;
                
                RAISE NOTICE 'Updated variant stock: variant_id=%, quantity_reduced=%', v_variant_id, v_quantity;
            ELSE
                -- Update main product quantity
                UPDATE products 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE id = v_product_id;
                
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Product with ID % not found', v_product_id;
                END IF;
                
                RAISE NOTICE 'Updated product stock: product_id=%, quantity_reduced=%', v_product_id, v_quantity;
            END IF;
            
            v_updated_count := v_updated_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error updating item: ' || SQLERRM);
            RAISE NOTICE 'Error updating item: %', SQLERRM;
        END;
    END LOOP;
    
    -- Return result
    IF array_length(v_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'updated_count', v_updated_count,
            'errors', v_errors,
            'message', 'Some items failed to update'
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'updated_count', v_updated_count,
            'message', 'All product quantities updated successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: CREATE FUNCTION TO RESTORE QUANTITIES FOR REFUNDS
-- ========================================

CREATE OR REPLACE FUNCTION restore_product_quantities(
    p_refund_items JSONB
)
RETURNS JSON AS $$
DECLARE
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_variant_id UUID;
    v_restored_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Loop through each refund item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_refund_items)
    LOOP
        BEGIN
            v_product_id := (v_item->>'product_id')::UUID;
            v_quantity := (v_item->>'quantity')::INTEGER;
            v_variant_id := CASE 
                WHEN v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null'
                THEN (v_item->>'variant_id')::UUID 
                ELSE NULL 
            END;
            
            -- Validate inputs
            IF v_product_id IS NULL THEN
                RAISE EXCEPTION 'Product ID is required';
            END IF;
            
            IF v_quantity IS NULL OR v_quantity <= 0 THEN
                RAISE EXCEPTION 'Quantity must be greater than 0';
            END IF;
            
            -- Restore product quantity
            IF v_variant_id IS NOT NULL THEN
                -- Restore variant quantity
                UPDATE product_variants 
                SET 
                    stock_quantity = stock_quantity + v_quantity,
                    updated_at = NOW()
                WHERE id = v_variant_id;
                
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Variant with ID % not found', v_variant_id;
                END IF;
                
                RAISE NOTICE 'Restored variant stock: variant_id=%, quantity_restored=%', v_variant_id, v_quantity;
            ELSE
                -- Restore main product quantity
                UPDATE products 
                SET 
                    stock_quantity = stock_quantity + v_quantity,
                    updated_at = NOW()
                WHERE id = v_product_id;
                
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Product with ID % not found', v_product_id;
                END IF;
                
                RAISE NOTICE 'Restored product stock: product_id=%, quantity_restored=%', v_product_id, v_quantity;
            END IF;
            
            v_restored_count := v_restored_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error restoring item: ' || SQLERRM);
            RAISE NOTICE 'Error restoring item: %', SQLERRM;
        END;
    END LOOP;
    
    -- Return result
    IF array_length(v_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'restored_count', v_restored_count,
            'errors', v_errors,
            'message', 'Some items failed to restore'
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'restored_count', v_restored_count,
            'message', 'All product quantities restored successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 6: ENHANCE LAYBYE SYSTEM TO UPDATE QUANTITIES
-- ========================================

-- Function to update quantities when laybye items are added
CREATE OR REPLACE FUNCTION update_laybye_quantities(
    p_laybye_items JSONB
)
RETURNS JSON AS $$
DECLARE
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_variant_id UUID;
    v_updated_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Loop through each laybye item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_laybye_items)
    LOOP
        BEGIN
            v_product_id := (v_item->>'product_id')::UUID;
            v_quantity := (v_item->>'quantity')::INTEGER;
            v_variant_id := CASE 
                WHEN v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null'
                THEN (v_item->>'variant_id')::UUID 
                ELSE NULL 
            END;
            
            -- Validate inputs
            IF v_product_id IS NULL THEN
                RAISE EXCEPTION 'Product ID is required';
            END IF;
            
            IF v_quantity IS NULL OR v_quantity <= 0 THEN
                RAISE EXCEPTION 'Quantity must be greater than 0';
            END IF;
            
            -- Update product quantity (laybye also reduces stock)
            IF v_variant_id IS NOT NULL THEN
                -- Update variant quantity
                UPDATE product_variants 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE id = v_variant_id;
                
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Variant with ID % not found', v_variant_id;
                END IF;
                
                RAISE NOTICE 'Updated laybye variant stock: variant_id=%, quantity_reduced=%', v_variant_id, v_quantity;
            ELSE
                -- Update main product quantity
                UPDATE products 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE id = v_product_id;
                
                IF NOT FOUND THEN
                    RAISE EXCEPTION 'Product with ID % not found', v_product_id;
                END IF;
                
                RAISE NOTICE 'Updated laybye product stock: product_id=%, quantity_reduced=%', v_product_id, v_quantity;
            END IF;
            
            v_updated_count := v_updated_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error updating laybye item: ' || SQLERRM);
            RAISE NOTICE 'Error updating laybye item: %', SQLERRM;
        END;
    END LOOP;
    
    -- Return result
    IF array_length(v_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'updated_count', v_updated_count,
            'errors', v_errors,
            'message', 'Some laybye items failed to update'
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'updated_count', v_updated_count,
            'message', 'All laybye quantities updated successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 7: VERIFY TRIGGERS ARE WORKING
-- ========================================

-- Check if triggers exist and are enabled
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('update_stock_on_sale_item', 'restore_stock_on_refund_item')
ORDER BY trigger_name;

-- ========================================
-- STEP 8: TEST THE SYSTEM
-- ========================================

-- Create a test function to verify inventory updates
CREATE OR REPLACE FUNCTION test_inventory_system()
RETURNS JSON AS $$
DECLARE
    v_test_product_id UUID;
    v_initial_quantity INTEGER;
    v_final_quantity INTEGER;
    v_test_result JSON;
BEGIN
    -- Get a test product
    SELECT id, stock_quantity INTO v_test_product_id, v_initial_quantity
    FROM products 
    WHERE stock_quantity > 0 
    LIMIT 1;
    
    IF v_test_product_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'No products with stock available for testing'
        );
    END IF;
    
    -- Test the update function
    SELECT * INTO v_test_result
    FROM update_product_quantities(
        jsonb_build_array(
            jsonb_build_object(
                'product_id', v_test_product_id,
                'variant_id', null,
                'quantity', 1
            )
        )
    );
    
    -- Check final quantity
    SELECT stock_quantity INTO v_final_quantity
    FROM products 
    WHERE id = v_test_product_id;
    
    -- Restore the test quantity
    UPDATE products 
    SET stock_quantity = v_initial_quantity
    WHERE id = v_test_product_id;
    
    RETURN json_build_object(
        'success', true,
        'test_product_id', v_test_product_id,
        'initial_quantity', v_initial_quantity,
        'final_quantity', v_final_quantity,
        'quantity_reduced', v_initial_quantity - v_final_quantity,
        'update_function_result', v_test_result,
        'message', 'Inventory system test completed'
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 9: CREATE MONITORING FUNCTION
-- ========================================

-- Function to monitor inventory changes
CREATE OR REPLACE FUNCTION get_inventory_changes(
    p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE (
    product_name TEXT,
    product_id UUID,
    initial_quantity INTEGER,
    current_quantity INTEGER,
    quantity_change INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT,
        p.id,
        COALESCE(p.stock_quantity + COALESCE(si.total_sold, 0), p.stock_quantity) as initial_quantity,
        p.stock_quantity as current_quantity,
        COALESCE(si.total_sold, 0) as quantity_change,
        p.updated_at as last_updated
    FROM products p
    LEFT JOIN (
        SELECT 
            si.product_id,
            SUM(si.quantity) as total_sold
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.created_at >= NOW() - INTERVAL '1 hour' * p_hours_back
        GROUP BY si.product_id
    ) si ON p.id = si.product_id
    WHERE p.stock_quantity IS NOT NULL
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 10: FINAL VERIFICATION
-- ========================================

-- Show current trigger status
SELECT 
    'Trigger Status' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    'Active' as status
FROM information_schema.triggers 
WHERE trigger_name IN ('update_stock_on_sale_item', 'restore_stock_on_refund_item')
ORDER BY trigger_name;

-- Show function status
SELECT 
    'Function Status' as info,
    routine_name,
    routine_type,
    'Available' as status
FROM information_schema.routines 
WHERE routine_name IN (
    'update_product_stock',
    'restore_product_stock', 
    'update_product_quantities',
    'restore_product_quantities',
    'update_laybye_quantities',
    'test_inventory_system',
    'get_inventory_changes'
)
ORDER BY routine_name;
