-- Create Inventory Tables for KQS POS
-- Run this in your Supabase SQL Editor

-- ========================================
-- CENTRAL STOCK MANAGEMENT
-- ========================================

-- Central stock table (holds all inventory)
CREATE TABLE IF NOT EXISTS central_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    total_quantity INTEGER DEFAULT 0,
    allocated_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id)
);

-- Branch allocations table (tracks what's allocated where)
CREATE TABLE IF NOT EXISTS branch_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    allocated_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_central_stock_product ON central_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_branch_allocations_product ON branch_allocations(product_id);
CREATE INDEX IF NOT EXISTS idx_branch_allocations_branch ON branch_allocations(branch_id);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
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

-- Trigger for branch allocations
DROP TRIGGER IF EXISTS update_central_stock_on_allocation ON branch_allocations;
CREATE TRIGGER update_central_stock_on_allocation 
    AFTER INSERT OR UPDATE OR DELETE ON branch_allocations 
    FOR EACH ROW EXECUTE FUNCTION update_central_stock();

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

-- Trigger for new products
DROP TRIGGER IF EXISTS initialize_central_stock_on_product ON products;
CREATE TRIGGER initialize_central_stock_on_product 
    AFTER INSERT ON products 
    FOR EACH ROW EXECUTE FUNCTION initialize_central_stock();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE central_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_allocations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
DROP POLICY IF EXISTS "Allow all operations on central_stock" ON central_stock;
CREATE POLICY "Allow all operations on central_stock" ON central_stock FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on branch_allocations" ON branch_allocations;
CREATE POLICY "Allow all operations on branch_allocations" ON branch_allocations FOR ALL USING (true);

-- ========================================
-- INITIALIZE CENTRAL STOCK FROM EXISTING PRODUCTS
-- ========================================

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'central_stock_product_id_key'
    ) THEN
        ALTER TABLE central_stock ADD CONSTRAINT central_stock_product_id_key UNIQUE (product_id);
    END IF;
END $$;

-- Insert existing products into central_stock
INSERT INTO central_stock (product_id, total_quantity, available_quantity, allocated_quantity)
SELECT 
    id as product_id,
    COALESCE(stock_quantity, 0) as total_quantity,
    COALESCE(stock_quantity, 0) as available_quantity,
    0 as allocated_quantity
FROM products 
WHERE is_active = true
ON CONFLICT (product_id) DO NOTHING;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE central_stock IS 'Central warehouse stock management';
COMMENT ON TABLE branch_allocations IS 'Stock allocations to branches'; 