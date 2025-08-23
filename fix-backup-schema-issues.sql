-- Fix Backup Schema Issues
-- This migration addresses all the issues found in the backup system

-- =====================================================
-- 1. FIX BACKUP_HISTORY TABLE CONSTRAINTS
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE backup_history 
DROP CONSTRAINT IF EXISTS backup_history_user_id_fkey;

-- Add a new foreign key constraint that allows NULL values
ALTER TABLE backup_history 
ADD CONSTRAINT backup_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add a check constraint to ensure user_id is either NULL or a valid UUID
ALTER TABLE backup_history 
DROP CONSTRAINT IF EXISTS backup_history_user_id_check;

ALTER TABLE backup_history 
ADD CONSTRAINT backup_history_user_id_check 
CHECK (user_id IS NULL OR user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- =====================================================
-- 2. FIX EXPORT_HISTORY TABLE CONSTRAINTS
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE export_history 
DROP CONSTRAINT IF EXISTS export_history_user_id_fkey;

-- Add a new foreign key constraint that allows NULL values
ALTER TABLE export_history 
ADD CONSTRAINT export_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add a check constraint to ensure user_id is either NULL or a valid UUID
ALTER TABLE export_history 
DROP CONSTRAINT IF EXISTS export_history_user_id_check;

ALTER TABLE export_history 
ADD CONSTRAINT export_history_user_id_check 
CHECK (user_id IS NULL OR user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- =====================================================
-- 3. FIX CLEANUP_HISTORY TABLE CONSTRAINTS
-- =====================================================

-- Drop the existing foreign key constraint
ALTER TABLE cleanup_history 
DROP CONSTRAINT IF EXISTS cleanup_history_user_id_fkey;

-- Add a new foreign key constraint that allows NULL values
ALTER TABLE cleanup_history 
ADD CONSTRAINT cleanup_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add a check constraint to ensure user_id is either NULL or a valid UUID
ALTER TABLE cleanup_history 
DROP CONSTRAINT IF EXISTS cleanup_history_user_id_check;

ALTER TABLE cleanup_history 
ADD CONSTRAINT cleanup_history_user_id_check 
CHECK (user_id IS NULL OR user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- =====================================================
-- 4. ADD MISSING COLUMNS TO BACKUP_HISTORY
-- =====================================================

-- Add file_path column if it doesn't exist
ALTER TABLE backup_history 
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);

-- Add file_size column if it doesn't exist
ALTER TABLE backup_history 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Add error_message column if it doesn't exist
ALTER TABLE backup_history 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add missing columns to export_history table
ALTER TABLE export_history 
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);

ALTER TABLE export_history 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

ALTER TABLE export_history 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add missing columns to cleanup_history table
ALTER TABLE cleanup_history 
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);

ALTER TABLE cleanup_history 
ADD COLUMN IF NOT EXISTS file_size BIGINT;

ALTER TABLE cleanup_history 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- =====================================================
-- 5. CREATE MISSING TABLES
-- =====================================================

-- Create inventory_movements table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- in, out, adjustment, transfer
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    reason VARCHAR(255),
    reference_id UUID, -- ID of related sale, purchase, etc.
    reference_type VARCHAR(50), -- sale, purchase, adjustment, transfer
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ADD BRANCH_ID TO EXISTING TABLES
-- =====================================================

-- Add branch_id to products if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to categories if it doesn't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to customers if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to sales if it doesn't exist
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to sale_items if it doesn't exist
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to laybye_orders if it doesn't exist
ALTER TABLE laybye_orders 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to laybye_payments if it doesn't exist
ALTER TABLE laybye_payments 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to inventory_movements if it doesn't exist
ALTER TABLE inventory_movements 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to user_activities if it doesn't exist
ALTER TABLE user_activities 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for branch_id columns
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_categories_branch_id ON categories(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_branch_id ON sale_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_branch_id ON laybye_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_laybye_payments_branch_id ON laybye_payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_branch_id ON inventory_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_branch_id ON user_activities(branch_id);

-- Indexes for history tables (if they don't already exist)
CREATE INDEX IF NOT EXISTS idx_backup_history_branch_id ON backup_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_user_id ON backup_history(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(backup_status);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at);

CREATE INDEX IF NOT EXISTS idx_export_history_branch_id ON export_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(export_status);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);

CREATE INDEX IF NOT EXISTS idx_cleanup_history_branch_id ON cleanup_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_user_id ON cleanup_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_status ON cleanup_history(cleanup_status);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_created_at ON cleanup_history(created_at);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_resource ON user_activities(resource);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- =====================================================
-- 8. UPDATE RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies that might conflict
DROP POLICY IF EXISTS "Users can view inventory movements for their branch" ON inventory_movements;
DROP POLICY IF EXISTS "Users can create inventory movements for their branch" ON inventory_movements;
DROP POLICY IF EXISTS "Users can update inventory movements for their branch" ON inventory_movements;
DROP POLICY IF EXISTS "Users can delete inventory movements for their branch" ON inventory_movements;

DROP POLICY IF EXISTS "Users can view user activities for their branch" ON user_activities;
DROP POLICY IF EXISTS "Users can create user activities for their branch" ON user_activities;
DROP POLICY IF EXISTS "Users can update user activities for their branch" ON user_activities;
DROP POLICY IF EXISTS "Users can delete user activities for their branch" ON user_activities;

-- Create RLS policies for inventory_movements
CREATE POLICY "Users can view inventory movements for their branch" ON inventory_movements
    FOR SELECT USING (
        branch_id IS NULL OR -- Global movements
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create inventory movements for their branch" ON inventory_movements
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global movements
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Create RLS policies for user_activities
CREATE POLICY "Users can view user activities for their branch" ON user_activities
    FOR SELECT USING (
        branch_id IS NULL OR -- Global activities
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create user activities for their branch" ON user_activities
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global activities
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 9. VERIFICATION
-- =====================================================

-- Test the backup_history table
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
    'Test schema fix',
    NOW()
);

-- Test the export_history table
INSERT INTO export_history (
    branch_id,
    user_id,
    export_type,
    export_format,
    export_status,
    export_notes,
    started_at
) VALUES (
    NULL,
    NULL,
    'test',
    'csv',
    'pending',
    'Test schema fix',
    NOW()
);

-- Test the cleanup_history table
INSERT INTO cleanup_history (
    branch_id,
    user_id,
    cleanup_type,
    cleanup_status,
    cleanup_notes,
    started_at
) VALUES (
    NULL,
    NULL,
    'test',
    'pending',
    'Test schema fix',
    NOW()
);

-- Clean up test records
DELETE FROM backup_history WHERE backup_notes = 'Test schema fix';
DELETE FROM export_history WHERE export_notes = 'Test schema fix';
DELETE FROM cleanup_history WHERE cleanup_notes = 'Test schema fix';

-- Show summary
SELECT 
    'Data management schema issues fixed successfully' as status,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN table_name LIKE '%branch_id%' THEN 1 END) as tables_with_branch_id
FROM information_schema.columns 
WHERE table_name IN ('products', 'categories', 'customers', 'sales', 'sale_items', 
                     'laybye_orders', 'laybye_payments', 'inventory_movements', 'user_activities',
                     'backup_history', 'export_history', 'cleanup_history')
  AND column_name = 'branch_id'; 