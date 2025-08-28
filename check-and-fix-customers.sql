-- Check and Fix Customers for POS
-- Run this in your Supabase SQL Editor

-- 1. Check if customers table exists and has data
SELECT 
  'Customer table check:' as info,
  COUNT(*) as total_customers
FROM customers;

-- 2. Show existing customers
SELECT 
  id,
  customer_number,
  first_name || ' ' || last_name as full_name,
  email,
  phone,
  account_balance,
  credit_limit,
  status,
  branch_id
FROM customers
ORDER BY first_name;

-- 3. Check for customers with null branch_id (should be accessible from POS)
SELECT 
  'Customers accessible from POS (null branch_id):' as info,
  COUNT(*) as count
FROM customers 
WHERE status = 'active' AND branch_id IS NULL;

-- 4. Show customers accessible from POS
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  account_balance,
  credit_limit,
  status
FROM customers 
WHERE status = 'active' AND branch_id IS NULL
ORDER BY first_name;

-- 5. If no customers accessible from POS, create some sample customers
DO $$
BEGIN
  -- Check if we have any customers accessible from POS
  IF (SELECT COUNT(*) FROM customers WHERE status = 'active' AND branch_id IS NULL) = 0 THEN
    RAISE NOTICE 'No customers accessible from POS. Creating sample customers...';
    
    -- Insert sample customers with null branch_id (accessible from POS)
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
      branch_id
    ) VALUES 
    ('CUST-001', 'John', 'Doe', 'john.doe@example.com', '+1234567890', '123 Main St', 'New York', 'NY', '10001', 'USA', 'active', 'regular', 500.00, 1000.00, NULL),
    ('CUST-002', 'Jane', 'Smith', 'jane.smith@example.com', '+1234567891', '456 Oak Ave', 'Los Angeles', 'CA', '90210', 'USA', 'active', 'vip', 1000.00, 2000.00, NULL),
    ('CUST-003', 'Bob', 'Johnson', 'bob.johnson@example.com', '+1234567892', '789 Pine Rd', 'Chicago', 'IL', '60601', 'USA', 'active', 'regular', 250.00, 1000.00, NULL),
    ('CUST-004', 'Alice', 'Brown', 'alice.brown@example.com', '+1234567893', '321 Elm St', 'Houston', 'TX', '77001', 'USA', 'active', 'wholesale', 1500.00, 5000.00, NULL),
    ('CUST-005', 'Charlie', 'Wilson', 'charlie.wilson@example.com', '+1234567894', '654 Maple Dr', 'Phoenix', 'AZ', '85001', 'USA', 'active', 'regular', 0.00, 1000.00, NULL);
    
    RAISE NOTICE 'Sample customers created successfully!';
  ELSE
    RAISE NOTICE 'Customers already exist and are accessible from POS.';
  END IF;
END $$;

-- 6. Final check - show all customers accessible from POS
SELECT 
  'Final check - Customers accessible from POS:' as info,
  COUNT(*) as total_count
FROM customers 
WHERE status = 'active' AND branch_id IS NULL;

-- 7. Show final customer list
SELECT 
  customer_number,
  first_name || ' ' || last_name as full_name,
  account_balance,
  credit_limit,
  status
FROM customers 
WHERE status = 'active' AND branch_id IS NULL
ORDER BY first_name;
