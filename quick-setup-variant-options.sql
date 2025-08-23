-- Quick setup for variant options
-- Run this in Supabase SQL Editor if variant options are empty

-- Check if we have any variant option types
DO $$
DECLARE
  types_count INTEGER;
  options_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO types_count FROM variant_option_types;
  SELECT COUNT(*) INTO options_count FROM variant_options;
  
  RAISE NOTICE 'Current variant option types: %', types_count;
  RAISE NOTICE 'Current variant options: %', options_count;
  
  -- Only insert if tables are empty
  IF types_count = 0 THEN
    -- Insert variant option types
    INSERT INTO variant_option_types (name, display_name, description, is_active, sort_order) VALUES
    ('size', 'Size', 'Product sizes', true, 1),
    ('color', 'Color', 'Product colors', true, 2),
    ('gender', 'Gender', 'Target gender', true, 3),
    ('brand', 'Brand', 'Product brand', true, 4);
    
    RAISE NOTICE 'Inserted variant option types';
  END IF;
  
  IF options_count = 0 THEN
    -- Insert basic options for each type
    INSERT INTO variant_options (type_id, value, label, color_hex, is_active, sort_order)
    SELECT 
      vot.id,
      'red',
      'Red',
      '#FF0000',
      true,
      1
    FROM variant_option_types vot WHERE vot.name = 'color'
    UNION ALL
    SELECT 
      vot.id,
      'blue',
      'Blue', 
      '#0000FF',
      true,
      2
    FROM variant_option_types vot WHERE vot.name = 'color'
    UNION ALL
    SELECT 
      vot.id,
      'black',
      'Black',
      '#000000',
      true,
      3
    FROM variant_option_types vot WHERE vot.name = 'color'
    UNION ALL
    SELECT 
      vot.id,
      'white',
      'White',
      '#FFFFFF',
      true,
      4
    FROM variant_option_types vot WHERE vot.name = 'color'
    UNION ALL
    SELECT 
      vot.id,
      'S',
      'Small',
      NULL,
      true,
      1
    FROM variant_option_types vot WHERE vot.name = 'size'
    UNION ALL
    SELECT 
      vot.id,
      'M',
      'Medium',
      NULL,
      true,
      2
    FROM variant_option_types vot WHERE vot.name = 'size'
    UNION ALL
    SELECT 
      vot.id,
      'L',
      'Large',
      NULL,
      true,
      3
    FROM variant_option_types vot WHERE vot.name = 'size'
    UNION ALL
    SELECT 
      vot.id,
      'XL',
      'Extra Large',
      NULL,
      true,
      4
    FROM variant_option_types vot WHERE vot.name = 'size';
    
    RAISE NOTICE 'Inserted basic variant options';
  END IF;
  
  -- Associate all variant types with all categories
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
  ON CONFLICT (category_id, variant_type_id) DO NOTHING;
  
  RAISE NOTICE 'Associated variant types with categories';
  
  -- Show final counts
  SELECT COUNT(*) INTO types_count FROM variant_option_types;
  SELECT COUNT(*) INTO options_count FROM variant_options;
  
  RAISE NOTICE 'Final variant option types: %', types_count;
  RAISE NOTICE 'Final variant options: %', options_count;
END $$;
