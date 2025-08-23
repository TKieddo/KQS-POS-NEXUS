-- Complete Laybye System Setup
-- This script creates all three laybye tables with proper structure and relationships

-- ============================================
-- 1. LAYBYE_ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.laybye_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NULL,
    branch_id UUID NULL,
    cashier_id UUID NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    deposit_amount NUMERIC(12, 2) NOT NULL,
    remaining_balance NUMERIC(12, 2) NOT NULL,
    remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT laybye_orders_pkey PRIMARY KEY (id),
    CONSTRAINT laybye_orders_order_number_key UNIQUE (order_number),
    CONSTRAINT laybye_orders_status_check CHECK (status IN ('active', 'completed', 'cancelled', 'expired'))
);

-- ============================================
-- 2. LAYBYE_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.laybye_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    laybye_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT laybye_items_pkey PRIMARY KEY (id),
    CONSTRAINT laybye_items_laybye_id_fkey FOREIGN KEY (laybye_id) REFERENCES laybye_orders (id) ON DELETE CASCADE,
    CONSTRAINT laybye_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT laybye_items_unit_price_check CHECK (unit_price >= 0),
    CONSTRAINT laybye_items_total_price_check CHECK (total_price >= 0)
);

-- ============================================
-- 3. LAYBYE_PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.laybye_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    laybye_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT laybye_payments_pkey PRIMARY KEY (id),
    CONSTRAINT laybye_payments_laybye_id_fkey FOREIGN KEY (laybye_id) REFERENCES laybye_orders (id) ON DELETE CASCADE,
    CONSTRAINT laybye_payments_amount_check CHECK (amount >= 0),
    CONSTRAINT laybye_payments_payment_method_check CHECK (
        payment_method IN ('cash', 'card', 'bank_transfer', 'mpesa', 'ecocash', 'deposit', 'other')
    )
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Laybye Orders Indexes
CREATE INDEX IF NOT EXISTS idx_laybye_orders_customer_id ON public.laybye_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_branch_id ON public.laybye_orders (branch_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_status ON public.laybye_orders (status);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_due_date ON public.laybye_orders (due_date);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_created_at ON public.laybye_orders (created_at);

-- Laybye Items Indexes
CREATE INDEX IF NOT EXISTS idx_laybye_items_laybye_id ON public.laybye_items (laybye_id);
CREATE INDEX IF NOT EXISTS idx_laybye_items_product_id ON public.laybye_items (product_id);

-- Laybye Payments Indexes
CREATE INDEX IF NOT EXISTS idx_laybye_payments_laybye_id ON public.laybye_payments (laybye_id);
CREATE INDEX IF NOT EXISTS idx_laybye_payments_payment_date ON public.laybye_payments (payment_date);
CREATE INDEX IF NOT EXISTS idx_laybye_payments_payment_method ON public.laybye_payments (payment_method);

-- ============================================
-- CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for each table
DROP TRIGGER IF EXISTS update_laybye_orders_updated_at ON laybye_orders;
CREATE TRIGGER update_laybye_orders_updated_at
    BEFORE UPDATE ON laybye_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_laybye_items_updated_at ON laybye_items;
CREATE TRIGGER update_laybye_items_updated_at
    BEFORE UPDATE ON laybye_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_laybye_payments_updated_at ON laybye_payments;
CREATE TRIGGER update_laybye_payments_updated_at
    BEFORE UPDATE ON laybye_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.laybye_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laybye_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laybye_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users for now)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON laybye_orders;
CREATE POLICY "Allow all operations for authenticated users"
    ON laybye_orders FOR ALL
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON laybye_items;
CREATE POLICY "Allow all operations for authenticated users"
    ON laybye_items FOR ALL
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON laybye_payments;
CREATE POLICY "Allow all operations for authenticated users"
    ON laybye_payments FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON TABLE public.laybye_orders TO authenticated;
GRANT ALL ON TABLE public.laybye_orders TO service_role;

GRANT ALL ON TABLE public.laybye_items TO authenticated;
GRANT ALL ON TABLE public.laybye_items TO service_role;

GRANT ALL ON TABLE public.laybye_payments TO authenticated;
GRANT ALL ON TABLE public.laybye_payments TO service_role;

-- ============================================
-- SHOW FINAL STRUCTURE
-- ============================================

-- Show laybye_orders structure
SELECT 'LAYBYE_ORDERS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show laybye_items structure  
SELECT 'LAYBYE_ITEMS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_items' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show laybye_payments structure
SELECT 'LAYBYE_PAYMENTS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'laybye_payments' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT '🎉 Complete Laybye System Setup Successful!' as result;
