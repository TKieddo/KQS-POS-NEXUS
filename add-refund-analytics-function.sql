-- Add missing get_refund_analytics function
-- Run this script to add the analytics function that's missing from the database

-- ========================================
-- FUNCTION TO GET REFUND ANALYTICS
-- ========================================

CREATE OR REPLACE FUNCTION get_refund_analytics(
    p_branch_id UUID DEFAULT NULL,
    p_period VARCHAR(20) DEFAULT 'week'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_date TIMESTAMP;
    v_analytics JSON;
BEGIN
    -- Calculate start date based on period
    CASE p_period
        WHEN 'today' THEN
            v_start_date := date_trunc('day', now());
        WHEN 'week' THEN
            v_start_date := date_trunc('week', now());
        WHEN 'month' THEN
            v_start_date := date_trunc('month', now());
        WHEN 'quarter' THEN
            v_start_date := date_trunc('quarter', now());
        WHEN 'year' THEN
            v_start_date := date_trunc('year', now());
        WHEN 'all' THEN
            v_start_date := '1970-01-01'::timestamp;
        ELSE
            v_start_date := date_trunc('week', now());
    END CASE;

    -- Get analytics data
    SELECT json_build_object(
        'dailyRefunds', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'date', date_trunc('day', processed_at)::date,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            ), '[]'::json)
            FROM (
                SELECT processed_at, refund_amount
                FROM refunds
                WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
                  AND processed_at >= v_start_date
            ) daily_data
            GROUP BY date_trunc('day', processed_at)
            ORDER BY date_trunc('day', processed_at)
        ),
        'methodBreakdown', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'method', refund_method,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            ), '[]'::json)
            FROM refunds
            WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
              AND processed_at >= v_start_date
            GROUP BY refund_method
            ORDER BY COUNT(*) DESC
        ),
        'statusBreakdown', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'status', status,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            ), '[]'::json)
            FROM refunds
            WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
              AND processed_at >= v_start_date
            GROUP BY status
            ORDER BY COUNT(*) DESC
        ),
        'topReasons', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'reason', reason,
                    'count', COUNT(*),
                    'amount', COALESCE(SUM(refund_amount), 0)
                )
            ), '[]'::json)
            FROM refunds
            WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
              AND processed_at >= v_start_date
            GROUP BY reason
            ORDER BY COUNT(*) DESC
            LIMIT 10
        ),
        'period', p_period,
        'start_date', v_start_date
    ) INTO v_analytics
    FROM refunds
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id)
      AND processed_at >= v_start_date
    LIMIT 1;

    -- Return analytics with default values if no data
    RETURN COALESCE(v_analytics, json_build_object(
        'dailyRefunds', '[]'::json,
        'methodBreakdown', '[]'::json,
        'statusBreakdown', '[]'::json,
        'topReasons', '[]'::json,
        'period', p_period,
        'start_date', v_start_date
    ));
END;
$$;

-- Verify the function was created
SELECT 
    routine_name,
    CASE 
        WHEN routine_name = 'get_refund_analytics' 
        THEN '✅ Created Successfully' 
        ELSE '❌ Failed to create' 
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_refund_analytics';
