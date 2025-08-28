-- Create app_settings table for storing JSON templates and other app settings
-- This table will be used to bypass RLS constraints for receipt templates

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- Enable RLS but with simple policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read all settings
CREATE POLICY "Allow authenticated users to read app settings" ON app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert/update settings
CREATE POLICY "Allow authenticated users to insert app settings" ON app_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update app settings" ON app_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert some default receipt templates for existing branches
-- This will be done by the application when needed

-- Grant permissions to authenticated users
GRANT ALL ON app_settings TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
