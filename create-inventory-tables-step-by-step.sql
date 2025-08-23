-- Create Inventory Tables Step by Step
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: CREATE CENTRAL STOCK TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS central_stock CASCADE;

-- Create central stock table
CREATE TABLE central_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    total_quantity INTEGER DEFAULT 0,
    allocated_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id)
);

-- ========================================
-- STEP 2: CREATE BRANCH ALLOCATIONS TABLE
-- ========================================

-- Drop table if exists (for clean start)
DROP TABLE IF EXISTS branch_allocations CASCADE;

-- Create branch allocations table
CREATE TABLE branch_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    allocated_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: CREATE INDEXES
-- ========================================

CREATE INDEX idx_central_stock_product ON central_stock(product_id);
CREATE INDEX idx_branch_allocations_product ON branch_allocations(product_id);
CREATE INDEX idx_branch_allocations_branch ON branch_allocations(branch_id);

-- ========================================
-- STEP 4: CREATE FUNCTIONS
-- ========================================

-- Function to update central stock when branch allocations change
CREATE OR REPLACE FUNCTION update_central_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update central stock available quantity
    UPDATE central_stock 
    SET 
        allocated_quantity = (
            SELECT COALESCE(SUM(allocated_quantity), 0)
            FROM branch_allocations 
            WHERE product_id = NEW.product_id
        ),
        available_quantity = total_quantity - allocated_quantity,
        updated_at = NOW()
    WHERE product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to initialize central stock when products are added
CREATE OR REPLACE FUNCTION initialize_central_stock()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO central_stock (product_id, total_quantity, available_quantity)
    VALUES (NEW.id, NEW.stock_quantity, NEW.stock_quantity)
    ON CONFLICT (product_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- STEP 5: CREATE TRIGGERS
-- ========================================

-- Trigger for branch allocations
CREATE TRIGGER update_central_stock_on_allocation 
    AFTER INSERT OR UPDATE OR DELETE ON branch_allocations 
    FOR EACH ROW EXECUTE FUNCTION update_central_stock();

-- Trigger for new products
CREATE TRIGGER initialize_central_stock_on_product 
    AFTER INSERT ON products 
    FOR EACH ROW EXECUTE FUNCTION initialize_central_stock();

-- ========================================
-- STEP 6: ENABLE RLS
-- ========================================

ALTER TABLE central_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_allocations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 7: CREATE RLS POLICIES
-- ========================================

CREATE POLICY "Allow all operations on central_stock" ON central_stock FOR ALL USING (true);
CREATE POLICY "Allow all operations on branch_allocations" ON branch_allocations FOR ALL USING (true);

-- ========================================
-- STEP 8: INSERT EXISTING PRODUCTS
-- ========================================

-- Insert existing products into central_stock
INSERT INTO central_stock (product_id, total_quantity, available_quantity, allocated_quantity)
SELECT 
    id as product_id,
    COALESCE(stock_quantity, 0) as total_quantity,
    COALESCE(stock_quantity, 0) as available_quantity,
    0 as allocated_quantity
FROM products 
WHERE is_active = true;

-- ========================================
-- STEP 9: ADD COMMENTS
-- ========================================

COMMENT ON TABLE central_stock IS 'Central warehouse stock management';
COMMENT ON TABLE branch_allocations IS 'Stock allocations to branches';

-- ========================================
-- STEP 10: VERIFY CREATION
-- ========================================

-- Check if tables were created successfully
SELECT 
    'central_stock' as table_name,
    COUNT(*) as row_count
FROM central_stock
UNION ALL
SELECT 
    'branch_allocations' as table_name,
    COUNT(*) as row_count
FROM branch_allocations; 