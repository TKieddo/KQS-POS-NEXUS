-- Create cash_variances table for tracking all money discrepancies
CREATE TABLE IF NOT EXISTS public.cash_variances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cashup_session_id UUID NOT NULL REFERENCES cashup_sessions(id) ON DELETE CASCADE,
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
    manager_id UUID REFERENCES auth.users(id),
    manager_notes TEXT,
    branch_id UUID NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create variance_actions table for tracking all actions taken on variances
CREATE TABLE IF NOT EXISTS public.variance_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    variance_id UUID NOT NULL REFERENCES cash_variances(id) ON DELETE CASCADE,
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

-- Create variance_reports table for periodic variance summaries
CREATE TABLE IF NOT EXISTS public.variance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_period VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    total_variances INTEGER DEFAULT 0,
    total_shortage_amount DECIMAL(10,2) DEFAULT 0,
    total_overage_amount DECIMAL(10,2) DEFAULT 0,
    net_variance DECIMAL(10,2) DEFAULT 0,
    unresolved_count INTEGER DEFAULT 0,
    variance_categories JSONB DEFAULT '{}'::jsonb,
    generated_by VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cash_variances_session ON public.cash_variances(cashup_session_id);
CREATE INDEX IF NOT EXISTS idx_cash_variances_branch ON public.cash_variances(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_variances_type ON public.cash_variances(variance_type);
CREATE INDEX IF NOT EXISTS idx_cash_variances_status ON public.cash_variances(resolution_status);
CREATE INDEX IF NOT EXISTS idx_cash_variances_date ON public.cash_variances(created_at);
CREATE INDEX IF NOT EXISTS idx_variance_actions_variance ON public.variance_actions(variance_id);
CREATE INDEX IF NOT EXISTS idx_variance_reports_branch ON public.variance_reports(branch_id);
CREATE INDEX IF NOT EXISTS idx_variance_reports_period ON public.variance_reports(start_date, end_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_cash_variances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cash_variances_updated_at
    BEFORE UPDATE ON public.cash_variances
    FOR EACH ROW
    EXECUTE FUNCTION update_cash_variances_updated_at();

-- Create trigger to automatically create variance actions
CREATE OR REPLACE FUNCTION create_variance_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert action for new variance
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.variance_actions (
            variance_id, action_type, action_by, action_notes, new_value
        ) VALUES (
            NEW.id, 'created', NEW.reported_by, 
            CONCAT('Variance created: ', NEW.variance_type, ' of ', NEW.amount),
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    
    -- Insert action for variance updates
    IF TG_OP = 'UPDATE' THEN
        -- Track status changes
        IF OLD.resolution_status != NEW.resolution_status THEN
            INSERT INTO public.variance_actions (
                variance_id, action_type, action_by, action_notes, old_value, new_value
            ) VALUES (
                NEW.id, 'status_updated', COALESCE(NEW.investigated_by, NEW.reported_by),
                CONCAT('Status changed from ', OLD.resolution_status, ' to ', NEW.resolution_status),
                jsonb_build_object('status', OLD.resolution_status),
                jsonb_build_object('status', NEW.resolution_status)
            );
        END IF;
        
        -- Track manager approval
        IF OLD.manager_approval != NEW.manager_approval AND NEW.manager_approval = TRUE THEN
            INSERT INTO public.variance_actions (
                variance_id, action_type, action_by, action_notes, new_value
            ) VALUES (
                NEW.id, 'approved', COALESCE(NEW.manager_id::text, 'system'),
                'Variance approved by manager',
                jsonb_build_object('approved_by', NEW.manager_id)
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_variance_action
    AFTER INSERT OR UPDATE ON public.cash_variances
    FOR EACH ROW
    EXECUTE FUNCTION create_variance_action();

-- Function to calculate net variance for a period
CREATE OR REPLACE FUNCTION calculate_net_variance(
    p_branch_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_shortage DECIMAL(10,2) := 0;
    total_overage DECIMAL(10,2) := 0;
BEGIN
    -- Calculate total shortage
    SELECT COALESCE(SUM(amount), 0) INTO total_shortage
    FROM public.cash_variances
    WHERE branch_id = p_branch_id
    AND variance_type = 'shortage'
    AND created_at::date BETWEEN p_start_date AND p_end_date;
    
    -- Calculate total overage
    SELECT COALESCE(SUM(amount), 0) INTO total_overage
    FROM public.cash_variances
    WHERE branch_id = p_branch_id
    AND variance_type = 'overage'
    AND created_at::date BETWEEN p_start_date AND p_end_date;
    
    -- Return net variance (overage - shortage)
    RETURN total_overage - total_shortage;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.cash_variances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variance_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variance_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view variances for their branches" ON public.cash_variances
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert variances for their branches" ON public.cash_variances
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update variances for their branches" ON public.cash_variances
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete variances for their branches" ON public.cash_variances
    FOR DELETE USING (auth.role() = 'authenticated');

-- Variance actions policies
CREATE POLICY "Users can view variance actions" ON public.variance_actions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert variance actions" ON public.variance_actions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update variance actions" ON public.variance_actions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete variance actions" ON public.variance_actions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Variance reports policies
CREATE POLICY "Users can view variance reports" ON public.variance_reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert variance reports" ON public.variance_reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update variance reports" ON public.variance_reports
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete variance reports" ON public.variance_reports
    FOR DELETE USING (auth.role() = 'authenticated');
