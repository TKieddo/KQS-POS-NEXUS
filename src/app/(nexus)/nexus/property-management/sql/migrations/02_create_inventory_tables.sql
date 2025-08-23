-- Create inventory items table
CREATE TABLE IF NOT EXISTS property_inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES property_rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  condition TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS property_maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID NOT NULL REFERENCES property_buildings(id) ON DELETE CASCADE,
  room_id UUID REFERENCES property_rooms(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(10,2),
  scheduled_date DATE,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_property_inventory_items_room_id ON property_inventory_items(room_id);
CREATE INDEX IF NOT EXISTS idx_property_maintenance_building_id ON property_maintenance_records(building_id);
CREATE INDEX IF NOT EXISTS idx_property_maintenance_room_id ON property_maintenance_records(room_id);

-- Enable RLS
ALTER TABLE property_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "View inventory" ON property_inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage inventory" ON property_inventory_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "View maintenance" ON property_maintenance_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage maintenance" ON property_maintenance_records FOR ALL USING (auth.role() = 'authenticated');
