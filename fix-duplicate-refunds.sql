-- Fix duplicate refunds by adding validation
-- This script updates the process_complete_refund function to prevent duplicate refunds

-- ========================================
-- UPDATED REFUND PROCESSING FUNCTION
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
    v_already_refunded BOOLEAN;
BEGIN
    -- Validate required parameters
    IF p_item_id IS NULL OR p_refund_amount IS NULL OR p_reason IS NULL OR p_refund_method IS NULL OR p_processed_by IS NULL OR p_branch_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Missing required parameters');
    END IF;

    -- Check if item has already been refunded
    SELECT refunded INTO v_already_refunded
    FROM sale_items
    WHERE id = p_item_id;

    IF v_already_refunded THEN
        RETURN json_build_object('success', false, 'error', 'This item has already been refunded');
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
-- CLEANUP DUPLICATE REFUNDS
-- ========================================

-- Remove duplicate refund items (keep only the first one for each sale item)
WITH duplicate_items AS (
    SELECT 
        id,
        original_sale_item_id,
        ROW_NUMBER() OVER (
            PARTITION BY original_sale_item_id 
            ORDER BY created_at ASC
        ) as rn
    FROM refund_items
    WHERE original_sale_item_id IN (
        SELECT original_sale_item_id
        FROM refund_items
        GROUP BY original_sale_item_id
        HAVING COUNT(*) > 1
    )
)
DELETE FROM refund_items 
WHERE id IN (
    SELECT id 
    FROM duplicate_items 
    WHERE rn > 1
);

-- Remove orphaned refunds (refunds without items)
DELETE FROM refunds 
WHERE id NOT IN (
    SELECT DISTINCT refund_id 
    FROM refund_items
);

-- ========================================
-- ADD UNIQUE CONSTRAINT TO PREVENT FUTURE DUPLICATES
-- ========================================

-- Add unique constraint to prevent duplicate refunds for the same sale item
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_sale_item_refund' 
        AND table_name = 'refund_items'
    ) THEN
        ALTER TABLE refund_items 
        ADD CONSTRAINT unique_sale_item_refund 
        UNIQUE (original_sale_item_id);
    END IF;
END $$;

-- ========================================
-- VERIFICATION
-- ========================================

-- Check remaining refunds
SELECT 
    'Remaining refunds' as check_type,
    COUNT(*) as count
FROM refunds
UNION ALL
SELECT 
    'Remaining refund items' as check_type,
    COUNT(*) as count
FROM refund_items
UNION ALL
SELECT 
    'Sale items marked as refunded' as check_type,
    COUNT(*) as count
FROM sale_items
WHERE refunded = true;

-- Check for any remaining duplicates
SELECT 
    'Duplicate sale item refunds remaining' as check_type,
    COUNT(*) as count
FROM (
    SELECT original_sale_item_id
    FROM refund_items
    GROUP BY original_sale_item_id
    HAVING COUNT(*) > 1
) duplicates;
