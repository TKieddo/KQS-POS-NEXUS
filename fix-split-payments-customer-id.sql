-- Fix split_payments table to add customer_id column
-- This migration adds the missing customer_id column for account payments

-- Add customer_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'split_payments' 
        AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE split_payments ADD COLUMN customer_id UUID REFERENCES customers(id);
        RAISE NOTICE 'Added customer_id column to split_payments table';
    ELSE
        RAISE NOTICE 'customer_id column already exists in split_payments table';
    END IF;
END $$;

-- Add index for customer_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_split_payments_customer_id ON split_payments(customer_id);

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS create_sale_with_split_payments(UUID, DECIMAL, JSONB, UUID, UUID, JSONB);
DROP FUNCTION IF EXISTS get_sale_split_payments(UUID);
DROP FUNCTION IF EXISTS validate_account_payment(UUID, DECIMAL);

-- Create the enhanced function
CREATE OR REPLACE FUNCTION create_sale_with_split_payments(
    p_customer_id UUID,
    p_total_amount DECIMAL(10,2),
    p_payment_methods JSONB, -- Array of {method: string, amount: number, customer_id?: string}
    p_processed_by UUID,
    p_branch_id UUID,
    p_sale_items JSONB -- Array of sale items
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_payment JSONB;
    v_item JSONB;
    v_account_customer_id UUID;
    v_account_amount DECIMAL(10,2);
BEGIN
    -- Create the sale record
    INSERT INTO sales (
        customer_id,
        total_amount,
        payment_method,
        payment_status,
        cash_amount,
        change_amount,
        processed_by,
        branch_id
    ) VALUES (
        p_customer_id,
        p_total_amount,
        'split_payment', -- Indicates this is a split payment
        'completed',
        NULL,
        NULL,
        p_processed_by,
        p_branch_id
    ) RETURNING id INTO v_sale_id;

    -- Insert split payments with customer_id
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payment_methods)
    LOOP
        INSERT INTO split_payments (
            sale_id,
            payment_method,
            amount,
            customer_id
        ) VALUES (
            v_sale_id,
            (v_payment->>'method')::TEXT,
            (v_payment->>'amount')::DECIMAL(10,2),
            CASE 
                WHEN v_payment->>'customer_id' IS NOT NULL 
                THEN (v_payment->>'customer_id')::UUID 
                ELSE NULL 
            END
        );
    END LOOP;

    -- Insert sale items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
    LOOP
        INSERT INTO sale_items (
            sale_id,
            product_id,
            variant_id,
            quantity,
            unit_price,
            total_price
        ) VALUES (
            v_sale_id,
            (v_item->>'product_id')::UUID,
            CASE 
                WHEN v_item->>'variant_id' IS NOT NULL AND v_item->>'variant_id' != 'null' 
                THEN (v_item->>'variant_id')::UUID 
                ELSE NULL 
            END,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::DECIMAL(10,2),
            (v_item->>'total_price')::DECIMAL(10,2)
        );
    END LOOP;

    -- Handle account payment credit deduction and transaction recording
    SELECT 
        (v_payment->>'customer_id')::UUID,
        (v_payment->>'amount')::DECIMAL(10,2)
    INTO v_account_customer_id, v_account_amount
    FROM jsonb_array_elements(p_payment_methods) AS v_payment
    WHERE (v_payment->>'method')::TEXT = 'account'
    LIMIT 1;

    IF v_account_customer_id IS NOT NULL AND v_account_amount > 0 THEN
        -- Check if credit account exists
        IF EXISTS (SELECT 1 FROM credit_accounts WHERE customer_id = v_account_customer_id) THEN
            -- Update existing credit account (increase balance to reduce credit)
            UPDATE credit_accounts 
            SET current_balance = current_balance + v_account_amount,
                updated_at = NOW()
            WHERE customer_id = v_account_customer_id;
        ELSE
            -- Create new credit account
            INSERT INTO credit_accounts (
                customer_id, 
                current_balance, 
                credit_limit,
                is_active
            ) VALUES (
                v_account_customer_id, 
                v_account_amount, 
                1000, -- Default credit limit
                true
            );
        END IF;

        -- Create credit transaction record
        INSERT INTO credit_transactions (
            customer_id,
            type,
            amount,
            description,
            balance_after,
            reference,
            created_by
        ) VALUES (
            v_account_customer_id,
            'purchase',
            v_account_amount,
            'Account payment for sale #' || v_sale_id,
            (SELECT current_balance FROM credit_accounts WHERE customer_id = v_account_customer_id),
            'sale_' || v_sale_id,
            p_processed_by
        );
    END IF;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- Create get_sale_split_payments function with customer information
CREATE OR REPLACE FUNCTION get_sale_split_payments(p_sale_id UUID)
RETURNS TABLE (
    payment_method TEXT,
    amount DECIMAL(10,2),
    customer_id UUID,
    customer_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.payment_method,
        sp.amount,
        sp.customer_id,
        CASE 
            WHEN sp.customer_id IS NOT NULL 
            THEN c.first_name || ' ' || c.last_name
            ELSE NULL 
        END as customer_name
    FROM split_payments sp
    LEFT JOIN customers c ON sp.customer_id = c.id
    WHERE sp.sale_id = p_sale_id
    ORDER BY sp.created_at;
END;
$$ LANGUAGE plpgsql;

-- Create validate_account_payment function
CREATE OR REPLACE FUNCTION validate_account_payment(
    p_customer_id UUID,
    p_amount DECIMAL(10,2)
)
RETURNS TABLE (
    is_valid BOOLEAN,
    available_credit DECIMAL(10,2),
    error_message TEXT
) AS $$
DECLARE
    v_credit_account RECORD;
BEGIN
    -- Get credit account details
    SELECT 
        current_balance,
        credit_limit,
        is_active
    INTO v_credit_account
    FROM credit_accounts
    WHERE customer_id = p_customer_id;

    -- If no credit account exists, create one with default values
    IF NOT FOUND THEN
        INSERT INTO credit_accounts (
            customer_id,
            current_balance,
            credit_limit,
            is_active
        ) VALUES (
            p_customer_id,
            0,
            1000,
            true
        );
        
        v_credit_account.current_balance := 0;
        v_credit_account.credit_limit := 1000;
        v_credit_account.is_active := true;
    END IF;

    -- Check if account is active
    IF NOT v_credit_account.is_active THEN
        RETURN QUERY SELECT 
            false,
            0,
            'Credit account is not active';
        RETURN;
    END IF;

    -- Calculate available credit (negative balance means credit available)
    DECLARE
        v_available_credit DECIMAL(10,2);
    BEGIN
        v_available_credit := v_credit_account.credit_limit - v_credit_account.current_balance;
        
        -- Check if sufficient credit is available
        IF v_available_credit < p_amount THEN
            RETURN QUERY SELECT 
                false,
                v_available_credit,
                'Insufficient credit. Available: ' || v_available_credit || ', Required: ' || p_amount;
        ELSE
            RETURN QUERY SELECT 
                true,
                v_available_credit,
                'Payment valid';
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;
