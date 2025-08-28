-- Fix the account payment function to properly handle balance deduction
CREATE OR REPLACE FUNCTION process_account_payment(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_current_balance NUMERIC;
    v_credit_limit NUMERIC;
    v_result JSON;
BEGIN
    -- Get current customer balance and credit limit
    SELECT current_balance, credit_limit 
    INTO v_current_balance, v_credit_limit
    FROM customers 
    WHERE id = p_customer_id;
    
    -- Check if customer exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;
    
    -- For account payments, we subtract from the customer's balance
    -- The customer's current_balance represents what they owe (positive = owes money)
    -- When they pay using account, we subtract from what they owe
    
    -- Update customer balance (subtract what they're paying)
    UPDATE customers 
    SET 
        current_balance = current_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    -- Update credit_accounts table to keep in sync
    UPDATE credit_accounts 
    SET 
        current_balance = current_balance - p_amount,
        updated_at = NOW()
    WHERE customer_id = p_customer_id;
    
    -- If credit_accounts doesn't exist for this customer, create it
    IF NOT FOUND THEN
        INSERT INTO credit_accounts (
            customer_id, 
            current_balance, 
            credit_limit, 
            is_active
        ) VALUES (
            p_customer_id, 
            v_current_balance - p_amount, 
            COALESCE(v_credit_limit, 1000), 
            true
        );
    END IF;
    
    -- Create a transaction record for tracking
    INSERT INTO credit_transactions (
        customer_id,
        type,
        amount,
        description,
        balance_after,
        reference,
        created_by
    ) VALUES (
        p_customer_id,
        'payment',
        p_amount,
        'Account payment for sale #' || p_sale_id,
        v_current_balance - p_amount,
        'sale_' || p_sale_id,
        auth.uid()
    );
    
    RETURN json_build_object(
        'success', true,
        'new_balance', v_current_balance - p_amount,
        'available_credit', v_credit_limit - (v_current_balance - p_amount),
        'message', 'Account payment processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Also create a simpler function that just updates the balance without credit checks
CREATE OR REPLACE FUNCTION update_customer_balance(
    p_customer_id UUID,
    p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Get current balance
    SELECT current_balance INTO v_current_balance
    FROM customers 
    WHERE id = p_customer_id;
    
    -- Check if customer exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;
    
    v_new_balance := v_current_balance - p_amount;
    
    -- Update customer balance
    UPDATE customers 
    SET 
        current_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    -- Update credit_accounts table
    UPDATE credit_accounts 
    SET 
        current_balance = v_new_balance,
        updated_at = NOW()
    WHERE customer_id = p_customer_id;
    
    -- If credit_accounts doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO credit_accounts (
            customer_id, 
            current_balance, 
            credit_limit, 
            is_active
        ) VALUES (
            p_customer_id, 
            v_new_balance, 
            1000, 
            true
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'old_balance', v_current_balance,
        'new_balance', v_new_balance,
        'amount_deducted', p_amount
    );
END;
$$ LANGUAGE plpgsql;
