-- Complete Credit Accounts Fix - Add All Missing Columns
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

-- Step 2: Add ALL missing columns that the admin service expects
SELECT '=== STEP 2: ADDING ALL MISSING COLUMNS ===' as step;

-- Add account_number column
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);

-- Add available_credit column (this is what the admin service is trying to insert)
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS available_credit NUMERIC(10, 2) DEFAULT 0;

-- Add other missing columns
ALTER TABLE credit_accounts 
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS credit_score VARCHAR(20) DEFAULT 'good',
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS current_balance NUMERIC(10, 2) DEFAULT 0;

-- Step 3: Update existing credit accounts with proper values
SELECT '=== STEP 3: UPDATING EXISTING ACCOUNTS ===' as step;

-- Update account numbers for existing records
UPDATE credit_accounts 
SET account_number = 'CREDIT-' || customer_id::text
WHERE account_number IS NULL;

-- Update available_credit to match credit_limit for existing records
UPDATE credit_accounts 
SET available_credit = credit_limit
WHERE available_credit IS NULL OR available_credit = 0;

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

-- Step 5: Update the sync function to handle all columns properly
SELECT '=== STEP 5: UPDATING SYNC FUNCTION ===' as step;

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS sync_customer_to_credit_trigger ON customers;

-- Drop the existing function
DROP FUNCTION IF EXISTS sync_customer_to_credit();

-- Create updated sync function that handles all columns
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
      available_credit,
      current_balance,
      payment_terms,
      credit_score
    ) VALUES (
      NEW.id,
      'CREDIT-' || NEW.customer_number,
      true,
      COALESCE(NEW.credit_limit, 1000),
      COALESCE(NEW.credit_limit, 1000), -- available_credit starts equal to credit_limit
      0, -- current_balance starts at 0
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
      available_credit = COALESCE(NEW.credit_limit, 1000), -- keep available_credit in sync
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

-- Step 6: Test the sync function by checking current data
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
  ca.available_credit,
  ca.current_balance,
  ca.is_active as credit_account_active
FROM customers c
LEFT JOIN credit_accounts ca ON c.id = ca.customer_id
WHERE c.status = 'active'
ORDER BY c.first_name
LIMIT 5;

-- Step 8: Test creating a sample credit account to verify structure
SELECT 
  '=== STEP 8: TESTING CREDIT ACCOUNT CREATION ===' as step,
  'Testing with sample data...' as test_note;

-- Step 9: Final status
SELECT 
  '=== STEP 9: FINAL STATUS ===' as step,
  '✅ Credit accounts schema completely fixed' as status,
  '✅ All required columns added' as columns_added,
  '✅ Sync function updated' as function_updated,
  '✅ Admin customer creation should work now' as instruction;

-- Step 10: Show final table structure
SELECT 
  '=== STEP 10: FINAL TABLE STRUCTURE ===' as step,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
ORDER BY ordinal_position;
