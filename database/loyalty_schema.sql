-- Drop existing tables if they exist
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS loyalty_accounts CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table (main customer table for ALL customers)
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
  customer_type VARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale', 'laybye')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  branch_id UUID,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_accounts table
CREATE TABLE loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  card_number VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  current_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  tier_points INTEGER DEFAULT 0,
  next_tier_points INTEGER DEFAULT 1000,
  points_to_next_tier INTEGER DEFAULT 1000,
  last_earned_date TIMESTAMP WITH TIME ZONE,
  last_redeemed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_accounts table
CREATE TABLE credit_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  current_balance DECIMAL(10,2) DEFAULT 0,
  available_credit DECIMAL(10,2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_amount DECIMAL(10,2),
  overdue_amount DECIMAL(10,2) DEFAULT 0,
  credit_score VARCHAR(20) DEFAULT 'fair' CHECK (credit_score IN ('excellent', 'good', 'fair', 'poor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_transactions table
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loyalty_account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT,
  order_id UUID,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance_after INTEGER NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  credit_account_id UUID NOT NULL REFERENCES credit_accounts(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('purchase', 'payment', 'adjustment', 'refund', 'credit_limit_change')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance_after DECIMAL(10,2) NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);

CREATE INDEX idx_loyalty_accounts_customer_id ON loyalty_accounts(customer_id);
CREATE INDEX idx_loyalty_accounts_card_number ON loyalty_accounts(card_number);
CREATE INDEX idx_loyalty_accounts_tier ON loyalty_accounts(tier);

CREATE INDEX idx_credit_accounts_customer_id ON credit_accounts(customer_id);
CREATE INDEX idx_credit_accounts_account_number ON credit_accounts(account_number);
CREATE INDEX idx_credit_accounts_credit_score ON credit_accounts(credit_score);

CREATE INDEX idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_loyalty_account_id ON loyalty_transactions(loyalty_account_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_loyalty_transactions_date ON loyalty_transactions(date);

CREATE INDEX idx_credit_transactions_customer_id ON credit_transactions(customer_id);
CREATE INDEX idx_credit_transactions_credit_account_id ON credit_transactions(credit_account_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_date ON credit_transactions(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_accounts_updated_at BEFORE UPDATE ON loyalty_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credit_accounts_updated_at BEFORE UPDATE ON credit_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate available credit
CREATE OR REPLACE FUNCTION calculate_available_credit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.available_credit = NEW.credit_limit - NEW.current_balance;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for available credit calculation
CREATE TRIGGER calculate_available_credit_trigger BEFORE INSERT OR UPDATE ON credit_accounts FOR EACH ROW EXECUTE FUNCTION calculate_available_credit();

-- Create function to update loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE loyalty_accounts 
    SET 
        current_points = current_points + NEW.points,
        lifetime_points = lifetime_points + NEW.points,
        last_earned_date = CASE WHEN NEW.type = 'earned' THEN NOW() ELSE last_earned_date END,
        last_redeemed_date = CASE WHEN NEW.type = 'redeemed' THEN NOW() ELSE last_redeemed_date END
    WHERE id = NEW.loyalty_account_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for loyalty points update
CREATE TRIGGER update_loyalty_points_trigger AFTER INSERT ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION update_loyalty_points();

-- Create function to update credit balance
CREATE OR REPLACE FUNCTION update_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE credit_accounts 
    SET 
        current_balance = NEW.balance_after,
        last_payment_date = CASE WHEN NEW.type = 'payment' THEN NOW() ELSE last_payment_date END,
        last_payment_amount = CASE WHEN NEW.type = 'payment' THEN NEW.amount ELSE last_payment_amount END
    WHERE id = NEW.credit_account_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for credit balance update
CREATE TRIGGER update_credit_balance_trigger AFTER INSERT ON credit_transactions FOR EACH ROW EXECUTE FUNCTION update_credit_balance();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (you may need to adjust these based on your auth setup)
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON customers FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON loyalty_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON loyalty_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON loyalty_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON loyalty_accounts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON credit_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON credit_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON credit_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON credit_accounts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON loyalty_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON loyalty_transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON loyalty_transactions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON credit_transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON credit_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON credit_transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON credit_transactions FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO customers (customer_number, first_name, last_name, email, phone, address_street, address_city, address_state, address_zip_code, status, customer_type, notes, tags) VALUES
('CUST001', 'John', 'Doe', 'john.doe@email.com', '+1-555-0123', '123 Main St', 'New York', 'NY', '10001', 'active', 'regular', 'Regular customer', ARRAY['regular']),
('CUST002', 'Jane', 'Smith', 'jane.smith@email.com', '+1-555-0124', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'active', 'vip', 'VIP customer', ARRAY['vip', 'premium']),
('CUST003', 'Bob', 'Johnson', 'bob.johnson@email.com', '+1-555-0125', '789 Pine Rd', 'Chicago', 'IL', '60601', 'active', 'wholesale', 'Wholesale customer', ARRAY['wholesale']),
('CUST004', 'Alice', 'Brown', 'alice.brown@email.com', '+1-555-0126', '321 Elm St', 'Houston', 'TX', '77001', 'active', 'laybye', 'Laybye customer', ARRAY['laybye']);

-- Insert sample loyalty accounts
INSERT INTO loyalty_accounts (customer_id, card_number, tier, current_points, lifetime_points) VALUES
((SELECT id FROM customers WHERE customer_number = 'CUST001'), 'LOY-001-001', 'bronze', 150, 150),
((SELECT id FROM customers WHERE customer_number = 'CUST002'), 'LOY-002-001', 'gold', 2500, 2500);

-- Insert sample credit accounts
INSERT INTO credit_accounts (customer_id, account_number, credit_limit, current_balance, payment_terms, credit_score) VALUES
((SELECT id FROM customers WHERE customer_number = 'CUST002'), 'CRED-002-001', 5000.00, 0.00, 30, 'excellent'),
((SELECT id FROM customers WHERE customer_number = 'CUST003'), 'CRED-003-001', 10000.00, 0.00, 45, 'good'); 