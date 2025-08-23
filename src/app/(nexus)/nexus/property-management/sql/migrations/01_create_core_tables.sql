-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create buildings table
CREATE TABLE IF NOT EXISTS property_buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  total_units INTEGER NOT NULL DEFAULT 0,
  occupied_units INTEGER NOT NULL DEFAULT 0,
  total_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  collected_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  overdue_payments INTEGER NOT NULL DEFAULT 0,
  amenities JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS property_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID NOT NULL REFERENCES property_buildings(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor TEXT NOT NULL,
  type TEXT NOT NULL,
  size DECIMAL(10,2),
  rent_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  amenities JSONB NOT NULL DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(building_id, room_number)
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS property_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID NOT NULL REFERENCES property_buildings(id) ON DELETE CASCADE,
  room_id UUID REFERENCES property_rooms(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  lease_start_date DATE NOT NULL,
  lease_end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_due_date DATE NOT NULL,
  documents JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_property_rooms_building_id ON property_rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_property_tenants_building_id ON property_tenants(building_id);
CREATE INDEX IF NOT EXISTS idx_property_tenants_room_id ON property_tenants(room_id);

-- Enable RLS
ALTER TABLE property_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "View buildings" ON property_buildings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage buildings" ON property_buildings FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "View rooms" ON property_rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage rooms" ON property_rooms FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "View tenants" ON property_tenants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Manage tenants" ON property_tenants FOR ALL USING (auth.role() = 'authenticated');
