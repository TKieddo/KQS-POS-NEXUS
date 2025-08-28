-- Add Foreign Key Constraint for Laybye Orders to Customers
-- This fixes the PGRST200 error by establishing the relationship

-- Add the foreign key constraint
ALTER TABLE laybye_orders 
ADD CONSTRAINT laybye_orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Verify the constraint was added
SELECT 
    'Foreign Key Constraint Added' as status,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'laybye_orders'
    AND kcu.column_name = 'customer_id';
