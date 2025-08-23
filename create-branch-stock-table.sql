-- Create branch_stock table to track actual inventory at each branch
-- This is different from branch_allocations which tracks allocation promises

-- Step 1: Create branch_stock table
CREATE TABLE IF NOT EXISTS branch_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create unique constraints
-- For product-level stock (where variant_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_branch_product_stock 
ON branch_stock (product_id, branch_id) 
WHERE variant_id IS NULL;

-- For variant-level stock (where variant_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_branch_variant_stock 
ON branch_stock (product_id, branch_id, variant_id) 
WHERE variant_id IS NOT NULL;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_branch_stock_branch ON branch_stock(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_stock_product ON branch_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_branch_stock_variant ON branch_stock(variant_id) WHERE variant_id IS NOT NULL;

-- Step 4: Enable RLS
ALTER TABLE branch_stock ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Allow all operations on branch_stock" ON branch_stock FOR ALL USING (true);

-- Step 6: Add comments
COMMENT ON TABLE branch_stock IS 'Actual inventory stock at each branch location';
COMMENT ON COLUMN branch_stock.variant_id IS 'NULL for product-level stock, variant ID for variant-specific stock';

-- Step 7: Verify creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'branch_stock'
ORDER BY ordinal_position;

RAISE NOTICE 'Branch stock table created successfully!';
