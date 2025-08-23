-- Robust Cashflow Fix
-- This script creates a more robust version of the get_monthly_summary function

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS get_monthly_summary(UUID, INTEGER, INTEGER);

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
    -- If no data exists, return empty result set
    IF NOT EXISTS (
        SELECT 1 FROM public.daily_summaries ds
        WHERE (p_branch_id IS NULL OR ds.branch_id = p_branch_id)
            AND EXTRACT(YEAR FROM ds.summary_date) = p_year
            AND EXTRACT(MONTH FROM ds.summary_date) = p_month
    ) THEN
        RETURN;
    END IF;

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

-- Test the function
SELECT 'Function updated successfully' as status;

-- Test with current month (should return empty if no data)
SELECT * FROM get_monthly_summary();

-- Test with a specific year/month (adjust as needed)
SELECT * FROM get_monthly_summary(NULL, 2024, 12);
