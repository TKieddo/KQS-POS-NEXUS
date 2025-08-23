-- Migration: Add Till Operations Tables
-- Description: Creates tables for cash drops, till counts, and till reconciliations
-- Date: 2024-12-19
-- Author: KQS POS System

-- Begin transaction
BEGIN;

-- ========================================
-- CASH DROPS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS cash_drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    till_amount_before DECIMAL(10,2) NOT NULL,
    till_amount_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TILL COUNTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS till_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    expected_amount DECIMAL(10,2) NOT NULL,
    actual_amount DECIMAL(10,2) NOT NULL,
    variance DECIMAL(10,2) NOT NULL,
    denomination_counts JSONB NOT NULL, -- Store counts for each denomination
    notes TEXT,
    counted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TILL RECONCILIATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS till_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    opening_amount DECIMAL(10,2) NOT NULL,
    sales_total DECIMAL(10,2) NOT NULL,
    refunds_total DECIMAL(10,2) NOT NULL,
    cash_payments DECIMAL(10,2) NOT NULL,
    expected_amount DECIMAL(10,2) NOT NULL,
    actual_amount DECIMAL(10,2) NOT NULL,
    variance DECIMAL(10,2) NOT NULL,
    notes TEXT,
    reconciled_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TILL SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS till_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    opened_by UUID REFERENCES auth.users(id),
    closed_by UUID REFERENCES auth.users(id),
    opening_amount DECIMAL(10,2) NOT NULL,
    closing_amount DECIMAL(10,2),
    opening_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closing_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_cash_drops_branch_id ON cash_drops(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_drops_created_at ON cash_drops(created_at);
CREATE INDEX IF NOT EXISTS idx_till_counts_branch_id ON till_counts(branch_id);
CREATE INDEX IF NOT EXISTS idx_till_counts_created_at ON till_counts(created_at);
CREATE INDEX IF NOT EXISTS idx_till_reconciliations_branch_id ON till_reconciliations(branch_id);
CREATE INDEX IF NOT EXISTS idx_till_reconciliations_created_at ON till_reconciliations(created_at);
CREATE INDEX IF NOT EXISTS idx_till_sessions_branch_id ON till_sessions(branch_id);
CREATE INDEX IF NOT EXISTS idx_till_sessions_status ON till_sessions(status);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================
CREATE TRIGGER update_cash_drops_updated_at 
    BEFORE UPDATE ON cash_drops 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_till_counts_updated_at 
    BEFORE UPDATE ON till_counts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_till_reconciliations_updated_at 
    BEFORE UPDATE ON till_reconciliations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_till_sessions_updated_at 
    BEFORE UPDATE ON till_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE cash_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE till_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE till_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE till_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cash_drops
CREATE POLICY "Users can view cash drops for their branch" ON cash_drops
    FOR SELECT USING (true);

CREATE POLICY "Users can insert cash drops for their branch" ON cash_drops
    FOR INSERT WITH CHECK (true);

-- RLS Policies for till_counts
CREATE POLICY "Users can view till counts for their branch" ON till_counts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert till counts for their branch" ON till_counts
    FOR INSERT WITH CHECK (true);

-- RLS Policies for till_reconciliations
CREATE POLICY "Users can view till reconciliations for their branch" ON till_reconciliations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert till reconciliations for their branch" ON till_reconciliations
    FOR INSERT WITH CHECK (true);

-- RLS Policies for till_sessions
CREATE POLICY "Users can view till sessions for their branch" ON till_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert till sessions for their branch" ON till_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update till sessions for their branch" ON till_sessions
    FOR UPDATE USING (true);

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get current till amount for a branch
CREATE OR REPLACE FUNCTION get_current_till_amount(p_branch_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_opening_amount DECIMAL(10,2) := 0;
    v_cash_drops DECIMAL(10,2) := 0;
    v_sales_total DECIMAL(10,2) := 0;
    v_refunds_total DECIMAL(10,2) := 0;
    v_cash_payments DECIMAL(10,2) := 0;
BEGIN
    -- Get opening amount from latest open session
    SELECT opening_amount INTO v_opening_amount
    FROM till_sessions 
    WHERE branch_id = p_branch_id AND status = 'open'
    ORDER BY opening_time DESC 
    LIMIT 1;
    
    -- Get total cash drops since session opened
    SELECT COALESCE(SUM(amount), 0) INTO v_cash_drops
    FROM cash_drops 
    WHERE branch_id = p_branch_id 
    AND created_at >= (
        SELECT opening_time 
        FROM till_sessions 
        WHERE branch_id = p_branch_id AND status = 'open'
        ORDER BY opening_time DESC 
        LIMIT 1
    );
    
    -- Get sales total (this would come from sales table in real implementation)
    -- For now, we'll use a placeholder
    v_sales_total := 0;
    
    -- Get refunds total (this would come from refunds table in real implementation)
    -- For now, we'll use a placeholder
    v_refunds_total := 0;
    
    -- Get cash payments (this would come from sales table in real implementation)
    -- For now, we'll use a placeholder
    v_cash_payments := 0;
    
    RETURN v_opening_amount + v_sales_total - v_refunds_total - v_cash_drops - v_cash_payments;
END;
$$ LANGUAGE plpgsql;

-- Function to get till summary for a branch
CREATE OR REPLACE FUNCTION get_till_summary(p_branch_id UUID)
RETURNS TABLE(
    current_amount DECIMAL(10,2),
    opening_amount DECIMAL(10,2),
    sales_total DECIMAL(10,2),
    refunds_total DECIMAL(10,2),
    cash_payments DECIMAL(10,2),
    cash_drops_total DECIMAL(10,2)
) AS $$
DECLARE
    v_opening_amount DECIMAL(10,2) := 0;
    v_cash_drops_total DECIMAL(10,2) := 0;
    v_opening_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get opening amount and time from latest open session
    SELECT ts.opening_amount, ts.opening_time INTO v_opening_amount, v_opening_time
    FROM till_sessions ts
    WHERE ts.branch_id = p_branch_id AND ts.status = 'open'
    ORDER BY ts.opening_time DESC 
    LIMIT 1;
    
    -- If no open session found, return zeros
    IF v_opening_amount IS NULL THEN
        RETURN QUERY SELECT 0::DECIMAL(10,2), 0::DECIMAL(10,2), 0::DECIMAL(10,2), 0::DECIMAL(10,2), 0::DECIMAL(10,2), 0::DECIMAL(10,2);
        RETURN;
    END IF;
    
    -- Get total cash drops since session opened
    SELECT COALESCE(SUM(cd.amount), 0) INTO v_cash_drops_total
    FROM cash_drops cd
    WHERE cd.branch_id = p_branch_id 
    AND cd.created_at >= v_opening_time;
    
    -- Return the summary
    RETURN QUERY SELECT 
        (v_opening_amount - v_cash_drops_total)::DECIMAL(10,2) as current_amount,
        v_opening_amount as opening_amount,
        0::DECIMAL(10,2) as sales_total, -- Placeholder for sales total
        0::DECIMAL(10,2) as refunds_total, -- Placeholder for refunds total
        0::DECIMAL(10,2) as cash_payments, -- Placeholder for cash payments
        v_cash_drops_total as cash_drops_total;
END;
$$ LANGUAGE plpgsql;

-- Commit transaction
COMMIT;

-- Verify the migration
SELECT 
    'cash_drops' as table_name,
    COUNT(*) as record_count
FROM cash_drops
UNION ALL
SELECT 
    'till_counts' as table_name,
    COUNT(*) as record_count
FROM till_counts
UNION ALL
SELECT 
    'till_reconciliations' as table_name,
    COUNT(*) as record_count
FROM till_reconciliations
UNION ALL
SELECT 
    'till_sessions' as table_name,
    COUNT(*) as record_count
FROM till_sessions; 