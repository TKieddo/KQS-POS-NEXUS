-- Check Credit Transactions Table Structure
-- This script checks what columns actually exist in the credit_transactions table

-- Check if credit_transactions table exists
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'credit_transactions';

-- Check all columns in credit_transactions table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'credit_transactions'
ORDER BY ordinal_position;

-- Check if there are any existing records
SELECT COUNT(*) as record_count FROM credit_transactions LIMIT 1;

-- Show sample data structure (if any records exist)
SELECT * FROM credit_transactions LIMIT 3;
