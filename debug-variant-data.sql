-- Debug script to check variant data structure
-- Run this in Supabase SQL editor to see what variant data exists

-- Check variant option types
SELECT 'variant_option_types' as table_name, count(*) as count FROM variant_option_types;
SELECT * FROM variant_option_types ORDER BY sort_order;

-- Check variant options  
SELECT 'variant_options' as table_name, count(*) as count FROM variant_options;
SELECT vo.*, vot.name as type_name, vot.display_name as type_display_name 
FROM variant_options vo 
JOIN variant_option_types vot ON vo.type_id = vot.id 
ORDER BY vot.sort_order, vo.sort_order;

-- Check products with variants
SELECT 'products_with_variants' as table_name, count(*) as count FROM products WHERE has_variants = true;
SELECT id, name, sku, has_variants FROM products WHERE has_variants = true LIMIT 10;

-- Check product variants
SELECT 'product_variants' as table_name, count(*) as count FROM product_variants;
SELECT pv.*, p.name as product_name 
FROM product_variants pv 
JOIN products p ON pv.product_id = p.id 
WHERE pv.is_active = true 
LIMIT 10;

-- Check product variant options (the linking table)
SELECT 'product_variant_options' as table_name, count(*) as count FROM product_variant_options;
SELECT pvo.*, pv.sku as variant_sku, vo.value as option_value, vo.label as option_label, vot.name as option_type
FROM product_variant_options pvo
JOIN product_variants pv ON pvo.variant_id = pv.id
JOIN variant_options vo ON pvo.option_id = vo.id
JOIN variant_option_types vot ON vo.type_id = vot.id
LIMIT 20;

-- Check a specific product's variants and their options
-- Replace the product_id with an actual ID from your database
SELECT 
    p.name as product_name,
    pv.sku as variant_sku,
    pv.stock_quantity,
    vo.value as option_value,
    vo.label as option_label,
    vot.name as option_type,
    vot.display_name as option_type_display
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
LEFT JOIN product_variant_options pvo ON pv.id = pvo.variant_id
LEFT JOIN variant_options vo ON pvo.option_id = vo.id
LEFT JOIN variant_option_types vot ON vo.type_id = vot.id
WHERE p.has_variants = true
ORDER BY p.name, pv.sku, vot.sort_order;
