-- Add individual mobile money provider settings to global_settings table
-- This script adds M-Pesa, EcoCash, Airtel Money, and Orange Money as separate payment options

-- M-Pesa Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order, created_at, updated_at)
VALUES 
  ('mpesa_enabled', 'false', 'boolean', 'payment', 'Enable M-Pesa', 'Accept M-Pesa mobile money payments', false, 'false', 7, NOW(), NOW()),
  ('mpesa_phone', '', 'string', 'payment', 'M-Pesa Phone Number', 'Phone number for M-Pesa transactions', false, '', 8, NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- EcoCash Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order, created_at, updated_at)
VALUES 
  ('ecocash_enabled', 'false', 'boolean', 'payment', 'Enable EcoCash', 'Accept EcoCash mobile money payments', false, 'false', 9, NOW(), NOW()),
  ('ecocash_phone', '', 'string', 'payment', 'EcoCash Phone Number', 'Phone number for EcoCash transactions', false, '', 10, NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Airtel Money Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order, created_at, updated_at)
VALUES 
  ('airtel_money_enabled', 'false', 'boolean', 'payment', 'Enable Airtel Money', 'Accept Airtel Money mobile money payments', false, 'false', 11, NOW(), NOW()),
  ('airtel_money_phone', '', 'string', 'payment', 'Airtel Money Phone Number', 'Phone number for Airtel Money transactions', false, '', 12, NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Orange Money Settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order, created_at, updated_at)
VALUES 
  ('orange_money_enabled', 'false', 'boolean', 'payment', 'Enable Orange Money', 'Accept Orange Money mobile money payments', false, 'false', 13, NOW(), NOW()),
  ('orange_money_phone', '', 'string', 'payment', 'Orange Money Phone Number', 'Phone number for Orange Money transactions', false, '', 14, NOW(), NOW())
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Update existing mobile_money settings to be disabled by default (since we now have individual providers)
UPDATE global_settings 
SET setting_value = 'false', updated_at = NOW()
WHERE setting_key IN ('mobile_money_enabled', 'mobile_money_provider', 'mobile_money_phone');

-- Verify the new settings were added
SELECT setting_key, setting_value, display_name, sort_order 
FROM global_settings 
WHERE setting_key LIKE '%mpesa%' OR setting_key LIKE '%ecocash%' OR setting_key LIKE '%airtel_money%' OR setting_key LIKE '%orange_money%'
ORDER BY sort_order;
