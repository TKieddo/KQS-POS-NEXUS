-- Fix Discount Schema Migration
-- This adds proper discount fields and expiration date to products table

-- Add discount fields if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage'; -- 'percentage' or 'fixed'
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_discount_active BOOLEAN DEFAULT false;

-- Add discount fields to product_variants as well
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage';
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS discount_description TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS discount_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_discount_active BOOLEAN DEFAULT false;

-- Create function to calculate discounted price
CREATE OR REPLACE FUNCTION calculate_discounted_price(
  original_price DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  discount_type VARCHAR(20)
) RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF discount_amount <= 0 THEN
    RETURN original_price;
  END IF;
  
  IF discount_type = 'percentage' THEN
    RETURN GREATEST(original_price * (1 - discount_amount / 100), 0);
  ELSE
    RETURN GREATEST(original_price - discount_amount, 0);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if discount is still valid
CREATE OR REPLACE FUNCTION is_discount_valid(
  is_active BOOLEAN,
  expires_at TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
BEGIN
  IF NOT is_active THEN
    RETURN false;
  END IF;
  
  IF expires_at IS NULL THEN
    RETURN true; -- No expiration date means always valid
  END IF;
  
  RETURN NOW() < expires_at;
END;
$$ LANGUAGE plpgsql;

-- Create view for products with calculated discounted prices
CREATE OR REPLACE VIEW products_with_discounts AS
SELECT 
  p.*,
  CASE 
    WHEN is_discount_valid(p.is_discount_active, p.discount_expires_at) THEN
      calculate_discounted_price(p.price, p.discount_amount, p.discount_type)
    ELSE p.price
  END as final_price,
  CASE 
    WHEN is_discount_valid(p.is_discount_active, p.discount_expires_at) THEN
      p.price - calculate_discounted_price(p.price, p.discount_amount, p.discount_type)
    ELSE 0
  END as discount_savings
FROM products p;

-- Create view for product variants with calculated discounted prices
CREATE OR REPLACE VIEW product_variants_with_discounts AS
SELECT 
  pv.*,
  CASE 
    WHEN is_discount_valid(pv.is_discount_active, pv.discount_expires_at) THEN
      calculate_discounted_price(pv.price, pv.discount_amount, pv.discount_type)
    ELSE pv.price
  END as final_price,
  CASE 
    WHEN is_discount_valid(pv.is_discount_active, pv.discount_expires_at) THEN
      pv.price - calculate_discounted_price(pv.price, pv.discount_amount, pv.discount_type)
    ELSE 0
  END as discount_savings
FROM product_variants pv;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_discount_active ON products(is_discount_active);
CREATE INDEX IF NOT EXISTS idx_products_discount_expires ON products(discount_expires_at);
CREATE INDEX IF NOT EXISTS idx_product_variants_discount_active ON product_variants(is_discount_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_discount_expires ON product_variants(discount_expires_at); 