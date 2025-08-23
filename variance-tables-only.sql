-- Simple Variance Tables Creation (No Triggers/Functions to avoid conflicts)
-- Run this if you're getting trigger/function conflicts

-- Create cash_variances table
CREATE TABLE IF NOT EXISTS public.cash_variances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cashup_session_id UUID NOT NULL,
    variance_type VARCHAR(20) NOT NULL CHECK (variance_type IN ('shortage', 'overage')),
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'counting_error', 'unrecorded_sale', 'wrong_change_given', 
        'cash_theft', 'register_malfunction', 'unaccounted_expense',
        'foreign_currency', 'damaged_bills', 'customer_dispute',
        'unknown', 'other'
    )),
    description TEXT,
    reported_by VARCHAR(255) NOT NULL,
    investigated_by VARCHAR(255),
    investigation_notes TEXT,
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (resolution_status IN (
        'pending', 'investigating', 'resolved', 'unresolved', 'manager_approved'
    )),
    manager_approval BOOLEAN DEFAULT FALSE,
    manager_id UUID,
    manager_notes TEXT,
    branch_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create variance_actions table
CREATE TABLE IF NOT EXISTS public.variance_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variance_id UUID NOT NULL,
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN (
        'created', 'investigated', 'category_updated', 'manager_reviewed',
        'approved', 'rejected', 'resolved', 'escalated', 'comment_added'
    )),
    action_by VARCHAR(255) NOT NULL,
    action_notes TEXT,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create variance_reports table
CREATE TABLE IF NOT EXISTS public.variance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_period VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    branch_id UUID NOT NULL,
    total_variances INTEGER DEFAULT 0,
    total_shortage_amount DECIMAL(10,2) DEFAULT 0,
    total_overage_amount DECIMAL(10,2) DEFAULT 0,
    net_variance DECIMAL(10,2) DEFAULT 0,
    unresolved_count INTEGER DEFAULT 0,
    variance_categories JSONB DEFAULT '{}'::jsonb,
    generated_by VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cash_variances_session ON public.cash_variances(cashup_session_id);
CREATE INDEX IF NOT EXISTS idx_cash_variances_branch ON public.cash_variances(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_variances_type ON public.cash_variances(variance_type);
CREATE INDEX IF NOT EXISTS idx_cash_variances_status ON public.cash_variances(resolution_status);
CREATE INDEX IF NOT EXISTS idx_cash_variances_date ON public.cash_variances(created_at);
CREATE INDEX IF NOT EXISTS idx_variance_actions_variance ON public.variance_actions(variance_id);
CREATE INDEX IF NOT EXISTS idx_variance_reports_branch ON public.variance_reports(branch_id);
CREATE INDEX IF NOT EXISTS idx_variance_reports_period ON public.variance_reports(start_date, end_date);

-- Disable RLS to avoid policy conflicts
ALTER TABLE public.cash_variances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.variance_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.variance_reports DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Variance tables created successfully! RLS disabled for easy testing.' as result;
