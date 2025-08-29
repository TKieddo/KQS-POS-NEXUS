-- Fix Cash Up Receipt Template - Check Constraints and Create Template
-- This script will first check existing constraints and then create the template

-- First, let's check what constraints exist on the report_templates table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'report_templates'
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check if there's already a cash up template and delete it first
DELETE FROM report_templates 
WHERE name = 'KQS Cash Up Report';

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
);

-- Also create for any existing branches (without ON CONFLICT)
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
AND NOT EXISTS (
    SELECT 1 FROM report_templates rt 
    WHERE rt.name = 'KQS Cash Up Report' 
    AND rt.branch_id = b.id
);

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
