-- Minimal Fresh Customer Management Schema
-- This only adds missing components to existing tables
-- Safe to run multiple times - uses IF NOT EXISTS and ON CONFLICT

-- ========================================
-- INDEXES FOR PERFORMANCE (Safe to run multiple times)
-- ========================================

-- Customers indexes (only add if they don't exist)
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON public.customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON public.customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);

-- Credit accounts indexes (only add if they don't exist)
CREATE INDEX IF NOT EXISTS idx_credit_accounts_customer_id ON public.credit_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_account_number ON public.credit_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_credit_score ON public.credit_accounts(credit_score);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_is_active ON public.credit_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_overdue_amount ON public.credit_accounts(overdue_amount);

-- Loyalty accounts indexes (only add if they don't exist)
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer_id ON public.loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_card_number ON public.loyalty_accounts(card_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tier ON public.loyalty_accounts(tier);

-- Transaction indexes (only add if they don't exist)
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