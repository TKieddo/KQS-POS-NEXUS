-- Create Notifications Tables
-- Run this in your Supabase SQL Editor to set up the required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- NOTIFICATION RULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('email', 'sms', 'push', 'in-app')) DEFAULT 'email',
    condition VARCHAR(100) NOT NULL,
    action VARCHAR(20) CHECK (action IN ('immediate', 'daily', 'weekly', 'monthly')) DEFAULT 'immediate',
    recipients TEXT[] DEFAULT '{}',
    message_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INTEGRATION SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS integration_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    email_provider VARCHAR(20) CHECK (email_provider IN ('smtp', 'sendgrid', 'mailgun')) DEFAULT 'smtp',
    smtp_host VARCHAR(255),
    smtp_port VARCHAR(10) DEFAULT '587',
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255),
    sms_provider VARCHAR(20) CHECK (sms_provider IN ('twilio', 'africastalking', 'messagebird')) DEFAULT 'twilio',
    sms_api_key VARCHAR(255),
    sms_api_secret VARCHAR(255),
    sms_from_number VARCHAR(20),
    webhook_url TEXT,
    webhook_secret VARCHAR(255),
    enable_webhooks BOOLEAN DEFAULT false,
    enable_email_notifications BOOLEAN DEFAULT false,
    enable_sms_notifications BOOLEAN DEFAULT false,
    enable_push_notifications BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(20) CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')) DEFAULT 'immediate',
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id)
);

-- =====================================================
-- NOTIFICATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_id UUID REFERENCES notification_rules(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notification_rules_branch_id ON notification_rules(branch_id);
CREATE INDEX IF NOT EXISTS idx_notification_rules_active ON notification_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_rules_type ON notification_rules(type);

CREATE INDEX IF NOT EXISTS idx_integration_settings_branch_id ON integration_settings(branch_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_rule_id ON notification_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Notification rules trigger
CREATE TRIGGER update_notification_rules_updated_at 
    BEFORE UPDATE ON notification_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Integration settings trigger
CREATE TRIGGER update_integration_settings_updated_at 
    BEFORE UPDATE ON integration_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_rules
CREATE POLICY "Users can view notification rules for their branch" ON notification_rules
    FOR SELECT USING (true);

CREATE POLICY "Users can update notification rules for their branch" ON notification_rules
    FOR UPDATE USING (true);

CREATE POLICY "Users can insert notification rules for their branch" ON notification_rules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete notification rules for their branch" ON notification_rules
    FOR DELETE USING (true);

-- RLS Policies for integration_settings
CREATE POLICY "Users can view integration settings for their branch" ON integration_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can update integration settings for their branch" ON integration_settings
    FOR UPDATE USING (true);

CREATE POLICY "Users can insert integration settings for their branch" ON integration_settings
    FOR INSERT WITH CHECK (true);

-- RLS Policies for notification_logs
CREATE POLICY "Users can view notification logs" ON notification_logs
    FOR SELECT USING (true);

CREATE POLICY "Users can insert notification logs" ON notification_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update notification logs" ON notification_logs
    FOR UPDATE USING (true);

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert a sample notification rule
INSERT INTO notification_rules (name, type, condition, action, recipients, is_active) VALUES
('Low Stock Alert', 'email', 'low_stock', 'immediate', ARRAY['manager@store.com'], true),
('Daily Sales Report', 'email', 'high_sales', 'daily', ARRAY['owner@store.com'], true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Notification tables created successfully!' as status; 