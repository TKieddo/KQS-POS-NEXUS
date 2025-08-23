-- Migration: Add Remaining Settings (Safe Version)
-- Description: Adds settings for Till & Cash, User Management, Printing, Notifications, Reports, Data Management, and Advanced settings
-- Date: 2024-12-19
-- Author: KQS POS System

-- Begin transaction
BEGIN;

-- Insert Till & Cash Settings (Safe - won't fail if already exists)
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- Till & Cash Settings
('default_float_amount', '1000.00', 'number', 'till', 'Default Float Amount', 'Default cash amount in till at start of day', true, '1000.00', 1),
('cash_drop_threshold', '5000.00', 'number', 'till', 'Cash Drop Threshold', 'Amount at which cash should be dropped', false, '5000.00', 2),
('auto_cash_drop', 'false', 'boolean', 'till', 'Auto Cash Drop', 'Automatically prompt for cash drops at threshold', false, 'false', 3),
('cash_counting_required', 'true', 'boolean', 'till', 'Cash Counting Required', 'Require cash counting at end of shift', false, 'true', 4),
('till_session_timeout', '30', 'number', 'till', 'Till Session Timeout', 'Minutes before till session expires', false, '30', 5),
('enable_cashup_reminders', 'true', 'boolean', 'till', 'Enable Cashup Reminders', 'Send reminders for cashup procedures', false, 'true', 6),
('max_cash_in_till', '10000.00', 'number', 'till', 'Maximum Cash in Till', 'Maximum amount to keep in till', false, '10000.00', 7),
('cash_drop_frequency', 'daily', 'string', 'till', 'Cash Drop Frequency', 'How often to perform cash drops', false, 'daily', 8),
('cash_counting_method', 'manual', 'string', 'till', 'Cash Counting Method', 'Method for counting cash', false, 'manual', 9),
('till_reconciliation_required', 'true', 'boolean', 'till', 'Till Reconciliation Required', 'Require till reconciliation before closing', false, 'true', 10),
('cash_shortage_tolerance', '50.00', 'number', 'till', 'Cash Shortage Tolerance', 'Acceptable variance in cash counting', false, '50.00', 11),
('enable_cash_flow_tracking', 'true', 'boolean', 'till', 'Enable Cash Flow Tracking', 'Track detailed cash flow movements', false, 'true', 12)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert User Management Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- User Management Settings
('default_user_role', 'cashier', 'string', 'user', 'Default User Role', 'Default role assigned to new users', true, 'cashier', 1),
('password_min_length', '8', 'number', 'user', 'Minimum Password Length', 'Minimum required length for user passwords', false, '8', 2),
('password_complexity', 'true', 'boolean', 'user', 'Require Password Complexity', 'Enforce strong password requirements', false, 'true', 3),
('two_factor_auth', 'false', 'boolean', 'user', 'Enable Two-Factor Authentication', 'Require 2FA for all users', false, 'false', 4),
('session_timeout', '480', 'number', 'user', 'Session Timeout (minutes)', 'How long before user sessions expire', false, '480', 5),
('account_lockout', 'true', 'boolean', 'user', 'Account Lockout After Failed Attempts', 'Lock accounts after multiple failed logins', false, 'true', 6),
('audit_log_access', 'true', 'boolean', 'user', 'Allow Audit Log Access', 'Allow users to view audit logs', false, 'true', 7),
('max_login_attempts', '5', 'number', 'user', 'Max Login Attempts', 'Maximum failed login attempts before lockout', false, '5', 8),
('lockout_duration', '30', 'number', 'user', 'Lockout Duration (minutes)', 'How long to lock account after failed attempts', false, '30', 9),
('require_password_change', 'false', 'boolean', 'user', 'Require Password Change', 'Force password change on first login', false, 'false', 10),
('password_expiry_days', '90', 'number', 'user', 'Password Expiry (days)', 'Days before password expires', false, '90', 11),
('enable_user_activity_logging', 'true', 'boolean', 'user', 'Enable User Activity Logging', 'Log all user activities for audit', false, 'true', 12)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Printing Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- Printing Settings
('receipt_header', 'KQS POS', 'string', 'printing', 'Receipt Header', 'Text displayed at the top of receipts', false, 'KQS POS', 1),
('receipt_footer', 'Thank you for shopping with us!', 'string', 'printing', 'Receipt Footer', 'Text displayed at the bottom of receipts', false, 'Thank you for shopping with us!', 2),
('receipt_show_logo', 'true', 'boolean', 'printing', 'Show Logo on Receipt', 'Display business logo on receipts', false, 'true', 3),
('receipt_show_tax_breakdown', 'true', 'boolean', 'printing', 'Show Tax Breakdown', 'Display tax breakdown on receipts', false, 'true', 4),
('receipt_paper_width', '80', 'number', 'printing', 'Receipt Paper Width (mm)', 'Width of receipt paper in millimeters', false, '80', 5),
('receipt_font_size', '12', 'number', 'printing', 'Receipt Font Size', 'Font size for receipt text', false, '12', 6),
('receipt_show_barcode', 'true', 'boolean', 'printing', 'Show Barcode on Receipt', 'Display transaction barcode on receipts', false, 'true', 7),
('receipt_show_cashier', 'true', 'boolean', 'printing', 'Show Cashier Name', 'Display cashier name on receipts', false, 'true', 8),
('receipt_show_date_time', 'true', 'boolean', 'printing', 'Show Date and Time', 'Display date and time on receipts', false, 'true', 9),
('receipt_show_store_info', 'true', 'boolean', 'printing', 'Show Store Information', 'Display store contact information', false, 'true', 10),
('receipt_copies', '1', 'number', 'printing', 'Receipt Copies', 'Number of receipt copies to print', false, '1', 11),
('auto_print_receipts', 'true', 'boolean', 'printing', 'Auto Print Receipts', 'Automatically print receipts after sale', false, 'true', 12),
('printer_name', '', 'string', 'printing', 'Default Printer', 'Default printer for receipts', false, '', 13),
('label_printer_enabled', 'false', 'boolean', 'printing', 'Enable Label Printer', 'Enable label printing functionality', false, 'false', 14),
('label_template', 'default', 'string', 'printing', 'Label Template', 'Template for product labels', false, 'default', 15)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Notifications & Integrations Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- Notifications & Integrations Settings
('email_notifications', 'false', 'boolean', 'notifications', 'Email Notifications', 'Enable email notifications', false, 'false', 1),
('sms_notifications', 'false', 'boolean', 'notifications', 'SMS Notifications', 'Enable SMS notifications', false, 'false', 2),
('low_stock_alerts', 'true', 'boolean', 'notifications', 'Low Stock Alerts', 'Send alerts when stock is low', false, 'true', 3),
('daily_sales_report', 'false', 'boolean', 'notifications', 'Daily Sales Report', 'Send daily sales reports via email', false, 'false', 4),
('email_smtp_server', '', 'string', 'notifications', 'SMTP Server', 'Email server for sending notifications', false, '', 5),
('email_smtp_port', '587', 'number', 'notifications', 'SMTP Port', 'Port for email server', false, '587', 6),
('email_username', '', 'string', 'notifications', 'Email Username', 'Username for email authentication', false, '', 7),
('email_password', '', 'string', 'notifications', 'Email Password', 'Password for email authentication', false, '', 8),
('email_from_address', '', 'string', 'notifications', 'From Email Address', 'Email address to send from', false, '', 9),
('sms_provider', '', 'string', 'notifications', 'SMS Provider', 'SMS service provider', false, '', 10),
('sms_api_key', '', 'string', 'notifications', 'SMS API Key', 'API key for SMS service', false, '', 11),
('sms_phone_number', '', 'string', 'notifications', 'SMS Phone Number', 'Phone number for SMS notifications', false, '', 12),
('push_notifications', 'false', 'boolean', 'notifications', 'Push Notifications', 'Enable push notifications', false, 'false', 13),
('notification_sound', 'true', 'boolean', 'notifications', 'Notification Sound', 'Play sound for notifications', false, 'true', 14),
('notification_desktop', 'true', 'boolean', 'notifications', 'Desktop Notifications', 'Show desktop notifications', false, 'true', 15)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Reports & Export Settings (using 'system' category since 'reports' is not allowed)
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- Reports & Export Settings
('reports_auto_generate', 'false', 'boolean', 'system', 'Auto Generate Reports', 'Automatically generate reports', false, 'false', 1),
('reports_schedule', 'daily', 'string', 'system', 'Report Schedule', 'How often to generate reports', false, 'daily', 2),
('reports_email_recipients', '[]', 'json', 'system', 'Report Email Recipients', 'Email addresses to send reports to', false, '[]', 3),
('reports_include_charts', 'true', 'boolean', 'system', 'Include Charts in Reports', 'Include charts and graphs in reports', false, 'true', 4),
('reports_format', 'pdf', 'string', 'system', 'Report Format', 'Default format for reports', false, 'pdf', 5),
('reports_retention_days', '365', 'number', 'system', 'Report Retention (days)', 'How long to keep generated reports', false, '365', 6),
('export_include_headers', 'true', 'boolean', 'system', 'Include Headers in Exports', 'Include column headers in exports', false, 'true', 7),
('export_date_format', 'DD/MM/YYYY', 'string', 'system', 'Export Date Format', 'Date format for exported data', false, 'DD/MM/YYYY', 8),
('export_timezone', 'Africa/Johannesburg', 'string', 'system', 'Export Timezone', 'Timezone for exported data', false, 'Africa/Johannesburg', 9),
('export_compression', 'false', 'boolean', 'system', 'Compress Exports', 'Compress exported files', false, 'false', 10),
('export_batch_size', '1000', 'number', 'system', 'Export Batch Size', 'Number of records per export batch', false, '1000', 11),
('reports_include_summary', 'true', 'boolean', 'system', 'Include Summary in Reports', 'Include summary section in reports', false, 'true', 12)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Data Management Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- Data Management Settings
('auto_backup', 'true', 'boolean', 'data', 'Auto Backup', 'Enable automatic data backups', false, 'true', 1),
('backup_frequency', 'daily', 'string', 'data', 'Backup Frequency', 'How often to perform backups', false, 'daily', 2),
('data_retention_days', '365', 'number', 'data', 'Data Retention (days)', 'How long to keep transaction data', false, '365', 3),
('export_format', 'csv', 'string', 'data', 'Export Format', 'Default format for data exports', false, 'csv', 4),
('backup_location', 'local', 'string', 'data', 'Backup Location', 'Where to store backups', false, 'local', 5),
('backup_encryption', 'false', 'boolean', 'data', 'Backup Encryption', 'Encrypt backup files', false, 'false', 6),
('backup_compression', 'true', 'boolean', 'data', 'Backup Compression', 'Compress backup files', false, 'true', 7),
('data_cleanup_enabled', 'false', 'boolean', 'data', 'Enable Data Cleanup', 'Automatically clean old data', false, 'false', 8),
('data_cleanup_frequency', 'monthly', 'string', 'data', 'Data Cleanup Frequency', 'How often to clean old data', false, 'monthly', 9),
('data_cleanup_older_than', '730', 'number', 'data', 'Data Cleanup Age (days)', 'Remove data older than this many days', false, '730', 10),
('data_validation_enabled', 'true', 'boolean', 'data', 'Enable Data Validation', 'Validate data integrity', false, 'true', 11),
('data_repair_enabled', 'false', 'boolean', 'data', 'Enable Data Repair', 'Automatically repair data issues', false, 'false', 12)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Advanced Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES
-- Advanced Settings
('debug_mode', 'false', 'boolean', 'advanced', 'Debug Mode', 'Enable debug logging and features', false, 'false', 1),
('api_rate_limit', '1000', 'number', 'advanced', 'API Rate Limit', 'Maximum API requests per hour', false, '1000', 2),
('cache_ttl', '3600', 'number', 'advanced', 'Cache TTL (seconds)', 'Time to live for cached data', false, '3600', 3),
('maintenance_mode', 'false', 'boolean', 'advanced', 'Maintenance Mode', 'Enable maintenance mode for system updates', false, 'false', 4),
('performance_monitoring', 'true', 'boolean', 'advanced', 'Performance Monitoring', 'Monitor system performance', false, 'true', 5),
('error_reporting', 'true', 'boolean', 'advanced', 'Error Reporting', 'Send error reports to developers', false, 'true', 6),
('log_level', 'info', 'string', 'advanced', 'Log Level', 'Level of detail for system logs', false, 'info', 7),
('log_retention_days', '30', 'number', 'advanced', 'Log Retention (days)', 'How long to keep log files', false, '30', 8),
('auto_update_enabled', 'false', 'boolean', 'advanced', 'Auto Update', 'Automatically update the system', false, 'false', 9),
('update_channel', 'stable', 'string', 'advanced', 'Update Channel', 'Update release channel', false, 'stable', 10),
('security_scan_enabled', 'true', 'boolean', 'advanced', 'Security Scanning', 'Enable security vulnerability scanning', false, 'true', 11),
('backup_verification', 'true', 'boolean', 'advanced', 'Backup Verification', 'Verify backup integrity', false, 'true', 12),
('system_health_checks', 'true', 'boolean', 'advanced', 'System Health Checks', 'Perform regular system health checks', false, 'true', 13),
('optimization_enabled', 'true', 'boolean', 'advanced', 'Performance Optimization', 'Enable automatic performance optimization', false, 'true', 14),
('resource_monitoring', 'true', 'boolean', 'advanced', 'Resource Monitoring', 'Monitor system resource usage', false, 'true', 15)
ON CONFLICT (setting_key) DO NOTHING;

-- Commit transaction
COMMIT;

-- Verify the migration
SELECT 
    category,
    COUNT(*) as setting_count
FROM global_settings 
WHERE category IN ('till', 'user', 'printing', 'notifications', 'system', 'data', 'advanced')
GROUP BY category 
ORDER BY category; 