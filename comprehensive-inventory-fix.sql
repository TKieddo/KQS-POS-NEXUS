-- ========================================
-- COMPREHENSIVE INVENTORY MANAGEMENT FIX
-- ========================================
-- This script fixes all inventory management issues in the KQS POS system

-- ========================================
-- STEP 1: CLEAN UP EXISTING TRIGGERS AND FUNCTIONS
-- ========================================

-- Drop all existing triggers and functions to start fresh
DROP TRIGGER IF EXISTS update_stock_on_sale_item ON sale_items;
DROP TRIGGER IF EXISTS restore_stock_on_refund_item ON refund_items;
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;
DROP FUNCTION IF EXISTS restore_product_stock() CASCADE;
DROP FUNCTION IF EXISTS update_product_quantities(JSONB) CASCADE;
DROP FUNCTION IF EXISTS update_product_quantities(JSONB, UUID) CASCADE;

-- ========================================
-- STEP 2: CREATE THE MAIN INVENTORY UPDATE FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id UUID;
    v_sale_branch_id UUID;
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Get the branch_id from the sale record
    SELECT branch_id INTO v_sale_branch_id
    FROM sales
    WHERE id = NEW.sale_id;
    
    -- Log the trigger execution for debugging
    RAISE NOTICE '🔧 Trigger update_product_stock executed for product_id: %, variant_id: %, quantity: %, branch_id: %', 
        NEW.product_id, NEW.variant_id, NEW.quantity, v_sale_branch_id;
    
    -- Update branch stock quantity if branch_stock table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_stock') THEN
        IF NEW.variant_id IS NOT NULL THEN
            -- Get current branch variant stock
            SELECT stock_quantity INTO v_current_stock
            FROM branch_stock 
            WHERE product_id = NEW.product_id 
              AND branch_id = v_sale_branch_id 
              AND variant_id = NEW.variant_id;
            
            IF FOUND THEN
                v_new_stock := v_current_stock - NEW.quantity;
                
                -- Update variant stock in branch_stock table
                UPDATE branch_stock 
                SET 
                    stock_quantity = v_new_stock,
                    updated_at = NOW()
                WHERE product_id = NEW.product_id 
                  AND branch_id = v_sale_branch_id 
                  AND variant_id = NEW.variant_id;
                
                RAISE NOTICE '✅ Updated branch variant stock: product_id=%, variant_id=%, branch_id=%, old_stock=%, new_stock=%', 
                    NEW.product_id, NEW.variant_id, v_sale_branch_id, v_current_stock, v_new_stock;
            ELSE
                RAISE NOTICE '⚠️ Branch variant stock not found, skipping branch update';
            END IF;
        ELSE
            -- Get current branch product stock
            SELECT stock_quantity INTO v_current_stock
            FROM branch_stock 
            WHERE product_id = NEW.product_id 
              AND branch_id = v_sale_branch_id 
              AND variant_id IS NULL;
            
            IF FOUND THEN
                v_new_stock := v_current_stock - NEW.quantity;
                
                -- Update main product stock in branch_stock table
                UPDATE branch_stock 
                SET 
                    stock_quantity = v_new_stock,
                    updated_at = NOW()
                WHERE product_id = NEW.product_id 
                  AND branch_id = v_sale_branch_id 
                  AND variant_id IS NULL;
                
                RAISE NOTICE '✅ Updated branch product stock: product_id=%, branch_id=%, old_stock=%, new_stock=%', 
                    NEW.product_id, v_sale_branch_id, v_current_stock, v_new_stock;
            ELSE
                RAISE NOTICE '⚠️ Branch product stock not found, skipping branch update';
            END IF;
        END IF;
    END IF;
    
    -- Update main product stock quantity (always do this as fallback)
    SELECT stock_quantity INTO v_current_stock
    FROM products 
    WHERE id = NEW.product_id;
    
    IF FOUND THEN
        v_new_stock := v_current_stock - NEW.quantity;
        
        UPDATE products 
        SET 
            stock_quantity = v_new_stock,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        RAISE NOTICE '✅ Updated main product stock: product_id=%, old_stock=%, new_stock=%', 
            NEW.product_id, v_current_stock, v_new_stock;
    ELSE
        RAISE EXCEPTION '❌ Product with ID % not found', NEW.product_id;
    END IF;
    
    -- Update variant stock if variant exists
    IF NEW.variant_id IS NOT NULL THEN
        SELECT stock_quantity INTO v_current_stock
        FROM product_variants 
        WHERE id = NEW.variant_id;
        
        IF FOUND THEN
            v_new_stock := v_current_stock - NEW.quantity;
            
            UPDATE product_variants 
            SET 
                stock_quantity = v_new_stock,
                updated_at = NOW()
            WHERE id = NEW.variant_id;
            
            RAISE NOTICE '✅ Updated variant stock: variant_id=%, old_stock=%, new_stock=%', 
                NEW.variant_id, v_current_stock, v_new_stock;
        ELSE
            RAISE EXCEPTION '❌ Variant with ID % not found', NEW.variant_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 3: CREATE THE REFUND STOCK RESTORATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_branch_id UUID;
    v_refund_branch_id UUID;
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Get the branch_id from the refund record
    SELECT branch_id INTO v_refund_branch_id
    FROM refunds
    WHERE id = NEW.refund_id;
    
    -- Log the trigger execution for debugging
    RAISE NOTICE '🔄 Trigger restore_product_stock executed for product_id: %, variant_id: %, quantity: %, branch_id: %', 
        NEW.product_id, NEW.variant_id, NEW.quantity, v_refund_branch_id;
    
    -- Update branch stock quantity if branch_stock table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_stock') THEN
        IF NEW.variant_id IS NOT NULL THEN
            -- Get current branch variant stock
            SELECT stock_quantity INTO v_current_stock
            FROM branch_stock 
            WHERE product_id = NEW.product_id 
              AND branch_id = v_refund_branch_id 
              AND variant_id = NEW.variant_id;
            
            IF FOUND THEN
                v_new_stock := v_current_stock + NEW.quantity;
                
                -- Update variant stock in branch_stock table (add back)
                UPDATE branch_stock 
                SET 
                    stock_quantity = v_new_stock,
                    updated_at = NOW()
                WHERE product_id = NEW.product_id 
                  AND branch_id = v_refund_branch_id 
                  AND variant_id = NEW.variant_id;
                
                RAISE NOTICE '✅ Restored branch variant stock: product_id=%, variant_id=%, branch_id=%, old_stock=%, new_stock=%', 
                    NEW.product_id, NEW.variant_id, v_refund_branch_id, v_current_stock, v_new_stock;
            ELSE
                RAISE NOTICE '⚠️ Branch variant stock not found, skipping branch restore';
            END IF;
        ELSE
            -- Get current branch product stock
            SELECT stock_quantity INTO v_current_stock
            FROM branch_stock 
            WHERE product_id = NEW.product_id 
              AND branch_id = v_refund_branch_id 
              AND variant_id IS NULL;
            
            IF FOUND THEN
                v_new_stock := v_current_stock + NEW.quantity;
                
                -- Update main product stock in branch_stock table (add back)
                UPDATE branch_stock 
                SET 
                    stock_quantity = v_new_stock,
                    updated_at = NOW()
                WHERE product_id = NEW.product_id 
                  AND branch_id = v_refund_branch_id 
                  AND variant_id IS NULL;
                
                RAISE NOTICE '✅ Restored branch product stock: product_id=%, branch_id=%, old_stock=%, new_stock=%', 
                    NEW.product_id, v_refund_branch_id, v_current_stock, v_new_stock;
            ELSE
                RAISE NOTICE '⚠️ Branch product stock not found, skipping branch restore';
            END IF;
        END IF;
    END IF;
    
    -- Update main product stock quantity (add back)
    SELECT stock_quantity INTO v_current_stock
    FROM products 
    WHERE id = NEW.product_id;
    
    IF FOUND THEN
        v_new_stock := v_current_stock + NEW.quantity;
        
        UPDATE products 
        SET 
            stock_quantity = v_new_stock,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
        RAISE NOTICE '✅ Restored main product stock: product_id=%, old_stock=%, new_stock=%', 
            NEW.product_id, v_current_stock, v_new_stock;
    ELSE
        RAISE EXCEPTION '❌ Product with ID % not found', NEW.product_id;
    END IF;
    
    -- Update variant stock if variant exists
    IF NEW.variant_id IS NOT NULL THEN
        SELECT stock_quantity INTO v_current_stock
        FROM product_variants 
        WHERE id = NEW.variant_id;
        
        IF FOUND THEN
            v_new_stock := v_current_stock + NEW.quantity;
            
            UPDATE product_variants 
            SET 
                stock_quantity = v_new_stock,
                updated_at = NOW()
            WHERE id = NEW.variant_id;
            
            RAISE NOTICE '✅ Restored variant stock: variant_id=%, old_stock=%, new_stock=%', 
                NEW.variant_id, v_current_stock, v_new_stock;
        ELSE
            RAISE EXCEPTION '❌ Variant with ID % not found', NEW.variant_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 4: CREATE THE MANUAL UPDATE FUNCTION
-- ========================================

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
    v_current_stock INTEGER;
    v_new_stock INTEGER;
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
                    -- Get current branch variant stock
                    SELECT stock_quantity INTO v_current_stock
                    FROM branch_stock 
                    WHERE product_id = v_product_id 
                      AND branch_id = p_branch_id 
                      AND variant_id = v_variant_id;
                    
                    IF FOUND THEN
                        v_new_stock := v_current_stock - v_quantity;
                        
                        -- Update variant quantity in branch_stock
                        UPDATE branch_stock 
                        SET 
                            stock_quantity = v_new_stock,
                            updated_at = NOW()
                        WHERE product_id = v_product_id 
                          AND branch_id = p_branch_id 
                          AND variant_id = v_variant_id;
                        
                        RAISE NOTICE '✅ Updated branch variant stock: variant_id=%, old_stock=%, new_stock=%', 
                            v_variant_id, v_current_stock, v_new_stock;
                    ELSE
                        RAISE EXCEPTION 'Branch variant stock not found for product_id: %, variant_id: %, branch_id: %', 
                            v_product_id, v_variant_id, p_branch_id;
                    END IF;
                ELSE
                    -- Get current branch product stock
                    SELECT stock_quantity INTO v_current_stock
                    FROM branch_stock 
                    WHERE product_id = v_product_id 
                      AND branch_id = p_branch_id 
                      AND variant_id IS NULL;
                    
                    IF FOUND THEN
                        v_new_stock := v_current_stock - v_quantity;
                        
                        -- Update main product quantity in branch_stock
                        UPDATE branch_stock 
                        SET 
                            stock_quantity = v_new_stock,
                            updated_at = NOW()
                        WHERE product_id = v_product_id 
                          AND branch_id = p_branch_id 
                          AND variant_id IS NULL;
                        
                        RAISE NOTICE '✅ Updated branch product stock: product_id=%, old_stock=%, new_stock=%', 
                            v_product_id, v_current_stock, v_new_stock;
                    ELSE
                        RAISE EXCEPTION 'Branch product stock not found for product_id: %, branch_id: %', 
                            v_product_id, p_branch_id;
                    END IF;
                END IF;
            END IF;
            
            -- Update main product quantity (fallback)
            SELECT stock_quantity INTO v_current_stock
            FROM products 
            WHERE id = v_product_id;
            
            IF FOUND THEN
                v_new_stock := v_current_stock - v_quantity;
                
                IF v_variant_id IS NOT NULL THEN
                    -- Update variant quantity
                    UPDATE product_variants 
                    SET 
                        stock_quantity = v_new_stock,
                        updated_at = NOW()
                    WHERE id = v_variant_id;
                    
                    RAISE NOTICE '✅ Updated variant stock: variant_id=%, old_stock=%, new_stock=%', 
                        v_variant_id, v_current_stock, v_new_stock;
                ELSE
                    -- Update main product quantity
                    UPDATE products 
                    SET 
                        stock_quantity = v_new_stock,
                        updated_at = NOW()
                    WHERE id = v_product_id;
                    
                    RAISE NOTICE '✅ Updated product stock: product_id=%, old_stock=%, new_stock=%', 
                        v_product_id, v_current_stock, v_new_stock;
                END IF;
            ELSE
                RAISE EXCEPTION 'Product with ID % not found', v_product_id;
            END IF;
            
            v_updated_count := v_updated_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, SQLERRM);
            RAISE NOTICE '❌ Error updating product %: %', v_product_id, SQLERRM;
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
-- STEP 5: CREATE THE TRIGGERS
-- ========================================

-- Create the trigger to update stock when sale items are inserted
CREATE TRIGGER update_stock_on_sale_item 
    AFTER INSERT ON sale_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_stock();

-- Create trigger for refunds
CREATE TRIGGER restore_stock_on_refund_item 
    AFTER INSERT ON refund_items 
    FOR EACH ROW 
    EXECUTE FUNCTION restore_product_stock();

-- ========================================
-- STEP 6: VERIFY THE FIX
-- ========================================

-- Check if triggers are properly created
SELECT 
    '✅ Trigger status:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('update_stock_on_sale_item', 'restore_stock_on_refund_item');

-- Check if functions are properly created
SELECT 
    '✅ Function status:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('update_product_stock', 'restore_product_stock', 'update_product_quantities');

-- Show sample products to verify current state
SELECT 
    '📋 Sample products:' as info,
    id,
    name,
    stock_quantity,
    updated_at
FROM products 
ORDER BY updated_at DESC
LIMIT 5;

-- Show recent sales to verify trigger activity
SELECT 
    '📋 Recent sales:' as info,
    s.id as sale_id,
    s.transaction_number,
    s.total_amount,
    s.created_at,
    COUNT(si.id) as item_count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
GROUP BY s.id, s.transaction_number, s.total_amount, s.created_at
ORDER BY s.created_at DESC
LIMIT 5;
