-- Create printer_settings table
CREATE TABLE IF NOT EXISTS printer_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  printer_name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique settings per user, branch, and printer
  UNIQUE(user_id, branch_id, printer_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_printer_settings_user_branch ON printer_settings(user_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_printer_settings_printer_name ON printer_settings(printer_name);

-- Enable Row Level Security
ALTER TABLE printer_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own printer settings
CREATE POLICY "Users can view their own printer settings" ON printer_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own printer settings
CREATE POLICY "Users can insert their own printer settings" ON printer_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own printer settings
CREATE POLICY "Users can update their own printer settings" ON printer_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own printer settings
CREATE POLICY "Users can delete their own printer settings" ON printer_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_printer_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_printer_settings_updated_at
  BEFORE UPDATE ON printer_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_printer_settings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE printer_settings IS 'Stores printer configuration settings for each user and branch';
COMMENT ON COLUMN printer_settings.user_id IS 'The user who owns these printer settings';
COMMENT ON COLUMN printer_settings.branch_id IS 'The branch where these settings apply';
COMMENT ON COLUMN printer_settings.printer_name IS 'The name of the printer (as detected by QZ Tray)';
COMMENT ON COLUMN printer_settings.settings IS 'JSON object containing printer configuration (paper size, margins, etc.)'; 