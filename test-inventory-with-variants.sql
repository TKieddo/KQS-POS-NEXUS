-- Test script to create products with variants for testing inventory accordion functionality

-- First, let's ensure we have some variant types and options
INSERT INTO variant_option_types (name, display_name, description, is_active, sort_order) 
VALUES 
  ('size', 'Size', 'Product size options', true, 1),
  ('color', 'Color', 'Product color options', true, 2),
  ('brand', 'Brand', 'Product brand options', true, 3)
ON CONFLICT (name) DO NOTHING;

-- Get the variant type IDs
DO $$
DECLARE
    size_type_id UUID;
    color_type_id UUID;
    brand_type_id UUID;
    category_id UUID;
    product_id UUID;
    variant_id UUID;
    size_small_id UUID;
    size_medium_id UUID;
    size_large_id UUID;
    color_red_id UUID;
    color_blue_id UUID;
    color_black_id UUID;
BEGIN
    -- Get variant type IDs
    SELECT id INTO size_type_id FROM variant_option_types WHERE name = 'size';
    SELECT id INTO color_type_id FROM variant_option_types WHERE name = 'color';
    SELECT id INTO brand_type_id FROM variant_option_types WHERE name = 'brand';

    -- Insert variant options if they don't exist
    INSERT INTO variant_options (type_id, value, label, is_active, sort_order) 
    VALUES 
      (size_type_id, 'small', 'Small', true, 1),
      (size_type_id, 'medium', 'Medium', true, 2),
      (size_type_id, 'large', 'Large', true, 3),
      (color_type_id, 'red', 'Red', true, 1),
      (color_type_id, 'blue', 'Blue', true, 2),
      (color_type_id, 'black', 'Black', true, 3)
    ON CONFLICT (type_id, value) DO NOTHING;

    -- Get variant option IDs
    SELECT id INTO size_small_id FROM variant_options WHERE type_id = size_type_id AND value = 'small';
    SELECT id INTO size_medium_id FROM variant_options WHERE type_id = size_type_id AND value = 'medium';
    SELECT id INTO size_large_id FROM variant_options WHERE type_id = size_type_id AND value = 'large';
    SELECT id INTO color_red_id FROM variant_options WHERE type_id = color_type_id AND value = 'red';
    SELECT id INTO color_blue_id FROM variant_options WHERE type_id = color_type_id AND value = 'blue';
    SELECT id INTO color_black_id FROM variant_options WHERE type_id = color_type_id AND value = 'black';

    -- Create a category if it doesn't exist
    INSERT INTO categories (name, description, color, is_active) 
    VALUES ('Clothing', 'Clothing items', '#3B82F6', true)
    ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO category_id FROM categories WHERE name = 'Clothing';

    -- Create a test product with variants
    INSERT INTO products (
        name, 
        description, 
        category_id, 
        price, 
        cost_price, 
        stock_quantity, 
        min_stock_level, 
        sku, 
        has_variants, 
        is_active
    ) VALUES (
        'Test T-Shirt with Variants',
        'A test t-shirt with size and color variants',
        category_id,
        29.99,
        15.00,
        100,
        10,
        'TEST-TSHIRT-001',
        true,
        true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO product_id;

    -- If product already exists, get its ID
    IF product_id IS NULL THEN
        SELECT id INTO product_id FROM products WHERE sku = 'TEST-TSHIRT-001';
    END IF;

    -- Create product variants
    -- Small Red
    INSERT INTO product_variants (
        product_id, sku, price, cost_price, stock_quantity, min_stock_level, is_active
    ) VALUES (
        product_id, 'TEST-TSHIRT-001-SM-RED', 29.99, 15.00, 15, 2, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO variant_id;

    IF variant_id IS NULL THEN
        SELECT id INTO variant_id FROM product_variants WHERE sku = 'TEST-TSHIRT-001-SM-RED';
    END IF;

    -- Link variant to options
    INSERT INTO product_variant_options (variant_id, option_id) 
    VALUES 
        (variant_id, size_small_id),
        (variant_id, color_red_id)
    ON CONFLICT (variant_id, option_id) DO NOTHING;

    -- Medium Blue
    INSERT INTO product_variants (
        product_id, sku, price, cost_price, stock_quantity, min_stock_level, is_active
    ) VALUES (
        product_id, 'TEST-TSHIRT-001-MD-BLUE', 29.99, 15.00, 20, 2, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO variant_id;

    IF variant_id IS NULL THEN
        SELECT id INTO variant_id FROM product_variants WHERE sku = 'TEST-TSHIRT-001-MD-BLUE';
    END IF;

    INSERT INTO product_variant_options (variant_id, option_id) 
    VALUES 
        (variant_id, size_medium_id),
        (variant_id, color_blue_id)
    ON CONFLICT (variant_id, option_id) DO NOTHING;

    -- Large Black
    INSERT INTO product_variants (
        product_id, sku, price, cost_price, stock_quantity, min_stock_level, is_active
    ) VALUES (
        product_id, 'TEST-TSHIRT-001-LG-BLACK', 29.99, 15.00, 25, 2, true
    )
    ON CONFLICT (sku) DO NOTHING
    RETURNING id INTO variant_id;

    IF variant_id IS NULL THEN
        SELECT id INTO variant_id FROM product_variants WHERE sku = 'TEST-TSHIRT-001-LG-BLACK';
    END IF;

    INSERT INTO product_variant_options (variant_id, option_id) 
    VALUES 
        (variant_id, size_large_id),
        (variant_id, color_black_id)
    ON CONFLICT (variant_id, option_id) DO NOTHING;

    -- Add to central stock
    INSERT INTO central_stock (product_id, total_quantity, allocated_quantity, available_quantity)
    VALUES (product_id, 60, 0, 60)
    ON CONFLICT (product_id) DO UPDATE SET
        total_quantity = 60,
        available_quantity = 60;

    RAISE NOTICE 'Test product with variants created successfully!';
END $$;
