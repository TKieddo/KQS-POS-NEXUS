-- Test Product & Pricing Database Connection
-- Run this in your Supabase SQL Editor to verify everything is working

-- 1. Check if branches exist
SELECT 'Branches' as table_name, COUNT(*) as count FROM branches;

-- 2. Check if product_pricing_settings exist
SELECT 'Product Pricing Settings' as table_name, COUNT(*) as count FROM product_pricing_settings;

-- 3. Check if product_pricing_rules exist
SELECT 'Product Pricing Rules' as table_name, COUNT(*) as count FROM product_pricing_rules;

-- 4. Show sample data from branches
SELECT id, name, is_active FROM branches LIMIT 5;

-- 5. Show sample data from product_pricing_settings
SELECT branch_id, default_markup_percentage, min_profit_margin, is_active FROM product_pricing_settings LIMIT 5;

-- 6. Show sample data from product_pricing_rules
SELECT id, name, rule_type, action_value, is_active FROM product_pricing_rules LIMIT 5;

-- 7. Create default settings for any branch that doesn't have them
INSERT INTO product_pricing_settings (
    branch_id,
    default_markup_percentage,
    min_profit_margin,
    max_profit_margin,
    competitive_pricing_enabled,
    auto_price_adjustment,
    price_rounding_method,
    price_rounding_increment,
    bulk_update_enabled,
    discount_management_enabled,
    price_optimization_enabled,
    created_at,
    updated_at
)
SELECT 
    b.id as branch_id,
    30.00 as default_markup_percentage,
    15.00 as min_profit_margin,
    50.00 as max_profit_margin,
    false as competitive_pricing_enabled,
    false as auto_price_adjustment,
    'nearest' as price_rounding_method,
    0.01 as price_rounding_increment,
    true as bulk_update_enabled,
    true as discount_management_enabled,
    false as price_optimization_enabled,
    NOW() as created_at,
    NOW() as updated_at
FROM branches b
WHERE NOT EXISTS (
    SELECT 1 FROM product_pricing_settings pps WHERE pps.branch_id = b.id
);

-- 8. Verify the insert worked
SELECT 'After Insert - Product Pricing Settings' as table_name, COUNT(*) as count FROM product_pricing_settings; 