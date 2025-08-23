-- Fix duplicate security settings before creating unique index
-- This script handles the case where multiple records have NULL branch_id

-- First, let's see what we have
SELECT 
    'Current security settings' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as null_branch_records,
    COUNT(CASE WHEN branch_id IS NOT NULL THEN 1 END) as branch_specific_records
FROM security_settings;

-- Keep only the most recent record for NULL branch_id (global settings)
DELETE FROM security_settings 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM security_settings 
        WHERE branch_id IS NULL
    ) ranked 
    WHERE rn = 1
);

-- Keep only the most recent record for each branch_id
DELETE FROM security_settings 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY branch_id ORDER BY created_at DESC) as rn
        FROM security_settings 
        WHERE branch_id IS NOT NULL
    ) ranked 
    WHERE rn = 1
);

-- Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_security_settings_branch_unique 
ON security_settings (COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Verify the fix
SELECT 
    'After deduplication' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as null_branch_records,
    COUNT(CASE WHEN branch_id IS NOT NULL THEN 1 END) as branch_specific_records
FROM security_settings; 