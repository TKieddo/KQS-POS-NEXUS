-- KQS POS Default Template Setup Script
-- Run this in your Supabase SQL Editor to create a basic default receipt template

-- ========================================
-- CREATE DEFAULT RECEIPT TEMPLATE FOR BRANCH
-- ========================================

-- Replace 'YOUR-BRANCH-ID-HERE' with your actual branch ID
-- You can find your branch ID in the branches table

-- First, delete any existing default template for this branch to avoid duplicates
DELETE FROM receipt_templates WHERE branch_id = 'YOUR-BRANCH-ID-HERE' AND is_default = true;

-- Now insert the default template
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
) VALUES (
  gen_random_uuid(),
  'KQS Retail Receipt',
  'Default retail receipt template',
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
  'YOUR-BRANCH-ID-HERE', -- Replace with your branch ID
  '{}',
  '{}',
  NOW(),
  NOW()
);

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Check that the template was created successfully
SELECT 
  name, 
  is_active, 
  is_default, 
  created_at 
FROM receipt_templates 
WHERE branch_id = 'YOUR-BRANCH-ID-HERE' -- Replace with your branch ID
ORDER BY name;
