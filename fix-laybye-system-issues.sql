-- Fix Laybye System Issues
-- This script addresses balance calculation, quantity deduction, and customer name issues

-- ========================================
-- STEP 1: FIX LAYBYE BALANCE CALCULATION
-- ========================================

-- Function to properly calculate laybye balance
CREATE OR REPLACE FUNCTION calculate_laybye_balance(
    p_laybye_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_laybye_order RECORD;
    v_total_payments NUMERIC(12, 2) := 0;
    v_calculated_balance NUMERIC(12, 2);
    v_result JSON;
BEGIN
    -- Get laybye order details
    SELECT 
        total_amount,
        deposit_amount,
        remaining_balance,
        remaining_amount
    INTO v_laybye_order
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
    
    -- Calculate the correct remaining balance
    -- Total amount - (deposit + all payments)
    v_calculated_balance := v_laybye_order.total_amount - (v_laybye_order.deposit_amount + v_total_payments);
    
    -- Ensure balance doesn't go negative
    IF v_calculated_balance < 0 THEN
        v_calculated_balance := 0;
    END IF;
    
    -- Update the laybye order with correct balance
    UPDATE laybye_orders
    SET 
        remaining_balance = v_calculated_balance,
        remaining_amount = v_calculated_balance,
        status = CASE 
            WHEN v_calculated_balance <= 0 THEN 'completed'
            ELSE 'active'
        END,
        updated_at = NOW()
    WHERE id = p_laybye_id;
    
    RETURN json_build_object(
        'success', true,
        'total_amount', v_laybye_order.total_amount,
        'deposit_amount', v_laybye_order.deposit_amount,
        'total_payments', v_total_payments,
        'calculated_balance', v_calculated_balance,
        'new_status', CASE WHEN v_calculated_balance <= 0 THEN 'completed' ELSE 'active' END
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 2: FIX LAYBYE PAYMENT PROCESSING
-- ========================================

-- Enhanced function to add laybye payment with proper balance calculation
CREATE OR REPLACE FUNCTION add_laybye_payment_enhanced(
    p_laybye_id UUID,
    p_amount NUMERIC(12, 2),
    p_payment_method VARCHAR(50) DEFAULT 'cash',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_payment_id UUID;
    v_balance_result JSON;
    v_laybye_order RECORD;
    v_is_completed BOOLEAN := FALSE;
BEGIN
    -- Validate inputs
    IF p_amount <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Payment amount must be greater than 0'
        );
    END IF;
    
    -- Get laybye order to check if it's already completed
    SELECT status INTO v_laybye_order
    FROM laybye_orders
    WHERE id = p_laybye_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Laybye order not found'
        );
    END IF;
    
    IF v_laybye_order.status = 'completed' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Laybye order is already completed'
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
    
    -- Calculate new balance
    SELECT * INTO v_balance_result
    FROM calculate_laybye_balance(p_laybye_id);
    
    -- Check if laybye is now completed
    SELECT (v_balance_result->>'new_status') = 'completed' INTO v_is_completed;
    
    -- If completed, process final payment (deduct quantities from branch stock)
    IF v_is_completed THEN
        PERFORM process_laybye_completion(p_laybye_id);
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'balance_result', v_balance_result,
        'is_completed', v_is_completed
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 3: FUNCTION TO PROCESS LAYBYE COMPLETION
-- ========================================

-- Function to handle laybye completion (deduct quantities from branch stock)
CREATE OR REPLACE FUNCTION process_laybye_completion(
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
                    stock_quantity = stock_quantity - v_laybye_item.quantity,
                    updated_at = NOW()
                WHERE product_id = v_laybye_item.product_id 
                  AND branch_id = v_branch_id 
                  AND variant_id = v_laybye_item.variant_id;
            ELSE
                -- Update main product stock in branch_stock table
                UPDATE branch_stock 
                SET 
                    stock_quantity = stock_quantity - v_laybye_item.quantity,
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
    
    -- Create stock movement records for completed laybye
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
        'laybye_completion',
        p_laybye_id,
        'Laybye completion - items sold'
    FROM laybye_items li
    WHERE li.laybye_id = p_laybye_id;
    
    RETURN json_build_object(
        'success', true,
        'updated_count', v_updated_count,
        'errors', v_errors,
        'message', 'Laybye completion processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 4: FIX CUSTOMER NAME DISPLAY
-- ========================================

-- Function to get customer name with proper fallback
CREATE OR REPLACE FUNCTION get_customer_display_name(
    p_customer_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_customer RECORD;
    v_display_name TEXT;
BEGIN
    -- Get customer details
    SELECT 
        first_name,
        last_name,
        email,
        phone
    INTO v_customer
    FROM customers
    WHERE id = p_customer_id;
    
    IF NOT FOUND THEN
        RETURN 'Unknown Customer';
    END IF;
    
    -- Build display name with fallbacks
    IF v_customer.first_name IS NOT NULL AND v_customer.first_name != '' THEN
        IF v_customer.last_name IS NOT NULL AND v_customer.last_name != '' THEN
            v_display_name := v_customer.first_name || ' ' || v_customer.last_name;
        ELSE
            v_display_name := v_customer.first_name;
        END IF;
    ELSIF v_customer.last_name IS NOT NULL AND v_customer.last_name != '' THEN
        v_display_name := v_customer.last_name;
    ELSIF v_customer.email IS NOT NULL AND v_customer.email != '' THEN
        v_display_name := v_customer.email;
    ELSIF v_customer.phone IS NOT NULL AND v_customer.phone != '' THEN
        v_display_name := 'Customer (' || v_customer.phone || ')';
    ELSE
        v_display_name := 'Unknown Customer';
    END IF;
    
    RETURN v_display_name;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: ENHANCED LAYBYE ORDERS VIEW
-- ========================================

-- Create a view for laybye orders with proper customer names and balance calculations
CREATE OR REPLACE VIEW laybye_orders_enhanced AS
SELECT 
    lo.id,
    lo.order_number,
    lo.customer_id,
    CASE 
        WHEN c.first_name IS NOT NULL AND c.first_name != '' THEN
            CASE 
                WHEN c.last_name IS NOT NULL AND c.last_name != '' THEN
                    c.first_name || ' ' || c.last_name
                ELSE
                    c.first_name
            END
        WHEN c.last_name IS NOT NULL AND c.last_name != '' THEN
            c.last_name
        WHEN c.email IS NOT NULL AND c.email != '' THEN
            c.email
        WHEN c.phone IS NOT NULL AND c.phone != '' THEN
            'Customer (' || c.phone || ')'
        ELSE
            'Unknown Customer'
    END as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    lo.total_amount,
    lo.deposit_amount,
    COALESCE(lo.remaining_balance, lo.remaining_amount, 
        lo.total_amount - lo.deposit_amount - COALESCE(
            (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = lo.id), 0
        )
    ) as calculated_balance,
    lo.status,
    lo.due_date,
    lo.created_at,
    lo.updated_at,
    lo.branch_id,
    b.name as branch_name,
    -- Count items
    (SELECT COUNT(*) FROM laybye_items WHERE laybye_id = lo.id) as item_count,
    -- Count payments
    (SELECT COUNT(*) FROM laybye_payments WHERE laybye_id = lo.id) as payment_count,
    -- Total payments made
    COALESCE((SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = lo.id), 0) as total_payments_made
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
LEFT JOIN branches b ON lo.branch_id = b.id;

-- ========================================
-- STEP 6: FIX EXISTING LAYBYE ORDERS
-- ========================================

-- Update all existing laybye orders with correct balance calculations
DO $$
DECLARE
    v_laybye_order RECORD;
BEGIN
    FOR v_laybye_order IN 
        SELECT id FROM laybye_orders
    LOOP
        PERFORM calculate_laybye_balance(v_laybye_order.id);
    END LOOP;
END $$;

-- ========================================
-- STEP 7: CREATE TRIGGER FOR AUTOMATIC BALANCE UPDATES
-- ========================================

-- Function to automatically update laybye balance when payments are added/modified
CREATE OR REPLACE FUNCTION auto_update_laybye_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update balance for the affected laybye order
    PERFORM calculate_laybye_balance(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.laybye_id
            ELSE NEW.laybye_id
        END
    );
    
    RETURN CASE 
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic balance updates
DROP TRIGGER IF EXISTS trigger_auto_update_laybye_balance ON laybye_payments;
CREATE TRIGGER trigger_auto_update_laybye_balance
    AFTER INSERT OR UPDATE OR DELETE ON laybye_payments
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_laybye_balance();

-- ========================================
-- STEP 8: TEST FUNCTIONS
-- ========================================

-- Function to test laybye balance calculation
CREATE OR REPLACE FUNCTION test_laybye_balance_calculation(
    p_laybye_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_laybye_order RECORD;
BEGIN
    -- Get laybye order details
    SELECT * INTO v_laybye_order
    FROM laybye_orders_enhanced
    WHERE id = p_laybye_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Laybye order not found'
        );
    END IF;
    
    -- Calculate balance
    SELECT * INTO v_result
    FROM calculate_laybye_balance(p_laybye_id);
    
    RETURN json_build_object(
        'success', true,
        'laybye_order', v_laybye_order,
        'balance_calculation', v_result
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 9: VERIFICATION QUERIES
-- ========================================

-- Show current laybye orders with enhanced information
SELECT 
    'Laybye Orders Status' as info,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN customer_name = 'Unknown Customer' THEN 1 END) as unknown_customers
FROM laybye_orders_enhanced;

-- Show sample laybye orders with proper customer names and balances
SELECT 
    'Sample Laybye Orders' as info,
    order_number,
    customer_name,
    total_amount,
    deposit_amount,
    calculated_balance,
    status,
    item_count,
    payment_count
FROM laybye_orders_enhanced
ORDER BY created_at DESC
LIMIT 5;
