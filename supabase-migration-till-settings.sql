-- Migration: Create till_settings table
-- This table stores branch-specific till management settings

BEGIN;

-- Create till_settings table
CREATE TABLE IF NOT EXISTS till_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    till_cash_management_enabled BOOLEAN DEFAULT true,
    auto_cash_drops_enabled BOOLEAN DEFAULT false,
    till_count_reminders_enabled BOOLEAN DEFAULT true,
    variance_alerts_enabled BOOLEAN DEFAULT true,
    max_till_amount DECIMAL(10,2) DEFAULT 5000.00,
    min_till_amount DECIMAL(10,2) DEFAULT 500.00,
    variance_threshold DECIMAL(10,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_till_settings_branch_id ON till_settings(branch_id);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_till_settings_updated_at 
    BEFORE UPDATE ON till_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE till_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for till_settings
CREATE POLICY "Users can view till settings for their branch" ON till_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert till settings for their branch" ON till_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update till settings for their branch" ON till_settings
    FOR UPDATE USING (true);

-- Insert default settings for existing branches
INSERT INTO till_settings (branch_id, till_cash_management_enabled, auto_cash_drops_enabled, till_count_reminders_enabled, variance_alerts_enabled, max_till_amount, min_till_amount, variance_threshold)
SELECT 
    id as branch_id,
    true as till_cash_management_enabled,
    false as auto_cash_drops_enabled,
    true as till_count_reminders_enabled,
    true as variance_alerts_enabled,
    5000.00 as max_till_amount,
    500.00 as min_till_amount,
    100.00 as variance_threshold
FROM branches
WHERE is_active = true
ON CONFLICT (branch_id) DO NOTHING;

COMMIT;

-- Verify the migration
SELECT 
    'till_settings' as table_name,
    COUNT(*) as record_count
FROM till_settings; 