-- Debug Cashflow System
-- This script helps identify what's causing the empty error

-- 1. Check if tables exist and have data
SELECT 'cashflow_entries' as table_name, COUNT(*) as row_count FROM public.cashflow_entries WHERE is_active = true
UNION ALL
SELECT 'daily_summaries' as table_name, COUNT(*) as row_count FROM public.daily_summaries
UNION ALL
SELECT 'cashflow_categories' as table_name, COUNT(*) as row_count FROM public.cashflow_categories WHERE is_active = true;

-- 2. Check if branches table has data
SELECT COUNT(*) as branch_count FROM public.branches;

-- 3. Test the function with explicit parameters
SELECT * FROM get_monthly_summary(
    NULL, -- p_branch_id (NULL for all branches)
    EXTRACT(YEAR FROM CURRENT_DATE), -- p_year
    EXTRACT(MONTH FROM CURRENT_DATE) -- p_month
);

-- 4. Test a simpler query to see if the join works
SELECT 
    ds.branch_id,
    b.name,
    COUNT(*) as summary_count
FROM public.daily_summaries ds
JOIN public.branches b ON ds.branch_id = b.id
GROUP BY ds.branch_id, b.name
LIMIT 5;

-- 5. Check if there are any daily summaries for the current month
SELECT 
    summary_date,
    total_expenses,
    total_income,
    total_sales,
    net_amount
FROM public.daily_summaries 
WHERE EXTRACT(YEAR FROM summary_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM summary_date) = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY summary_date DESC
LIMIT 10;

-- 6. Test the function with a specific branch (if you have one)
SELECT 
    id,
    name
FROM public.branches 
LIMIT 1;
