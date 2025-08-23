-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_property_buildings_updated_at
  BEFORE UPDATE ON property_buildings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_rooms_updated_at
  BEFORE UPDATE ON property_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_inventory_items_updated_at
  BEFORE UPDATE ON property_inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_tenants_updated_at
  BEFORE UPDATE ON property_tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_payments_updated_at
  BEFORE UPDATE ON property_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_maintenance_records_updated_at
  BEFORE UPDATE ON property_maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_documents_updated_at
  BEFORE UPDATE ON property_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_receipts_updated_at
  BEFORE UPDATE ON property_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_communications_updated_at
  BEFORE UPDATE ON property_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
