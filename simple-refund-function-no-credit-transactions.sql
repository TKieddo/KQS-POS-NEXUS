-- Simple Refund Function - No Credit Transactions Dependency
-- This version completely skips the credit_transactions table to avoid column errors

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
    v_current_balance DECIMAL(10,2);
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
            -- Get current customer balance
            SELECT account_balance INTO v_current_balance
            FROM customers 
            WHERE id = v_customer_id;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Customer not found: %', v_customer_id;
            END IF;

            -- Update customer account balance (add the refund amount)
            UPDATE customers 
            SET account_balance = COALESCE(v_current_balance, 0) + p_refund_amount,
                updated_at = NOW()
            WHERE id = v_customer_id;

            -- Note: Credit transaction record creation is handled in the application layer
            -- to avoid table structure issues
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
