-- KQS POS Receipt Templates Setup Script
-- Run this in your Supabase SQL Editor to create all necessary receipt templates

-- ========================================
-- CREATE RECEIPT TEMPLATES FOR BRANCH
-- ========================================

-- Replace '17dae1d2-1169-4174-a170-2e3b4fcacbf3' with your actual branch ID
-- You can find your branch ID in the branches table

-- First, delete any existing templates for this branch to avoid duplicates
DELETE FROM receipt_templates WHERE branch_id = '17dae1d2-1169-4174-a170-2e3b4fcacbf3';

-- Now insert all the templates
INSERT INTO receipt_templates (
  id,
  name,
  description,
  template_type,
  business_name,
  business_address,
  business_phone,
  business_website,
  business_facebook,
  business_tagline,
  return_policy_english,
  return_policy_sesotho,
  thank_you_message,
  footer_text,
  show_qr_section,
  show_policy_section,
  show_points_section,
  show_tagline,
  is_active,
  is_default,
  branch_id,
  layout,
  template_settings,
  created_at,
  updated_at
) VALUES 
-- KQS Retail Receipt (Default template for sales)
(
  gen_random_uuid(),
  'KQS Retail Receipt',
  'Standard retail receipt template with business information and policies',
  'standard',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  true,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Refund Slip
(
  gen_random_uuid(),
  'KQS Refund Slip',
  'Refund slip template for returns and exchanges',
  'compact',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Laybye Reserve Slip
(
  gen_random_uuid(),
  'KQS Laybye Reserve Slip',
  'Laybye reserve slip template for initial deposits',
  'compact',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Laybye Payment Receipt
(
  gen_random_uuid(),
  'KQS Laybye Payment Receipt',
  'Laybye payment receipt with balance tracking and progress display',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Final Laybye Payment Receipt
(
  gen_random_uuid(),
  'KQS Final Laybye Payment Receipt',
  'Final laybye payment receipt showing completion and collection ready status',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Final Laybye Payment
(
  gen_random_uuid(),
  'KQS Final Laybye Payment',
  'Final laybye payment receipt with balance tracking and progress display',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Cash Up Report
(
  gen_random_uuid(),
  'KQS Cash Up Report',
  'Cash up report template for end-of-day reconciliation',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Cash Drop Receipt
(
  gen_random_uuid(),
  'KQS Cash Drop Receipt',
  'Cash drop receipt template for till management',
  'standard',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Till Session Report
(
  gen_random_uuid(),
  'KQS Till Session Report',
  'Till session report template for shift summaries',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Account Payment Receipt
(
  gen_random_uuid(),
  'KQS Account Payment Receipt',
  'Account payment receipt template for credit customers',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Laybye Cancellation Receipt
(
  gen_random_uuid(),
  'KQS Laybye Cancellation Receipt',
  'Laybye cancellation receipt template for refunds',
  'standard',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Returns & Exchange Slip
(
  gen_random_uuid(),
  'KQS Returns & Exchange Slip',
  'Returns and exchange slip template for customer service',
  'compact',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Delivery Slip
(
  gen_random_uuid(),
  'KQS Delivery Slip',
  'Delivery slip template for order fulfillment and tracking',
  'compact',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Quotation Slip
(
  gen_random_uuid(),
  'KQS Quotation Slip',
  'Quotation slip template for price estimates and proposals',
  'compact',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Order Slip
(
  gen_random_uuid(),
  'KQS Order Slip',
  'Order slip template for pending orders and reservations',
  'compact',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Customer Statement
(
  gen_random_uuid(),
  'KQS Customer Statement',
  'Customer statement template for account summaries',
  'detailed',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
),

-- KQS Intermediate Bill
(
  gen_random_uuid(),
  'KQS Intermediate Bill',
  'Intermediate bill template for partial payments',
  'standard',
  'KQS',
  'Maseru, Husteds opposite Queen II',
  '2700 7795',
  'www.kqsfootware.com',
  'KQSFOOTWARE',
  'Finest footware',
  'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  'Thank You for shopping with Us',
  'SHOP ONLINE - Stand a chance to win',
  true,
  true,
  true,
  true,
  true,
  false,
  '17dae1d2-1169-4174-a170-2e3b4fcacbf3', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
);

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Check that templates were created successfully
SELECT 
  name, 
  is_active, 
  is_default, 
  created_at 
FROM receipt_templates 
WHERE branch_id = '17dae1d2-1169-4174-a170-2e3b4fcacbf3' -- Replace with your branch ID
ORDER BY name;
