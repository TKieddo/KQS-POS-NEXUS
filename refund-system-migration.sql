-- Refund System Migration for KQS POS
-- This migration ensures all necessary tables and columns exist for the refund item functionality

-- ========================================
-- ENSURE REFUNDS TABLE EXISTS
-- ========================================

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_sale_id UUID REFERENCES sales(id) ON DELETE RESTRICT,
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_method VARCHAR(50) NOT NULL, -- cash, card, account, exchange
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, completed, rejected
    processed_by UUID, -- Will reference auth.users when auth is set up
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENSURE REFUND_ITEMS TABLE EXISTS
-- ========================================

CREATE TABLE IF NOT EXISTS refund_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_id UUID REFERENCES refunds(id) ON DELETE CASCADE,
    original_sale_item_id UUID REFERENCES sale_items(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ========================================

-- Add branch_id to refunds if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'refunds' AND column_name = 'branch_id') THEN
        ALTER TABLE refunds ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add branch_id to sales if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'branch_id') THEN
        ALTER TABLE sales ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add branch_id to customers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'branch_id') THEN
        ALTER TABLE customers ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add current_balance to customers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'current_balance') THEN
        ALTER TABLE customers ADD COLUMN current_balance DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add credit_limit to customers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'credit_limit') THEN
        ALTER TABLE customers ADD COLUMN credit_limit DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add status to customers if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'status') THEN
        ALTER TABLE customers ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Refunds indexes
CREATE INDEX IF NOT EXISTS idx_refunds_original_sale_id ON refunds(original_sale_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_id ON refunds(customer_id);
CREATE INDEX IF NOT EXISTS idx_refunds_branch_id ON refunds(branch_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

-- Refund items indexes
CREATE INDEX IF NOT EXISTS idx_refund_items_refund_id ON refund_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_original_sale_item_id ON refund_items(original_sale_item_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_product_id ON refund_items(product_id);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_current_balance ON customers(current_balance);

-- ========================================
-- CREATE FUNCTIONS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update refunds updated_at
CREATE OR REPLACE FUNCTION update_refunds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for refunds updated_at
DROP TRIGGER IF EXISTS trigger_update_refunds_updated_at ON refunds;
CREATE TRIGGER trigger_update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_refunds_updated_at();

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on refunds table
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Enable RLS on refund_items table
ALTER TABLE refund_items ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE RLS POLICIES
-- ========================================

-- Refunds policies - using the correct user_branches table
CREATE POLICY "Users can view refunds for their branches" ON refunds
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
        OR branch_id IS NULL
    );

CREATE POLICY "Users can insert refunds for their branches" ON refunds
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
        OR branch_id IS NULL
    );

CREATE POLICY "Users can update refunds for their branches" ON refunds
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM user_branches 
            WHERE user_id = auth.uid()
        )
        OR branch_id IS NULL
    );

-- Refund items policies
CREATE POLICY "Users can view refund items for their branches" ON refund_items
    FOR SELECT USING (
        refund_id IN (
            SELECT id FROM refunds 
            WHERE branch_id IN (
                SELECT branch_id FROM user_branches 
                WHERE user_id = auth.uid()
            )
            OR branch_id IS NULL
        )
    );

CREATE POLICY "Users can insert refund items for their branches" ON refund_items
    FOR INSERT WITH CHECK (
        refund_id IN (
            SELECT id FROM refunds 
            WHERE branch_id IN (
                SELECT branch_id FROM user_branches 
                WHERE user_id = auth.uid()
            )
            OR branch_id IS NULL
        )
    );

-- ========================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- ========================================

-- Insert sample customers with account balances (if needed for testing)
INSERT INTO customers (id, customer_number, first_name, last_name, email, phone, current_balance, credit_limit, status, branch_id)
VALUES 
    (gen_random_uuid(), 'CUST001', 'John', 'Smith', 'john.smith@example.com', '+1234567890', 0, 1000.00, 'active', (SELECT id FROM branches LIMIT 1)),
    (gen_random_uuid(), 'CUST002', 'Jane', 'Doe', 'jane.doe@example.com', '+1234567891', 250.00, 1500.00, 'active', (SELECT id FROM branches LIMIT 1)),
    (gen_random_uuid(), 'CUST003', 'Bob', 'Johnson', 'bob.johnson@example.com', '+1234567892', -150.00, 2000.00, 'active', (SELECT id FROM branches LIMIT 1))
ON CONFLICT (customer_number) DO NOTHING;

-- Insert sample products (if needed for testing)
INSERT INTO products (id, name, sku, description, price, cost_price, category_id, branch_id)
VALUES 
    (gen_random_uuid(), 'Test T-Shirt', 'TSHIRT-001', 'Sample t-shirt for testing', 25.00, 15.00, NULL, (SELECT id FROM branches LIMIT 1)),
    (gen_random_uuid(), 'Test Jeans', 'JEANS-001', 'Sample jeans for testing', 75.00, 45.00, NULL, (SELECT id FROM branches LIMIT 1)),
    (gen_random_uuid(), 'Test Shoes', 'SHOES-001', 'Sample shoes for testing', 120.00, 80.00, NULL, (SELECT id FROM branches LIMIT 1))
ON CONFLICT (sku) DO NOTHING;

-- Insert sample sales (if needed for testing)
INSERT INTO sales (id, transaction_number, customer_id, total_amount, payment_method, sale_type, branch_id, created_at)
VALUES 
    (gen_random_uuid(), 'SALE-001', (SELECT id FROM customers WHERE customer_number = 'CUST001' LIMIT 1), 100.00, 'cash', 'retail', (SELECT id FROM branches LIMIT 1), NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), 'SALE-002', (SELECT id FROM customers WHERE customer_number = 'CUST002' LIMIT 1), 150.00, 'card', 'retail', (SELECT id FROM branches LIMIT 1), NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), 'SALE-003', (SELECT id FROM customers WHERE customer_number = 'CUST003' LIMIT 1), 200.00, 'cash', 'retail', (SELECT id FROM branches LIMIT 1), NOW())
ON CONFLICT (transaction_number) DO NOTHING;

-- Insert sample sale items (if needed for testing)
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price, created_at)
VALUES 
    (gen_random_uuid(), (SELECT id FROM sales WHERE transaction_number = 'SALE-001' LIMIT 1), (SELECT id FROM products WHERE sku = 'TSHIRT-001' LIMIT 1), 2, 25.00, 50.00, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), (SELECT id FROM sales WHERE transaction_number = 'SALE-001' LIMIT 1), (SELECT id FROM products WHERE sku = 'JEANS-001' LIMIT 1), 1, 75.00, 75.00, NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), (SELECT id FROM sales WHERE transaction_number = 'SALE-002' LIMIT 1), (SELECT id FROM products WHERE sku = 'SHOES-001' LIMIT 1), 1, 120.00, 120.00, NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), (SELECT id FROM sales WHERE transaction_number = 'SALE-002' LIMIT 1), (SELECT id FROM products WHERE sku = 'TSHIRT-001' LIMIT 1), 1, 25.00, 25.00, NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), (SELECT id FROM sales WHERE transaction_number = 'SALE-003' LIMIT 1), (SELECT id FROM products WHERE sku = 'JEANS-001' LIMIT 1), 2, 75.00, 150.00, NOW()),
    (gen_random_uuid(), (SELECT id FROM sales WHERE transaction_number = 'SALE-003' LIMIT 1), (SELECT id FROM products WHERE sku = 'SHOES-001' LIMIT 1), 1, 120.00, 120.00, NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if all tables exist
SELECT 
    expected_tables.table_name,
    CASE WHEN t.table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
    VALUES ('refunds'), ('refund_items'), ('sales'), ('customers'), ('branches')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables t ON t.table_name = expected_tables.table_name;

-- Check if all required columns exist
SELECT 
    expected_columns.table_name,
    expected_columns.column_name,
    CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
    VALUES 
        ('refunds', 'branch_id'),
        ('refunds', 'refund_method'),
        ('customers', 'current_balance'),
        ('customers', 'credit_limit'),
        ('customers', 'status'),
        ('sales', 'branch_id')
) AS expected_columns(table_name, column_name)
LEFT JOIN information_schema.columns c ON c.table_name = expected_columns.table_name AND c.column_name = expected_columns.column_name;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- This migration ensures the refund system is properly set up with:
-- 1. Refunds and refund_items tables with proper relationships
-- 2. Branch-based data isolation
-- 3. Customer account balance tracking
-- 4. Proper indexes for performance
-- 5. Row Level Security policies
-- 6. Automatic timestamp updates
