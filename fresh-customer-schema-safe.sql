-- Fresh Customer Management Schema (Safe Version)
-- This creates a clean, production-ready customer system that works with existing structure
-- Safe to run multiple times - uses IF NOT EXISTS and ON CONFLICT

-- ========================================
-- CUSTOMERS TABLE (Updated to match existing)
-- ========================================
CREATE TABLE IF NOT EXISTS public.customers (
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
  address_country VARCHAR(100) DEFAULT 'South Africa',
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

-- ========================================
-- CREDIT ACCOUNTS TABLE (Updated to match existing)
-- ========================================
CREATE TABLE IF NOT EXISTS public.credit_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT credit_accounts_credit_limit_check CHECK (credit_limit >= 0),
  CONSTRAINT credit_accounts_current_balance_check CHECK (current_balance >= 0),
  CONSTRAINT credit_accounts_available_credit_check CHECK (available_credit >= 0)
);

-- ========================================
-- LOYALTY ACCOUNTS TABLE (Updated to match existing)
-- ========================================
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT loyalty_accounts_current_points_check CHECK (current_points >= 0),
  CONSTRAINT loyalty_accounts_lifetime_points_check CHECK (lifetime_points >= 0)
);

-- ========================================
-- CREDIT TRANSACTIONS TABLE (Updated to match existing)
-- ========================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  credit_account_id UUID NOT NULL REFERENCES public.credit_accounts(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('purchase', 'payment', 'adjustment', 'refund', 'credit_limit_change')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance_after DECIMAL(10,2) NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LOYALTY TRANSACTIONS TABLE (Updated to match existing)
-- ========================================
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  loyalty_account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT,
  order_id UUID,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  balance_after INTEGER NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE (Safe to run multiple times)
-- ========================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON public.customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON public.customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);

-- Credit accounts indexes
CREATE INDEX IF NOT EXISTS idx_credit_accounts_customer_id ON public.credit_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_account_number ON public.credit_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_credit_score ON public.credit_accounts(credit_score);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_is_active ON public.credit_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_overdue_amount ON public.credit_accounts(overdue_amount);

-- Loyalty accounts indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer_id ON public.loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_card_number ON public.loyalty_accounts(card_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON public.loyalty_accounts(tier);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_customer_id ON public.credit_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_credit_account_id ON public.credit_transactions(credit_account_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_date ON public.credit_transactions(date);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_loyalty_account_id ON public.loyalty_transactions(loyalty_account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON public.loyalty_transactions(type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_date ON public.loyalty_transactions(date);

-- ========================================
-- FUNCTIONS (Safe to create/replace)
-- ========================================

-- Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update available credit when credit limit or current balance changes
CREATE OR REPLACE FUNCTION calculate_available_credit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_credit = NEW.credit_limit - NEW.current_balance;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update loyalty tier based on points
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Update tier based on current points
  IF NEW.current_points >= 10000 THEN
    NEW.tier = 'platinum';
    NEW.next_tier_points = 15000;
  ELSIF NEW.current_points >= 5000 THEN
    NEW.tier = 'gold';
    NEW.next_tier_points = 10000;
  ELSIF NEW.current_points >= 1000 THEN
    NEW.tier = 'silver';
    NEW.next_tier_points = 5000;
  ELSE
    NEW.tier = 'bronze';
    NEW.next_tier_points = 1000;
  END IF;
  
  -- Update points to next tier
  NEW.points_to_next_tier = NEW.next_tier_points - NEW.current_points;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS (Safe to create - will replace if exists)
-- ========================================

-- Drop existing triggers if they exist (to avoid conflicts)
DO $$ 
BEGIN
  -- Drop triggers if they exist
  DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
  DROP TRIGGER IF EXISTS update_credit_accounts_updated_at ON public.credit_accounts;
  DROP TRIGGER IF EXISTS update_loyalty_accounts_updated_at ON public.loyalty_accounts;
  DROP TRIGGER IF EXISTS calculate_available_credit_trigger ON public.credit_accounts;
  DROP TRIGGER IF EXISTS trigger_update_loyalty_tier ON public.loyalty_accounts;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if triggers don't exist
    NULL;
END $$;

-- Create triggers
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON public.customers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_accounts_updated_at 
  BEFORE UPDATE ON public.credit_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_accounts_updated_at 
  BEFORE UPDATE ON public.loyalty_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER calculate_available_credit_trigger
  BEFORE INSERT OR UPDATE ON public.credit_accounts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_available_credit();

CREATE TRIGGER trigger_update_loyalty_tier
  BEFORE INSERT OR UPDATE ON public.loyalty_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Safe to create)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Allow authenticated users to view customers" ON public.customers;
  DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON public.customers;
  DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON public.customers;
  DROP POLICY IF EXISTS "Allow authenticated users to delete customers" ON public.customers;
  
  DROP POLICY IF EXISTS "Allow authenticated users to view credit accounts" ON public.credit_accounts;
  DROP POLICY IF EXISTS "Allow authenticated users to manage credit accounts" ON public.credit_accounts;
  
  DROP POLICY IF EXISTS "Allow authenticated users to view loyalty accounts" ON public.loyalty_accounts;
  DROP POLICY IF EXISTS "Allow authenticated users to manage loyalty accounts" ON public.loyalty_accounts;
  
  DROP POLICY IF EXISTS "Allow authenticated users to view transactions" ON public.credit_transactions;
  DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON public.credit_transactions;
  
  DROP POLICY IF EXISTS "Allow authenticated users to view loyalty transactions" ON public.loyalty_transactions;
  DROP POLICY IF EXISTS "Allow authenticated users to insert loyalty transactions" ON public.loyalty_transactions;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Allow authenticated users to view customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert customers" ON public.customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update customers" ON public.customers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete customers" ON public.customers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Credit accounts policies
CREATE POLICY "Allow authenticated users to view credit accounts" ON public.credit_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage credit accounts" ON public.credit_accounts
  FOR ALL USING (auth.role() = 'authenticated');

-- Loyalty accounts policies
CREATE POLICY "Allow authenticated users to view loyalty accounts" ON public.loyalty_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage loyalty accounts" ON public.loyalty_accounts
  FOR ALL USING (auth.role() = 'authenticated');

-- Transaction policies
CREATE POLICY "Allow authenticated users to view transactions" ON public.credit_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Similar policies for loyalty transactions
CREATE POLICY "Allow authenticated users to view loyalty transactions" ON public.loyalty_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert loyalty transactions" ON public.loyalty_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- SAMPLE DATA (Safe to insert - uses ON CONFLICT with correct constraints)
-- ========================================

-- Insert sample customer
INSERT INTO public.customers (
  customer_number,
  first_name,
  last_name,
  email,
  phone,
  status,
  customer_type,
  total_purchases,
  total_spent
) VALUES (
  'CUST-000001',
  'John',
  'Doe',
  'john.doe@example.com',
  '+27123456789',
  'active',
  'regular',
  5,
  2500.00
) ON CONFLICT (customer_number) DO NOTHING;

-- Insert sample credit account (using account_number for conflict resolution)
INSERT INTO public.credit_accounts (
  customer_id,
  account_number,
  is_active,
  credit_limit,
  current_balance,
  payment_terms,
  credit_score
) VALUES (
  (SELECT id FROM public.customers WHERE customer_number = 'CUST-000001'),
  'CRED-000001',
  true,
  5000.00,
  1500.00,
  30,
  'good'
) ON CONFLICT (account_number) DO NOTHING;

-- Insert sample loyalty account (using card_number for conflict resolution)
INSERT INTO public.loyalty_accounts (
  customer_id,
  card_number,
  current_points,
  lifetime_points,
  tier
) VALUES (
  (SELECT id FROM public.customers WHERE customer_number = 'CUST-000001'),
  'LOY-000001',
  2500,
  5000,
  'silver'
) ON CONFLICT (card_number) DO NOTHING; 