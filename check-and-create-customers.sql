-- Check and Create Customers Script
-- Run this in your Supabase SQL Editor

-- First, check if customers exist
SELECT 
  'Current customers in database:' as info,
  COUNT(*) as total_customers
FROM customers;

-- Show existing customers
SELECT 
  id,
  customer_number,
  first_name,
  last_name,
  email,
  phone,
  account_balance,
  credit_limit,
  status,
  customer_type
FROM customers
ORDER BY first_name;

-- If no customers exist, create sample customers
DO $$
BEGIN
  -- Check if we have any customers
  IF (SELECT COUNT(*) FROM customers) = 0 THEN
    RAISE NOTICE 'No customers found. Creating sample customers...';
    
    -- Insert sample customers
    INSERT INTO customers (
      customer_number,
      first_name,
      last_name,
      email,
      phone,
      account_balance,
      credit_limit,
      status,
      customer_type
    ) VALUES 
    (
      'CUST001',
      'John',
      'Doe',
      'john.doe@example.com',
      '+1234567890',
      200.00,
      1000.00,
      'active',
      'regular'
    ),
    (
      'CUST002',
      'Jane',
      'Smith',
      'jane.smith@example.com',
      '+1234567891',
      0.00,
      1500.00,
      'active',
      'regular'
    ),
    (
      'CUST003',
      'Bob',
      'Johnson',
      'bob.johnson@example.com',
      '+1234567892',
      500.00,
      2000.00,
      'active',
      'vip'
    ),
    (
      'CUST004',
      'Alice',
      'Brown',
      'alice.brown@example.com',
      '+1234567893',
      -150.00,
      800.00,
      'active',
      'regular'
    ),
    (
      'CUST005',
      'Charlie',
      'Wilson',
      'charlie.wilson@example.com',
      '+1234567894',
      750.00,
      3000.00,
      'active',
      'wholesale'
    );
    
    RAISE NOTICE 'Sample customers created successfully!';
  ELSE
    RAISE NOTICE 'Customers already exist in database.';
  END IF;
END $$;

-- Show final customer list
SELECT 
  'Final customer list:' as info,
  COUNT(*) as total_customers
FROM customers;

SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  account_balance,
  credit_limit,
  status,
  customer_type
FROM customers
ORDER BY first_name;
