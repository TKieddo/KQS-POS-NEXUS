-- Account Payment Functions for POS System
-- These functions handle account payments with proper balance deduction and credit limit validation

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS validate_account_payment(UUID, NUMERIC);
DROP FUNCTION IF EXISTS process_account_payment(UUID, NUMERIC, UUID);
DROP FUNCTION IF EXISTS process_credit_purchase(UUID, NUMERIC, UUID);
DROP FUNCTION IF EXISTS process_mixed_account_payment(UUID, NUMERIC, NUMERIC, UUID);

-- Function to validate account payment (check if customer can pay with account)
CREATE OR REPLACE FUNCTION validate_account_payment(
    p_customer_id UUID,
    p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
    v_customer RECORD;
    v_available_balance NUMERIC;
    v_credit_limit NUMERIC;
    v_result JSON;
BEGIN
    -- Get customer details
    SELECT 
        id,
        first_name,
        last_name,
        account_balance,
        credit_limit,
        status
    INTO v_customer
    FROM customers 
    WHERE id = p_customer_id;

    -- Check if customer exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'isValid', false,
            'errorMessage', 'Customer not found',
            'availableBalance', 0,
            'creditLimit', 0,
            'canUseCredit', false
        );
    END IF;

    -- Check if customer account is active
    IF v_customer.status != 'active' THEN
        RETURN json_build_object(
            'isValid', false,
            'errorMessage', 'Customer account is not active',
            'availableBalance', v_customer.account_balance,
            'creditLimit', v_customer.credit_limit,
            'canUseCredit', false
        );
    END IF;

    -- Calculate current balance and available credit
    v_available_balance := COALESCE(v_customer.account_balance, 0);
    v_credit_limit := COALESCE(v_customer.credit_limit, 0);

    -- Calculate how much can be paid from balance and how much needs credit
    IF v_available_balance >= p_amount THEN
        -- Customer has enough balance to pay the full amount
        RETURN json_build_object(
            'isValid', true,
            'errorMessage', 'Payment can be processed from balance',
            'availableBalance', v_available_balance,
            'creditLimit', v_credit_limit,
            'canUseCredit', false,
            'paymentType', 'full_balance',
            'amountFromBalance', p_amount,
            'amountFromCredit', 0,
            'newBalanceAfterPayment', v_available_balance - p_amount
        );
    ELSE
        -- Customer doesn't have enough balance, calculate credit needed
        DECLARE
            v_amount_from_balance NUMERIC := v_available_balance;
            v_amount_from_credit NUMERIC := p_amount - v_available_balance;
            v_new_balance NUMERIC := v_available_balance - p_amount;
        BEGIN
            -- Check if the new balance would exceed credit limit
            IF v_new_balance > v_credit_limit THEN
                -- Would exceed credit limit, can only pay up to credit limit
                RETURN json_build_object(
                    'isValid', false,
                    'errorMessage', 'Payment would exceed credit limit. Available credit: ' || format_currency(v_credit_limit),
                    'availableBalance', v_available_balance,
                    'creditLimit', v_credit_limit,
                    'canUseCredit', true,
                    'paymentType', 'exceeds_credit_limit',
                    'maxPossiblePayment', v_available_balance + v_credit_limit,
                    'amountFromBalance', v_available_balance,
                    'amountFromCredit', v_credit_limit,
                    'remainingNeedsOtherPayment', p_amount - (v_available_balance + v_credit_limit)
                );
            ELSE
                -- Within credit limit, can proceed with credit
                RETURN json_build_object(
                    'isValid', true,
                    'errorMessage', 'Insufficient balance, but within credit limit',
                    'availableBalance', v_available_balance,
                    'creditLimit', v_credit_limit,
                    'canUseCredit', true,
                    'paymentType', 'partial_credit',
                    'amountFromBalance', v_amount_from_balance,
                    'amountFromCredit', v_amount_from_credit,
                    'newBalanceAfterPayment', v_new_balance
                );
            END IF;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to process account payment (deduct from customer balance)
CREATE OR REPLACE FUNCTION process_account_payment(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_customer RECORD;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_credit_limit NUMERIC;
    v_result JSON;
BEGIN
    -- Get customer details
    SELECT 
        id,
        account_balance,
        credit_limit,
        status
    INTO v_customer
    FROM customers 
    WHERE id = p_customer_id;

    -- Check if customer exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;

    -- Check if customer account is active
    IF v_customer.status != 'active' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer account is not active'
        );
    END IF;

    v_current_balance := COALESCE(v_customer.account_balance, 0);
    v_new_balance := v_current_balance - p_amount;
    v_credit_limit := COALESCE(v_customer.credit_limit, 0);

    -- Check if this would exceed credit limit (negative balance means they owe money)
    IF v_new_balance < -v_credit_limit THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Payment would exceed credit limit. Available credit: ' || format_currency(v_credit_limit),
            'availableBalance', v_current_balance,
            'creditLimit', v_credit_limit,
            'requestedAmount', p_amount,
            'wouldExceedBy', v_new_balance - v_credit_limit
        );
    END IF;

    -- Update customer balance (deduct the payment amount)
    UPDATE customers 
    SET 
        account_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_customer_id;

    -- Create transaction record for audit trail (if credit_transactions table exists)
    BEGIN
        INSERT INTO credit_transactions (
            customer_id,
            type,
            amount,
            description,
            balance_after,
            reference_id,
            reference_type,
            created_at
        ) VALUES (
            p_customer_id,
            'payment',
            p_amount,
            'Account payment for sale #' || p_sale_id,
            v_new_balance,
            p_sale_id,
            'sale',
            NOW()
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Credit transactions table doesn't exist, skip
            NULL;
        WHEN undefined_column THEN
            -- Credit transactions table has different structure, skip
            NULL;
    END;

    RETURN json_build_object(
        'success', true,
        'oldBalance', v_current_balance,
        'newBalance', v_new_balance,
        'amountDeducted', p_amount,
        'message', 'Account payment processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to process credit purchase (add to customer balance when they buy on credit)
CREATE OR REPLACE FUNCTION process_credit_purchase(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_customer RECORD;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_available_credit NUMERIC;
    v_result JSON;
BEGIN
    -- Get customer details
    SELECT 
        id,
        account_balance,
        credit_limit,
        status
    INTO v_customer
    FROM customers 
    WHERE id = p_customer_id;

    -- Check if customer exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;

    -- Check if customer account is active
    IF v_customer.status != 'active' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer account is not active'
        );
    END IF;

    v_current_balance := COALESCE(v_customer.account_balance, 0);
    v_new_balance := v_current_balance + p_amount;
    v_available_credit := COALESCE(v_customer.credit_limit, 0);

    -- Check if this would exceed credit limit
    IF v_new_balance > v_available_credit THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Purchase would exceed credit limit. Available credit: ' || format_currency(v_available_credit),
            'currentBalance', v_current_balance,
            'requestedAmount', p_amount,
            'wouldExceedBy', v_new_balance - v_available_credit
        );
    END IF;

    -- Update customer balance (add the purchase amount to what they owe)
    UPDATE customers 
    SET 
        account_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_customer_id;

    -- Create transaction record for audit trail (if credit_transactions table exists)
    BEGIN
        INSERT INTO credit_transactions (
            customer_id,
            type,
            amount,
            description,
            balance_after,
            reference_id,
            reference_type,
            created_at
        ) VALUES (
            p_customer_id,
            'purchase',
            p_amount,
            'Credit purchase for sale #' || p_sale_id,
            v_new_balance,
            p_sale_id,
            'sale',
            NOW()
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Credit transactions table doesn't exist, skip
            NULL;
        WHEN undefined_column THEN
            -- Credit transactions table has different structure, skip
            NULL;
    END;

    RETURN json_build_object(
        'success', true,
        'oldBalance', v_current_balance,
        'newBalance', v_new_balance,
        'amountCharged', p_amount,
        'availableCredit', v_available_credit,
        'message', 'Credit purchase processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to process mixed payment (part balance, part credit)
CREATE OR REPLACE FUNCTION process_mixed_account_payment(
    p_customer_id UUID,
    p_balance_amount NUMERIC,
    p_credit_amount NUMERIC,
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_customer RECORD;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_available_credit NUMERIC;
    v_result JSON;
BEGIN
    -- Get customer details
    SELECT 
        id,
        account_balance,
        credit_limit,
        status
    INTO v_customer
    FROM customers 
    WHERE id = p_customer_id;

    -- Check if customer exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer not found'
        );
    END IF;

    -- Check if customer account is active
    IF v_customer.status != 'active' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Customer account is not active'
        );
    END IF;

    v_current_balance := COALESCE(v_customer.account_balance, 0);
    v_available_credit := COALESCE(v_customer.credit_limit, 0);

    -- Check if customer has sufficient balance for balance portion
    IF v_current_balance < p_balance_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient balance for balance portion. Available: ' || format_currency(v_current_balance),
            'requestedBalanceAmount', p_balance_amount
        );
    END IF;

    -- Calculate new balance after both balance deduction and credit addition
    v_new_balance := v_current_balance - p_balance_amount + p_credit_amount;

    -- Check if final balance would exceed credit limit
    IF v_new_balance > v_available_credit THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Final balance would exceed credit limit. Available credit: ' || format_currency(v_available_credit),
            'wouldExceedBy', v_new_balance - v_available_credit
        );
    END IF;

    -- Update customer balance
    UPDATE customers 
    SET 
        account_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_customer_id;

    -- Create transaction records for audit trail (if credit_transactions table exists)
    BEGIN
        -- Record balance payment
        IF p_balance_amount > 0 THEN
            INSERT INTO credit_transactions (
                customer_id,
                type,
                amount,
                description,
                balance_after,
                reference_id,
                reference_type,
                created_at
            ) VALUES (
                p_customer_id,
                'payment',
                p_balance_amount,
                'Balance payment for sale #' || p_sale_id,
                v_current_balance - p_balance_amount,
                p_sale_id,
                'sale',
                NOW()
            );
        END IF;

        -- Record credit purchase
        IF p_credit_amount > 0 THEN
            INSERT INTO credit_transactions (
                customer_id,
                type,
                amount,
                description,
                balance_after,
                reference_id,
                reference_type,
                created_at
            ) VALUES (
                p_customer_id,
                'purchase',
                p_credit_amount,
                'Credit purchase for sale #' || p_sale_id,
                v_new_balance,
                p_sale_id,
                'sale',
                NOW()
            );
        END IF;
    EXCEPTION
        WHEN undefined_table THEN
            -- Credit transactions table doesn't exist, skip
            NULL;
        WHEN undefined_column THEN
            -- Credit transactions table has different structure, skip
            NULL;
    END;

    RETURN json_build_object(
        'success', true,
        'oldBalance', v_current_balance,
        'newBalance', v_new_balance,
        'balanceDeducted', p_balance_amount,
        'creditCharged', p_credit_amount,
        'message', 'Mixed account payment processed successfully'
    );
END;
$$ LANGUAGE plpgsql;
