-- Complete Refund System Setup for KQS POS
-- This file contains all necessary database functions and triggers for the refund system

-- ========================================
-- REFUND TABLES (if not already created)
-- ========================================

-- Create refunds table if it doesn't exist
CREATE TABLE IF NOT EXISTS refunds (
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

-- Create refund_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS refund_items (
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
-- CREDIT ACCOUNTS TABLE (if not already created)
-- ========================================

CREATE TABLE IF NOT EXISTS credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    current_balance DECIMAL(10,2) DEFAULT 0,
    credit_limit DECIMAL(10,2) DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_transactions (
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

CREATE INDEX IF NOT EXISTS idx_refunds_sale_id ON refunds(original_sale_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_id ON refunds(customer_id);
CREATE INDEX IF NOT EXISTS idx_refunds_branch_id ON refunds(branch_id);
CREATE INDEX IF NOT EXISTS idx_refunds_processed_at ON refunds(processed_at);
CREATE INDEX IF NOT EXISTS idx_refund_items_refund_id ON refund_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_product_id ON refund_items(product_id);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_customer_id ON credit_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_customer_id ON credit_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- ========================================
-- MAIN REFUND PROCESSING FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION process_complete_refund(
    p_item_id UUID,
    p_refund_amount DECIMAL(10,2),
    p_reason TEXT,
    p_refund_method VARCHAR(50),
    p_customer_id UUID DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL,
    p_branch_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_refund_id UUID;
    v_refund_number VARCHAR(50);
    v_sale_item RECORD;
    v_original_sale_id UUID;
    v_customer_id UUID;
    v_result JSON;
BEGIN
    -- Validate required parameters
    IF p_item_id IS NULL OR p_refund_amount IS NULL OR p_reason IS NULL OR p_refund_method IS NULL OR p_processed_by IS NULL OR p_branch_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    -- Start transaction
    BEGIN
        -- Get sale item details
        SELECT 
            si.id,
            si.sale_id,
            si.product_id,
            si.variant_id,
            si.quantity,
            si.unit_price,
            s.customer_id
        INTO v_sale_item
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE si.id = p_item_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Sale item not found: %', p_item_id;
        END IF;

        v_original_sale_id := v_sale_item.sale_id;
        v_customer_id := COALESCE(p_customer_id, v_sale_item.customer_id);

        -- Generate refund number
        v_refund_number := 'REF-' || to_char(now(), 'YYYYMMDD') || '-' || 
                          lpad(floor(random() * 10000)::text, 4, '0');

        -- Create refund record
        INSERT INTO refunds (
            refund_number,
            original_sale_id,
            customer_id,
            refund_amount,
            refund_method,
            reason,
            status,
            processed_by,
            branch_id
        ) VALUES (
            v_refund_number,
            v_original_sale_id,
            v_customer_id,
            p_refund_amount,
            p_refund_method,
            p_reason,
            'completed',
            p_processed_by,
            p_branch_id
        ) RETURNING id INTO v_refund_id;

        -- Create refund item record
        INSERT INTO refund_items (
            refund_id,
            original_sale_item_id,
            product_id,
            variant_id,
            quantity,
            unit_price,
            refund_amount,
            reason
        ) VALUES (
            v_refund_id,
            p_item_id,
            v_sale_item.product_id,
            v_sale_item.variant_id,
            v_sale_item.quantity,
            v_sale_item.unit_price,
            p_refund_amount,
            p_reason
        );

        -- Update inventory (add back the quantity)
        UPDATE products 
        SET stock_quantity = stock_quantity + v_sale_item.quantity,
            updated_at = NOW()
        WHERE id = v_sale_item.product_id;

        -- Update variant stock if applicable
        IF v_sale_item.variant_id IS NOT NULL THEN
            UPDATE product_variants 
            SET stock_quantity = stock_quantity + v_sale_item.quantity,
                updated_at = NOW()
            WHERE id = v_sale_item.variant_id;
        END IF;

        -- Update branch stock if it exists
        UPDATE branch_stock 
        SET stock_quantity = stock_quantity + v_sale_item.quantity,
            updated_at = NOW()
        WHERE product_id = v_sale_item.product_id 
          AND variant_id = v_sale_item.variant_id
          AND branch_id = p_branch_id;

        -- Handle account credit if refund method is 'account'
        IF p_refund_method = 'account' AND v_customer_id IS NOT NULL THEN
            -- Check if credit account exists
            IF EXISTS (SELECT 1 FROM credit_accounts WHERE customer_id = v_customer_id) THEN
                -- Update existing credit account
                UPDATE credit_accounts 
                SET current_balance = current_balance + p_refund_amount,
                    updated_at = NOW()
                WHERE customer_id = v_customer_id;
            ELSE
                -- Insert new credit account
                INSERT INTO credit_accounts (customer_id, current_balance, credit_limit)
                VALUES (v_customer_id, p_refund_amount, 1000);
            END IF;

            -- Create credit transaction record
            INSERT INTO credit_transactions (
                customer_id,
                transaction_type,
                amount,
                description,
                balance_after,
                reference_id,
                reference_type
            ) VALUES (
                v_customer_id,
                'credit',
                p_refund_amount,
                'Refund credit - ' || p_reason,
                (SELECT current_balance FROM credit_accounts WHERE customer_id = v_customer_id),
                v_refund_id,
                'refund'
            );
        END IF;

        -- Mark sale item as refunded
        UPDATE sale_items 
        SET refunded = true,
            refund_amount = p_refund_amount,
            refund_date = NOW()
        WHERE id = p_item_id;

        -- Return success result
        v_result := json_build_object(
            'success', true,
            'refund_id', v_refund_id,
            'refund_number', v_refund_number,
            'message', 'Refund processed successfully'
        );

        RETURN v_result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback transaction
            RAISE;
    END;
END;
$$;

-- ========================================
-- FUNCTION TO GET REFUND HISTORY
-- ========================================

CREATE OR REPLACE FUNCTION get_refund_history(
    p_branch_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    refund_id UUID,
    refund_number VARCHAR(50),
    original_sale_id UUID,
    customer_name TEXT,
    customer_email VARCHAR(255),
    refund_amount DECIMAL(10,2),
    refund_method VARCHAR(50),
    reason TEXT,
    status VARCHAR(20),
    processed_by_name TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    items_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.refund_number,
        r.original_sale_id,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.email as customer_email,
        r.refund_amount,
        r.refund_method,
        r.reason,
        r.status,
        CONCAT(u.first_name, ' ', u.last_name) as processed_by_name,
        r.processed_at,
        COUNT(ri.id)::INTEGER as items_count
    FROM refunds r
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN users u ON r.processed_by = u.id
    LEFT JOIN refund_items ri ON r.id = ri.refund_id
    WHERE (p_branch_id IS NULL OR r.branch_id = p_branch_id)
    GROUP BY r.id, r.refund_number, r.original_sale_id, c.first_name, c.last_name, 
             c.email, r.refund_amount, r.refund_method, r.reason, r.status, 
             u.first_name, u.last_name, r.processed_at
    ORDER BY r.processed_at DESC
    LIMIT p_limit;
END;
$$;

-- ========================================
-- FUNCTION TO GET REFUND STATISTICS
-- ========================================

CREATE OR REPLACE FUNCTION get_refund_stats(
    p_branch_id UUID DEFAULT NULL,
    p_period VARCHAR(20) DEFAULT 'today'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_date TIMESTAMP WITH TIME ZONE;
    v_stats JSON;
BEGIN
    -- Calculate start date based on period
    CASE p_period
        WHEN 'today' THEN
            v_start_date := date_trunc('day', now());
        WHEN 'week' THEN
            v_start_date := date_trunc('week', now());
        WHEN 'month' THEN
            v_start_date := date_trunc('month', now());
        ELSE
            v_start_date := date_trunc('day', now());
    END CASE;

    -- Get statistics
    SELECT json_build_object(
        'total_refunds', COUNT(*),
        'total_amount', COALESCE(SUM(refund_amount), 0),
        'by_method', (
            SELECT json_object_agg(refund_method, count)
            FROM (
                SELECT refund_method, COUNT(*) as count
                FROM refunds
                WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
                  AND processed_at >= v_start_date
                GROUP BY refund_method
            ) method_counts
        ),
        'by_status', (
            SELECT json_object_agg(status, count)
            FROM (
                SELECT status, COUNT(*) as count
                FROM refunds
                WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
                  AND processed_at >= v_start_date
                GROUP BY status
            ) status_counts
        ),
        'period', p_period,
        'start_date', v_start_date
    ) INTO v_stats
    FROM refunds
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
      AND processed_at >= v_start_date;

    RETURN v_stats;
END;
$$;

-- ========================================
-- FUNCTION TO GET CUSTOMER CREDIT BALANCE
-- ========================================

CREATE OR REPLACE FUNCTION get_customer_credit_balance(p_customer_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance DECIMAL(10,2);
    v_limit DECIMAL(10,2);
    v_result JSON;
BEGIN
    SELECT 
        COALESCE(current_balance, 0),
        COALESCE(credit_limit, 1000)
    INTO v_balance, v_limit
    FROM credit_accounts
    WHERE customer_id = p_customer_id;

    v_result := json_build_object(
        'customer_id', p_customer_id,
        'current_balance', COALESCE(v_balance, 0),
        'credit_limit', COALESCE(v_limit, 1000),
        'available_credit', COALESCE(v_limit, 1000) - COALESCE(v_balance, 0),
        'has_credit_account', v_balance IS NOT NULL
    );

    RETURN v_result;
END;
$$;

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
DROP TRIGGER IF EXISTS update_refund_timestamp_trigger ON refunds;
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
DROP TRIGGER IF EXISTS update_credit_account_timestamp_trigger ON credit_accounts;
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

-- Basic RLS policies (adjust based on your security requirements)
DROP POLICY IF EXISTS "Allow all operations on refunds" ON refunds;
CREATE POLICY "Allow all operations on refunds" ON refunds FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on refund_items" ON refund_items;
CREATE POLICY "Allow all operations on refund_items" ON refund_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on credit_accounts" ON credit_accounts;
CREATE POLICY "Allow all operations on credit_accounts" ON credit_accounts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on credit_transactions" ON credit_transactions;
CREATE POLICY "Allow all operations on credit_transactions" ON credit_transactions FOR ALL USING (true);

-- ========================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ========================================

-- Insert sample credit account for testing
-- INSERT INTO credit_accounts (customer_id, current_balance, credit_limit)
-- SELECT id, 0, 1000 FROM customers LIMIT 1;

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

-- Check if functions exist
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('process_complete_refund', 'get_refund_history', 'get_refund_stats', 'get_customer_credit_balance') 
        THEN '✅ Exists' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('process_complete_refund', 'get_refund_history', 'get_refund_stats', 'get_customer_credit_balance');

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

-- ========================================
-- USAGE EXAMPLES
-- ========================================

/*
-- Example 1: Process a refund
SELECT process_complete_refund(
    'sale-item-uuid-here',
    150.00,
    'Customer changed mind',
    'cash',
    'customer-uuid-here',
    'user-uuid-here',
    'branch-uuid-here'
);

-- Example 2: Get refund history
SELECT * FROM get_refund_history('branch-uuid-here', 10);

-- Example 3: Get refund statistics
SELECT get_refund_stats('branch-uuid-here', 'week');

-- Example 4: Get customer credit balance
SELECT get_customer_credit_balance('customer-uuid-here');
*/
