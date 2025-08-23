-- Fix type mismatch issues in cashflow system
-- This script addresses the "Returned type character varying(100) does not match expected type text" error

-- 1. Update the get_monthly_summary function to explicitly cast branch_name to TEXT
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

-- 2. Update the cashflow_summary_view to explicitly cast branch_name to TEXT
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

-- 3. Verify the fixes
SELECT 'get_monthly_summary function updated successfully' as status;
SELECT 'cashflow_summary_view updated successfully' as status;
