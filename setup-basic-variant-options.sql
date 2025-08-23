-- Setup basic variant options for KQS POS
-- This script creates basic variant option types and options if they don't exist

-- Insert basic variant option types
INSERT INTO variant_option_types (name, display_name, description, is_active, sort_order) VALUES
('size', 'Size', 'Product sizes like XS, S, M, L, XL', true, 1),
('color', 'Color', 'Product colors like Red, Blue, Green', true, 2),
('gender', 'Gender', 'Target gender like Men, Women, Unisex', true, 3),
('brand', 'Brand', 'Product brand or manufacturer', true, 4),
('style', 'Style', 'Product style or variant', true, 5)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Get the type IDs for inserting options
DO $$
DECLARE
  size_type_id UUID;
  color_type_id UUID;
  gender_type_id UUID;
  brand_type_id UUID;
  style_type_id UUID;
BEGIN
  -- Get type IDs
  SELECT id INTO size_type_id FROM variant_option_types WHERE name = 'size';
  SELECT id INTO color_type_id FROM variant_option_types WHERE name = 'color';
  SELECT id INTO gender_type_id FROM variant_option_types WHERE name = 'gender';
  SELECT id INTO brand_type_id FROM variant_option_types WHERE name = 'brand';
  SELECT id INTO style_type_id FROM variant_option_types WHERE name = 'style';

  -- Insert size options
  INSERT INTO variant_options (type_id, value, label, is_active, sort_order) VALUES
  (size_type_id, 'XS', 'Extra Small', true, 1),
  (size_type_id, 'S', 'Small', true, 2),
  (size_type_id, 'M', 'Medium', true, 3),
  (size_type_id, 'L', 'Large', true, 4),
  (size_type_id, 'XL', 'Extra Large', true, 5),
  (size_type_id, 'XXL', '2X Large', true, 6),
  (size_type_id, 'XXXL', '3X Large', true, 7),
  (size_type_id, '28', 'Size 28', true, 8),
  (size_type_id, '30', 'Size 30', true, 9),
  (size_type_id, '32', 'Size 32', true, 10),
  (size_type_id, '34', 'Size 34', true, 11),
  (size_type_id, '36', 'Size 36', true, 12),
  (size_type_id, '38', 'Size 38', true, 13),
  (size_type_id, '40', 'Size 40', true, 14),
  (size_type_id, '42', 'Size 42', true, 15)
  ON CONFLICT (type_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

  -- Insert color options
  INSERT INTO variant_options (type_id, value, label, color_hex, is_active, sort_order) VALUES
  (color_type_id, 'red', 'Red', '#FF0000', true, 1),
  (color_type_id, 'blue', 'Blue', '#0000FF', true, 2),
  (color_type_id, 'green', 'Green', '#00FF00', true, 3),
  (color_type_id, 'black', 'Black', '#000000', true, 4),
  (color_type_id, 'white', 'White', '#FFFFFF', true, 5),
  (color_type_id, 'yellow', 'Yellow', '#FFFF00', true, 6),
  (color_type_id, 'purple', 'Purple', '#800080', true, 7),
  (color_type_id, 'orange', 'Orange', '#FFA500', true, 8),
  (color_type_id, 'pink', 'Pink', '#FFC0CB', true, 9),
  (color_type_id, 'brown', 'Brown', '#A52A2A', true, 10),
  (color_type_id, 'gray', 'Gray', '#808080', true, 11),
  (color_type_id, 'navy', 'Navy Blue', '#000080', true, 12),
  (color_type_id, 'gold', 'Gold', '#FFD700', true, 13),
  (color_type_id, 'silver', 'Silver', '#C0C0C0', true, 14),
  (color_type_id, 'beige', 'Beige', '#F5F5DC', true, 15)
  ON CONFLICT (type_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    color_hex = EXCLUDED.color_hex,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

  -- Insert gender options
  INSERT INTO variant_options (type_id, value, label, is_active, sort_order) VALUES
  (gender_type_id, 'men', 'Men', true, 1),
  (gender_type_id, 'women', 'Women', true, 2),
  (gender_type_id, 'unisex', 'Unisex', true, 3),
  (gender_type_id, 'boys', 'Boys', true, 4),
  (gender_type_id, 'girls', 'Girls', true, 5),
  (gender_type_id, 'kids', 'Kids', true, 6)
  ON CONFLICT (type_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

  -- Insert brand options
  INSERT INTO variant_options (type_id, value, label, is_active, sort_order) VALUES
  (brand_type_id, 'nike', 'Nike', true, 1),
  (brand_type_id, 'adidas', 'Adidas', true, 2),
  (brand_type_id, 'puma', 'Puma', true, 3),
  (brand_type_id, 'reebok', 'Reebok', true, 4),
  (brand_type_id, 'converse', 'Converse', true, 5),
  (brand_type_id, 'vans', 'Vans', true, 6),
  (brand_type_id, 'zara', 'Zara', true, 7),
  (brand_type_id, 'h&m', 'H&M', true, 8),
  (brand_type_id, 'uniqlo', 'Uniqlo', true, 9),
  (brand_type_id, 'levis', 'Levi\'s', true, 10),
  (brand_type_id, 'gap', 'Gap', true, 11),
  (brand_type_id, 'polo', 'Polo Ralph Lauren', true, 12)
  ON CONFLICT (type_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

  -- Insert style options
  INSERT INTO variant_options (type_id, value, label, is_active, sort_order) VALUES
  (style_type_id, 'casual', 'Casual', true, 1),
  (style_type_id, 'formal', 'Formal', true, 2),
  (style_type_id, 'sport', 'Sport', true, 3),
  (style_type_id, 'vintage', 'Vintage', true, 4),
  (style_type_id, 'modern', 'Modern', true, 5),
  (style_type_id, 'classic', 'Classic', true, 6),
  (style_type_id, 'trendy', 'Trendy', true, 7),
  (style_type_id, 'business', 'Business', true, 8)
  ON CONFLICT (type_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

END $$;

-- Now we need to associate these variant types with categories
-- Get all category IDs and create basic associations
INSERT INTO category_variant_configs (category_id, variant_type_id, is_required, sort_order)
SELECT 
  c.id as category_id,
  vot.id as variant_type_id,
  false as is_required,
  vot.sort_order
FROM categories c
CROSS JOIN variant_option_types vot
WHERE vot.is_active = true
  AND c.is_active = true
ON CONFLICT (category_id, variant_type_id) DO UPDATE SET
  is_required = EXCLUDED.is_required,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Verify the setup
SELECT 'variant_option_types' as table_name, count(*) as count FROM variant_option_types WHERE is_active = true;
SELECT 'variant_options' as table_name, count(*) as count FROM variant_options WHERE is_active = true;
SELECT 'category_variant_configs' as table_name, count(*) as count FROM category_variant_configs;

-- Show some sample data
SELECT 
  vot.name as type_name,
  vot.display_name,
  vo.value,
  vo.label,
  vo.color_hex,
  vo.sort_order
FROM variant_option_types vot
JOIN variant_options vo ON vot.id = vo.type_id
WHERE vot.is_active = true AND vo.is_active = true
ORDER BY vot.sort_order, vo.sort_order
LIMIT 20;
