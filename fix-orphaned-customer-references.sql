-- Fix Orphaned Customer References in Laybye Orders
-- This script handles customer IDs that exist in laybye_orders but not in customers table

-- ========================================
-- FIX ORPHANED CUSTOMER REFERENCES IN LAYBYE ORDERS
-- ========================================

-- Check for orphaned customer references (laybye_orders with customer_id that don't exist in customers table)
SELECT 
    lo.id as laybye_order_id,
    lo.order_number,
    lo.customer_id,
    lo.created_at
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL;

-- Count orphaned references
SELECT 
    COUNT(*) as orphaned_customer_references
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL;

-- ========================================
-- ADD CUSTOMER_NAME FIELD TO LAYBYE_ORDERS TABLE
-- ========================================

-- Add customer_name column to laybye_orders table
ALTER TABLE laybye_orders 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Add customer_phone column for additional customer info
ALTER TABLE laybye_orders 
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);

-- Add customer_email column for additional customer info
ALTER TABLE laybye_orders 
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- ========================================
-- CREATE FUNCTION TO GET CUSTOMER DISPLAY NAME
-- ========================================

-- Function to get customer display name with proper fallback
CREATE OR REPLACE FUNCTION get_customer_display_name(
    p_customer_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_customer RECORD;
    v_display_name TEXT;
BEGIN
    -- Get customer details
    SELECT 
        first_name,
        last_name,
        email,
        phone
    INTO v_customer
    FROM customers
    WHERE id = p_customer_id;
    
    IF NOT FOUND THEN
        RETURN 'Unknown Customer';
    END IF;
    
    -- Build display name with fallbacks
    IF v_customer.first_name IS NOT NULL AND v_customer.first_name != '' THEN
        IF v_customer.last_name IS NOT NULL AND v_customer.last_name != '' THEN
            v_display_name := v_customer.first_name || ' ' || v_customer.last_name;
        ELSE
            v_display_name := v_customer.first_name;
        END IF;
    ELSIF v_customer.last_name IS NOT NULL AND v_customer.last_name != '' THEN
        v_display_name := v_customer.last_name;
    ELSIF v_customer.email IS NOT NULL AND v_customer.email != '' THEN
        v_display_name := v_customer.email;
    ELSIF v_customer.phone IS NOT NULL AND v_customer.phone != '' THEN
        v_display_name := 'Customer (' || v_customer.phone || ')';
    ELSE
        v_display_name := 'Unknown Customer';
    END IF;
    
    RETURN v_display_name;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE TRIGGER TO AUTO-POPULATE CUSTOMER_NAME
-- ========================================

-- Function to update customer name when laybye order is inserted or updated
CREATE OR REPLACE FUNCTION update_laybye_customer_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer name when customer_id is set or changed
    IF NEW.customer_id IS NOT NULL THEN
        NEW.customer_name := get_customer_display_name(NEW.customer_id);
        
        -- Also update customer phone and email
        SELECT phone, email INTO NEW.customer_phone, NEW.customer_email
        FROM customers 
        WHERE id = NEW.customer_id;
    ELSE
        NEW.customer_name := 'Walk-in Customer';
        NEW.customer_phone := NULL;
        NEW.customer_email := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS trigger_update_laybye_customer_name_insert ON laybye_orders;
CREATE TRIGGER trigger_update_laybye_customer_name_insert
    BEFORE INSERT ON laybye_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_laybye_customer_name();

-- Create trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_update_laybye_customer_name_update ON laybye_orders;
CREATE TRIGGER trigger_update_laybye_customer_name_update
    BEFORE UPDATE ON laybye_orders
    FOR EACH ROW
    WHEN (OLD.customer_id IS DISTINCT FROM NEW.customer_id)
    EXECUTE FUNCTION update_laybye_customer_name();

-- ========================================
-- UPDATE EXISTING LAYBYE ORDERS WITH CUSTOMER NAMES
-- ========================================

-- Update all existing laybye orders with customer names
UPDATE laybye_orders 
SET 
    customer_name = get_customer_display_name(customer_id),
    customer_phone = c.phone,
    customer_email = c.email
FROM customers c
WHERE laybye_orders.customer_id = c.id;

-- Update laybye orders with NULL customer_id
UPDATE laybye_orders 
SET customer_name = 'Walk-in Customer'
WHERE customer_id IS NULL;

-- ========================================
-- CREATE TRIGGER TO UPDATE LAYBYE ORDERS WHEN CUSTOMER IS UPDATED
-- ========================================

-- Function to update laybye orders when customer data changes
CREATE OR REPLACE FUNCTION update_laybye_orders_on_customer_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all laybye orders for this customer
    UPDATE laybye_orders 
    SET 
        customer_name = get_customer_display_name(NEW.id),
        customer_phone = NEW.phone,
        customer_email = NEW.email
    WHERE customer_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on customers table
DROP TRIGGER IF EXISTS trigger_update_laybye_orders_on_customer_change ON customers;
CREATE TRIGGER trigger_update_laybye_orders_on_customer_change
    AFTER UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_laybye_orders_on_customer_change();

-- ========================================
-- ADD FOREIGN KEY CONSTRAINT (if not exists)
-- ========================================

-- Check if foreign key constraint exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'laybye_orders'
  AND kcu.column_name = 'customer_id';

-- Add foreign key constraint if it doesn't exist
-- Note: This will fail if there are orphaned references
-- ALTER TABLE laybye_orders 
-- ADD CONSTRAINT laybye_orders_customer_id_fkey 
-- FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- ========================================
-- CLEAN UP ORPHANED REFERENCES (OPTIONAL)
-- ========================================

-- Option 1: Set orphaned customer_id to NULL
-- UPDATE laybye_orders 
-- SET customer_id = NULL 
-- WHERE customer_id IN (
--     SELECT lo.customer_id
--     FROM laybye_orders lo
--     LEFT JOIN customers c ON lo.customer_id = c.id
--     WHERE lo.customer_id IS NOT NULL 
--       AND c.id IS NULL
-- );

-- Option 2: Delete laybye orders with orphaned customer references (DANGEROUS!)
-- DELETE FROM laybye_orders 
-- WHERE customer_id IN (
--     SELECT lo.customer_id
--     FROM laybye_orders lo
--     LEFT JOIN customers c ON lo.customer_id = c.id
--     WHERE lo.customer_id IS NOT NULL 
--       AND c.id IS NULL
-- );

-- ========================================
-- VERIFY CUSTOMER DATA INTEGRITY
-- ========================================

-- Check laybye orders with customer data
SELECT 
    lo.id,
    lo.order_number,
    lo.customer_id,
    lo.customer_name,
    lo.customer_phone,
    lo.customer_email,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    lo.created_at
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL
ORDER BY lo.created_at DESC
LIMIT 10;

-- Count laybye orders by customer status
SELECT 
    CASE 
        WHEN c.id IS NULL THEN 'No Customer'
        WHEN c.first_name IS NULL OR c.first_name = '' THEN 'Customer (No Name)'
        ELSE 'Customer (Has Name)'
    END as customer_status,
    COUNT(*) as count
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
GROUP BY 
    CASE 
        WHEN c.id IS NULL THEN 'No Customer'
        WHEN c.first_name IS NULL OR c.first_name = '' THEN 'Customer (No Name)'
        ELSE 'Customer (Has Name)'
    END;

-- ========================================
-- CREATE ENHANCED VIEW FOR LAYBYE ORDERS
-- ========================================

-- Drop the existing view if it exists
DROP VIEW IF EXISTS laybye_orders_with_customers;

-- Create view for laybye orders with customer information
CREATE VIEW laybye_orders_with_customers AS
SELECT 
    lo.id,
    lo.order_number,
    lo.customer_id,
    lo.customer_name,
    lo.customer_phone,
    lo.customer_email,
    lo.total_amount,
    lo.deposit_amount,
    lo.remaining_balance,
    lo.remaining_amount,
    lo.status,
    lo.due_date,
    lo.created_at,
    lo.updated_at,
    lo.branch_id,
    lo.cashier_id,
    -- Customer information from customers table (for reference)
    c.first_name,
    c.last_name,
    c.email as customer_table_email,
    c.phone as customer_table_phone
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id;

-- Test the view
SELECT 
    order_number,
    customer_name,
    customer_phone,
    total_amount,
    status,
    created_at
FROM laybye_orders_with_customers
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- INDEX OPTIMIZATION
-- ========================================

-- Ensure proper indexes exist for customer lookups
CREATE INDEX IF NOT EXISTS idx_laybye_orders_customer_id_lookup 
ON laybye_orders(customer_id) 
WHERE customer_id IS NOT NULL;

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_laybye_orders_customer_status 
ON laybye_orders(customer_id, status) 
WHERE customer_id IS NOT NULL;

-- Index for customer name searches
CREATE INDEX IF NOT EXISTS idx_laybye_orders_customer_name 
ON laybye_orders(customer_name);

-- ========================================
-- DATA VALIDATION QUERIES
-- ========================================

-- Validate that all laybye orders have valid customer references
SELECT 
    'Laybye orders with invalid customer references' as check_type,
    COUNT(*) as count
FROM laybye_orders lo
LEFT JOIN customers c ON lo.customer_id = c.id
WHERE lo.customer_id IS NOT NULL 
  AND c.id IS NULL

UNION ALL

SELECT 
    'Laybye orders with valid customer references' as check_type,
    COUNT(*) as count
FROM laybye_orders lo
INNER JOIN customers c ON lo.customer_id = c.id

UNION ALL

SELECT 
    'Laybye orders with no customer (NULL customer_id)' as check_type,
    COUNT(*) as count
FROM laybye_orders lo
WHERE lo.customer_id IS NULL;

-- Check customer name population
SELECT 
    'Laybye orders with customer names populated' as check_type,
    COUNT(*) as count
FROM laybye_orders 
WHERE customer_name IS NOT NULL AND customer_name != ''

UNION ALL

SELECT 
    'Laybye orders without customer names' as check_type,
    COUNT(*) as count
FROM laybye_orders 
WHERE customer_name IS NULL OR customer_name = '';

-- ========================================
-- CLEANUP RECOMMENDATIONS
-- ========================================

/*
RECOMMENDED ACTIONS:

1. First, run the orphaned reference check to see how many issues exist
2. If orphaned references exist, decide on cleanup strategy:
   - Set customer_id to NULL (preserves laybye order)
   - Delete laybye orders (loses data)
   - Restore missing customers (if possible)

3. After cleanup, add the foreign key constraint:
   ALTER TABLE laybye_orders 
   ADD CONSTRAINT laybye_orders_customer_id_fkey 
   FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

4. Use the enhanced view for better customer name display in the application

5. Monitor for future orphaned references by running the validation queries regularly
*/
