-- Fresh Customer and Credit System
-- This will replace the existing tables with a clean, working system

-- First, drop existing triggers and functions with CASCADE
DROP TRIGGER IF EXISTS sync_credit_to_customer_trigger ON credit_accounts;
DROP TRIGGER IF EXISTS sync_customer_credit_data_trigger ON customers;
DROP TRIGGER IF EXISTS sync_customer_credit_trigger ON customers;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_credit_accounts_updated_at ON credit_accounts;

-- Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS sync_credit_to_customer() CASCADE;
DROP FUNCTION IF EXISTS sync_customer_credit_data() CASCADE;
DROP FUNCTION IF EXISTS sync_customer_to_credit() CASCADE;
DROP FUNCTION IF EXISTS process_account_payment() CASCADE;
DROP FUNCTION IF EXISTS update_customer_balance() CASCADE;
DROP FUNCTION IF EXISTS add_credit_purchase() CASCADE;
DROP FUNCTION IF EXISTS initialize_credit_accounts() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop existing tables (safely)
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create fresh customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    customer_type VARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    branch_id UUID,
    last_purchase_date TIMESTAMPTZ,
    total_purchases INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    current_balance NUMERIC(10, 2) DEFAULT 0,
    credit_limit NUMERIC(10, 2) DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create fresh credit_accounts table
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    current_balance NUMERIC(10, 2) DEFAULT 0,
    credit_limit NUMERIC(10, 2) DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Create credit_transactions table for tracking
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'payment', 'refund', 'adjustment')),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    balance_after NUMERIC(10, 2) NOT NULL,
    reference VARCHAR(100),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_customers_current_balance ON customers(current_balance);
CREATE INDEX idx_credit_accounts_customer_id ON credit_accounts(customer_id);
CREATE INDEX idx_credit_transactions_customer_id ON credit_transactions(customer_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_accounts_updated_at 
    BEFORE UPDATE ON credit_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync customers to credit_accounts
CREATE OR REPLACE FUNCTION sync_customer_to_credit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Create credit account for new customer
        INSERT INTO credit_accounts (customer_id, current_balance, credit_limit, is_active)
        VALUES (NEW.id, NEW.current_balance, NEW.credit_limit, NEW.status = 'active')
        ON CONFLICT (customer_id) DO UPDATE SET
            current_balance = NEW.current_balance,
            credit_limit = NEW.credit_limit,
            updated_at = NOW();
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update credit account when customer is updated
        UPDATE credit_accounts 
        SET 
            current_balance = NEW.current_balance,
            credit_limit = NEW.credit_limit,
            is_active = NEW.status = 'active',
            updated_at = NOW()
        WHERE customer_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync credit_accounts to customers
CREATE OR REPLACE FUNCTION sync_credit_to_customer()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Update customer when credit account is updated
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

-- Create triggers
CREATE TRIGGER sync_customer_to_credit_trigger
    AFTER INSERT OR UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION sync_customer_to_credit();

CREATE TRIGGER sync_credit_to_customer_trigger
    AFTER UPDATE ON credit_accounts
    FOR EACH ROW
    EXECUTE FUNCTION sync_credit_to_customer();

-- Function to process account payments (subtract from balance)
CREATE OR REPLACE FUNCTION process_account_payment(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_current_balance NUMERIC;
    v_credit_limit NUMERIC;
    v_new_balance NUMERIC;
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
    
    -- Check if customer has sufficient balance to pay
    IF v_current_balance < p_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient balance. Customer has ' || v_current_balance || ' but needs ' || p_amount
        );
    END IF;
    
    v_new_balance := v_current_balance - p_amount;
    
    -- Update customer balance (subtract what they're paying)
    UPDATE customers 
    SET 
        current_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
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
        v_new_balance,
        'sale_' || p_sale_id,
        auth.uid()
    );
    
    RETURN json_build_object(
        'success', true,
        'old_balance', v_current_balance,
        'new_balance', v_new_balance,
        'amount_paid', p_amount,
        'message', 'Account payment processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to add credit purchase (add to balance)
CREATE OR REPLACE FUNCTION add_credit_purchase(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_sale_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_current_balance NUMERIC;
    v_credit_limit NUMERIC;
    v_new_balance NUMERIC;
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
    
    v_new_balance := v_current_balance + p_amount;
    
    -- Check if this would exceed credit limit
    IF v_new_balance > v_credit_limit THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Purchase would exceed credit limit. Available: ' || (v_credit_limit - v_current_balance)
        );
    END IF;
    
    -- Update customer balance (add to what they owe)
    UPDATE customers 
    SET 
        current_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
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
        'purchase',
        p_amount,
        'Credit purchase for sale #' || p_sale_id,
        v_new_balance,
        'sale_' || p_sale_id,
        auth.uid()
    );
    
    RETURN json_build_object(
        'success', true,
        'old_balance', v_current_balance,
        'new_balance', v_new_balance,
        'amount_charged', p_amount,
        'message', 'Credit purchase processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update product quantities after sale
CREATE OR REPLACE FUNCTION update_product_quantities(
    p_sale_items JSONB
)
RETURNS JSON AS $$
DECLARE
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_variant_id UUID;
BEGIN
    -- Loop through each sale item
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        v_variant_id := CASE 
            WHEN v_item->>'variant_id' IS NOT NULL 
            THEN (v_item->>'variant_id')::UUID 
            ELSE NULL 
        END;
        
        -- Update product quantity
        IF v_variant_id IS NOT NULL THEN
            -- Update variant quantity
            UPDATE product_variants 
            SET 
                stock_quantity = stock_quantity - v_quantity,
                updated_at = NOW()
            WHERE id = v_variant_id;
        ELSE
            -- Update main product quantity
            UPDATE products 
            SET 
                stock_quantity = stock_quantity - v_quantity,
                updated_at = NOW()
            WHERE id = v_product_id;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Product quantities updated successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Insert sample customers for testing
INSERT INTO customers (customer_number, first_name, last_name, email, phone, current_balance, credit_limit) VALUES
('CUST001', 'John', 'Doe', 'john.doe@example.com', '+1234567890', 500.00, 2000.00),
('CUST002', 'Jane', 'Smith', 'jane.smith@example.com', '+1234567891', 0.00, 1500.00),
('CUST003', 'Bob', 'Johnson', 'bob.johnson@example.com', '+1234567892', 750.00, 3000.00);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Customers are viewable by authenticated users" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customers are insertable by authenticated users" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Customers are updatable by authenticated users" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Credit accounts are viewable by authenticated users" ON credit_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Credit accounts are insertable by authenticated users" ON credit_accounts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Credit accounts are updatable by authenticated users" ON credit_accounts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Credit transactions are viewable by authenticated users" ON credit_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Credit transactions are insertable by authenticated users" ON credit_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
