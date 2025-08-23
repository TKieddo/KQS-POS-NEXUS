-- Multi-Branch Schema Migration for KQS POS
-- Run this script in your Supabase SQL editor to add branch support

-- ========================================
-- BRANCHES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ADD BRANCH_ID TO EXISTING TABLES
-- ========================================

-- Add branch_id to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to laybye_orders table
ALTER TABLE laybye_orders ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- Add branch_id to refunds table
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- ========================================
-- CREATE DEFAULT BRANCHES
-- ========================================

-- Insert Central Warehouse (if not exists)
INSERT INTO branches (id, name, address, phone, email, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Central Warehouse',
    'All Branches Overview',
    '',
    '',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert some example branches (if not exists)
INSERT INTO branches (id, name, address, phone, email, is_active)
VALUES 
    (uuid_generate_v4(), 'Main Store', '123 Main Street, City', '+1234567890', 'main@store.com', true),
    (uuid_generate_v4(), 'Downtown Branch', '456 Downtown Ave, City', '+1234567891', 'downtown@store.com', true),
    (uuid_generate_v4(), 'Mall Location', '789 Mall Road, City', '+1234567892', 'mall@store.com', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_branch ON laybye_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_refunds_branch ON refunds(branch_id);

-- ========================================
-- UPDATE EXISTING RECORDS
-- ========================================

-- Update existing sales to use Central Warehouse as default branch
UPDATE sales SET branch_id = '00000000-0000-0000-0000-000000000001' WHERE branch_id IS NULL;

-- Update existing laybye_orders to use Central Warehouse as default branch
UPDATE laybye_orders SET branch_id = '00000000-0000-0000-0000-000000000001' WHERE branch_id IS NULL;

-- Update existing customers to use Central Warehouse as default branch
UPDATE customers SET branch_id = '00000000-0000-0000-0000-000000000001' WHERE branch_id IS NULL;

-- Update existing products to use Central Warehouse as default branch
UPDATE products SET branch_id = '00000000-0000-0000-0000-000000000001' WHERE branch_id IS NULL;

-- Update existing refunds to use Central Warehouse as default branch
UPDATE refunds SET branch_id = '00000000-0000-0000-0000-000000000001' WHERE branch_id IS NULL;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check that all tables have branch_id column
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('sales', 'laybye_orders', 'customers', 'products', 'refunds', 'branches')
AND column_name = 'branch_id'
ORDER BY table_name;

-- Check branch data
SELECT id, name, is_active FROM branches ORDER BY name; 