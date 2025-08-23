-- Test Refund Page Fix
-- Run this in your Supabase SQL editor to verify the refund page query logic

-- ========================================
-- 1. CHECK BRANCHES
-- ========================================
SELECT 'Available Branches:' as info;
SELECT id, name, is_active FROM branches ORDER BY name;

-- ========================================
-- 2. TEST THE EXACT REFUND PAGE LOGIC
-- ========================================
-- Replace 'YOUR_BRANCH_ID' with your actual branch ID from step 1

-- Step 1: Get sales for branch (same as refund page)
SELECT 'Step 1 - Sales for Branch:' as info;
SELECT 
    id,
    transaction_number,
    customer_id,
    total_amount,
    payment_method,
    created_at
FROM sales 
WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Get sale items for those sales (same as refund page)
SELECT 'Step 2 - Sale Items for Branch Sales:' as info;
WITH branch_sales AS (
    SELECT id FROM sales 
    WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
)
SELECT 
    si.id,
    si.sale_id,
    si.product_id,
    si.quantity,
    si.unit_price,
    si.total_price,
    si.created_at,
    p.name as product_name,
    p.sku as product_sku,
    pv.sku as variant_sku,
    pv.barcode as variant_barcode
FROM sale_items si
JOIN products p ON si.product_id = p.id
LEFT JOIN product_variants pv ON si.variant_id = pv.id
JOIN branch_sales bs ON si.sale_id = bs.id
ORDER BY si.created_at DESC
LIMIT 10;

-- ========================================
-- 3. TEST DATE FILTERING
-- ========================================
-- Test today's sales
SELECT 'Todays Sales:' as info;
SELECT 
    id,
    transaction_number,
    created_at
FROM sales 
WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Test today's sale items
SELECT 'Todays Sale Items:' as info;
SELECT 
    si.id,
    si.sale_id,
    p.name as product_name,
    p.sku,
    si.quantity,
    si.unit_price
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
AND DATE(s.created_at) = CURRENT_DATE
ORDER BY si.created_at DESC;

-- ========================================
-- 4. TEST CUSTOMER DATA
-- ========================================
SELECT 'Customers for Branch Sales:' as info;
SELECT DISTINCT
    c.id,
    c.first_name,
    c.last_name,
    c.email
FROM customers c
JOIN sales s ON c.id = s.customer_id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
LIMIT 10;

-- ========================================
-- 5. FINAL COMPLETE QUERY (Refund Page Logic)
-- ========================================
SELECT 'Complete Refund Page Query:' as info;
WITH branch_sales AS (
    SELECT 
        id,
        transaction_number,
        customer_id,
        total_amount,
        payment_method,
        created_at
    FROM sales 
    WHERE branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
    ORDER BY created_at DESC
),
branch_sale_items AS (
    SELECT 
        si.id,
        si.sale_id,
        si.product_id,
        si.variant_id,
        si.quantity,
        si.unit_price,
        si.total_price,
        si.created_at,
        p.name as product_name,
        p.sku as product_sku,
        pv.sku as variant_sku,
        pv.barcode as variant_barcode
    FROM sale_items si
    JOIN products p ON si.product_id = p.id
    LEFT JOIN product_variants pv ON si.variant_id = pv.id
    JOIN branch_sales bs ON si.sale_id = bs.id
    ORDER BY si.created_at DESC
)
SELECT 
    bsi.id,
    bsi.sale_id,
    bs.transaction_number,
    bsi.product_name,
    COALESCE(bsi.variant_sku, bsi.product_sku) as sku,
    bsi.quantity,
    bsi.unit_price,
    bsi.total_price,
    bs.created_at as sale_date,
    c.first_name || ' ' || c.last_name as customer_name,
    bs.payment_method
FROM branch_sale_items bsi
JOIN branch_sales bs ON bsi.sale_id = bs.id
LEFT JOIN customers c ON bs.customer_id = c.id
ORDER BY bs.created_at DESC
LIMIT 10;
