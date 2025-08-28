-- IMMEDIATE RLS FIX FOR RECEIPT_TEMPLATES
-- Run this in your Supabase SQL Editor to fix the permission issues

-- Step 1: Disable RLS temporarily to allow access
ALTER TABLE receipt_templates DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant all permissions to authenticated users
GRANT ALL ON receipt_templates TO authenticated;

-- Step 3: Verify the changes
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'receipt_templates';

-- Step 4: Show current permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'receipt_templates' 
AND grantee = 'authenticated';

-- Step 5: Create a default template if none exists
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
    'retail_receipt',
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
    WHERE template_type = 'retail_receipt' 
    AND branch_id = b.id
)
LIMIT 1;

-- Step 6: Verify the template was created
SELECT * FROM receipt_templates WHERE template_type = 'retail_receipt';
