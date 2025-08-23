-- Migration script to fix branch column in attendance tables
-- This script updates the existing attendance schema to use branch_id UUID instead of branch VARCHAR

-- First, let's check if the employees table exists and what columns it has
DO $$
BEGIN
    -- Check if employees table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employees') THEN
        -- Check if branch column exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'branch') THEN
            -- Rename branch column to branch_id
            ALTER TABLE employees RENAME COLUMN branch TO branch_id;
            
            -- Change the data type from VARCHAR to UUID
            ALTER TABLE employees ALTER COLUMN branch_id TYPE UUID USING 
                CASE 
                    WHEN branch_id = 'Central Warehouse' THEN '00000000-0000-0000-0000-000000000001'::UUID
                    ELSE NULL
                END;
            
            -- Add foreign key constraint
            ALTER TABLE employees ADD CONSTRAINT fk_employees_branch_id 
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
            
            RAISE NOTICE 'Successfully migrated branch column to branch_id UUID in employees table';
        ELSE
            RAISE NOTICE 'branch column does not exist in employees table';
        END IF;
        
        -- Check if branch_id column already exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'branch_id') THEN
            RAISE NOTICE 'branch_id column already exists in employees table';
        END IF;
    ELSE
        RAISE NOTICE 'employees table does not exist';
    END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_employees_branch;
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);

-- Update sample data to use proper UUID values
UPDATE employees 
SET branch_id = '00000000-0000-0000-0000-000000000001'::UUID 
WHERE branch_id IS NULL OR branch_id::text = 'Central Warehouse';

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('branch', 'branch_id')
ORDER BY column_name;
