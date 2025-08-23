-- Create payments table
CREATE TABLE IF NOT EXISTS property_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES property_tenants(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES property_buildings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_property_payments_tenant_id ON property_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_payments_building_id ON property_payments(building_id);
CREATE INDEX IF NOT EXISTS idx_property_receipts_tenant_id ON property_receipts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_receipts_building_id ON property_receipts(building_id);
CREATE INDEX IF NOT EXISTS idx_property_receipts_date ON property_receipts(date);
CREATE INDEX IF NOT EXISTS idx_property_receipts_receipt_number ON property_receipts(receipt_number);

-- Enable RLS
ALTER TABLE property_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_receipts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "View payments" ON property_payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage payments" ON property_payments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "View receipts" ON property_receipts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage receipts" ON property_receipts FOR ALL USING (auth.role() = 'authenticated');
