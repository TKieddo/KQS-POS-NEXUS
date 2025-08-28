-- Check what template types are allowed in the constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'receipt_templates_template_type_check';

-- Also check the current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'receipt_templates' 
AND column_name = 'template_type';

-- Check if there are any existing templates
SELECT DISTINCT template_type FROM receipt_templates;
