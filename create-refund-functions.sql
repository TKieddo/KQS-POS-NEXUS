-- Create Refund System Functions for KQS POS
-- This script creates all necessary functions for the refund system

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
                -- Update existing credit account (decrease balance to give more credit)
                UPDATE credit_accounts 
                SET current_balance = current_balance - p_refund_amount,
                    updated_at = NOW()
                WHERE customer_id = v_customer_id;
            ELSE
                -- Insert new credit account (negative balance means credit available)
                INSERT INTO credit_accounts (customer_id, current_balance, credit_limit)
                VALUES (v_customer_id, -p_refund_amount, 1000);
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

DROP FUNCTION IF EXISTS get_refund_history(UUID, INTEGER);

CREATE OR REPLACE FUNCTION get_refund_history(
    p_branch_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    refund_id UUID,
    refund_number VARCHAR(50),
    original_sale_id UUID,
    customer_name TEXT,
    customer_email TEXT,
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
        COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Unknown Customer')::TEXT as customer_name,
        COALESCE(c.email, '')::TEXT as customer_email,
        r.refund_amount,
        r.refund_method,
        r.reason,
        r.status,
        COALESCE(u.full_name, 'Unknown User')::TEXT as processed_by_name,
        r.processed_at,
        COUNT(ri.id)::INTEGER as items_count
    FROM refunds r
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN users u ON r.processed_by = u.id
    LEFT JOIN refund_items ri ON r.id = ri.refund_id
    WHERE (p_branch_id IS NULL OR r.branch_id = p_branch_id)
    GROUP BY r.id, r.refund_number, r.original_sale_id, c.first_name, c.last_name, 
             c.email, r.refund_amount, r.refund_method, r.reason, r.status, 
             u.full_name, r.processed_at
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
        WHEN 'all' THEN
            v_start_date := '1970-01-01'::timestamp;
        ELSE
            v_start_date := date_trunc('day', now());
    END CASE;

    -- Get statistics
    SELECT json_build_object(
        'totalRefunds', COUNT(*),
        'totalAmount', COALESCE(SUM(refund_amount), 0),
        'byMethod', (
            SELECT json_object_agg(refund_method, count)
            FROM (
                SELECT refund_method, COUNT(*) as count
                FROM refunds
                WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
                  AND processed_at >= v_start_date
                GROUP BY refund_method
            ) method_counts
        ),
        'byStatus', (
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
-- FUNCTION TO GET REFUND ANALYTICS
-- ========================================

CREATE OR REPLACE FUNCTION get_refund_analytics(
    p_branch_id UUID DEFAULT NULL,
    p_period VARCHAR(20) DEFAULT 'week'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_date TIMESTAMP;
    v_analytics JSON;
BEGIN
    -- Calculate start date based on period
    CASE p_period
        WHEN 'today' THEN
            v_start_date := date_trunc('day', now());
        WHEN 'week' THEN
            v_start_date := date_trunc('week', now());
        WHEN 'month' THEN
            v_start_date := date_trunc('month', now());
        WHEN 'quarter' THEN
            v_start_date := date_trunc('quarter', now());
        WHEN 'year' THEN
            v_start_date := date_trunc('year', now());
        WHEN 'all' THEN
            v_start_date := '1970-01-01'::timestamp;
        ELSE
            v_start_date := date_trunc('week', now());
    END CASE;

    -- Get analytics data
    SELECT json_build_object(
        'dailyRefunds', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', processed_at)::date,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            )
            FROM (
                SELECT processed_at, refund_amount
                FROM refunds
                WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
                  AND processed_at >= v_start_date
                ORDER BY date_trunc('day', processed_at)
            ) daily_data
            GROUP BY date_trunc('day', processed_at)
            ORDER BY date_trunc('day', processed_at)
        ),
        'methodBreakdown', (
            SELECT json_agg(
                json_build_object(
                    'method', refund_method,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            )
            FROM refunds
            WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
              AND processed_at >= v_start_date
            GROUP BY refund_method
            ORDER BY COUNT(*) DESC
        ),
        'statusBreakdown', (
            SELECT json_agg(
                json_build_object(
                    'status', status,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            )
            FROM refunds
            WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
              AND processed_at >= v_start_date
            GROUP BY status
            ORDER BY COUNT(*) DESC
        ),
        'topReasons', (
            SELECT json_agg(
                json_build_object(
                    'reason', reason,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            )
            FROM refunds
            WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
              AND processed_at >= v_start_date
            GROUP BY reason
            ORDER BY COUNT(*) DESC
            LIMIT 10
        ),
        'period', p_period,
        'start_date', v_start_date
    ) INTO v_analytics
    FROM refunds
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
      AND processed_at >= v_start_date
    LIMIT 1;

    -- Return analytics with default values if no data
    RETURN COALESCE(v_analytics, json_build_object(
        'dailyRefunds', '[]'::json,
        'methodBreakdown', '[]'::json,
        'statusBreakdown', '[]'::json,
        'topReasons', '[]'::json,
        'period', p_period,
        'start_date', v_start_date
    ));
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
-- VERIFICATION QUERIES
-- ========================================

-- Check if functions exist
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('process_complete_refund', 'get_refund_history', 'get_refund_stats', 'get_refund_analytics', 'get_customer_credit_balance') 
        THEN '✅ Exists' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('process_complete_refund', 'get_refund_history', 'get_refund_stats', 'get_refund_analytics', 'get_customer_credit_balance');
