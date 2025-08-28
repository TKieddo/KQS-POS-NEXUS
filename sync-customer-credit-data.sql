-- Function to sync customer data between customers and credit_accounts tables
CREATE OR REPLACE FUNCTION sync_customer_credit_data()
RETURNS TRIGGER AS $$
BEGIN
    -- When a customer is inserted/updated, sync to credit_accounts
    IF TG_OP = 'INSERT' THEN
        -- Insert into credit_accounts if not exists
        INSERT INTO credit_accounts (customer_id, current_balance, credit_limit, is_active)
        VALUES (NEW.id, NEW.current_balance, NEW.credit_limit, NEW.status = 'active')
        ON CONFLICT (customer_id) DO UPDATE SET
            current_balance = EXCLUDED.current_balance,
            credit_limit = EXCLUDED.credit_limit,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update credit_accounts
        UPDATE credit_accounts 
        SET 
            current_balance = NEW.current_balance,
            credit_limit = NEW.credit_limit,
            is_active = NEW.status = 'active',
            updated_at = NOW()
        WHERE customer_id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Delete from credit_accounts
        DELETE FROM credit_accounts WHERE customer_id = OLD.id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync customer data to credit_accounts
DROP TRIGGER IF EXISTS sync_customer_credit_trigger ON customers;
CREATE TRIGGER sync_customer_credit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION sync_customer_credit_data();

-- Function to sync credit_accounts data back to customers
CREATE OR REPLACE FUNCTION sync_credit_to_customer()
RETURNS TRIGGER AS $$
BEGIN
    -- When credit_accounts is updated, sync back to customers
    IF TG_OP = 'UPDATE' THEN
        UPDATE customers 
        SET 
            current_balance = NEW.current_balance,
            credit_limit = NEW.credit_limit,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync credit_accounts data back to customers
DROP TRIGGER IF EXISTS sync_credit_to_customer_trigger ON credit_accounts;
CREATE TRIGGER sync_credit_to_customer_trigger
    AFTER UPDATE ON credit_accounts
    FOR EACH ROW
    EXECUTE FUNCTION sync_credit_to_customer();

-- Function to initialize credit_accounts for existing customers
CREATE OR REPLACE FUNCTION initialize_credit_accounts()
RETURNS void AS $$
BEGIN
    -- Insert credit_accounts for customers that don't have them
    INSERT INTO credit_accounts (customer_id, current_balance, credit_limit, is_active)
    SELECT 
        c.id,
        COALESCE(c.current_balance, 0),
        COALESCE(c.credit_limit, 1000),
        c.status = 'active'
    FROM customers c
    LEFT JOIN credit_accounts ca ON c.id = ca.customer_id
    WHERE ca.customer_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the initialization
SELECT initialize_credit_accounts();

-- Function to update customer balance when account payment is made
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
    
    -- Check if customer has sufficient credit
    IF (v_credit_limit - v_current_balance) < p_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient credit available'
        );
    END IF;
    
    -- Update customer balance
    UPDATE customers 
    SET 
        current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    -- Update credit_accounts table
    UPDATE credit_accounts 
    SET 
        current_balance = current_balance + p_amount,
        updated_at = NOW()
    WHERE customer_id = p_customer_id;
    
    RETURN json_build_object(
        'success', true,
        'new_balance', v_current_balance + p_amount,
        'available_credit', v_credit_limit - (v_current_balance + p_amount)
    );
END;
$$ LANGUAGE plpgsql;
