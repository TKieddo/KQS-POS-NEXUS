-- Test Refund Data Loading
-- Run this in your Supabase SQL editor to verify sale items are available

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
    s.id,
    s.transaction_number,
    s.total_amount,
    s.payment_method,
    s.created_at,
    c.first_name || ' ' || c.last_name as customer_name
FROM sales s
LEFT JOIN customers c ON s.customer_id = c.id
WHERE s.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY s.created_at DESC
LIMIT 10;

-- ========================================
-- 3. CHECK SALE ITEMS IN YOUR BRANCH
-- ========================================
SELECT 'Sale Items in Branch:' as info;
SELECT 
    si.id as sale_item_id,
    si.sale_id,
    si.quantity,
    si.unit_price,
    si.total_price,
    si.created_at,
    p.name as product_name,
    p.sku,
    s.transaction_number,
    c.first_name || ' ' || c.last_name as customer_name
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
LEFT JOIN customers c ON s.customer_id = c.id
WHERE si.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
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
-- 5. UPDATE SALE ITEMS WITH BRANCH_ID (if needed)
-- ========================================
-- If sale items don't have branch_id, run this to update them:
/*
UPDATE sale_items 
SET branch_id = s.branch_id
FROM sales s
WHERE sale_items.sale_id = s.id 
AND sale_items.branch_id IS NULL;
*/

-- ========================================
-- 6. TEST THE EXACT QUERY USED IN REFUND PAGE
-- ========================================
-- Replace 'YOUR_BRANCH_ID' with your actual branch ID
SELECT 'Refund Page Query Test:' as info;
SELECT 
    si.id,
    si.sale_id,
    si.product_id,
    si.quantity,
    si.unit_price,
    si.total_price,
    p.name as product_name,
    p.sku,
    s.transaction_number,
    s.payment_method,
    s.created_at as sale_date
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE si.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY si.created_at DESC
LIMIT 5;

-- ========================================
-- 7. CHECK REFUNDED ITEMS
-- ========================================
SELECT 'Refunded Items:' as info;
SELECT 
    ri.original_sale_item_id,
    ri.refund_amount,
    ri.created_at as refund_date,
    si.quantity as original_quantity,
    si.unit_price,
    p.name as product_name
FROM refund_items ri
JOIN sale_items si ON ri.original_sale_item_id = si.id
JOIN products p ON si.product_id = p.id
ORDER BY ri.created_at DESC
LIMIT 5;
