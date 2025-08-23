-- Fresh Customer Management Schema
-- This creates a clean, production-ready customer system

-- ========================================
-- CUSTOMERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  
  -- Address fields
  address_street TEXT,
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_zip_code VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'South Africa',
  
  -- Business fields
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  customer_type VARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
  notes TEXT,
  tags TEXT[],
  
  -- Financial tracking
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  
  -- Branch assignment
  branch_id UUID REFERENCES public.branches(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREDIT ACCOUNTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.credit_accounts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  credit_limit DECIMAL(12, 2) DEFAULT 0.00,
  current_balance DECIMAL(12, 2) DEFAULT 0.00,
  available_credit DECIMAL(12, 2) DEFAULT 0.00,
  payment_terms INTEGER DEFAULT 30,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_amount DECIMAL(12, 2),
  overdue_amount DECIMAL(12, 2) DEFAULT 0.00,
  credit_score VARCHAR(20) DEFAULT 'good' CHECK (credit_score IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(customer_id),
  CONSTRAINT credit_accounts_credit_limit_check CHECK (credit_limit >= 0),
  CONSTRAINT credit_accounts_current_balance_check CHECK (current_balance >= 0),
  CONSTRAINT credit_accounts_available_credit_check CHECK (available_credit >= 0)
);

-- ========================================
-- LOYALTY ACCOUNTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  card_number VARCHAR(50) UNIQUE NOT NULL,
  current_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  tier_points INTEGER DEFAULT 0,
  next_tier_points INTEGER DEFAULT 1000,
  points_to_next_tier INTEGER DEFAULT 1000,
  last_earned_date TIMESTAMP WITH TIME ZONE,
  last_redeemed_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(customer_id),
  CONSTRAINT loyalty_accounts_current_points_check CHECK (current_points >= 0),
  CONSTRAINT loyalty_accounts_lifetime_points_check CHECK (lifetime_points >= 0)
);

-- ========================================
-- CREDIT TRANSACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  credit_account_id UUID NOT NULL REFERENCES public.credit_accounts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'payment', 'adjustment', 'refund')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  balance_after DECIMAL(12, 2) NOT NULL,
  created_by UUID REFERENCES public.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LOYALTY TRANSACTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  loyalty_account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT,
  order_id UUID,
  balance_after INTEGER NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_credit_accounts_is_active ON public.credit_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_overdue_amount ON public.credit_accounts(overdue_amount);

-- Loyalty accounts indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer_id ON public.loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON public.loyalty_accounts(tier);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_card_number ON public.loyalty_accounts(card_number);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_customer_id ON public.credit_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON public.loyalty_transactions(created_at);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Update available credit when credit limit or current balance changes
CREATE OR REPLACE FUNCTION update_available_credit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_credit = NEW.credit_limit - NEW.current_balance;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_available_credit
  BEFORE INSERT OR UPDATE ON public.credit_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_available_credit();

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

CREATE TRIGGER trigger_update_loyalty_tier
  BEFORE INSERT OR UPDATE ON public.loyalty_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view customers from their branch" ON public.customers
  FOR SELECT USING (branch_id IN (
    SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert customers in their branch" ON public.customers
  FOR INSERT WITH CHECK (branch_id IN (
    SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update customers in their branch" ON public.customers
  FOR UPDATE USING (branch_id IN (
    SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete customers in their branch" ON public.customers
  FOR DELETE USING (branch_id IN (
    SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
  ));

-- Credit accounts policies
CREATE POLICY "Users can view credit accounts from their branch" ON public.credit_accounts
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage credit accounts in their branch" ON public.credit_accounts
  FOR ALL USING (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

-- Loyalty accounts policies
CREATE POLICY "Users can view loyalty accounts from their branch" ON public.loyalty_accounts
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage loyalty accounts in their branch" ON public.loyalty_accounts
  FOR ALL USING (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

-- Transaction policies
CREATE POLICY "Users can view transactions from their branch" ON public.credit_transactions
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert transactions in their branch" ON public.credit_transactions
  FOR INSERT WITH CHECK (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

-- Similar policies for loyalty transactions
CREATE POLICY "Users can view loyalty transactions from their branch" ON public.loyalty_transactions
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert loyalty transactions in their branch" ON public.loyalty_transactions
  FOR INSERT WITH CHECK (customer_id IN (
    SELECT id FROM public.customers WHERE branch_id IN (
      SELECT branch_id FROM public.user_branches WHERE user_id = auth.uid()
    )
  ));

-- ========================================
-- SAMPLE DATA (OPTIONAL)
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

-- Insert sample credit account
INSERT INTO public.credit_accounts (
  customer_id,
  is_active,
  credit_limit,
  current_balance,
  payment_terms,
  credit_score
) VALUES (
  (SELECT id FROM public.customers WHERE customer_number = 'CUST-000001'),
  true,
  5000.00,
  1500.00,
  30,
  'good'
) ON CONFLICT (customer_id) DO NOTHING;

-- Insert sample loyalty account
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
) ON CONFLICT (customer_id) DO NOTHING; 