-- Cashflow Management Database Setup
-- This creates tables for recording daily expenses, sales, and cashflow analysis

-- 1. Create cashflow_entries table for recording all financial transactions
CREATE TABLE IF NOT EXISTS public.cashflow_entries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('expense', 'income', 'sale')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_url TEXT,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Create cashflow_categories table for expense/income categories
CREATE TABLE IF NOT EXISTS public.cashflow_categories (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create daily_summaries table for daily totals
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    total_expenses DECIMAL(10, 2) DEFAULT 0,
    total_income DECIMAL(10, 2) DEFAULT 0,
    total_sales DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id, summary_date)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cashflow_entries_branch_date ON public.cashflow_entries(branch_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_cashflow_entries_type ON public.cashflow_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_cashflow_entries_category ON public.cashflow_entries(category);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_branch_date ON public.daily_summaries(branch_id, summary_date);

-- 5. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cashflow_entries_updated_at BEFORE UPDATE ON public.cashflow_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON public.daily_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Create function to automatically update daily summaries
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily summary
    INSERT INTO public.daily_summaries (branch_id, summary_date, total_expenses, total_income, total_sales, net_amount)
    SELECT 
        branch_id,
        entry_date,
        COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN entry_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN entry_type = 'sale' THEN amount ELSE 0 END), 0) as total_sales,
        COALESCE(SUM(CASE WHEN entry_type IN ('income', 'sale') THEN amount ELSE -amount END), 0) as net_amount
    FROM public.cashflow_entries
    WHERE branch_id = NEW.branch_id AND entry_date = NEW.entry_date AND is_active = TRUE
    GROUP BY branch_id, entry_date
    ON CONFLICT (branch_id, summary_date) 
    DO UPDATE SET
        total_expenses = EXCLUDED.total_expenses,
        total_income = EXCLUDED.total_income,
        total_sales = EXCLUDED.total_sales,
        net_amount = EXCLUDED.net_amount,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger to automatically update daily summaries when entries change
CREATE TRIGGER trigger_update_daily_summary
    AFTER INSERT OR UPDATE OR DELETE ON public.cashflow_entries
    FOR EACH ROW EXECUTE FUNCTION update_daily_summary();

-- 8. Insert default categories
INSERT INTO public.cashflow_categories (name, type, description, color) VALUES
-- Expense Categories
('Transport', 'expense', 'Transportation and fuel costs', '#EF4444'),
('Equipment', 'expense', 'Equipment and tools purchases', '#F59E0B'),
('Staff Essentials', 'expense', 'Staff supplies and essentials', '#8B5CF6'),
('Food', 'expense', 'Food and refreshments', '#EC4899'),
('Utilities', 'expense', 'Electricity, water, internet, etc.', '#06B6D4'),
('Rent', 'expense', 'Rental and lease payments', '#84CC16'),
('Marketing', 'expense', 'Advertising and marketing costs', '#F97316'),
('Maintenance', 'expense', 'Repairs and maintenance', '#6B7280'),
('Insurance', 'expense', 'Insurance premiums', '#10B981'),
('Other Expenses', 'expense', 'Miscellaneous expenses', '#6366F1'),

-- Income Categories
('Sales', 'income', 'Product and service sales', '#22C55E'),
('Services', 'income', 'Service fees and commissions', '#14B8A6'),
('Investments', 'income', 'Investment returns', '#F59E0B'),
('Refunds', 'income', 'Customer refunds and returns', '#8B5CF6'),
('Other Income', 'income', 'Miscellaneous income', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.cashflow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
-- Allow authenticated users to read all entries (for analysis)
CREATE POLICY "Allow authenticated users to read cashflow entries" ON public.cashflow_entries
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own entries
CREATE POLICY "Allow authenticated users to insert cashflow entries" ON public.cashflow_entries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own entries
CREATE POLICY "Allow authenticated users to update cashflow entries" ON public.cashflow_entries
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own entries
CREATE POLICY "Allow authenticated users to delete cashflow entries" ON public.cashflow_entries
    FOR DELETE USING (auth.role() = 'authenticated');

-- Categories policies
CREATE POLICY "Allow authenticated users to read categories" ON public.cashflow_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Daily summaries policies
CREATE POLICY "Allow authenticated users to read daily summaries" ON public.daily_summaries
    FOR SELECT USING (auth.role() = 'authenticated');

-- 11. Create views for easier querying
CREATE OR REPLACE VIEW public.cashflow_summary_view AS
SELECT 
    ce.branch_id,
    b.name::TEXT as branch_name,
    ce.entry_date,
    ce.entry_type,
    ce.category,
    SUM(ce.amount) as total_amount,
    COUNT(*) as entry_count
FROM public.cashflow_entries ce
JOIN public.branches b ON ce.branch_id = b.id
WHERE ce.is_active = TRUE
GROUP BY ce.branch_id, b.name, ce.entry_date, ce.entry_type, ce.category
ORDER BY ce.entry_date DESC, ce.entry_type, ce.category;

-- 12. Create function to get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_summary(p_branch_id UUID DEFAULT NULL, p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE), p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE))
RETURNS TABLE (
    branch_id UUID,
    branch_name TEXT,
    total_expenses DECIMAL(10, 2),
    total_income DECIMAL(10, 2),
    total_sales DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    days_with_entries INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ds.branch_id,
        b.name::TEXT as branch_name,
        COALESCE(SUM(ds.total_expenses), 0) as total_expenses,
        COALESCE(SUM(ds.total_income), 0) as total_income,
        COALESCE(SUM(ds.total_sales), 0) as total_sales,
        COALESCE(SUM(ds.net_amount), 0) as net_amount,
        COUNT(DISTINCT ds.summary_date) as days_with_entries
    FROM public.daily_summaries ds
    JOIN public.branches b ON ds.branch_id = b.id
    WHERE (p_branch_id IS NULL OR ds.branch_id = p_branch_id)
        AND EXTRACT(YEAR FROM ds.summary_date) = p_year
        AND EXTRACT(MONTH FROM ds.summary_date) = p_month
    GROUP BY ds.branch_id, b.name;
END;
$$ LANGUAGE plpgsql;
