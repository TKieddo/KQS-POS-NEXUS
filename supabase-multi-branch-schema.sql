-- Multi-Branch Extension for KQS POS
-- This extends the existing schema with branch management

-- ========================================
-- BRANCHES TABLE
-- ========================================

CREATE TABLE branches (
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
-- CENTRAL STOCK MANAGEMENT
-- ========================================

-- Central stock table (holds all inventory)
CREATE TABLE central_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    total_quantity INTEGER DEFAULT 0,
    allocated_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch allocations table (tracks what's allocated where)
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
-- UPDATE EXISTING TABLES
-- ========================================

-- Add branch_id to existing tables
ALTER TABLE products ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE sales ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE laybye_orders ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE refunds ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_branches_active ON branches(is_active);
CREATE INDEX idx_central_stock_product ON central_stock(product_id);
CREATE INDEX idx_branch_allocations_product ON branch_allocations(product_id);
CREATE INDEX idx_branch_allocations_branch ON branch_allocations(branch_id);
CREATE INDEX idx_products_branch ON products(branch_id);
CREATE INDEX idx_customers_branch ON customers(branch_id);
CREATE INDEX idx_sales_branch ON sales(branch_id);

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
CREATE TRIGGER initialize_central_stock_on_product 
    AFTER INSERT ON products 
    FOR EACH ROW EXECUTE FUNCTION initialize_central_stock();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_allocations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced when auth is implemented)
CREATE POLICY "Allow all operations on branches" ON branches FOR ALL USING (true);
CREATE POLICY "Allow all operations on central_stock" ON central_stock FOR ALL USING (true);
CREATE POLICY "Allow all operations on branch_allocations" ON branch_allocations FOR ALL USING (true);

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Insert sample branches
INSERT INTO branches (name, address, phone, email) VALUES
('Main Store', '123 Main Street, Johannesburg, South Africa', '+27 11 123 4567', 'main@kqspos.com'),
('North Branch', '456 North Avenue, Pretoria, South Africa', '+27 12 345 6789', 'north@kqspos.com'),
('South Branch', '789 South Road, Cape Town, South Africa', '+27 21 987 6543', 'south@kqspos.com');

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE branches IS 'Store branches/locations';
COMMENT ON TABLE central_stock IS 'Central warehouse stock management';
COMMENT ON TABLE branch_allocations IS 'Stock allocations to branches'; 