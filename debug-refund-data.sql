-- Debug Refund Data Loading
-- Run this in your Supabase SQL editor to identify data loading issues

-- ========================================
-- 1. CHECK BRANCHES
-- ========================================
SELECT 'Available Branches:' as info;
SELECT id, name, is_active FROM branches ORDER BY name;

-- ========================================
-- 2. CHECK SALES IN YOUR BRANCH
-- ========================================
-- Replace 'YOUR_BRANCH_ID' with your actual branch ID from step 1
SELECT 'Sales in Branch:' as info;
SELECT 
    id,
    transaction_number,
    customer_id,
    total_amount,
    payment_method,
    created_at,
    branch_id
FROM sales 
WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 3. CHECK SALE ITEMS FOR THOSE SALES
-- ========================================
SELECT 'Sale Items for Branch Sales:' as info;
SELECT 
    si.id,
    si.sale_id,
    si.product_id,
    si.quantity,
    si.unit_price,
    si.total_price,
    si.created_at,
    si.branch_id,
    p.name as product_name,
    p.sku as product_sku,
    s.transaction_number,
    s.branch_id as sale_branch_id
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY si.created_at DESC
LIMIT 10;

-- ========================================
-- 4. CHECK IF SALE ITEMS HAVE BRANCH_ID
-- ========================================
SELECT 'Sale Items Branch ID Check:' as info;
SELECT 
    COUNT(*) as total_sale_items,
    COUNT(CASE WHEN branch_id IS NOT NULL THEN 1 END) as with_branch_id,
    COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as without_branch_id
FROM sale_items;

-- ========================================
-- 5. CHECK SALE ITEMS BY BRANCH_ID
-- ========================================
SELECT 'Sale Items by Branch ID:' as info;
SELECT 
    branch_id,
    COUNT(*) as item_count
FROM sale_items 
WHERE branch_id IS NOT NULL
GROUP BY branch_id
ORDER BY item_count DESC;

-- ========================================
-- 6. CHECK TODAYS SALES
-- ========================================
SELECT 'Todays Sales:' as info;
SELECT 
    s.id,
    s.transaction_number,
    s.created_at,
    COUNT(si.id) as item_count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
AND DATE(s.created_at) = CURRENT_DATE
GROUP BY s.id, s.transaction_number, s.created_at
ORDER BY s.created_at DESC;

-- ========================================
-- 7. CHECK TODAYS SALE ITEMS
-- ========================================
SELECT 'Todays Sale Items:' as info;
SELECT 
    si.id,
    si.sale_id,
    si.created_at,
    p.name as product_name,
    p.sku,
    si.quantity,
    si.unit_price
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
AND DATE(si.created_at) = CURRENT_DATE
ORDER BY si.created_at DESC;

-- ========================================
-- 8. CHECK CUSTOMERS
-- ========================================
SELECT 'Customers in Branch:' as info;
SELECT 
    id,
    first_name,
    last_name,
    email,
    branch_id
FROM customers 
WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
LIMIT 10;

-- ========================================
-- 9. TEST THE EXACT QUERY LOGIC
-- ========================================
-- Step 1: Get sales for branch
SELECT 'Step 1 - Sales for Branch:' as info;
WITH branch_sales AS (
    SELECT id, transaction_number, customer_id, total_amount, payment_method, created_at
    FROM sales 
    WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
    ORDER BY created_at DESC
)
SELECT * FROM branch_sales LIMIT 5;

-- Step 2: Get sale items for those sales
SELECT 'Step 2 - Sale Items for Branch Sales:' as info;
WITH branch_sales AS (
    SELECT id FROM sales 
    WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
),
branch_sale_items AS (
    SELECT 
        si.id,
        si.sale_id,
        si.product_id,
        si.quantity,
        si.unit_price,
        si.total_price,
        si.created_at,
        p.name as product_name,
        p.sku as product_sku
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    JOIN branch_sales bs ON si.sale_id = bs.id
    ORDER BY si.created_at DESC
)
SELECT * FROM branch_sale_items LIMIT 10;

-- ========================================
-- 10. CHECK FOR ANY DATA ISSUES
-- ========================================
SELECT 'Data Integrity Check:' as info;
SELECT 
    'Sales without items' as check_type,
    COUNT(*) as count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
AND si.id IS NULL

UNION ALL

SELECT 
    'Sale items without sales' as check_type,
    COUNT(*) as count
FROM sale_items si
LEFT JOIN sales s ON si.sale_id = s.id
WHERE s.id IS NULL

UNION ALL

SELECT 
    'Products without sale items' as check_type,
    COUNT(*) as count
FROM products p
LEFT JOIN sale_items si ON p.id = si.product_id
WHERE si.id IS NULL;
