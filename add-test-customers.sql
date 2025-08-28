-- Add test customers for POS testing
-- Run this after fixing RLS policies

-- First, let's see if there are any existing customers
SELECT COUNT(*) as existing_customers FROM public.customers;

-- Add test customers if none exist
INSERT INTO public.customers (
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
  created_at,
  updated_at
) VALUES 
(
  'CUST001',
  'John',
  'Doe',
  'john.doe@email.com',
  '+1234567890',
  '123 Main St',
  'New York',
  'NY',
  '10001',
  'USA',
  'active',
  'regular',
  150.00,
  1000.00,
  NULL,
  NOW(),
  NOW()
),
(
  'CUST002',
  'Jane',
  'Smith',
  'jane.smith@email.com',
  '+1234567891',
  '456 Oak Ave',
  'Los Angeles',
  'CA',
  '90210',
  'USA',
  'active',
  'vip',
  500.00,
  5000.00,
  NULL,
  NOW(),
  NOW()
),
(
  'CUST003',
  'Mike',
  'Johnson',
  'mike.johnson@email.com',
  '+1234567892',
  '789 Pine Rd',
  'Chicago',
  'IL',
  '60601',
  'USA',
  'active',
  'wholesale',
  1000.00,
  10000.00,
  NULL,
  NOW(),
  NOW()
),
(
  'CUST004',
  'Sarah',
  'Wilson',
  'sarah.wilson@email.com',
  '+1234567893',
  '321 Elm St',
  'Houston',
  'TX',
  '77001',
  'USA',
  'active',
  'regular',
  75.00,
  500.00,
  NULL,
  NOW(),
  NOW()
),
(
  'CUST005',
  'David',
  'Brown',
  'david.brown@email.com',
  '+1234567894',
  '654 Maple Dr',
  'Phoenix',
  'AZ',
  '85001',
  'USA',
  'inactive',
  'regular',
  -50.00,
  1000.00,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (customer_number) DO NOTHING;

-- Verify the customers were added
SELECT 
  customer_number,
  first_name,
  last_name,
  email,
  status,
  customer_type,
  account_balance
FROM public.customers 
ORDER BY customer_number;
