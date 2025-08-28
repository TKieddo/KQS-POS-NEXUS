-- Fix Branch-Specific Inventory Management System
-- This script ensures product quantities are properly updated in branch_stock table during all transactions

-- ========================================
-- STEP 1: VERIFY AND FIX TRIGGER FUNCTION FOR BRANCH STOCK
-- ========================================

-- Drop and recreate the trigger function to work with branch_stock table
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;

CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id UUID;
    v_sale_branch_id UUID;
BEGIN
    -- Get the branch_id from the sale record
    SELECT branch_id INTO v_sale_branch_id
    FROM sales
    WHERE id = NEW.sale_id;
    
    -- Log the trigger execution for debugging
    RAISE NOTICE 'Trigger update_product_stock executed for product_id: %, variant_id: %, quantity: %, branch_id: %', 
        NEW.product_id, NEW.variant_id, NEW.quantity, v_sale_branch_id;
    
    -- Update branch stock quantity
    IF NEW.variant_id IS NOT NULL THEN
        -- Update variant stock in branch_stock table
        UPDATE branch_stock 
        SET 
            stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE product_id = NEW.product_id 
          AND branch_id = v_sale_branch_id 
          AND variant_id = NEW.variant_id;
        
        -- Log the variant update
        RAISE NOTICE 'Updated branch variant stock for product_id: %, variant_id: %, branch_id: %', 
            NEW.product_id, NEW.variant_id, v_sale_branch_id;
    ELSE
        -- Update main product stock in branch_stock table
        UPDATE branch_stock 
        SET 
            stock_quantity = stock_quantity - NEW.quantity,
            updated_at = NOW()
        WHERE product_id = NEW.product_id 
          AND branch_id = v_sale_branch_id 
          AND variant_id IS NULL;
        
        -- Log the update
        RAISE NOTICE 'Updated branch product stock for product_id: %, branch_id: %', 
            NEW.product_id, v_sale_branch_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: RECREATE THE TRIGGER
-- ========================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_stock_on_sale_item ON sale_items;

-- Create the trigger to update branch stock when sale items are inserted
CREATE TRIGGER update_stock_on_sale_item 
    AFTER INSERT ON sale_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_stock();

-- ========================================
-- STEP 3: CREATE TRIGGER FOR REFUNDS (BRANCH STOCK)
-- ========================================

-- Function to restore branch stock when items are refunded
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id UUID;
    v_refund_branch_id UUID;
BEGIN
    -- Get the branch_id from the refund record
    SELECT branch_id INTO v_refund_branch_id
    FROM refunds
    WHERE id = NEW.refund_id;
    
    -- Log the trigger execution for debugging
    RAISE NOTICE 'Trigger restore_product_stock executed for product_id: %, variant_id: %, quantity: %, branch_id: %', 
        NEW.product_id, NEW.variant_id, NEW.quantity, v_refund_branch_id;
    
    -- Restore branch stock quantity
    IF NEW.variant_id IS NOT NULL THEN
        -- Restore variant stock in branch_stock table
        UPDATE branch_stock 
        SET 
            stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE product_id = NEW.product_id 
          AND branch_id = v_refund_branch_id 
          AND variant_id = NEW.variant_id;
        
        -- Log the variant update
        RAISE NOTICE 'Restored branch variant stock for product_id: %, variant_id: %, branch_id: %', 
            NEW.product_id, NEW.variant_id, v_refund_branch_id;
    ELSE
        -- Restore main product stock in branch_stock table
        UPDATE branch_stock 
        SET 
            stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE product_id = NEW.product_id 
          AND branch_id = v_refund_branch_id 
          AND variant_id IS NULL;
        
        -- Log the update
        RAISE NOTICE 'Restored branch product stock for product_id: %, branch_id: %', 
            NEW.product_id, v_refund_branch_id;
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
-- STEP 4: ENHANCE THE UPDATE_PRODUCT_QUANTITIES FUNCTION FOR BRANCH STOCK
-- ========================================

-- Drop and recreate the function with branch stock support
DROP FUNCTION IF EXISTS update_product_quantities(JSONB);

CREATE OR REPLACE FUNCTION update_product_quantities(
    p_sale_items JSONB,
    p_branch_id UUID DEFAULT NULL
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
            
            IF p_branch_id IS NULL THEN
                RAISE EXCEPTION 'Branch ID is required for branch stock updates';
            END IF;
            
            -- Update branch stock quantity
            IF v_variant_id IS NOT NULL THEN
                -- Update variant quantity in branch_stock
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE product_id = v_product_id 
                  AND branch_id = p_branch_id 
                  AND variant_id = v_variant_id;
                
                IF NOT FOUND THEN
                    -- Create branch stock record if it doesn't exist
                    INSERT INTO branch_stock (
                        product_id, 
                        branch_id, 
                        variant_id, 
                        stock_quantity
                    ) VALUES (
                        v_product_id, 
                        p_branch_id, 
                        v_variant_id, 
                        -v_quantity
                    );
                END IF;
                
                RAISE NOTICE 'Updated branch variant stock: product_id=%, variant_id=%, branch_id=%, quantity_reduced=%', 
                    v_product_id, v_variant_id, p_branch_id, v_quantity;
            ELSE
                -- Update main product quantity in branch_stock
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE product_id = v_product_id 
                  AND branch_id = p_branch_id 
                  AND variant_id IS NULL;
                
                IF NOT FOUND THEN
                    -- Create branch stock record if it doesn't exist
                    INSERT INTO branch_stock (
                        product_id, 
                        branch_id, 
                        variant_id, 
                        stock_quantity
                    ) VALUES (
                        v_product_id, 
                        p_branch_id, 
                        NULL, 
                        -v_quantity
                    );
                END IF;
                
                RAISE NOTICE 'Updated branch product stock: product_id=%, branch_id=%, quantity_reduced=%', 
                    v_product_id, p_branch_id, v_quantity;
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
            'message', 'All branch stock quantities updated successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: CREATE FUNCTION TO RESTORE QUANTITIES FOR REFUNDS (BRANCH STOCK)
-- ========================================

CREATE OR REPLACE FUNCTION restore_product_quantities(
    p_refund_items JSONB,
    p_branch_id UUID DEFAULT NULL
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
            
            IF p_branch_id IS NULL THEN
                RAISE EXCEPTION 'Branch ID is required for branch stock updates';
            END IF;
            
            -- Restore branch stock quantity
            IF v_variant_id IS NOT NULL THEN
                -- Restore variant quantity in branch_stock
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity + v_quantity,
                    updated_at = NOW()
                WHERE product_id = v_product_id 
                  AND branch_id = p_branch_id 
                  AND variant_id = v_variant_id;
                
                IF NOT FOUND THEN
                    -- Create branch stock record if it doesn't exist
                    INSERT INTO branch_stock (
                        product_id, 
                        branch_id, 
                        variant_id, 
                        stock_quantity
                    ) VALUES (
                        v_product_id, 
                        p_branch_id, 
                        v_variant_id, 
                        v_quantity
                    );
                END IF;
                
                RAISE NOTICE 'Restored branch variant stock: product_id=%, variant_id=%, branch_id=%, quantity_restored=%', 
                    v_product_id, v_variant_id, p_branch_id, v_quantity;
            ELSE
                -- Restore main product quantity in branch_stock
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity + v_quantity,
                    updated_at = NOW()
                WHERE product_id = v_product_id 
                  AND branch_id = p_branch_id 
                  AND variant_id IS NULL;
                
                IF NOT FOUND THEN
                    -- Create branch stock record if it doesn't exist
                    INSERT INTO branch_stock (
                        product_id, 
                        branch_id, 
                        variant_id, 
                        stock_quantity
                    ) VALUES (
                        v_product_id, 
                        p_branch_id, 
                        NULL, 
                        v_quantity
                    );
                END IF;
                
                RAISE NOTICE 'Restored branch product stock: product_id=%, branch_id=%, quantity_restored=%', 
                    v_product_id, p_branch_id, v_quantity;
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
            'message', 'All branch stock quantities restored successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 6: ENHANCE LAYBYE SYSTEM TO UPDATE BRANCH QUANTITIES
-- ========================================

-- Function to update branch quantities when laybye items are added
CREATE OR REPLACE FUNCTION update_laybye_quantities(
    p_laybye_items JSONB,
    p_branch_id UUID DEFAULT NULL
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
            
            IF p_branch_id IS NULL THEN
                RAISE EXCEPTION 'Branch ID is required for branch stock updates';
            END IF;
            
            -- Update branch stock quantity (laybye also reduces stock)
            IF v_variant_id IS NOT NULL THEN
                -- Update variant quantity in branch_stock
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE product_id = v_product_id 
                  AND branch_id = p_branch_id 
                  AND variant_id = v_variant_id;
                
                IF NOT FOUND THEN
                    -- Create branch stock record if it doesn't exist
                    INSERT INTO branch_stock (
                        product_id, 
                        branch_id, 
                        variant_id, 
                        stock_quantity
                    ) VALUES (
                        v_product_id, 
                        p_branch_id, 
                        v_variant_id, 
                        -v_quantity
                    );
                END IF;
                
                RAISE NOTICE 'Updated laybye branch variant stock: product_id=%, variant_id=%, branch_id=%, quantity_reduced=%', 
                    v_product_id, v_variant_id, p_branch_id, v_quantity;
            ELSE
                -- Update main product quantity in branch_stock
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity - v_quantity,
                    updated_at = NOW()
                WHERE product_id = v_product_id 
                  AND branch_id = p_branch_id 
                  AND variant_id IS NULL;
                
                IF NOT FOUND THEN
                    -- Create branch stock record if it doesn't exist
                    INSERT INTO branch_stock (
                        product_id, 
                        branch_id, 
                        variant_id, 
                        stock_quantity
                    ) VALUES (
                        v_product_id, 
                        p_branch_id, 
                        NULL, 
                        -v_quantity
                    );
                END IF;
                
                RAISE NOTICE 'Updated laybye branch product stock: product_id=%, branch_id=%, quantity_reduced=%', 
                    v_product_id, p_branch_id, v_quantity;
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
            'message', 'All laybye branch quantities updated successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 7: CREATE FUNCTION TO GET BRANCH STOCK
-- ========================================

-- Function to get current branch stock for products
CREATE OR REPLACE FUNCTION get_branch_stock(
    p_branch_id UUID,
    p_product_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    variant_id UUID,
    variant_name TEXT,
    stock_quantity INTEGER,
    min_stock_level INTEGER,
    max_stock_level INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.product_id,
        p.name::TEXT as product_name,
        bs.variant_id,
        pv.sku::TEXT as variant_name,
        bs.stock_quantity,
        bs.min_stock_level,
        bs.max_stock_level,
        bs.updated_at as last_updated
    FROM branch_stock bs
    JOIN products p ON bs.product_id = p.id
    LEFT JOIN product_variants pv ON bs.variant_id = pv.id
    WHERE bs.branch_id = p_branch_id
      AND (p_product_ids IS NULL OR bs.product_id = ANY(p_product_ids))
    ORDER BY p.name, pv.sku;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 8: CREATE FUNCTION TO MONITOR BRANCH INVENTORY CHANGES
-- ========================================

-- Function to monitor branch inventory changes
CREATE OR REPLACE FUNCTION get_branch_inventory_changes(
    p_branch_id UUID,
    p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE (
    product_name TEXT,
    product_id UUID,
    variant_id UUID,
    variant_name TEXT,
    initial_quantity INTEGER,
    current_quantity INTEGER,
    quantity_change INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name::TEXT,
        bs.product_id,
        bs.variant_id,
        pv.sku::TEXT as variant_name,
        COALESCE(bs.stock_quantity + COALESCE(si.total_sold, 0), bs.stock_quantity) as initial_quantity,
        bs.stock_quantity as current_quantity,
        COALESCE(si.total_sold, 0) as quantity_change,
        bs.updated_at as last_updated
    FROM branch_stock bs
    JOIN products p ON bs.product_id = p.id
    LEFT JOIN product_variants pv ON bs.variant_id = pv.id
    LEFT JOIN (
        SELECT 
            si.product_id,
            si.variant_id,
            SUM(si.quantity) as total_sold
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.branch_id = p_branch_id
          AND s.created_at >= NOW() - INTERVAL '1 hour' * p_hours_back
        GROUP BY si.product_id, si.variant_id
    ) si ON bs.product_id = si.product_id AND bs.variant_id IS NOT DISTINCT FROM si.variant_id
    WHERE bs.branch_id = p_branch_id
    ORDER BY bs.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 9: CREATE FUNCTION TO INITIALIZE BRANCH STOCK
-- ========================================

-- Function to initialize branch stock for products
CREATE OR REPLACE FUNCTION initialize_branch_stock(
    p_branch_id UUID,
    p_product_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_product RECORD;
    v_created_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Loop through products that don't have branch stock records
    FOR v_product IN 
        SELECT p.id as product_id, p.name, p.stock_quantity
        FROM products p
        WHERE p.is_active = true
          AND (p_product_ids IS NULL OR p.id = ANY(p_product_ids))
          AND NOT EXISTS (
              SELECT 1 FROM branch_stock bs 
              WHERE bs.product_id = p.id 
                AND bs.branch_id = p_branch_id 
                AND bs.variant_id IS NULL
          )
    LOOP
        BEGIN
            -- Create branch stock record
            INSERT INTO branch_stock (
                product_id,
                branch_id,
                variant_id,
                stock_quantity,
                min_stock_level,
                max_stock_level
            ) VALUES (
                v_product.product_id,
                p_branch_id,
                NULL,
                v_product.stock_quantity,
                0,
                NULL
            );
            
            v_created_count := v_created_count + 1;
            RAISE NOTICE 'Created branch stock for product: % (ID: %)', v_product.name, v_product.product_id;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error creating branch stock for product ' || v_product.name || ': ' || SQLERRM);
            RAISE NOTICE 'Error creating branch stock for product %: %', v_product.name, SQLERRM;
        END;
    END LOOP;
    
    -- Return result
    IF array_length(v_errors, 1) > 0 THEN
        RETURN json_build_object(
            'success', false,
            'created_count', v_created_count,
            'errors', v_errors,
            'message', 'Some branch stock records failed to create'
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'created_count', v_created_count,
            'message', 'All branch stock records created successfully'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 10: TEST THE BRANCH INVENTORY SYSTEM
-- ========================================

-- Create a test function to verify branch inventory updates
CREATE OR REPLACE FUNCTION test_branch_inventory_system(
    p_branch_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_test_product_id UUID;
    v_initial_quantity INTEGER;
    v_final_quantity INTEGER;
    v_test_result JSON;
    v_test_branch_id UUID;
BEGIN
    -- Use provided branch_id or get first available branch
    IF p_branch_id IS NULL THEN
        SELECT id INTO v_test_branch_id FROM branches LIMIT 1;
        IF v_test_branch_id IS NULL THEN
            RETURN json_build_object(
                'success', false,
                'message', 'No branches available for testing'
            );
        END IF;
    ELSE
        v_test_branch_id := p_branch_id;
    END IF;
    
    -- Get a test product with branch stock
    SELECT bs.product_id, bs.stock_quantity INTO v_test_product_id, v_initial_quantity
    FROM branch_stock bs
    WHERE bs.branch_id = v_test_branch_id 
      AND bs.stock_quantity > 0 
      AND bs.variant_id IS NULL
    LIMIT 1;
    
    IF v_test_product_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'No products with branch stock available for testing'
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
        ),
        v_test_branch_id
    );
    
    -- Check final quantity
    SELECT stock_quantity INTO v_final_quantity
    FROM branch_stock 
    WHERE product_id = v_test_product_id 
      AND branch_id = v_test_branch_id 
      AND variant_id IS NULL;
    
    -- Restore the test quantity
    UPDATE branch_stock 
    SET stock_quantity = v_initial_quantity
    WHERE product_id = v_test_product_id 
      AND branch_id = v_test_branch_id 
      AND variant_id IS NULL;
    
    RETURN json_build_object(
        'success', true,
        'test_product_id', v_test_product_id,
        'test_branch_id', v_test_branch_id,
        'initial_quantity', v_initial_quantity,
        'final_quantity', v_final_quantity,
        'quantity_reduced', v_initial_quantity - v_final_quantity,
        'update_function_result', v_test_result,
        'message', 'Branch inventory system test completed'
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 11: FINAL VERIFICATION
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
    'get_branch_stock',
    'get_branch_inventory_changes',
    'initialize_branch_stock',
    'test_branch_inventory_system'
)
ORDER BY routine_name;
