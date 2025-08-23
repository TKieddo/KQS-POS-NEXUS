-- Add Payment Options Settings to global_settings table
-- This migration adds the missing payment-related settings that are used by the PaymentOptionsForm

-- Insert payment options settings into global_settings
INSERT INTO global_settings (setting_key, setting_value, setting_type, category, display_name, description, is_required, default_value, sort_order) VALUES

-- Cash Payment Settings
('cash_enabled', 'true', 'boolean', 'payment', 'Enable Cash Payments', 'Allow customers to pay with cash', false, 'true', 1),
('cash_change_limit', '1000.00', 'number', 'payment', 'Cash Change Limit', 'Maximum amount of change to keep in till', false, '1000.00', 2),

-- Card Payment Settings
('card_enabled', 'false', 'boolean', 'payment', 'Enable Card Payments', 'Accept credit and debit card payments', false, 'false', 3),
('card_processor', '', 'string', 'payment', 'Card Processor', 'Payment processor for card transactions (e.g., Stripe, PayPal)', false, '', 4),
('card_api_key', '', 'string', 'payment', 'Card API Key', 'API key from your payment processor', false, '', 5),
('card_secret_key', '', 'string', 'payment', 'Card Secret Key', 'Secret key from your payment processor', false, '', 6),

-- Mobile Money Settings
('mobile_money_enabled', 'false', 'boolean', 'payment', 'Enable Mobile Money', 'Accept mobile money payments', false, 'false', 7),
('mobile_money_provider', '', 'string', 'payment', 'Mobile Money Provider', 'Mobile money service provider (e.g., M-Pesa, Orange Money)', false, '', 8),
('mobile_money_phone', '', 'string', 'payment', 'Mobile Money Phone', 'Phone number for mobile money transactions', false, '', 9),

-- EFT/Bank Transfer Settings
('eft_enabled', 'false', 'boolean', 'payment', 'Enable EFT Payments', 'Accept electronic fund transfers', false, 'false', 10),
('eft_bank_name', '', 'string', 'payment', 'EFT Bank Name', 'Bank name for EFT payments', false, '', 11),
('eft_account_number', '', 'string', 'payment', 'EFT Account Number', 'Bank account number for EFT payments', false, '', 12),
('eft_reference_prefix', 'KQS', 'string', 'payment', 'EFT Reference Prefix', 'Prefix for payment references', false, 'KQS', 13),

-- Lay-bye Settings
('laybye_enabled', 'false', 'boolean', 'payment', 'Enable Lay-bye', 'Allow customers to pay in installments', false, 'false', 14),
('laybye_deposit_percentage', '20.00', 'number', 'payment', 'Lay-bye Deposit Percentage', 'Minimum deposit percentage required for lay-bye', false, '20.00', 15),
('laybye_min_deposit_amount', '100.00', 'number', 'payment', 'Lay-bye Min Deposit Amount', 'Minimum deposit amount required for lay-bye', false, '100.00', 16),
('laybye_max_duration_days', '30', 'number', 'payment', 'Lay-bye Max Duration', 'Maximum lay-bye duration in days', false, '30', 17),

-- Credit Account Settings
('credit_accounts_enabled', 'false', 'boolean', 'payment', 'Enable Credit Accounts', 'Allow customers to have credit accounts', false, 'false', 18),
('credit_limit_default', '1000.00', 'number', 'payment', 'Default Credit Limit', 'Default credit limit for new accounts', false, '1000.00', 19),
('credit_interest_rate', '2.50', 'number', 'payment', 'Credit Interest Rate', 'Monthly interest rate on outstanding balances', false, '2.50', 20)

ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Update existing payment_methods setting to include new methods
UPDATE global_settings 
SET setting_value = '["cash", "card", "mobile_money", "eft", "laybye", "credit"]',
    updated_at = NOW()
WHERE setting_key = 'payment_methods'; 