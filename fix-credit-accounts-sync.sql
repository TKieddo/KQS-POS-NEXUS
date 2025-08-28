-- Fix Credit Accounts Sync Function
-- Run this in your Supabase SQL Editor

-- 1. First, let's check what columns actually exist in credit_accounts table
SELECT 
  'Credit accounts table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;

-- 2. Drop the trigger first, then the function
DROP TRIGGER IF EXISTS sync_customer_to_credit_trigger ON customers;
DROP FUNCTION IF EXISTS sync_customer_to_credit();

-- 3. Create a new sync function that uses the correct column names
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
      payment_terms,
      credit_score
    ) VALUES (
      NEW.id,
      'CREDIT-' || NEW.customer_number,
      true,
      COALESCE(NEW.credit_limit, 1000),
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
      updated_at = now()
    WHERE customer_id = NEW.id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
CREATE TRIGGER sync_customer_to_credit_trigger
  AFTER INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_to_credit();

-- 5. Update the process functions to work with the actual credit_accounts structure
DROP FUNCTION IF EXISTS process_credit_purchase(UUID, NUMERIC, UUID);
CREATE OR REPLACE FUNCTION process_credit_purchase(p_customer_id UUID, p_amount NUMERIC, p_sale_id UUID)
RETURNS VOID AS $$
DECLARE
  current_balance NUMERIC;
  credit_limit NUMERIC;
BEGIN
  -- Get current balance and credit limit from customers table
  SELECT account_balance, credit_limit 
  INTO current_balance, credit_limit
  FROM customers 
  WHERE id = p_customer_id;

  -- Check if purchase would exceed credit limit
  IF (current_balance - p_amount) < -credit_limit THEN
    RAISE EXCEPTION 'Purchase would exceed credit limit of %', credit_limit;
  END IF;

  -- Deduct amount from customer balance
  UPDATE customers 
  SET 
    account_balance = account_balance - p_amount,
    updated_at = now()
  WHERE id = p_customer_id;

  -- Record the transaction
  INSERT INTO credit_transactions (
    customer_id,
    transaction_type,
    amount,
    description,
    sale_id
  ) VALUES (
    p_customer_id,
    'purchase',
    p_amount,
    'Purchase on credit - Sale ID: ' || p_sale_id,
    p_sale_id
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Update the account payment function
DROP FUNCTION IF EXISTS process_account_payment(UUID, NUMERIC, UUID);
CREATE OR REPLACE FUNCTION process_account_payment(p_customer_id UUID, p_amount NUMERIC, p_sale_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Add amount to customer balance
  UPDATE customers 
  SET 
    account_balance = account_balance + p_amount,
    updated_at = now()
  WHERE id = p_customer_id;

  -- Update credit account with payment info
  UPDATE credit_accounts 
  SET 
    last_payment_date = now(),
    last_payment_amount = p_amount,
    updated_at = now()
  WHERE customer_id = p_customer_id;

  -- Record the transaction
  INSERT INTO credit_transactions (
    customer_id,
    transaction_type,
    amount,
    description,
    sale_id
  ) VALUES (
    p_customer_id,
    'payment',
    p_amount,
    'Account payment - Sale ID: ' || p_sale_id,
    p_sale_id
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Update the deposit function
DROP FUNCTION IF EXISTS add_account_deposit(UUID, NUMERIC, TEXT);
CREATE OR REPLACE FUNCTION add_account_deposit(p_customer_id UUID, p_amount NUMERIC, p_description TEXT)
RETURNS VOID AS $$
BEGIN
  -- Add amount to customer balance
  UPDATE customers 
  SET 
    account_balance = account_balance + p_amount,
    updated_at = now()
  WHERE id = p_customer_id;

  -- Update credit account with payment info
  UPDATE credit_accounts 
  SET 
    last_payment_date = now(),
    last_payment_amount = p_amount,
    updated_at = now()
  WHERE customer_id = p_customer_id;

  -- Record the transaction
  INSERT INTO credit_transactions (
    customer_id,
    transaction_type,
    amount,
    description
  ) VALUES (
    p_customer_id,
    'deposit',
    p_amount,
    COALESCE(p_description, 'Account deposit')
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Test the fix by checking if triggers are working
SELECT 
  'Trigger status:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sync%';

-- 9. Show current customers and their credit accounts
SELECT 
  'Current customers and credit accounts:' as info,
  c.customer_number,
  c.first_name || ' ' || c.last_name as full_name,
  c.account_balance,
  c.credit_limit,
  ca.credit_limit as credit_account_limit,
  ca.is_active as credit_account_active
FROM customers c
LEFT JOIN credit_accounts ca ON c.id = ca.customer_id
WHERE c.status = 'active' AND c.branch_id IS NULL
ORDER BY c.first_name;
