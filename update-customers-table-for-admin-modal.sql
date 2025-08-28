-- Update Customers Table for Admin Modal Compatibility
-- Run this in your Supabase SQL Editor

-- 1. First, let's add the missing fields to the customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Update existing customers to have proper default values
UPDATE customers 
SET 
  date_of_birth = NULL,
  gender = NULL,
  notes = '',
  tags = '{}'
WHERE date_of_birth IS NULL;

-- 3. Create or update the credit_accounts table to match admin structure
CREATE TABLE IF NOT EXISTS credit_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  account_number VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  credit_limit NUMERIC(10, 2) DEFAULT 0,
  current_balance NUMERIC(10, 2) DEFAULT 0,
  available_credit NUMERIC(10, 2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30,
  credit_score VARCHAR(20) DEFAULT 'good',
  last_payment_date TIMESTAMP WITH TIME ZONE,
  last_payment_amount NUMERIC(10, 2),
  overdue_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create or update the loyalty_accounts table
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  card_number VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  current_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  tier_points INTEGER DEFAULT 0,
  next_tier_points INTEGER DEFAULT 1000,
  points_to_next_tier INTEGER DEFAULT 1000,
  last_earned_date TIMESTAMP WITH TIME ZONE,
  last_redeemed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_accounts_customer_id ON credit_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_account_number ON credit_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer_id ON loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_card_number ON loyalty_accounts(card_number);

-- 6. Create or update the sync function for customers to credit_accounts
CREATE OR REPLACE FUNCTION sync_customer_to_credit()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new customer, create a credit account
  IF TG_OP = 'INSERT' THEN
    INSERT INTO credit_accounts (
      customer_id,
      account_number,
      is_active,
      credit_limit,
      current_balance,
      available_credit,
      payment_terms,
      credit_score
    ) VALUES (
      NEW.id,
      'CREDIT-' || NEW.customer_number,
      true,
      COALESCE(NEW.credit_limit, 1000),
      COALESCE(NEW.account_balance, 0),
      COALESCE(NEW.credit_limit, 1000) + COALESCE(NEW.account_balance, 0),
      30,
      'good'
    );
    RETURN NEW;
  END IF;

  -- If this is an update, sync the credit account
  IF TG_OP = 'UPDATE' THEN
    UPDATE credit_accounts 
    SET 
      credit_limit = COALESCE(NEW.credit_limit, 1000),
      current_balance = COALESCE(NEW.account_balance, 0),
      available_credit = COALESCE(NEW.credit_limit, 1000) + COALESCE(NEW.account_balance, 0),
      updated_at = now()
    WHERE customer_id = NEW.id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create or update the sync function for credit_accounts to customers
CREATE OR REPLACE FUNCTION sync_credit_to_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer when credit account changes
  UPDATE customers 
  SET 
    account_balance = NEW.current_balance,
    credit_limit = NEW.credit_limit,
    updated_at = now()
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create or update triggers
DROP TRIGGER IF EXISTS sync_customer_to_credit_trigger ON customers;
CREATE TRIGGER sync_customer_to_credit_trigger
  AFTER INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_to_credit();

DROP TRIGGER IF EXISTS sync_credit_to_customer_trigger ON credit_accounts;
CREATE TRIGGER sync_credit_to_customer_trigger
  AFTER INSERT OR UPDATE ON credit_accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_credit_to_customer();

-- 9. Create sample customers with the new structure if none exist
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM customers WHERE status = 'active' AND branch_id IS NULL) = 0 THEN
    RAISE NOTICE 'Creating sample customers with new structure...';
    
    INSERT INTO customers (
      customer_number,
      first_name,
      last_name,
      email,
      phone,
      address_street,
      address_city,
      address_state,
      address_zip_code,
      address_country,
      status,
      customer_type,
      account_balance,
      credit_limit,
      branch_id,
      date_of_birth,
      gender,
      notes,
      tags
    ) VALUES 
    ('CUST-001', 'John', 'Doe', 'john.doe@example.com', '+1234567890', '123 Main St', 'New York', 'NY', '10001', 'USA', 'active', 'regular', 500.00, 1000.00, NULL, '1990-01-15', 'male', 'Regular customer', ARRAY['vip']),
    ('CUST-002', 'Jane', 'Smith', 'jane.smith@example.com', '+1234567891', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'USA', 'active', 'vip', 1000.00, 2000.00, NULL, '1985-03-22', 'female', 'VIP customer', ARRAY['vip', 'wholesale']),
    ('CUST-003', 'Bob', 'Johnson', 'bob.johnson@example.com', '+1234567892', '789 Pine Rd', 'Chicago', 'IL', '60601', 'USA', 'active', 'regular', 250.00, 1000.00, NULL, '1992-07-10', 'male', 'New customer', ARRAY['regular']),
    ('CUST-004', 'Alice', 'Brown', 'alice.brown@example.com', '+1234567893', '321 Elm St', 'Houston', 'TX', '77001', 'USA', 'active', 'wholesale', 1500.00, 5000.00, NULL, '1988-11-05', 'female', 'Wholesale customer', ARRAY['wholesale']),
    ('CUST-005', 'Charlie', 'Wilson', 'charlie.wilson@example.com', '+1234567894', '654 Maple Dr', 'Phoenix', 'AZ', '85001', 'USA', 'active', 'regular', 0.00, 1000.00, NULL, '1995-12-18', 'male', 'Student customer', ARRAY['student']);
    
    RAISE NOTICE 'Sample customers created successfully!';
  ELSE
    RAISE NOTICE 'Customers already exist.';
  END IF;
END $$;

-- 10. Show final customer list with new structure
SELECT 
  'Final customer list with new structure:' as info,
  COUNT(*) as total_count
FROM customers 
WHERE status = 'active' AND branch_id IS NULL;

SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  email,
  phone,
  account_balance,
  credit_limit,
  customer_type,
  gender,
  date_of_birth,
  notes,
  tags
FROM customers 
WHERE status = 'active' AND branch_id IS NULL
ORDER BY first_name;
