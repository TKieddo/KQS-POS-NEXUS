-- Test Refund Relationships
-- Run this in your Supabase SQL editor to verify database relationships

-- ========================================
-- 1. CHECK TABLE STRUCTURES
-- ========================================
SELECT 'Sales Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sales' 
ORDER BY ordinal_position;

SELECT 'Sale Items Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sale_items' 
ORDER BY ordinal_position;

SELECT 'Customers Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- ========================================
-- 2. CHECK FOREIGN KEY RELATIONSHIPS
-- ========================================
SELECT 'Foreign Key Relationships:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('sales', 'sale_items', 'customers')
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- 3. CHECK SAMPLE DATA
-- ========================================
SELECT 'Sample Sales Data:' as info;
SELECT id, transaction_number, customer_id, total_amount, created_at 
FROM sales 
LIMIT 5;

SELECT 'Sample Sale Items Data:' as info;
SELECT id, sale_id, product_id, quantity, unit_price, created_at 
FROM sale_items 
LIMIT 5;

SELECT 'Sample Customers Data:' as info;
SELECT id, first_name, last_name, email 
FROM customers 
LIMIT 5;

-- ========================================
-- 4. TEST THE EXACT QUERY USED IN REFUND PAGE
-- ========================================
-- Replace 'YOUR_BRANCH_ID' with your actual branch ID
SELECT 'Test Refund Page Query:' as info;
SELECT 
    si.id,
    si.sale_id,
    si.product_id,
    si.quantity,
    si.unit_price,
    si.total_price,
    si.created_at,
    p.name as product_name,
    p.sku,
    s.transaction_number,
    s.customer_id,
    s.payment_method,
    s.created_at as sale_date
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE si.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY si.created_at DESC
LIMIT 5;

-- ========================================
-- 5. TEST CUSTOMER JOIN
-- ========================================
SELECT 'Test Customer Join:' as info;
SELECT 
    s.id as sale_id,
    s.transaction_number,
    s.customer_id,
    c.first_name,
    c.last_name,
    c.email
FROM sales s
LEFT JOIN customers c ON s.customer_id = c.id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
LIMIT 5;

-- ========================================
-- 6. CHECK IF CUSTOMER_ID IS NULL
-- ========================================
SELECT 'Sales with NULL Customer ID:' as info;
SELECT COUNT(*) as sales_without_customer
FROM sales 
WHERE customer_id IS NULL;

SELECT 'Sales with Customer ID:' as info;
SELECT COUNT(*) as sales_with_customer
FROM sales 
WHERE customer_id IS NOT NULL;
