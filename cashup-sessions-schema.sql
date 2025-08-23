-- Create cashup_sessions table
CREATE TABLE IF NOT EXISTS public.cashup_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_number VARCHAR(50) UNIQUE NOT NULL,
    cashier_id UUID REFERENCES auth.users(id),
    cashier_name VARCHAR(255) NOT NULL,
    branch_id UUID NOT NULL REFERENCES branches(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'reconciled')),
    opening_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    closing_amount DECIMAL(10,2),
    expected_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2),
    difference DECIMAL(10,2),
    sales JSONB DEFAULT '{"cash": 0, "card": 0, "transfer": 0, "mpesa": 0, "ecocash": 0, "total": 0}'::jsonb,
    refunds JSONB DEFAULT '{"cash": 0, "card": 0, "transfer": 0, "mpesa": 0, "ecocash": 0, "total": 0}'::jsonb,
    expenses JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cashup_sessions_branch_id ON public.cashup_sessions(branch_id);
CREATE INDEX IF NOT EXISTS idx_cashup_sessions_status ON public.cashup_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cashup_sessions_created_at ON public.cashup_sessions(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_cashup_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cashup_sessions_updated_at
    BEFORE UPDATE ON public.cashup_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_cashup_sessions_updated_at();

-- Enable Row Level Security
ALTER TABLE public.cashup_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view cashup sessions for their branches" ON public.cashup_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert cashup sessions for their branches" ON public.cashup_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update cashup sessions for their branches" ON public.cashup_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete cashup sessions for their branches" ON public.cashup_sessions
    FOR DELETE USING (auth.role() = 'authenticated');
