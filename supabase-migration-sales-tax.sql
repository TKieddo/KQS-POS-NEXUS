-- Migration: Add Sales Tax Settings
-- Description: Adds comprehensive sales tax settings to global_settings table
-- Date: 2024-12-19
-- Author: KQS POS System

-- Begin transaction
BEGIN;

-- Insert sales tax settings into global_settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES

-- Tax Configuration
('tax_enabled', 'true', 'boolean', 'tax', 'Enable Tax Calculation', 'Enable automatic tax calculation on sales', false, 'true', 1),
('default_tax_rate', '15.00', 'number', 'tax', 'Default Tax Rate', 'Default tax rate applied to products', false, '15.00', 2),
('tax_name', 'VAT', 'string', 'tax', 'Tax Name', 'Name of the tax (appears on receipts)', false, 'VAT', 3),
('tax_registration_number', '', 'string', 'tax', 'Tax Registration Number', 'Your business tax registration number', false, '', 4),

-- Tax Display
('show_tax_on_receipts', 'true', 'boolean', 'tax', 'Show Tax on Receipts', 'Display tax amount on customer receipts', false, 'true', 5),
('show_tax_breakdown', 'true', 'boolean', 'tax', 'Show Tax Breakdown', 'Show detailed tax breakdown on receipts', false, 'true', 6),
('tax_inclusive_pricing', 'false', 'boolean', 'tax', 'Tax Inclusive Pricing', 'Product prices include tax (vs. tax added separately)', false, 'false', 7),

-- Tax Exemptions
('tax_exempt_categories', '[]', 'json', 'tax', 'Tax Exempt Categories', 'Product categories that are exempt from tax', false, '[]', 8),
('tax_exempt_customer_types', '[]', 'json', 'tax', 'Tax Exempt Customer Types', 'Customer types that are exempt from tax', false, '[]', 9),

-- Tax Calculation
('auto_calculate_tax', 'true', 'boolean', 'tax', 'Auto Calculate Tax', 'Automatically calculate tax on all transactions', false, 'true', 10),
('tax_rounding_method', 'round', 'string', 'tax', 'Tax Rounding Method', 'Method for rounding tax calculations', false, 'round', 11),
('tax_decimal_places', '2', 'number', 'tax', 'Tax Decimal Places', 'Number of decimal places for tax amounts', false, '2', 12),

-- Tax Reporting
('tax_reporting_frequency', 'monthly', 'string', 'tax', 'Tax Reporting Frequency', 'How often to generate tax reports', false, 'monthly', 13),
('tax_reporting_email', '', 'string', 'tax', 'Tax Reporting Email', 'Email address for tax reports', false, '', 14),
('tax_reporting_auto', 'false', 'boolean', 'tax', 'Auto Tax Reporting', 'Automatically generate and send tax reports', false, 'false', 15)

ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Commit transaction
COMMIT;

-- Verify migration
SELECT 
  setting_key, 
  setting_value, 
  category, 
  sort_order 
FROM global_settings 
WHERE category = 'tax' 
ORDER BY sort_order; 