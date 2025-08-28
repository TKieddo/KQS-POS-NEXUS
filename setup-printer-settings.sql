-- Setup Default Printer Settings
-- Run this script to set up default printer settings for testing auto-print

-- First, let's see what branches exist
SELECT id, name FROM branches LIMIT 5;

-- Insert default printer settings for the first branch
-- Replace 'YOUR_BRANCH_ID' with the actual branch ID from the query above
INSERT INTO app_settings (key, value, category, description, created_at, updated_at)
VALUES (
  'printer_settings_YOUR_BRANCH_ID', -- Replace with actual branch ID
  '{
    "default_printer": "",
    "qz_tray_enabled": true,
    "auto_print_receipts": true,
    "print_copies": 1,
    "paper_width": 80
  }',
  'printer_settings',
  'Default printer settings for auto-print testing',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verify the settings were saved
SELECT 
  key, 
  value, 
  category, 
  created_at, 
  updated_at 
FROM app_settings 
WHERE category = 'printer_settings';

-- Instructions for manual setup:
-- 1. Run the first query to see your branch IDs
-- 2. Replace 'YOUR_BRANCH_ID' in the INSERT statement with your actual branch ID
-- 3. Run the INSERT statement
-- 4. Verify with the SELECT statement
