-- FIX TEMPLATE TYPE CONSTRAINT ISSUE
-- This script fixes the template type to use an allowed value

-- Step 1: Check what template types are allowed
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'receipt_templates_template_type_check';

-- Step 2: Update any existing templates with 'retail_receipt' to 'sales'
UPDATE receipt_templates 
SET template_type = 'sales' 
WHERE template_type = 'retail_receipt';

-- Step 3: Create a proper default template with correct template_type
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
)
SELECT 
    gen_random_uuid(),
    'KQS Retail Receipt',
    'Default retail receipt template',
    'sales', -- Use 'sales' instead of 'retail_receipt'
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
    b.id,
    '{}',
    '{}',
    NOW(),
    NOW()
FROM branches b
WHERE NOT EXISTS (
    SELECT 1 FROM receipt_templates 
    WHERE template_type = 'sales' 
    AND branch_id = b.id
)
LIMIT 1;

-- Step 4: Verify the template was created
SELECT * FROM receipt_templates WHERE template_type = 'sales';
