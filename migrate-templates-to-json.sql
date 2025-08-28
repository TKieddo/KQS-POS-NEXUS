-- Migration: Set up all templates and settings as JSON in app_settings table
-- This script will create all necessary templates and settings for the KQS POS system

-- First, let's clean up any existing templates to avoid conflicts
DELETE FROM app_settings WHERE key LIKE 'receipt_template_%';
DELETE FROM app_settings WHERE key LIKE 'printer_settings_%';

-- Get all branches to set up templates for each one
DO $$
DECLARE
    branch_record RECORD;
BEGIN
    FOR branch_record IN 
        SELECT id, name FROM branches
    LOOP
        -- Insert default receipt template for each branch
        INSERT INTO app_settings (key, value, category, description, created_at, updated_at)
        VALUES (
            'receipt_template_' || branch_record.id,
            '{
                "id": "' || gen_random_uuid() || '",
                "name": "KQS Retail Receipt",
                "business_name": "KQS",
                "business_address": "Maseru, Husteds opposite Queen II",
                "business_phone": "2700 7795",
                "business_website": "www.kqsfootware.com",
                "business_facebook": "",
                "business_tagline": "Finest footware",
                "return_policy_english": "Returns and exchanges accepted within 7 days of purchase with a valid receipt. Items must be in original condition with all tags attached.",
                "return_policy_sesotho": "Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chesa le resiti e nepahetseng. Ditho di tlameha ho ba maemong a tsona a pele ka ditheko tsohle tse nang le tsona.",
                "thank_you_message": "Thank You for shopping with Us",
                "footer_text": "SHOP ONLINE - Stand a chance to win",
                "show_qr_section": true,
                "show_policy_section": true,
                "show_points_section": true,
                "show_tagline": true
            }',
            'receipt_templates',
            'Default retail receipt template for ' || branch_record.name,
            NOW(),
            NOW()
        );

        -- Insert default printer settings for each branch
        INSERT INTO app_settings (key, value, category, description, created_at, updated_at)
        VALUES (
            'printer_settings_' || branch_record.id,
            '{
                "default_printer": "",
                "qz_tray_enabled": true,
                "auto_print_receipts": true,
                "print_copies": 1,
                "paper_width": 80
            }',
            'printer_settings',
            'Default printer settings for ' || branch_record.name,
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Created templates and settings for branch: %', branch_record.name;
    END LOOP;
END $$;

-- Verify the migration
SELECT 
    category,
    COUNT(*) as count,
    STRING_AGG(key, ', ') as keys
FROM app_settings 
WHERE category IN ('receipt_templates', 'printer_settings')
GROUP BY category;

-- Show sample data
SELECT 
    key,
    category,
    LEFT(value, 100) || '...' as value_preview,
    created_at
FROM app_settings 
WHERE category IN ('receipt_templates', 'printer_settings')
ORDER BY category, key
LIMIT 10;

-- Instructions for verification:
-- 1. Check that receipt templates were created for all branches
-- 2. Check that printer settings were created for all branches
-- 3. Test the POS system - it should now load templa/ tes without errors
-- 4. Test printer settings page - it should load without errors
