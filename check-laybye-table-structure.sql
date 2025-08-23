-- Check the current structure of laybye_orders table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'laybye_orders'
) as table_exists;
