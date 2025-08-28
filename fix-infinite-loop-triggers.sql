-- Fix Infinite Loop Triggers
-- Run this in your Supabase SQL Editor

-- 1. First, drop the existing triggers to stop the infinite loop
DROP TRIGGER IF EXISTS sync_customer_to_credit_trigger ON customers;
DROP TRIGGER IF EXISTS sync_credit_to_customer_trigger ON credit_accounts;

-- 2. Drop the existing functions with proper signatures
DROP FUNCTION IF EXISTS sync_customer_to_credit();
DROP FUNCTION IF EXISTS sync_credit_to_customer();
DROP FUNCTION IF EXISTS process_credit_purchase(UUID, NUMERIC, UUID);
DROP FUNCTION IF EXISTS process_account_payment(UUID, NUMERIC, UUID);
DROP FUNCTION IF EXISTS add_account_deposit(UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS update_product_quantities(JSONB);

-- 3. Create a new approach - only sync from customers to credit_accounts
-- This prevents the infinite loop by only going in one direction
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

-- 4. Create a function to manually sync credit account changes back to customer
-- This will be called explicitly when needed, not via trigger
CREATE OR REPLACE FUNCTION sync_credit_to_customer(p_customer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE customers 
  SET 
    account_balance = (
      SELECT current_balance 
      FROM credit_accounts 
      WHERE customer_id = p_customer_id
    ),
    credit_limit = (
      SELECT credit_limit 
      FROM credit_accounts 
      WHERE customer_id = p_customer_id
    ),
    updated_at = now()
  WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the trigger only for customers table (one-way sync)
CREATE TRIGGER sync_customer_to_credit_trigger
  AFTER INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_to_credit();

-- 6. Create a function to handle credit purchases (deduct from balance)
CREATE OR REPLACE FUNCTION process_credit_purchase(p_customer_id UUID, p_amount NUMERIC, p_sale_id UUID)
RETURNS VOID AS $$
DECLARE
  current_balance NUMERIC;
  credit_limit NUMERIC;
BEGIN
  -- Get current balance and credit limit
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

  -- Update credit account balance
  UPDATE credit_accounts 
  SET 
    current_balance = current_balance - p_amount,
    available_credit = credit_limit + (current_balance - p_amount),
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
    'purchase',
    p_amount,
    'Purchase on credit - Sale ID: ' || p_sale_id,
    p_sale_id
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Create a function to handle account payments (add to balance)
CREATE OR REPLACE FUNCTION process_account_payment(p_customer_id UUID, p_amount NUMERIC, p_sale_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Add amount to customer balance
  UPDATE customers 
  SET 
    account_balance = account_balance + p_amount,
    updated_at = now()
  WHERE id = p_customer_id;

  -- Update credit account balance
  UPDATE credit_accounts 
  SET 
    current_balance = current_balance + p_amount,
    available_credit = credit_limit + (current_balance + p_amount),
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

-- 8. Create a function to add deposits to account
CREATE OR REPLACE FUNCTION add_account_deposit(p_customer_id UUID, p_amount NUMERIC, p_description TEXT)
RETURNS VOID AS $$
BEGIN
  -- Add amount to customer balance
  UPDATE customers 
  SET 
    account_balance = account_balance + p_amount,
    updated_at = now()
  WHERE id = p_customer_id;

  -- Update credit account balance
  UPDATE credit_accounts 
  SET 
    current_balance = current_balance + p_amount,
    available_credit = credit_limit + (current_balance + p_amount),
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

-- 9. Create a function to update product quantities after sale
CREATE OR REPLACE FUNCTION update_product_quantities(p_sale_items JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_sale_items)
  LOOP
    -- Update product quantity if it's a regular product
    IF item->>'product_id' IS NOT NULL THEN
      UPDATE products 
      SET 
        stock_quantity = stock_quantity - (item->>'quantity')::INTEGER,
        updated_at = now()
      WHERE id = (item->>'product_id')::UUID;
    END IF;
    
    -- Update product variant quantity if it's a variant
    IF item->>'variant_id' IS NOT NULL THEN
      UPDATE product_variants 
      SET 
        stock_quantity = stock_quantity - (item->>'quantity')::INTEGER,
        updated_at = now()
      WHERE id = (item->>'variant_id')::UUID;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Test the fix by checking if triggers are working
SELECT 
  'Trigger status:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sync%';

-- 11. Show current customers and their credit accounts (fixed column names)
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
