-- Migration: Create tables for Printing, Notifications, and Reports settings
-- This migration adds the necessary tables for the remaining settings pages

BEGIN;

-- =====================================================
-- PRINTING SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS printing_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    receipt_template VARCHAR(50) DEFAULT 'standard',
    receipt_header TEXT DEFAULT 'Thank you for shopping with us!',
    receipt_footer TEXT DEFAULT 'No refunds after 7 days. T&Cs apply.',
    default_printer VARCHAR(100),
    paper_size VARCHAR(20) DEFAULT '80mm',
    paper_width INTEGER DEFAULT 80,
    print_logo BOOLEAN DEFAULT false,
    logo_url TEXT,
    print_barcode BOOLEAN DEFAULT true,
    print_tax_breakdown BOOLEAN DEFAULT true,
    print_customer_info BOOLEAN DEFAULT true,
    print_cashier_info BOOLEAN DEFAULT true,
    print_time_date BOOLEAN DEFAULT true,
    print_receipt_number BOOLEAN DEFAULT true,
    auto_print BOOLEAN DEFAULT true,
    print_copies INTEGER DEFAULT 1,
    slip_types JSONB DEFAULT '{}',
    custom_layouts JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id)
);

-- =====================================================
-- PRINTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS printers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('thermal', 'inkjet', 'laser')) DEFAULT 'thermal',
    connection VARCHAR(20) CHECK (connection IN ('usb', 'network', 'bluetooth')) DEFAULT 'usb',
    paper_size VARCHAR(20) DEFAULT '80mm',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RECEIPT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
-- REPORT SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'daily',
    format VARCHAR(10) CHECK (format IN ('pdf', 'excel', 'csv', 'json')) DEFAULT 'pdf',
    recipients TEXT[] DEFAULT '{}',
    schedule_time TIME DEFAULT '02:00:00',
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPORT SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS export_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    default_format VARCHAR(10) CHECK (default_format IN ('csv', 'excel', 'pdf', 'json')) DEFAULT 'csv',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    include_headers BOOLEAN DEFAULT true,
    max_rows INTEGER DEFAULT 10000,
    compression_enabled BOOLEAN DEFAULT true,
    auto_export_enabled BOOLEAN DEFAULT false,
    export_frequency VARCHAR(20) CHECK (export_frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
    export_time TIME DEFAULT '02:00:00',
    storage_location VARCHAR(20) CHECK (storage_location IN ('local', 'cloud', 'email')) DEFAULT 'local',
    retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id)
);

-- =====================================================
-- REPORT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(20) CHECK (category IN ('sales', 'inventory', 'financial', 'customer', 'custom')) DEFAULT 'custom',
    template_data JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPORT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS export_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES report_schedules(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Printing settings indexes
CREATE INDEX IF NOT EXISTS idx_printing_settings_branch_id ON printing_settings(branch_id);

-- Printers indexes
CREATE INDEX IF NOT EXISTS idx_printers_active ON printers(is_active);
CREATE INDEX IF NOT EXISTS idx_printers_default ON printers(is_default);

-- Receipt templates indexes
CREATE INDEX IF NOT EXISTS idx_receipt_templates_active ON receipt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_default ON receipt_templates(is_default);

-- Notification rules indexes
CREATE INDEX IF NOT EXISTS idx_notification_rules_branch_id ON notification_rules(branch_id);
CREATE INDEX IF NOT EXISTS idx_notification_rules_active ON notification_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_rules_type ON notification_rules(type);

-- Integration settings indexes
CREATE INDEX IF NOT EXISTS idx_integration_settings_branch_id ON integration_settings(branch_id);

-- Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_rule_id ON notification_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- Report schedules indexes
CREATE INDEX IF NOT EXISTS idx_report_schedules_branch_id ON report_schedules(branch_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run);

-- Export settings indexes
CREATE INDEX IF NOT EXISTS idx_export_settings_branch_id ON export_settings(branch_id);

-- Report templates indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_active ON report_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);

-- Export history indexes
CREATE INDEX IF NOT EXISTS idx_export_history_schedule_id ON export_history(schedule_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(status);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Printing settings trigger
CREATE TRIGGER update_printing_settings_updated_at 
    BEFORE UPDATE ON printing_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Printers trigger
CREATE TRIGGER update_printers_updated_at 
    BEFORE UPDATE ON printers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Receipt templates trigger
CREATE TRIGGER update_receipt_templates_updated_at 
    BEFORE UPDATE ON receipt_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notification rules trigger
CREATE TRIGGER update_notification_rules_updated_at 
    BEFORE UPDATE ON notification_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Integration settings trigger
CREATE TRIGGER update_integration_settings_updated_at 
    BEFORE UPDATE ON integration_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Report schedules trigger
CREATE TRIGGER update_report_schedules_updated_at 
    BEFORE UPDATE ON report_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Export settings trigger
CREATE TRIGGER update_export_settings_updated_at 
    BEFORE UPDATE ON export_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Report templates trigger
CREATE TRIGGER update_report_templates_updated_at 
    BEFORE UPDATE ON report_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE printing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for printing_settings
CREATE POLICY "Users can view printing settings for their branch" ON printing_settings
    FOR SELECT USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update printing settings for their branch" ON printing_settings
    FOR UPDATE USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert printing settings for their branch" ON printing_settings
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for printers (global access)
CREATE POLICY "Users can view printers" ON printers FOR SELECT USING (true);
CREATE POLICY "Users can update printers" ON printers FOR UPDATE USING (true);
CREATE POLICY "Users can insert printers" ON printers FOR INSERT WITH CHECK (true);

-- RLS Policies for receipt_templates (global access)
CREATE POLICY "Users can view receipt templates" ON receipt_templates FOR SELECT USING (true);
CREATE POLICY "Users can update receipt templates" ON receipt_templates FOR UPDATE USING (true);
CREATE POLICY "Users can insert receipt templates" ON receipt_templates FOR INSERT WITH CHECK (true);

-- RLS Policies for notification_rules
CREATE POLICY "Users can view notification rules for their branch" ON notification_rules
    FOR SELECT USING (
        branch_id IS NULL OR -- Global rules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update notification rules for their branch" ON notification_rules
    FOR UPDATE USING (
        branch_id IS NULL OR -- Global rules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert notification rules for their branch" ON notification_rules
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global rules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete notification rules for their branch" ON notification_rules
    FOR DELETE USING (
        branch_id IS NULL OR -- Global rules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for integration_settings
CREATE POLICY "Users can view integration settings for their branch" ON integration_settings
    FOR SELECT USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update integration settings for their branch" ON integration_settings
    FOR UPDATE USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert integration settings for their branch" ON integration_settings
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for notification_logs
CREATE POLICY "Users can view notification logs for their branch" ON notification_logs
    FOR SELECT USING (
        rule_id IN (
            SELECT id FROM notification_rules WHERE 
            branch_id IS NULL OR -- Global rules
            branch_id IN (
                SELECT branch_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert notification logs" ON notification_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for report_schedules
CREATE POLICY "Users can view report schedules for their branch" ON report_schedules
    FOR SELECT USING (
        branch_id IS NULL OR -- Global schedules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update report schedules for their branch" ON report_schedules
    FOR UPDATE USING (
        branch_id IS NULL OR -- Global schedules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert report schedules for their branch" ON report_schedules
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global schedules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete report schedules for their branch" ON report_schedules
    FOR DELETE USING (
        branch_id IS NULL OR -- Global schedules
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for export_settings
CREATE POLICY "Users can view export settings for their branch" ON export_settings
    FOR SELECT USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update export settings for their branch" ON export_settings
    FOR UPDATE USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert export settings for their branch" ON export_settings
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for report_templates (global access)
CREATE POLICY "Users can view report templates" ON report_templates FOR SELECT USING (true);
CREATE POLICY "Users can update report templates" ON report_templates FOR UPDATE USING (true);
CREATE POLICY "Users can insert report templates" ON report_templates FOR INSERT WITH CHECK (true);

-- RLS Policies for export_history
CREATE POLICY "Users can view export history for their branch" ON export_history
    FOR SELECT USING (
        schedule_id IN (
            SELECT id FROM report_schedules WHERE 
            branch_id IS NULL OR -- Global schedules
            branch_id IN (
                SELECT branch_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert export history" ON export_history
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Insert default receipt templates
INSERT INTO receipt_templates (name, description, is_default, is_active) VALUES
('Standard', 'Standard receipt template with business header and footer', true, true),
('Compact', 'Compact receipt template for thermal printers', false, true),
('Detailed', 'Detailed receipt template with additional information', false, true)
ON CONFLICT DO NOTHING;

-- Insert default report templates
INSERT INTO report_templates (name, description, category, is_default, is_active) VALUES
('Daily Sales Summary', 'Daily sales report with totals and trends', 'sales', true, true),
('Inventory Stock Levels', 'Current stock levels and low stock alerts', 'inventory', false, true),
('Monthly Financial Report', 'Monthly financial summary and analysis', 'financial', false, true),
('Customer Analysis', 'Customer purchase history and preferences', 'customer', false, true)
ON CONFLICT DO NOTHING;

-- Insert default printers
INSERT INTO printers (name, type, connection, paper_size, is_default, is_active) VALUES
('POS Thermal Printer', 'thermal', 'usb', '80mm', true, true),
('Office Laser Printer', 'laser', 'network', 'A4', false, true),
('Mobile Bluetooth Printer', 'thermal', 'bluetooth', '58mm', false, true)
ON CONFLICT DO NOTHING;

COMMIT; 