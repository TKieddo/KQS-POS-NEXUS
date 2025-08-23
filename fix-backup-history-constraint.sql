-- Fix backup_history foreign key constraint issue
-- This migration addresses the issue where auth users don't exist in the users table

-- First, let's check the current constraint
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'backup_history'
    AND kcu.column_name = 'user_id';

-- Drop the existing foreign key constraint
ALTER TABLE backup_history 
DROP CONSTRAINT IF EXISTS backup_history_user_id_fkey;

-- Add a new foreign key constraint that allows NULL values
ALTER TABLE backup_history 
ADD CONSTRAINT backup_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Also add a check constraint to ensure user_id is either NULL or a valid UUID
ALTER TABLE backup_history 
DROP CONSTRAINT IF EXISTS backup_history_user_id_check;

ALTER TABLE backup_history 
ADD CONSTRAINT backup_history_user_id_check 
CHECK (user_id IS NULL OR user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Verify the changes
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'backup_history'
    AND kcu.column_name = 'user_id';

-- Test the constraint by trying to insert a record with NULL user_id
INSERT INTO backup_history (
    branch_id,
    user_id,
    backup_type,
    backup_format,
    backup_status,
    backup_notes,
    started_at
) VALUES (
    NULL,
    NULL,
    'test',
    'sql',
    'pending',
    'Test constraint fix',
    NOW()
);

-- Clean up test record
DELETE FROM backup_history WHERE backup_notes = 'Test constraint fix';

SELECT 'Backup history constraint fix completed successfully' as status; 