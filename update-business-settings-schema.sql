-- Update Business Settings Schema
-- Add missing fields to support the new settings functionality

-- Add new fields to business_settings table
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS business_website TEXT,
ADD COLUMN IF NOT EXISTS business_hours JSONB,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Africa/Johannesburg',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS time_format VARCHAR(10) DEFAULT '24',
ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS tax_name VARCHAR(50) DEFAULT 'VAT',
ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS backup_frequency VARCHAR(20) DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

-- Update existing records with default values if they don't have them
UPDATE business_settings 
SET 
    business_website = COALESCE(business_website, ''),
    business_hours = COALESCE(business_hours, '{"monday": {"open": "09:00", "close": "17:00", "closed": false}, "tuesday": {"open": "09:00", "close": "17:00", "closed": false}, "wednesday": {"open": "09:00", "close": "17:00", "closed": false}, "thursday": {"open": "09:00", "close": "17:00", "closed": false}, "friday": {"open": "09:00", "close": "17:00", "closed": false}, "saturday": {"open": "09:00", "close": "15:00", "closed": false}, "sunday": {"open": "", "close": "", "closed": true}}'::jsonb),
    timezone = COALESCE(timezone, 'Africa/Johannesburg'),
    language = COALESCE(language, 'en'),
    date_format = COALESCE(date_format, 'DD/MM/YYYY'),
    time_format = COALESCE(time_format, '24'),
    decimal_places = COALESCE(decimal_places, 2),
    tax_name = COALESCE(tax_name, 'VAT'),
    auto_backup = COALESCE(auto_backup, true),
    backup_frequency = COALESCE(backup_frequency, 'daily'),
    notifications_enabled = COALESCE(notifications_enabled, true),
    email_notifications = COALESCE(email_notifications, true),
    sms_notifications = COALESCE(sms_notifications, false)
WHERE id IS NOT NULL;

-- Add comments to document the new fields
COMMENT ON COLUMN business_settings.business_website IS 'Business website URL';
COMMENT ON COLUMN business_settings.business_hours IS 'JSON object containing operating hours for each day';
COMMENT ON COLUMN business_settings.timezone IS 'Business timezone (e.g., Africa/Johannesburg)';
COMMENT ON COLUMN business_settings.language IS 'Primary language for the system (e.g., en, af, st)';
COMMENT ON COLUMN business_settings.date_format IS 'Date display format (e.g., DD/MM/YYYY)';
COMMENT ON COLUMN business_settings.time_format IS 'Time display format (12 or 24)';
COMMENT ON COLUMN business_settings.decimal_places IS 'Number of decimal places for currency display';
COMMENT ON COLUMN business_settings.tax_name IS 'Name of the tax (e.g., VAT, GST)';
COMMENT ON COLUMN business_settings.auto_backup IS 'Whether automatic backups are enabled';
COMMENT ON COLUMN business_settings.backup_frequency IS 'Frequency of automatic backups (daily, weekly, monthly)';
COMMENT ON COLUMN business_settings.notifications_enabled IS 'Whether system notifications are enabled';
COMMENT ON COLUMN business_settings.email_notifications IS 'Whether email notifications are enabled';
COMMENT ON COLUMN business_settings.sms_notifications IS 'Whether SMS notifications are enabled';

-- Success message
SELECT 'Business settings schema updated successfully!' as status; 