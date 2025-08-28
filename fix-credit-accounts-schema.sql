-- Fix Credit Accounts Schema - Add Missing Columns
-- Run this in your Supabase SQL Editor

-- Step 1: Check current credit_accounts table structure
SELECT 
  '=== STEP 1: CURRENT CREDIT_ACCOUNTS STRUCTURE ===' as step,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns to credit_accounts table
SELECT '=== STEP 2: ADDING MISSING COLUMNS ===' as step;

-- Add account_number column if it doesn't exist
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);

-- Add other missing columns that might be needed
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS credit_score VARCHAR(20) DEFAULT 'good',
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_amount NUMERIC(10, 2);

-- Step 3: Update existing credit accounts with account numbers
SELECT '=== STEP 3: UPDATING EXISTING ACCOUNTS ===' as step;

UPDATE credit_accounts 
SET account_number = 'CREDIT-' || customer_id::text
WHERE account_number IS NULL;

-- Step 4: Check the updated structure
SELECT 
  '=== STEP 4: UPDATED CREDIT_ACCOUNTS STRUCTURE ===' as step,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;

-- Step 5: Update the sync function to use correct column names
SELECT '=== STEP 5: UPDATING SYNC FUNCTION ===' as step;

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS sync_customer_to_credit_trigger ON customers;

-- Drop the existing function
DROP FUNCTION IF EXISTS sync_customer_to_credit();

-- Create updated sync function
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

-- Recreate the trigger
CREATE TRIGGER sync_customer_to_credit_trigger
  AFTER INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_to_credit();

-- Step 6: Test the sync function
SELECT 
  '=== STEP 6: TESTING SYNC FUNCTION ===' as step,
  'Sync function updated successfully' as status;

-- Step 7: Show current customers and their credit accounts
SELECT 
  '=== STEP 7: CURRENT CUSTOMERS AND CREDIT ACCOUNTS ===' as step,
  c.customer_number,
  c.first_name || ' ' || c.last_name as full_name,
  c.account_balance,
  c.credit_limit,
  ca.account_number,
  ca.credit_limit as credit_account_limit,
  ca.is_active as credit_account_active
FROM customers c
LEFT JOIN credit_accounts ca ON c.id = ca.customer_id
WHERE c.status = 'active'
ORDER BY c.first_name
LIMIT 5;

-- Step 8: Final status
SELECT 
  '=== STEP 8: FINAL STATUS ===' as step,
  '✅ Credit accounts schema fixed' as status,
  '✅ account_number column added' as column_added,
  '✅ Sync function updated' as function_updated,
  '✅ Try creating a customer now' as instruction;
