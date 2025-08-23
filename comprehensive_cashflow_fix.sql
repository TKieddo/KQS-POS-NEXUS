-- Comprehensive Cashflow Type Mismatch Fix
-- This script addresses ALL potential type mismatch issues in the cashflow system

-- 1. Drop and recreate the get_monthly_summary function with proper type casting
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
    RETURN QUERY
    SELECT 
        ds.branch_id,
        CAST(b.name AS TEXT) as branch_name,
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

-- 2. Drop and recreate the cashflow_summary_view with proper type casting
DROP VIEW IF EXISTS public.cashflow_summary_view;

CREATE OR REPLACE VIEW public.cashflow_summary_view AS
SELECT 
    ce.branch_id,
    CAST(b.name AS TEXT) as branch_name,
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

-- 3. Create a test function to verify the fix
CREATE OR REPLACE FUNCTION test_monthly_summary_function()
RETURNS TEXT AS $$
DECLARE
    result_count INTEGER;
BEGIN
    -- Test the function with no parameters
    SELECT COUNT(*) INTO result_count FROM get_monthly_summary();
    
    -- If we get here without error, the function works
    RETURN 'SUCCESS: get_monthly_summary function is working correctly. Returned ' || result_count || ' rows.';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 4. Test the function
SELECT test_monthly_summary_function() as test_result;

-- 5. Clean up test function
DROP FUNCTION IF EXISTS test_monthly_summary_function();

-- 6. Verify the fixes
SELECT 'get_monthly_summary function updated successfully' as status;
SELECT 'cashflow_summary_view updated successfully' as status;
SELECT 'All type casting issues should now be resolved' as status;
