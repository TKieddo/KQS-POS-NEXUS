-- CHECK ACTUAL CONSTRAINT VALUES
-- This will show us exactly what template types are allowed

-- Check the constraint definition
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'receipt_templates_template_type_check';

-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'receipt_templates' 
AND column_name = 'template_type';

-- Check if there are any existing templates and what types they use
SELECT DISTINCT template_type FROM receipt_templates;

-- Check the full table structure to understand all columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'receipt_templates'
ORDER BY ordinal_position;
