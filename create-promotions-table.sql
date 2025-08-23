-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount DECIMAL(10,2) NOT NULL CHECK (discount_amount > 0),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'categories', 'products')),
  category_ids UUID[] DEFAULT '{}',
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_applies_to ON promotions(applies_to);

-- Add RLS policies
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read promotions
CREATE POLICY "Users can view promotions" ON promotions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert promotions
CREATE POLICY "Users can create promotions" ON promotions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update promotions
CREATE POLICY "Users can update promotions" ON promotions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete promotions
CREATE POLICY "Users can delete promotions" ON promotions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- Create function to validate promotion dates
CREATE OR REPLACE FUNCTION validate_promotion_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date >= NEW.end_date THEN
    RAISE EXCEPTION 'Start date must be before end date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate promotion dates
CREATE TRIGGER validate_promotion_dates
  BEFORE INSERT OR UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION validate_promotion_dates();

-- Create function to validate discount amount based on type
CREATE OR REPLACE FUNCTION validate_discount_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_type = 'percentage' AND (NEW.discount_amount <= 0 OR NEW.discount_amount > 100) THEN
    RAISE EXCEPTION 'Percentage discount must be between 0 and 100';
  END IF;
  
  IF NEW.discount_type = 'fixed' AND NEW.discount_amount <= 0 THEN
    RAISE EXCEPTION 'Fixed discount must be greater than 0';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate discount amount
CREATE TRIGGER validate_discount_amount
  BEFORE INSERT OR UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION validate_discount_amount(); 