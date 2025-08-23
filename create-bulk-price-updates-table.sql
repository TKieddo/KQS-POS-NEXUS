-- Create the bulk_price_updates table for bulk price update functionality
-- Run this SQL in your Supabase Dashboard SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS bulk_price_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  update_type VARCHAR(20) NOT NULL CHECK (update_type IN ('percentage', 'fixed', 'multiplier', 'set')),
  update_direction VARCHAR(20) DEFAULT 'increase' CHECK (update_direction IN ('increase', 'decrease')),
  update_value DECIMAL(10,2) NOT NULL,
  affected_categories TEXT[],
  affected_products_count INTEGER DEFAULT 0,
  total_value_change DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  performed_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bulk_price_updates_branch_id ON bulk_price_updates(branch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_price_updates_status ON bulk_price_updates(status);
CREATE INDEX IF NOT EXISTS idx_bulk_price_updates_created_at ON bulk_price_updates(created_at);

-- Enable Row Level Security
ALTER TABLE bulk_price_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view bulk price updates" ON bulk_price_updates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert bulk price updates" ON bulk_price_updates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update bulk price updates" ON bulk_price_updates
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add comments for documentation
COMMENT ON TABLE bulk_price_updates IS 'Stores bulk price update operations for products';
COMMENT ON COLUMN bulk_price_updates.update_direction IS 'Direction of price update: increase or decrease';
COMMENT ON COLUMN bulk_price_updates.update_type IS 'Type of update: percentage, fixed, multiplier, or set';
COMMENT ON COLUMN bulk_price_updates.status IS 'Status of the bulk update operation';

-- Verify the table was created
SELECT 'bulk_price_updates table created successfully' as status; 