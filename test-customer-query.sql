-- Test query to check customer table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test simple customer query
SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  branch_id
FROM customers 
LIMIT 5;

-- Check if credit_accounts table exists and has data
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'credit_accounts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if loyalty_accounts table exists and has data
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'loyalty_accounts' 
AND table_schema = 'public'
ORDER BY ordinal_position; 