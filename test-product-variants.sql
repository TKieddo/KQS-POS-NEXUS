-- Test Product Variants Structure
-- Run this in your Supabase SQL editor to check product_variants table

-- ========================================
-- 1. CHECK PRODUCT_VARIANTS TABLE STRUCTURE
-- ========================================
SELECT 'Product Variants Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

-- ========================================
-- 2. CHECK SAMPLE PRODUCT_VARIANTS DATA
-- ========================================
SELECT 'Sample Product Variants Data:' as info;
SELECT id, product_id, sku, barcode, price, stock_quantity, is_active 
FROM product_variants 
LIMIT 5;

-- ========================================
-- 3. CHECK SALE_ITEMS WITH VARIANTS
-- ========================================
SELECT 'Sale Items with Variants:' as info;
SELECT 
    si.id,
    si.sale_id,
    si.product_id,
    si.variant_id,
    p.name as product_name,
    p.sku as product_sku,
    pv.id as variant_id,
    pv.sku as variant_sku,
    pv.barcode as variant_barcode,
    pv.price as variant_price
FROM sale_items si
JOIN products p ON si.product_id = p.id
LEFT JOIN product_variants pv ON si.variant_id = pv.id
WHERE si.variant_id IS NOT NULL
LIMIT 10;

-- ========================================
-- 4. CHECK SALE_ITEMS WITHOUT VARIANTS
-- ========================================
SELECT 'Sale Items without Variants:' as info;
SELECT 
    si.id,
    si.sale_id,
    si.product_id,
    si.variant_id,
    p.name as product_name,
    p.sku as product_sku
FROM sale_items si
JOIN products p ON si.product_id = p.id
WHERE si.variant_id IS NULL
LIMIT 10;

-- ========================================
-- 5. COUNT VARIANTS USAGE
-- ========================================
SELECT 'Variant Usage Count:' as info;
SELECT 
    COUNT(*) as total_sale_items,
    COUNT(CASE WHEN variant_id IS NOT NULL THEN 1 END) as with_variants,
    COUNT(CASE WHEN variant_id IS NULL THEN 1 END) as without_variants
FROM sale_items;

-- ========================================
-- 6. TEST THE EXACT QUERY USED IN REFUND PAGE
-- ========================================
-- Replace 'YOUR_BRANCH_ID' with your actual branch ID
SELECT 'Test Refund Page Query with Variants:' as info;
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
    pv.barcode as variant_barcode,
    s.transaction_number,
    s.customer_id,
    s.payment_method,
    s.created_at as sale_date
FROM sale_items si
JOIN products p ON si.product_id = p.id
LEFT JOIN product_variants pv ON si.variant_id = pv.id
JOIN sales s ON si.sale_id = s.id
WHERE si.branch_id = 'YOUR_BRANCH_ID'  -- Replace with your branch ID
ORDER BY si.created_at DESC
LIMIT 5;
