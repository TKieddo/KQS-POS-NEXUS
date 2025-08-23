-- Create property documents table
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES property_buildings(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES property_tenants(id) ON DELETE CASCADE,
  room_id UUID REFERENCES property_rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  uploaded_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (building_id IS NOT NULL AND tenant_id IS NULL AND room_id IS NULL) OR
    (building_id IS NULL AND tenant_id IS NOT NULL AND room_id IS NULL) OR
    (building_id IS NULL AND tenant_id IS NULL AND room_id IS NOT NULL)
  )
);

-- Create communications table
CREATE TABLE IF NOT EXISTS property_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES property_tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_building_id ON property_documents(building_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_tenant_id ON property_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_room_id ON property_documents(room_id);
CREATE INDEX IF NOT EXISTS idx_property_communications_tenant_id ON property_communications(tenant_id);

-- Enable RLS
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "View documents" ON property_documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage documents" ON property_documents FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "View communications" ON property_communications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage communications" ON property_communications FOR ALL USING (auth.role() = 'authenticated');
