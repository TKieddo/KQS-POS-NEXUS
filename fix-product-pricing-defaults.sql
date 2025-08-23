-- Fix Product & Pricing Defaults
-- This script ensures default pricing settings exist for all branches

-- Insert default pricing settings for all branches that don't have them
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

-- Insert some sample pricing rules for demonstration
INSERT INTO product_pricing_rules (
    branch_id,
    name,
    description,
    rule_type,
    condition_type,
    condition_value,
    action_type,
    action_value,
    priority,
    is_active,
    applies_to_variants,
    created_at,
    updated_at
)
SELECT 
    b.id as branch_id,
    'High Value Markup' as name,
    'Apply higher markup to products above R1000' as description,
    'markup' as rule_type,
    'cost_range' as condition_type,
    '{"min_cost": 1000, "max_cost": null}' as condition_value,
    'adjust_percentage' as action_type,
    40.00 as action_value,
    1 as priority,
    true as is_active,
    false as applies_to_variants,
    NOW() as created_at,
    NOW() as updated_at
FROM branches b
WHERE NOT EXISTS (
    SELECT 1 FROM product_pricing_rules ppr WHERE ppr.branch_id = b.id AND ppr.name = 'High Value Markup'
);

INSERT INTO product_pricing_rules (
    branch_id,
    name,
    description,
    rule_type,
    condition_type,
    condition_value,
    action_type,
    action_value,
    priority,
    is_active,
    applies_to_variants,
    created_at,
    updated_at
)
SELECT 
    b.id as branch_id,
    'Low Stock Discount' as name,
    'Apply discount to products with low stock' as description,
    'percentage' as rule_type,
    'stock_level' as condition_type,
    '{"max_stock": 10}' as condition_value,
    'adjust_percentage' as action_type,
    -10.00 as action_value,
    2 as priority,
    true as is_active,
    false as applies_to_variants,
    NOW() as created_at,
    NOW() as updated_at
FROM branches b
WHERE NOT EXISTS (
    SELECT 1 FROM product_pricing_rules ppr WHERE ppr.branch_id = b.id AND ppr.name = 'Low Stock Discount'
);

-- Update any existing settings to ensure they have all required fields
UPDATE product_pricing_settings 
SET 
    default_markup_percentage = COALESCE(default_markup_percentage, 30.00),
    min_profit_margin = COALESCE(min_profit_margin, 15.00),
    max_profit_margin = COALESCE(max_profit_margin, 50.00),
    competitive_pricing_enabled = COALESCE(competitive_pricing_enabled, false),
    auto_price_adjustment = COALESCE(auto_price_adjustment, false),
    price_rounding_method = COALESCE(price_rounding_method, 'nearest'),
    price_rounding_increment = COALESCE(price_rounding_increment, 0.01),
    bulk_update_enabled = COALESCE(bulk_update_enabled, true),
    discount_management_enabled = COALESCE(discount_management_enabled, true),
    price_optimization_enabled = COALESCE(price_optimization_enabled, false),
    updated_at = NOW()
WHERE 
    default_markup_percentage IS NULL 
    OR min_profit_margin IS NULL 
    OR max_profit_margin IS NULL;

-- Ensure all rules have proper priority values
UPDATE product_pricing_rules 
SET priority = COALESCE(priority, 0)
WHERE priority IS NULL;

-- Ensure all rules have proper is_active values
UPDATE product_pricing_rules 
SET is_active = COALESCE(is_active, true)
WHERE is_active IS NULL; 