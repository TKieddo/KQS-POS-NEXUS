-- Fix All Laybye Database Functions
-- This script fixes balance calculation, quantity management, and payment processing

-- ========================================
-- STEP 1: FIX LAYBYE ORDER CREATION FUNCTION
-- ========================================

-- Function to create laybye order with correct balance calculation
CREATE OR REPLACE FUNCTION create_laybye_order_with_correct_balance(
    p_order_number TEXT,
    p_customer_id UUID,
    p_branch_id UUID,
    p_total_amount NUMERIC(12, 2),
    p_deposit_amount NUMERIC(12, 2),
    p_due_date DATE,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_laybye_id UUID;
    v_remaining_balance NUMERIC(12, 2);
    v_result JSON;
BEGIN
    -- Calculate correct remaining balance: Total - Deposit (no payments yet)
    v_remaining_balance := p_total_amount - p_deposit_amount;
    
    -- Ensure balance doesn't go negative
    IF v_remaining_balance < 0 THEN
        v_remaining_balance := 0;
    END IF;
    
    -- Create laybye order
    INSERT INTO laybye_orders (
        order_number,
        customer_id,
        branch_id,
        total_amount,
        deposit_amount,
        remaining_balance,
        remaining_amount,
        due_date,
        notes,
        status
    ) VALUES (
        p_order_number,
        p_customer_id,
        p_branch_id,
        p_total_amount,
        p_deposit_amount,
        v_remaining_balance,
        v_remaining_balance,
        p_due_date,
        p_notes,
        'active'
    ) RETURNING id INTO v_laybye_id;
    
    RETURN json_build_object(
        'success', true,
        'laybye_id', v_laybye_id,
        'remaining_balance', v_remaining_balance,
        'message', 'Laybye order created with correct balance'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: FIX LAYBYE PAYMENT PROCESSING FUNCTION
-- ========================================

-- Function to add payment and update balance correctly
CREATE OR REPLACE FUNCTION add_laybye_payment_with_balance_update(
    p_laybye_id UUID,
    p_amount NUMERIC(12, 2),
    p_payment_method TEXT,
    p_payment_date TIMESTAMP WITH TIME ZONE,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_laybye_order RECORD;
    v_total_payments NUMERIC(12, 2) := 0;
    v_calculated_balance NUMERIC(12, 2);
    v_new_status TEXT;
    v_payment_id UUID;
    v_result JSON;
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
    
    -- Create payment record
    INSERT INTO laybye_payments (
        laybye_id,
        amount,
        payment_method,
        payment_date,
        notes
    ) VALUES (
        p_laybye_id,
        p_amount,
        p_payment_method,
        p_payment_date,
        p_notes
    ) RETURNING id INTO v_payment_id;
    
    -- Calculate total payments made (including this new payment)
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_payments
    FROM laybye_payments
    WHERE laybye_id = p_laybye_id;
    
    -- Calculate correct remaining balance: Total - (Deposit + All Payments)
    v_calculated_balance := v_laybye_order.total_amount - (v_laybye_order.deposit_amount + v_total_payments);
    
    -- Ensure balance doesn't go negative
    IF v_calculated_balance < 0 THEN
        v_calculated_balance := 0;
    END IF;
    
    -- Determine new status
    IF v_calculated_balance <= 0 THEN
        v_new_status := 'completed';
    ELSE
        v_new_status := 'active';
    END IF;
    
    -- Update laybye order with correct balance
    UPDATE laybye_orders
    SET 
        remaining_balance = v_calculated_balance,
        remaining_amount = v_calculated_balance,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_laybye_id;
    
    -- If laybye is completed, handle quantity deduction
    IF v_new_status = 'completed' THEN
        PERFORM handle_laybye_completion_quantity_deduction(p_laybye_id);
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'new_balance', v_calculated_balance,
        'new_status', v_new_status,
        'message', 'Payment processed successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 3: FIX QUANTITY DEDUCTION ON LAYBYE COMPLETION
-- ========================================

-- Function to handle quantity deduction when laybye is completed
CREATE OR REPLACE FUNCTION handle_laybye_completion_quantity_deduction(
    p_laybye_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_laybye_item RECORD;
    v_branch_id UUID;
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Get branch_id from laybye order
    SELECT branch_id INTO v_branch_id
    FROM laybye_orders
    WHERE id = p_laybye_id;
    
    IF v_branch_id IS NULL THEN
        RAISE NOTICE 'No branch_id found for laybye order %', p_laybye_id;
        RETURN;
    END IF;
    
    -- Process each laybye item
    FOR v_laybye_item IN 
        SELECT * FROM laybye_items 
        WHERE laybye_id = p_laybye_id
    LOOP
        -- Get current branch stock
        SELECT stock_quantity INTO v_current_stock
        FROM branch_stock
        WHERE product_id = v_laybye_item.product_id
        AND branch_id = v_branch_id
        AND variant_id IS NULL;
        
        IF FOUND THEN
            -- Calculate new stock (deduct the laybye quantity)
            v_new_stock := GREATEST(0, v_current_stock - v_laybye_item.quantity);
            
            -- Update branch stock
            UPDATE branch_stock
            SET 
                stock_quantity = v_new_stock,
                updated_at = NOW()
            WHERE product_id = v_laybye_item.product_id
            AND branch_id = v_branch_id
            AND variant_id IS NULL;
            
            RAISE NOTICE 'Deducted % units from product % in branch %. New stock: %', 
                v_laybye_item.quantity, v_laybye_item.product_id, v_branch_id, v_new_stock;
        ELSE
            RAISE NOTICE 'No branch stock record found for product % in branch %', 
                v_laybye_item.product_id, v_branch_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 4: FIX LAYBYE RESERVATION (NO QUANTITY DEDUCTION ON CREATION)
-- ========================================

-- Function to handle laybye item creation (reserve items without deducting)
CREATE OR REPLACE FUNCTION create_laybye_items_without_deduction(
    p_laybye_id UUID,
    p_items JSON
)
RETURNS JSON AS $$
DECLARE
    v_item JSON;
    v_result JSON;
BEGIN
    -- Process each item
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        -- Insert laybye item (no stock deduction - just reservation)
        INSERT INTO laybye_items (
            laybye_id,
            product_id,
            quantity,
            unit_price,
            total_price
        ) VALUES (
            p_laybye_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::NUMERIC(12, 2),
            (v_item->>'total_price')::NUMERIC(12, 2)
        );
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Laybye items created successfully (reserved without deduction)'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: FIX BALANCE CALCULATION FUNCTION
-- ========================================

-- Function to recalculate and update laybye balance
CREATE OR REPLACE FUNCTION recalculate_laybye_balance(
    p_laybye_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_laybye_order RECORD;
    v_total_payments NUMERIC(12, 2) := 0;
    v_calculated_balance NUMERIC(12, 2);
    v_new_status TEXT;
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
    
    -- Calculate total payments made
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_payments
    FROM laybye_payments
    WHERE laybye_id = p_laybye_id;
    
    -- Calculate correct remaining balance: Total - (Deposit + All Payments)
    v_calculated_balance := v_laybye_order.total_amount - (v_laybye_order.deposit_amount + v_total_payments);
    
    -- Ensure balance doesn't go negative
    IF v_calculated_balance < 0 THEN
        v_calculated_balance := 0;
    END IF;
    
    -- Determine new status
    IF v_calculated_balance <= 0 THEN
        v_new_status := 'completed';
    ELSE
        v_new_status := 'active';
    END IF;
    
    -- Update the laybye order with correct balance
    UPDATE laybye_orders
    SET 
        remaining_balance = v_calculated_balance,
        remaining_amount = v_calculated_balance,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_laybye_id;
    
    RETURN json_build_object(
        'success', true,
        'laybye_id', p_laybye_id,
        'total_amount', v_laybye_order.total_amount,
        'deposit_amount', v_laybye_order.deposit_amount,
        'total_payments', v_total_payments,
        'calculated_balance', v_calculated_balance,
        'new_status', v_new_status,
        'message', 'Balance recalculated successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 6: FIX ALL EXISTING LAYBYE ORDERS
-- ========================================

-- Update all existing laybye orders with correct balance calculations
DO $$
DECLARE
    v_laybye_order RECORD;
    v_result JSON;
BEGIN
    FOR v_laybye_order IN 
        SELECT id FROM laybye_orders
    LOOP
        SELECT * INTO v_result
        FROM recalculate_laybye_balance(v_laybye_order.id);
        
        IF (v_result->>'success')::BOOLEAN THEN
            RAISE NOTICE 'Fixed balance for laybye order %', v_laybye_order.id;
        ELSE
            RAISE NOTICE 'Error fixing balance for laybye order %: %', 
                v_laybye_order.id, v_result->>'error';
        END IF;
    END LOOP;
END $$;

-- ========================================
-- STEP 7: VERIFICATION QUERIES
-- ========================================

-- Show sample laybye orders with correct balances
SELECT 
    'Sample Laybye Orders with Correct Balances' as info,
    order_number,
    total_amount,
    deposit_amount,
    remaining_balance,
    status,
    (SELECT COUNT(*) FROM laybye_payments WHERE laybye_id = lo.id) as payment_count,
    (SELECT COALESCE(SUM(amount), 0) FROM laybye_payments WHERE laybye_id = lo.id) as total_payments
FROM laybye_orders lo
ORDER BY created_at DESC
LIMIT 5;

-- Show completed laybye orders that should have quantities deducted
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
