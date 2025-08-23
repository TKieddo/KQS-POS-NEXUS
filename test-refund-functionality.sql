-- Test Refund Functionality
-- Run this in your Supabase SQL editor to verify everything is working

-- ========================================
-- 1. CHECK BRANCHES
-- ========================================
SELECT 'Available Branches:' as info;
SELECT id, name, is_active FROM branches ORDER BY name;

-- ========================================
-- 2. CHECK USERS AND BRANCH ASSIGNMENTS
-- ========================================
SELECT 'Users and Their Branches:' as info;
SELECT 
    u.id,
    u.full_name,
    u.email,
    b.name as branch_name,
    b.id as branch_id
FROM users u
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.full_name;

-- ========================================
-- 3. CHECK CUSTOMERS WITH ACCOUNT BALANCES
-- ========================================
SELECT 'Customers with Account Balances:' as info;
SELECT 
    customer_number,
    first_name,
    last_name,
    email,
    current_balance,
    credit_limit,
    status,
    branch_id
FROM customers 
ORDER BY first_name, last_name;

-- ========================================
-- 4. CHECK SALES DATA
-- ========================================
SELECT 'Recent Sales:' as info;
SELECT 
    s.transaction_number,
    s.total_amount,
    s.payment_method,
    s.created_at,
    c.first_name || ' ' || c.last_name as customer_name,
    b.name as branch_name
FROM sales s
LEFT JOIN customers c ON s.customer_id = c.id
LEFT JOIN branches b ON s.branch_id = b.id
ORDER BY s.created_at DESC
LIMIT 10;

-- ========================================
-- 5. CHECK SALE ITEMS
-- ========================================
SELECT 'Sale Items Available for Refund:' as info;
SELECT 
    si.id as sale_item_id,
    s.transaction_number,
    p.name as product_name,
    p.sku,
    si.quantity,
    si.unit_price,
    si.total_price,
    s.created_at as sale_date,
    c.first_name || ' ' || c.last_name as customer_name
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
JOIN products p ON si.product_id = p.id
LEFT JOIN customers c ON s.customer_id = c.id
LEFT JOIN branches b ON s.branch_id = b.id
WHERE NOT EXISTS (
    SELECT 1 FROM refund_items ri 
    WHERE ri.original_sale_item_id = si.id
)
ORDER BY s.created_at DESC
LIMIT 10;

-- ========================================
-- 6. CHECK REFUNDS TABLE
-- ========================================
SELECT 'Refunds Table Structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'refunds'
ORDER BY ordinal_position;

-- ========================================
-- 7. CHECK REFUND_ITEMS TABLE
-- ========================================
SELECT 'Refund Items Table Structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'refund_items'
ORDER BY ordinal_position;

-- ========================================
-- 8. CHECK RLS POLICIES
-- ========================================
SELECT 'RLS Policies for Refunds:' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('refunds', 'refund_items')
ORDER BY tablename, policyname;

-- ========================================
-- 9. TEST DATA SUMMARY
-- ========================================
SELECT 'Test Data Summary:' as info;
SELECT 
    'Branches' as table_name,
    COUNT(*) as count
FROM branches
UNION ALL
SELECT 
    'Customers' as table_name,
    COUNT(*) as count
FROM customers
UNION ALL
SELECT 
    'Products' as table_name,
    COUNT(*) as count
FROM products
UNION ALL
SELECT 
    'Sales' as table_name,
    COUNT(*) as count
FROM sales
UNION ALL
SELECT 
    'Sale Items' as table_name,
    COUNT(*) as count
FROM sale_items
UNION ALL
SELECT 
    'Refunds' as table_name,
    COUNT(*) as count
FROM refunds
UNION ALL
SELECT 
    'Refund Items' as table_name,
    COUNT(*) as count
FROM refund_items;

-- ========================================
-- 10. VERIFY BRANCH ISOLATION
-- ========================================
SELECT 'Branch Isolation Test:' as info;
SELECT 
    b.name as branch_name,
    COUNT(DISTINCT s.id) as sales_count,
    COUNT(DISTINCT si.id) as sale_items_count,
    COUNT(DISTINCT c.id) as customers_count
FROM branches b
LEFT JOIN sales s ON b.id = s.branch_id
LEFT JOIN sale_items si ON s.id = si.sale_id
LEFT JOIN customers c ON b.id = c.branch_id
GROUP BY b.id, b.name
ORDER BY b.name;
