
-- Fix Inventory Management System
-- This script ensures product quantities are properly updated during all transactions

-- ========================================
-- STEP 1: VERIFY AND FIX TRIGGER FUNCTION
-- ========================================

-- Drop and recreate the trigger function to ensure it works properly
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
    
    -- Update branch stock quantity if branch_stock table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_stock') THEN
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
    END IF;
    
    -- Update main product stock quantity (fallback)
    UPDATE products 
    SET 
        stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Log the update
    RAISE NOTICE 'Updated main product stock for product_id: %', NEW.product_id;
    
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
    
    -- Update branch stock quantity if branch_stock table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_stock') THEN
        IF NEW.variant_id IS NOT NULL THEN
            -- Update variant stock in branch_stock table (add back)
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
            -- Update main product stock in branch_stock table (add back)
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
    END IF;
    
    -- Update main product stock quantity (add back)
    UPDATE products 
    SET 
        stock_quantity = stock_quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Log the update
    RAISE NOTICE 'Restored main product stock for product_id: %', NEW.product_id;
    
    -- Update variant stock if variant exists
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

-- Create trigger for refunds
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
            
            -- Update branch stock quantity if branch_stock table exists and branch_id provided
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_stock') 
               AND p_branch_id IS NOT NULL THEN
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
                        RAISE EXCEPTION 'Branch variant stock not found for product_id: %, variant_id: %, branch_id: %', 
                            v_product_id, v_variant_id, p_branch_id;
                    END IF;
                    
                    RAISE NOTICE 'Updated branch variant stock: variant_id=%, quantity_reduced=%', v_variant_id, v_quantity;
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
                        RAISE EXCEPTION 'Branch product stock not found for product_id: %, branch_id: %', 
                            v_product_id, p_branch_id;
                    END IF;
                    
                    RAISE NOTICE 'Updated branch product stock: product_id=%, quantity_reduced=%', v_product_id, v_quantity;
                END IF;
            END IF;
            
            -- Update main product quantity (fallback)
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
            v_errors := array_append(v_errors, SQLERRM);
            RAISE NOTICE 'Error updating product %: %', v_product_id, SQLERRM;
        END;
    END LOOP;
    
    RETURN json_build_object(
        'success', array_length(v_errors) = 0,
        'updated_count', v_updated_count,
        'errors', v_errors,
        'message', CASE 
            WHEN array_length(v_errors) = 0 THEN 'All product quantities updated successfully'
            ELSE 'Some products failed to update: ' || array_to_string(v_errors, '; ')
        END
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: VERIFY THE FIX
-- ========================================

-- Check if triggers are properly created
SELECT 
    'Trigger status:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('update_stock_on_sale_item', 'restore_stock_on_refund_item');

-- Check if functions are properly created
SELECT 
    'Function status:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('update_product_stock', 'restore_product_stock', 'update_product_quantities');

-- Show sample products to verify current state
SELECT 
    'Sample products:' as info,
    id,
    name,
    stock_quantity,
    updated_at
FROM products 
LIMIT 5;
    