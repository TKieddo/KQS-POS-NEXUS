-- Create Comprehensive Cash Up Receipt Template in Database
-- This template will be used for printing detailed cash up reports

INSERT INTO report_templates (
  id,
  name,
  description,
  category,
  template_data,
  is_default,
  is_active,
  branch_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'KQS Cash Up Report',
  'Template for printing comprehensive cash up reports with detailed breakdowns',
  'financial',
  '{
    "business_name": "KQS",
    "business_address": "Maseru, Husteds opposite Queen II",
    "business_phone": "2700 7795",
    "business_website": "kqs-boutique.com",
    "business_facebook": "",
    "business_tagline": "Your Fashion Destination",
    "return_policy_english": "All cash up reports must be verified and signed by a supervisor.",
    "return_policy_sesotho": "Litlaleho tsa cash up li tlameha ho netefatsoa ke mookameli pele li saenngoa.",
    "thank_you_message": "Thank you for your business",
    "footer_text": "KQS - Your Fashion Destination",
    "show_qr_section": false,
    "show_policy_section": true,
    "show_points_section": false,
    "show_tagline": true,
    "template_type": "cash_up_report",
    "include_payment_methods": true,
    "include_product_categories": true,
    "include_transaction_types": true,
    "include_grasshopper_fees": true
  }'::jsonb,
  true,
  true,
  '00000000-0000-0000-0000-000000000001', -- Default branch ID
  NOW(),
  NOW()
) ON CONFLICT (name, branch_id) DO UPDATE SET
  template_data = EXCLUDED.template_data,
  updated_at = NOW();

-- Also create for any existing branches
INSERT INTO report_templates (
  id,
  name,
  description,
  category,
  template_data,
  is_default,
  is_active,
  branch_id,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'KQS Cash Up Report',
  'Template for printing comprehensive cash up reports with detailed breakdowns',
  'financial',
  '{
    "business_name": "KQS",
    "business_address": "Maseru, Husteds opposite Queen II",
    "business_phone": "2700 7795",
    "business_website": "kqs-boutique.com",
    "business_facebook": "",
    "business_tagline": "Your Fashion Destination",
    "return_policy_english": "All cash up reports must be verified and signed by a supervisor.",
    "return_policy_sesotho": "Litlaleho tsa cash up li tlameha ho netefatsoa ke mookameli pele li saenngoa.",
    "thank_you_message": "Thank you for your business",
    "footer_text": "KQS - Your Fashion Destination",
    "show_qr_section": false,
    "show_policy_section": true,
    "show_points_section": false,
    "show_tagline": true,
    "template_type": "cash_up_report",
    "include_payment_methods": true,
    "include_product_categories": true,
    "include_transaction_types": true,
    "include_grasshopper_fees": true
  }'::jsonb,
  true,
  true,
  b.id,
  NOW(),
  NOW()
FROM branches b
WHERE b.id != '00000000-0000-0000-0000-000000000001'
ON CONFLICT (name, branch_id) DO UPDATE SET
  template_data = EXCLUDED.template_data,
  updated_at = NOW();

-- Verify the template was created
SELECT 
  name,
  category,
  template_data->>'template_type' as template_type,
  template_data->>'include_payment_methods' as include_payment_methods,
  template_data->>'include_product_categories' as include_product_categories,
  template_data->>'include_transaction_types' as include_transaction_types,
  template_data->>'include_grasshopper_fees' as include_grasshopper_fees,
  is_active,
  branch_id
FROM report_templates 
WHERE name = 'KQS Cash Up Report'
ORDER BY branch_id;
