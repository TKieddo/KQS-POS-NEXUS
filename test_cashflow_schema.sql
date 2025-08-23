-- Test Cashflow Schema and Functions
-- This script helps diagnose the type mismatch issue

-- 1. Check the branches table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'branches' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the get_monthly_summary function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_monthly_summary' 
AND routine_schema = 'public';

-- 3. Check the function signature
SELECT 
    parameter_name,
    parameter_mode,
    data_type,
    character_maximum_length
FROM information_schema.parameters 
WHERE specific_name = 'get_monthly_summary' 
AND specific_schema = 'public'
ORDER BY ordinal_position;

-- 4. Test a simple query to see the actual data types returned
SELECT 
    b.name,
    pg_typeof(b.name) as name_type
FROM public.branches b 
LIMIT 1;

-- 5. Test the function with explicit casting
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
WHERE EXTRACT(YEAR FROM ds.summary_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM ds.summary_date) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY ds.branch_id, b.name
LIMIT 5;

-- 6. Check if there are any existing cashflow entries
SELECT COUNT(*) as total_entries FROM public.cashflow_entries WHERE is_active = true;

-- 7. Check if there are any daily summaries
SELECT COUNT(*) as total_summaries FROM public.daily_summaries;
