-- Test Refund Function
-- This script tests if the process_complete_refund function exists and works

-- Check if the function exists
SELECT 
    routine_name, 
    routine_type, 
    data_type 
FROM information_schema.routines 
WHERE routine_name = 'process_complete_refund';

-- Check if refunds table exists
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'refunds';

-- Check if refund_items table exists
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'refund_items';

-- Check if customers table has account_balance column
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'account_balance';

-- Test the function with dummy data (this will fail but show the error)
-- SELECT process_complete_refund(
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     100.00,
--     'Test refund',
--     'cash',
--     NULL,
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     '00000000-0000-0000-0000-000000000000'::uuid
-- );
