-- Create Refund System Tables for KQS POS
-- This script creates all necessary tables for the refund system

-- ========================================
-- REFUND TABLES
-- ========================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS refund_items CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;

-- Create refunds table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    original_sale_id UUID REFERENCES sales(id),
    customer_id UUID REFERENCES customers(id),
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_method VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create refund_items table
CREATE TABLE refund_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_id UUID REFERENCES refunds(id) ON DELETE CASCADE,
    original_sale_item_id UUID REFERENCES sale_items(id),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREDIT ACCOUNTS TABLES
-- ========================================

-- Create credit_accounts table
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    current_balance DECIMAL(10,2) DEFAULT 0,
    credit_limit DECIMAL(10,2) DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    balance_after DECIMAL(10,2) NOT NULL,
    reference_id UUID, -- Can reference refund_id, sale_id, etc.
    reference_type VARCHAR(50), -- 'refund', 'sale', 'payment', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Refund indexes
CREATE INDEX idx_refunds_sale_id ON refunds(original_sale_id);
CREATE INDEX idx_refunds_customer_id ON refunds(customer_id);
CREATE INDEX idx_refunds_branch_id ON refunds(branch_id);
CREATE INDEX idx_refunds_processed_at ON refunds(processed_at);
CREATE INDEX idx_refund_items_refund_id ON refund_items(refund_id);
CREATE INDEX idx_refund_items_product_id ON refund_items(product_id);

-- Credit account indexes
CREATE INDEX idx_credit_accounts_customer_id ON credit_accounts(customer_id);
CREATE INDEX idx_credit_transactions_customer_id ON credit_transactions(customer_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update refund timestamp
CREATE OR REPLACE FUNCTION update_refund_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for refunds table
CREATE TRIGGER update_refund_timestamp_trigger
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_refund_timestamp();

-- Function to update credit account timestamp
CREATE OR REPLACE FUNCTION update_credit_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for credit_accounts table
CREATE TRIGGER update_credit_account_timestamp_trigger
    BEFORE UPDATE ON credit_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_account_timestamp();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on refund tables
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
DROP POLICY IF EXISTS "Allow all operations on refunds" ON refunds;
CREATE POLICY "Allow all operations on refunds" ON refunds FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on refund_items" ON refund_items;
CREATE POLICY "Allow all operations on refund_items" ON refund_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on credit_accounts" ON credit_accounts;
CREATE POLICY "Allow all operations on credit_accounts" ON credit_accounts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on credit_transactions" ON credit_transactions;
CREATE POLICY "Allow all operations on credit_transactions" ON credit_transactions FOR ALL USING (true);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('refunds', 'refund_items', 'credit_accounts', 'credit_transactions') 
        THEN '✅ Exists' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('refunds', 'refund_items', 'credit_accounts', 'credit_transactions');

-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('refunds', 'refund_items', 'credit_accounts', 'credit_transactions')
ORDER BY table_name, ordinal_position;

-- Check if indexes exist
SELECT 
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_refunds%' OR indexname LIKE 'idx_refund_items%' OR indexname LIKE 'idx_credit%'
        THEN '✅ Exists' 
        ELSE '❌ Missing' 
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (indexname LIKE 'idx_refunds%' OR indexname LIKE 'idx_refund_items%' OR indexname LIKE 'idx_credit%');
