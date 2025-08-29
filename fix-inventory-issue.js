require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixInventoryIssue() {
  console.log('🔧 Fixing inventory management issue...')
  
  try {
    // First, let's check if we can access the database
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(1)
    
    if (productError) {
      console.error('❌ Cannot access products table:', productError)
      return
    }
    
    console.log('✅ Database connection working')
    console.log('📋 Sample product:', products)
    
    // Apply the inventory fix SQL
    const inventoryFixSQL = `
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
    
    -- Update main product stock quantity (add back)
    UPDATE products 
    SET 
        stock_quantity = stock_quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Log the update
    RAISE NOTICE 'Restored product stock for product_id: %', NEW.product_id;
    
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
    `
    
    // Execute the SQL using the service role
    console.log('📋 Applying inventory fix SQL...')
    
    // Since we can't use exec_sql, let's try to apply this through the Supabase dashboard
    // For now, let's create a file that can be run manually
    const fs = require('fs')
    fs.writeFileSync('apply-inventory-fix-manual.sql', inventoryFixSQL)
    
    console.log('✅ Inventory fix SQL saved to apply-inventory-fix-manual.sql')
    console.log('')
    console.log('🔧 To fix the inventory issue:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of apply-inventory-fix-manual.sql')
    console.log('4. Execute the SQL')
    console.log('')
    console.log('📋 This will:')
    console.log('  • Recreate the update_product_stock() function')
    console.log('  • Recreate the update_stock_on_sale_item trigger')
    console.log('  • Add refund stock restoration functionality')
    console.log('  • Enhance the update_product_quantities function')
    console.log('')
    console.log('🎯 After applying this fix, product quantities will be automatically')
    console.log('   deducted when sales are made through the POS system.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixInventoryIssue()
