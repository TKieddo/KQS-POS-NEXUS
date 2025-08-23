-- Check what columns actually exist in your laybye_orders table
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check constraints to see what's required
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'laybye_orders' 
    AND table_schema = 'public';

-- Show NOT NULL constraints specifically
SELECT 
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'laybye_orders' 
    AND table_schema = 'public'
    AND is_nullable = 'NO'
ORDER BY column_name;
