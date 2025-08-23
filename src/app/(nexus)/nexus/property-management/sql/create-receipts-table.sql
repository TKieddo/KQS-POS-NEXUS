-- Create receipts table
CREATE TABLE IF NOT EXISTS property_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  due_date DATE,
  tenant_id UUID NOT NULL REFERENCES property_tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES property_buildings(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_property_receipts_tenant_id ON property_receipts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_receipts_building_id ON property_receipts(building_id);
CREATE INDEX IF NOT EXISTS idx_property_receipts_date ON property_receipts(date);

-- Add RLS policies
ALTER TABLE property_receipts ENABLE ROW LEVEL SECURITY;

-- Policy for viewing receipts
CREATE POLICY "View receipts" ON property_receipts
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- Policy for inserting receipts
CREATE POLICY "Insert receipts" ON property_receipts
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Policy for updating receipts
CREATE POLICY "Update receipts" ON property_receipts
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
  );

-- Policy for deleting receipts
CREATE POLICY "Delete receipts" ON property_receipts
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
  );

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_property_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_receipts_updated_at
  BEFORE UPDATE ON property_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_property_receipts_updated_at();
