-- Create Customer Tables Step by Step
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: CREATE CUSTOMERS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United States',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    customer_type VARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
    notes TEXT,
    tags TEXT[], -- Array of tags
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: CREATE CREDIT ACCOUNTS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS credit_accounts CASCADE;

-- Create credit accounts table
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    available_credit DECIMAL(12,2) DEFAULT 0.00,
    payment_terms INTEGER DEFAULT 30, -- days
    last_payment_date TIMESTAMP WITH TIME ZONE,
    last_payment_amount DECIMAL(12,2),
    overdue_amount DECIMAL(12,2) DEFAULT 0.00,
    credit_score VARCHAR(20) DEFAULT 'good' CHECK (credit_score IN ('excellent', 'good', 'fair', 'poor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- ========================================
-- STEP 3: CREATE CREDIT TRANSACTIONS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS credit_transactions CASCADE;

-- Create credit transactions table
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    credit_account_id UUID REFERENCES credit_accounts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'payment', 'adjustment', 'refund')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    balance_after DECIMAL(12,2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 4: CREATE LOYALTY ACCOUNTS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS loyalty_accounts CASCADE;

-- Create loyalty accounts table
CREATE TABLE loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    current_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_points INTEGER DEFAULT 0,
    next_tier_points INTEGER DEFAULT 1000,
    points_to_next_tier INTEGER DEFAULT 1000,
    last_earned_date TIMESTAMP WITH TIME ZONE,
    last_redeemed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- ========================================
-- STEP 5: CREATE LOYALTY TRANSACTIONS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS loyalty_transactions CASCADE;

-- Create loyalty transactions table
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    loyalty_account_id UUID REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus')),
    points INTEGER NOT NULL,
    description TEXT,
    order_id UUID, -- Reference to sales/orders table
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 6: CREATE CUSTOMER STATEMENTS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS customer_statements CASCADE;

-- Create customer statements table
CREATE TABLE customer_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    opening_balance DECIMAL(12,2) NOT NULL,
    closing_balance DECIMAL(12,2) NOT NULL,
    total_purchases DECIMAL(12,2) DEFAULT 0.00,
    total_payments DECIMAL(12,2) DEFAULT 0.00,
    total_adjustments DECIMAL(12,2) DEFAULT 0.00,
    average_daily_balance DECIMAL(12,2) DEFAULT 0.00,
    generated_by UUID REFERENCES auth.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 7: CREATE INDEXES
-- ========================================

-- Customer indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_branch ON customers(branch_id);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Credit account indexes
CREATE INDEX idx_credit_accounts_customer ON credit_accounts(customer_id);
CREATE INDEX idx_credit_accounts_active ON credit_accounts(is_active);
CREATE INDEX idx_credit_accounts_overdue ON credit_accounts(overdue_amount);

-- Credit transaction indexes
CREATE INDEX idx_credit_transactions_customer ON credit_transactions(customer_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_date ON credit_transactions(created_at);

-- Loyalty account indexes
CREATE INDEX idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);
CREATE INDEX idx_loyalty_accounts_tier ON loyalty_accounts(tier);
CREATE INDEX idx_loyalty_accounts_card ON loyalty_accounts(card_number);

-- Loyalty transaction indexes
CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_loyalty_transactions_date ON loyalty_transactions(created_at);

-- Statement indexes
CREATE INDEX idx_customer_statements_customer ON customer_statements(customer_id);
CREATE INDEX idx_customer_statements_period ON customer_statements(period_start, period_end);

-- ========================================
-- STEP 8: CREATE FUNCTIONS
-- ========================================

-- Function to update credit account balances
CREATE OR REPLACE FUNCTION update_credit_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update credit account after transaction
    UPDATE credit_accounts 
    SET 
        current_balance = NEW.balance_after,
        available_credit = credit_limit - NEW.balance_after,
        updated_at = NOW()
    WHERE customer_id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update loyalty account balances
CREATE OR REPLACE FUNCTION update_loyalty_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update loyalty account after transaction
    UPDATE loyalty_accounts 
    SET 
        current_points = NEW.balance_after,
        lifetime_points = CASE 
            WHEN NEW.type = 'earned' THEN lifetime_points + NEW.points
            ELSE lifetime_points
        END,
        last_earned_date = CASE 
            WHEN NEW.type = 'earned' THEN NOW()
            ELSE last_earned_date
        END,
        last_redeemed_date = CASE 
            WHEN NEW.type = 'redeemed' THEN NOW()
            ELSE last_redeemed_date
        END,
        updated_at = NOW()
    WHERE customer_id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to initialize credit and loyalty accounts for new customers
CREATE OR REPLACE FUNCTION initialize_customer_accounts()
RETURNS TRIGGER AS $$
BEGIN
    -- Create credit account
    INSERT INTO credit_accounts (customer_id, credit_limit, available_credit)
    VALUES (NEW.id, 0.00, 0.00);
    
    -- Create loyalty account
    INSERT INTO loyalty_accounts (customer_id, card_number)
    VALUES (NEW.id, 'LOY-' || upper(substring(NEW.customer_number from 6)));
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate customer number
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_number IS NULL THEN
        NEW.customer_number := 'CUST-' || lpad(nextval('customer_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- STEP 9: CREATE SEQUENCE FOR CUSTOMER NUMBERS
-- ========================================

CREATE SEQUENCE IF NOT EXISTS customer_number_seq START 1;

-- ========================================
-- STEP 10: CREATE TRIGGERS
-- ========================================

-- Trigger for credit transactions
CREATE TRIGGER update_credit_balance_on_transaction 
    AFTER INSERT ON credit_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_credit_account_balance();

-- Trigger for loyalty transactions
CREATE TRIGGER update_loyalty_balance_on_transaction 
    AFTER INSERT ON loyalty_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_account_balance();

-- Trigger for new customers
CREATE TRIGGER initialize_customer_accounts_on_insert 
    AFTER INSERT ON customers 
    FOR EACH ROW EXECUTE FUNCTION initialize_customer_accounts();

-- Trigger for customer number generation
CREATE TRIGGER generate_customer_number_on_insert 
    BEFORE INSERT ON customers 
    FOR EACH ROW EXECUTE FUNCTION generate_customer_number();

-- ========================================
-- STEP 11: ENABLE RLS
-- ========================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_statements ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 12: CREATE RLS POLICIES
-- ========================================

-- Customers policies
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on credit_accounts" ON credit_accounts FOR ALL USING (true);
CREATE POLICY "Allow all operations on credit_transactions" ON credit_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on loyalty_accounts" ON loyalty_accounts FOR ALL USING (true);
CREATE POLICY "Allow all operations on loyalty_transactions" ON loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on customer_statements" ON customer_statements FOR ALL USING (true);

-- ========================================
-- STEP 13: ADD COMMENTS
-- ========================================

COMMENT ON TABLE customers IS 'Customer information and profiles';
COMMENT ON TABLE credit_accounts IS 'Customer credit account management';
COMMENT ON TABLE credit_transactions IS 'Credit account transaction history';
COMMENT ON TABLE loyalty_accounts IS 'Customer loyalty program accounts';
COMMENT ON TABLE loyalty_transactions IS 'Loyalty program transaction history';
COMMENT ON TABLE customer_statements IS 'Customer account statements';

-- ========================================
-- STEP 14: VERIFY CREATION
-- ========================================

-- Check if tables were created successfully
SELECT 
    'customers' as table_name,
    COUNT(*) as row_count
FROM customers
UNION ALL
SELECT 
    'credit_accounts' as table_name,
    COUNT(*) as row_count
FROM credit_accounts
UNION ALL
SELECT 
    'loyalty_accounts' as table_name,
    COUNT(*) as row_count
FROM loyalty_accounts; 