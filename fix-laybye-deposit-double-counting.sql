-- Fix Laybye Deposit Double-Counting Issue
-- This script removes incorrect deposit payment records and recalculates balances

-- ========================================
-- STEP 1: IDENTIFY AND REMOVE INCORRECT DEPOSIT PAYMENTS
-- ========================================

-- Find laybye orders that have deposit payments that shouldn't exist
-- (deposit payments with notes containing "Initial deposit" or "deposit")
SELECT 
    'Laybye orders with incorrect deposit payments:' as info,
    lo.order_number,
    lo.total_amount,
    lo.deposit_amount,
    lo.remaining_balance,
    COUNT(lp.id) as deposit_payment_count,
    SUM(lp.amount) as total_deposit_payments
FROM laybye_orders lo
LEFT JOIN laybye_payments lp ON lo.id = lp.laybye_id 
    AND (lp.notes ILIKE '%Initial deposit%' OR lp.notes ILIKE '%deposit%')
WHERE lp.id IS NOT NULL
GROUP BY lo.id, lo.order_number, lo.total_amount, lo.deposit_amount, lo.remaining_balance
ORDER BY lo.created_at DESC;

-- Remove incorrect deposit payment records
DELETE FROM laybye_payments 
WHERE notes ILIKE '%Initial deposit%' 
   OR notes ILIKE '%deposit%'
   OR (payment_method = 'deposit' AND notes IS NULL);

-- ========================================
-- STEP 2: RECALCULATE ALL LAYBYE BALANCES
-- ========================================

-- Update all laybye orders with correct balance calculations
UPDATE laybye_orders 
SET 
    remaining_balance = GREATEST(0, total_amount - deposit_amount - COALESCE(
        (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = laybye_orders.id), 0
    )),
    remaining_amount = GREATEST(0, total_amount - deposit_amount - COALESCE(
        (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = laybye_orders.id), 0
    )),
    status = CASE 
        WHEN GREATEST(0, total_amount - deposit_amount - COALESCE(
            (SELECT SUM(amount) FROM laybye_payments WHERE laybye_id = laybye_orders.id), 0
        )) <= 0 THEN 'completed'
        ELSE 'active'
    END,
    updated_at = NOW();

-- ========================================
-- STEP 3: VERIFY THE FIXES
-- ========================================

-- Show sample laybye orders with correct balances
SELECT 
    'Sample Laybye Orders with Correct Balances' as info,
    order_number,
    total_amount,
    deposit_amount,
    remaining_balance,
    status,
    (SELECT COUNT(*) FROM laybye_payments WHERE laybye_id = lo.id) as payment_count,
    (SELECT COALESCE(SUM(amount), 0) FROM laybye_payments WHERE laybye_id = lo.id) as total_payments
FROM laybye_orders lo
ORDER BY created_at DESC
LIMIT 10;

-- Show the calculation breakdown for verification
SELECT 
    'Balance Calculation Breakdown' as info,
    lo.order_number,
    lo.total_amount,
    lo.deposit_amount,
    (SELECT COALESCE(SUM(amount), 0) FROM laybye_payments WHERE laybye_id = lo.id) as total_payments,
    lo.remaining_balance,
    (lo.total_amount - lo.deposit_amount - (SELECT COALESCE(SUM(amount), 0) FROM laybye_payments WHERE laybye_id = lo.id)) as calculated_balance
FROM laybye_orders lo
ORDER BY lo.created_at DESC
LIMIT 10;

-- ========================================
-- STEP 4: CREATE FUNCTION TO PREVENT FUTURE ISSUES
-- ========================================

-- Function to create laybye order without creating deposit payment
CREATE OR REPLACE FUNCTION create_laybye_order_correct(
    p_order_number TEXT,
    p_customer_id UUID,
    p_branch_id UUID,
    p_total_amount NUMERIC(12, 2),
    p_deposit_amount NUMERIC(12, 2),
    p_due_date DATE,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_laybye_id UUID;
    v_remaining_balance NUMERIC(12, 2);
BEGIN
    -- Calculate correct remaining balance: Total - Deposit (no payments yet)
    v_remaining_balance := p_total_amount - p_deposit_amount;
    
    -- Ensure balance doesn't go negative
    IF v_remaining_balance < 0 THEN
        v_remaining_balance := 0;
    END IF;
    
    -- Create laybye order
    INSERT INTO laybye_orders (
        order_number,
        customer_id,
        branch_id,
        total_amount,
        deposit_amount,
        remaining_balance,
        remaining_amount,
        due_date,
        notes,
        status
    ) VALUES (
        p_order_number,
        p_customer_id,
        p_branch_id,
        p_total_amount,
        p_deposit_amount,
        v_remaining_balance,
        v_remaining_balance,
        p_due_date,
        p_notes,
        'active'
    ) RETURNING id INTO v_laybye_id;
    
    -- NOTE: No deposit payment record is created here
    -- The deposit is tracked in laybye_orders.deposit_amount field
    
    RETURN json_build_object(
        'success', true,
        'laybye_id', v_laybye_id,
        'remaining_balance', v_remaining_balance,
        'message', 'Laybye order created with correct balance (no deposit payment record)'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- STEP 5: SUMMARY
-- ========================================

SELECT 
    'FIX SUMMARY' as info,
    '✅ Removed incorrect deposit payment records' as action_1,
    '✅ Recalculated all laybye balances' as action_2,
    '✅ Created prevention function' as action_3,
    '✅ Balance calculation: Total - Deposit - Payments' as formula;
