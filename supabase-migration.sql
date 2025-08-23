-- Add discount fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_type text;

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text,
  color text,
  sku text,
  barcode text,
  cost_price numeric,
  price numeric,
  stock_quantity integer,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text,
  is_main boolean DEFAULT false,
  variant_id uuid REFERENCES product_variants(id),
  sort_order integer,
  created_at timestamptz DEFAULT now()
);

-- Create settings table for universal markup
CREATE TABLE IF NOT EXISTS settings (
  id serial PRIMARY KEY,
  default_markup numeric,
  updated_at timestamptz DEFAULT now()
); 