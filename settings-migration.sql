-- KQS POS Settings System Migration
-- This script creates the settings infrastructure for global and branch-specific settings

-- ========================================
-- GLOBAL SETTINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS global_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'date')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('business', 'general', 'tax', 'payment', 'loyalty', 'receipt', 'user', 'system', 'till', 'printing', 'notifications', 'data', 'advanced')),
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    is_sensitive BOOLEAN DEFAULT false, -- For passwords, API keys, etc.
    validation_rules JSONB, -- For input validation
    default_value TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- BRANCH SETTINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS branch_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    is_override BOOLEAN DEFAULT true, -- true = override global, false = use global
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, setting_key)
);

-- ========================================
-- SETTINGS CATEGORIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS settings_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- For UI icons
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_global_settings_category ON global_settings(category);
CREATE INDEX IF NOT EXISTS idx_global_settings_active ON global_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_global_settings_sort ON global_settings(sort_order);
CREATE INDEX IF NOT EXISTS idx_branch_settings_branch ON branch_settings(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_settings_key ON branch_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_categories_sort ON settings_categories(sort_order);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Trigger for global_settings updated_at
CREATE TRIGGER update_global_settings_updated_at 
    BEFORE UPDATE ON global_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for branch_settings updated_at
CREATE TRIGGER update_branch_settings_updated_at 
    BEFORE UPDATE ON branch_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced when auth is implemented)
CREATE POLICY "Allow all operations on global_settings" ON global_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on branch_settings" ON branch_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings_categories" ON settings_categories FOR ALL USING (true);

-- ========================================
-- INITIAL DATA POPULATION
-- ========================================

-- Insert settings categories
INSERT INTO settings_categories (name, display_name, description, icon, sort_order) VALUES
('business', 'Business Information', 'Company details, contact information, and business hours', 'building', 1),
('general', 'General Settings', 'Currency, timezone, date formats, and language settings', 'settings', 2),
('tax', 'Tax & Pricing', 'Tax rates, pricing rules, and tax calculation methods', 'calculator', 3),
('payment', 'Payment Methods', 'Payment options, card processing, and cash handling', 'credit-card', 4),
('user', 'User Management', 'Staff accounts, roles, permissions, and access control', 'users', 5),
('till', 'Till & Cash', 'Cash drawer management, float amounts, and cash procedures', 'cash-register', 6),
('loyalty', 'Loyalty Program', 'Customer loyalty points, rewards, and redemption rules', 'gift', 7),
('receipt', 'Receipts & Printing', 'Receipt templates, printer settings, and customization', 'printer', 8),
('notifications', 'Notifications', 'Email, SMS, and system notification settings', 'bell', 9),
('data', 'Data Management', 'Backup, import/export, and data maintenance', 'database', 10),
('advanced', 'Advanced Settings', 'System performance, API settings, and technical configurations', 'cpu', 11);

-- Insert default global settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES

-- Business Information Settings
('business_name', 'KQS POS', 'string', 'business', 'Business Name', 'The name of your business as it appears on receipts and reports', true, 'KQS POS', 1),
('business_address', '', 'string', 'business', 'Business Address', 'The physical address of your business', false, '', 2),
('business_phone', '', 'string', 'business', 'Business Phone', 'The main contact phone number for your business', false, '', 3),
('business_email', '', 'string', 'business', 'Business Email', 'The main contact email address for your business', false, '', 4),
('business_website', '', 'string', 'business', 'Business Website', 'The website URL for your business', false, '', 5),
('business_hours', '{"monday": {"open": "09:00", "close": "17:00", "closed": false}, "tuesday": {"open": "09:00", "close": "17:00", "closed": false}, "wednesday": {"open": "09:00", "close": "17:00", "closed": false}, "thursday": {"open": "09:00", "close": "17:00", "closed": false}, "friday": {"open": "09:00", "close": "17:00", "closed": false}, "saturday": {"open": "09:00", "close": "15:00", "closed": false}, "sunday": {"open": "", "close": "", "closed": true}}', 'json', 'business', 'Business Hours', 'Operating hours for each day of the week', false, '{}', 6),
('logo_url', '', 'string', 'business', 'Business Logo', 'URL or path to your business logo image', false, '', 7),

-- General Settings
('currency', 'ZAR', 'string', 'general', 'Currency', 'The primary currency for your business', true, 'ZAR', 1),
('currency_symbol', 'R', 'string', 'general', 'Currency Symbol', 'The symbol used to represent your currency', true, 'R', 2),
('timezone', 'Africa/Johannesburg', 'string', 'general', 'Timezone', 'The timezone for your business location', true, 'Africa/Johannesburg', 3),
('date_format', 'DD/MM/YYYY', 'string', 'general', 'Date Format', 'The format for displaying dates', false, 'DD/MM/YYYY', 4),
('time_format', '24', 'string', 'general', 'Time Format', '12-hour or 24-hour time format', false, '24', 5),
('language', 'en', 'string', 'general', 'Language', 'The primary language for the system interface', false, 'en', 6),
('decimal_places', '2', 'number', 'general', 'Decimal Places', 'Number of decimal places for currency display', false, '2', 7),

-- Tax Settings
('tax_rate', '15.00', 'number', 'tax', 'Default Tax Rate (%)', 'The default tax rate applied to sales', true, '15.00', 1),
('tax_inclusive', 'false', 'boolean', 'tax', 'Tax Inclusive Pricing', 'Whether prices include tax or are added separately', false, 'false', 2),
('tax_exempt_categories', '[]', 'json', 'tax', 'Tax Exempt Categories', 'Product categories that are exempt from tax', false, '[]', 3),
('tax_registration_number', '', 'string', 'tax', 'Tax Registration Number', 'Your business tax registration number', false, '', 4),

-- Payment Settings
('payment_methods', '["cash", "card", "eft"]', 'json', 'payment', 'Enabled Payment Methods', 'Payment methods available for transactions', true, '["cash", "card", "eft"]', 1),
('card_processing_fee', '0.00', 'number', 'payment', 'Card Processing Fee (%)', 'Percentage fee charged for card transactions', false, '0.00', 2),
('cash_rounding', 'true', 'boolean', 'payment', 'Cash Rounding', 'Round cash payments to nearest currency unit', false, 'true', 3),
('change_calculation', 'automatic', 'string', 'payment', 'Change Calculation', 'Method for calculating change (automatic/manual)', false, 'automatic', 4),

-- User Management Settings
('default_user_role', 'cashier', 'string', 'user', 'Default User Role', 'Default role assigned to new users', true, 'cashier', 1),
('password_min_length', '8', 'number', 'user', 'Minimum Password Length', 'Minimum required length for user passwords', false, '8', 2),
('session_timeout', '480', 'number', 'user', 'Session Timeout (minutes)', 'How long before user sessions expire', false, '480', 3),
('max_login_attempts', '5', 'number', 'user', 'Max Login Attempts', 'Maximum failed login attempts before lockout', false, '5', 4),

-- Till & Cash Settings
('default_float_amount', '1000.00', 'number', 'till', 'Default Float Amount', 'Default cash amount in till at start of day', true, '1000.00', 1),
('cash_drop_threshold', '5000.00', 'number', 'till', 'Cash Drop Threshold', 'Amount at which cash should be dropped', false, '5000.00', 2),
('auto_cash_drop', 'false', 'boolean', 'till', 'Auto Cash Drop', 'Automatically prompt for cash drops at threshold', false, 'false', 3),
('cash_counting_required', 'true', 'boolean', 'till', 'Cash Counting Required', 'Require cash counting at end of shift', false, 'true', 4),

-- Loyalty Settings
('loyalty_enabled', 'true', 'boolean', 'loyalty', 'Loyalty Program Enabled', 'Enable customer loyalty program', false, 'true', 1),
('points_per_rand', '1.00', 'number', 'loyalty', 'Points per Rand', 'Loyalty points earned per rand spent', false, '1.00', 2),
('points_redemption_rate', '0.01', 'number', 'loyalty', 'Points Redemption Rate', 'Value of points when redeemed (R per point)', false, '0.01', 3),
('minimum_redemption', '100', 'number', 'loyalty', 'Minimum Points for Redemption', 'Minimum points required for redemption', false, '100', 4),

-- Receipt Settings
('receipt_header', 'KQS POS', 'string', 'receipt', 'Receipt Header', 'Text displayed at the top of receipts', false, 'KQS POS', 1),
('receipt_footer', 'Thank you for shopping with us!', 'string', 'receipt', 'Receipt Footer', 'Text displayed at the bottom of receipts', false, 'Thank you for shopping with us!', 2),
('receipt_show_logo', 'true', 'boolean', 'receipt', 'Show Logo on Receipt', 'Display business logo on receipts', false, 'true', 3),
('receipt_show_tax_breakdown', 'true', 'boolean', 'receipt', 'Show Tax Breakdown', 'Display tax breakdown on receipts', false, 'true', 4),
('receipt_paper_width', '80', 'number', 'receipt', 'Receipt Paper Width (mm)', 'Width of receipt paper in millimeters', false, '80', 5),

-- Notification Settings
('email_notifications', 'false', 'boolean', 'notifications', 'Email Notifications', 'Enable email notifications', false, 'false', 1),
('sms_notifications', 'false', 'boolean', 'notifications', 'SMS Notifications', 'Enable SMS notifications', false, 'false', 2),
('low_stock_alerts', 'true', 'boolean', 'notifications', 'Low Stock Alerts', 'Send alerts when stock is low', false, 'true', 3),
('daily_sales_report', 'false', 'boolean', 'notifications', 'Daily Sales Report', 'Send daily sales reports via email', false, 'false', 4),

-- Data Management Settings
('auto_backup', 'true', 'boolean', 'data', 'Auto Backup', 'Enable automatic data backups', false, 'true', 1),
('backup_frequency', 'daily', 'string', 'data', 'Backup Frequency', 'How often to perform backups', false, 'daily', 2),
('data_retention_days', '365', 'number', 'data', 'Data Retention (days)', 'How long to keep transaction data', false, '365', 3),
('export_format', 'csv', 'string', 'data', 'Export Format', 'Default format for data exports', false, 'csv', 4),

-- Advanced Settings
('debug_mode', 'false', 'boolean', 'advanced', 'Debug Mode', 'Enable debug logging and features', false, 'false', 1),
('api_rate_limit', '1000', 'number', 'advanced', 'API Rate Limit', 'Maximum API requests per hour', false, '1000', 2),
('cache_ttl', '3600', 'number', 'advanced', 'Cache TTL (seconds)', 'Time to live for cached data', false, '3600', 3),
('maintenance_mode', 'false', 'boolean', 'advanced', 'Maintenance Mode', 'Enable maintenance mode for system updates', false, 'false', 4);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE global_settings IS 'Global system settings that apply to all branches by default';
COMMENT ON TABLE branch_settings IS 'Branch-specific setting overrides';
COMMENT ON TABLE settings_categories IS 'Categories for organizing settings in the UI';

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get effective setting value (global or branch override)
CREATE OR REPLACE FUNCTION get_effective_setting(p_branch_id UUID, p_setting_key VARCHAR(100))
RETURNS TEXT AS $$
DECLARE
    v_setting_value TEXT;
    v_is_override BOOLEAN;
BEGIN
    -- Check for branch-specific setting
    SELECT setting_value, is_override 
    INTO v_setting_value, v_is_override
    FROM branch_settings 
    WHERE branch_id = p_branch_id AND setting_key = p_setting_key;
    
    -- If branch setting exists and is an override, return it
    IF v_setting_value IS NOT NULL AND v_is_override = true THEN
        RETURN v_setting_value;
    END IF;
    
    -- Otherwise, return global setting
    SELECT setting_value INTO v_setting_value
    FROM global_settings 
    WHERE setting_key = p_setting_key AND is_active = true;
    
    RETURN v_setting_value;
END;
$$ LANGUAGE plpgsql;

-- Function to get all effective settings for a branch
CREATE OR REPLACE FUNCTION get_branch_settings(p_branch_id UUID)
RETURNS TABLE(setting_key VARCHAR(100), setting_value TEXT, is_override BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.setting_key,
        COALESCE(bs.setting_value, gs.setting_value) as setting_value,
        CASE WHEN bs.setting_key IS NOT NULL THEN true ELSE false END as is_override
    FROM global_settings gs
    LEFT JOIN branch_settings bs ON bs.setting_key = gs.setting_key AND bs.branch_id = p_branch_id
    WHERE gs.is_active = true
    ORDER BY gs.category, gs.sort_order;
END;
$$ LANGUAGE plpgsql; 