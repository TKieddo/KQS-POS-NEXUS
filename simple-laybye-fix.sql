-- Simple Laybye Database Fix
-- Copy and paste this into your Supabase SQL editor

-- ========================================
-- STEP 1: FIX ALL EXISTING LAYBYE BALANCES
-- ========================================

-- Update all laybye orders with correct balance calculations
UPDATE laybye_orders 
SET 
    remaining_balance = GREATEST(0, total_amount - deposit_amount - COALESCE(
        (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = laybye_orders.id), 0
    )),
    remaining_amount = GREATEST(0, total_amount - deposit_amount - COALESCE(
        (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = laybye_orders.id), 0
    )),
    status = CASE 
        WHEN GREATEST(0, total_amount - deposit_amount - COALESCE(
            (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = laybye_orders.id), 0
        )) <= 0 THEN 'completed'
        ELSE 'active'
    END,
    updated_at = NOW();

-- ========================================
-- STEP 2: CREATE FUNCTION FOR CORRECT PAYMENT PROCESSING
-- ========================================

-- Function to add payment and update balance correctly
CREATE OR REPLACE FUNCTION add_laybye_payment_correct(
    p_laybye_id UUID,
    p_amount NUMERIC(12, 2),
    p_payment_method TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_laybye_order RECORD;
    v_total_payments NUMERIC(12, 2) := 0;
    v_calculated_balance NUMERIC(12, 2);
    v_new_status TEXT;
    v_payment_id UUID;
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
        NOW(),
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
    
    -- If laybye is completed, deduct quantities from branch stock
    IF v_new_status = 'completed' THEN
        -- Deduct quantities for each laybye item
        UPDATE branch_stock 
        SET 
            stock_quantity = GREATEST(0, stock_quantity - li.quantity),
            updated_at = NOW()
        FROM laybye_items li
        WHERE li.laybye_id = p_laybye_id
        AND branch_stock.product_id = li.product_id
        AND branch_stock.branch_id = v_laybye_order.branch_id
        AND branch_stock.variant_id IS NULL;
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
-- STEP 3: VERIFY THE FIXES
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
