-- KQS POS Row Level Security (RLS) Policies
-- This script creates policies to allow anonymous access to necessary tables
-- Run this in your Supabase SQL editor

-- ========================================
-- ENABLE RLS ON TABLES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_option_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_variant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laybye_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CATEGORIES POLICIES
-- ========================================

-- Allow anonymous users to read categories
CREATE POLICY "Allow anonymous read categories" ON categories
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert categories
CREATE POLICY "Allow authenticated insert categories" ON categories
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update categories
CREATE POLICY "Allow authenticated update categories" ON categories
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete categories (soft delete)
CREATE POLICY "Allow authenticated delete categories" ON categories
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- VARIANT OPTION TYPES POLICIES
-- ========================================

-- Allow anonymous users to read variant option types
CREATE POLICY "Allow anonymous read variant_option_types" ON variant_option_types
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert variant option types
CREATE POLICY "Allow authenticated insert variant_option_types" ON variant_option_types
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update variant option types
CREATE POLICY "Allow authenticated update variant_option_types" ON variant_option_types
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- VARIANT OPTIONS POLICIES
-- ========================================

-- Allow anonymous users to read variant options
CREATE POLICY "Allow anonymous read variant_options" ON variant_options
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert variant options
CREATE POLICY "Allow authenticated insert variant_options" ON variant_options
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update variant options
CREATE POLICY "Allow authenticated update variant_options" ON variant_options
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- CATEGORY VARIANT CONFIGS POLICIES
-- ========================================

-- Allow anonymous users to read category variant configs
CREATE POLICY "Allow anonymous read category_variant_configs" ON category_variant_configs
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert category variant configs
CREATE POLICY "Allow authenticated insert category_variant_configs" ON category_variant_configs
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update category variant configs
CREATE POLICY "Allow authenticated update category_variant_configs" ON category_variant_configs
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- PRODUCTS POLICIES
-- ========================================

-- Allow anonymous users to read products
CREATE POLICY "Allow anonymous read products" ON products
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated insert products" ON products
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products
CREATE POLICY "Allow authenticated update products" ON products
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete products (soft delete)
CREATE POLICY "Allow authenticated delete products" ON products
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- PRODUCT VARIANTS POLICIES
-- ========================================

-- Allow anonymous users to read product variants
CREATE POLICY "Allow anonymous read product_variants" ON product_variants
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert product variants
CREATE POLICY "Allow authenticated insert product_variants" ON product_variants
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update product variants
CREATE POLICY "Allow authenticated update product_variants" ON product_variants
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- PRODUCT VARIANT OPTIONS POLICIES
-- ========================================

-- Allow anonymous users to read product variant options
CREATE POLICY "Allow anonymous read product_variant_options" ON product_variant_options
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert product variant options
CREATE POLICY "Allow authenticated insert product_variant_options" ON product_variant_options
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update product variant options
CREATE POLICY "Allow authenticated update product_variant_options" ON product_variant_options
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- PRODUCT IMAGES POLICIES
-- ========================================

-- Allow anonymous users to read product images
CREATE POLICY "Allow anonymous read product_images" ON product_images
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert product images
CREATE POLICY "Allow authenticated insert product_images" ON product_images
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update product images
CREATE POLICY "Allow authenticated update product_images" ON product_images
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- CUSTOMERS POLICIES
-- ========================================

-- Allow anonymous users to read customers
CREATE POLICY "Allow anonymous read customers" ON customers
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert customers
CREATE POLICY "Allow authenticated insert customers" ON customers
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update customers
CREATE POLICY "Allow authenticated update customers" ON customers
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- SALES POLICIES
-- ========================================

-- Allow anonymous users to read sales
CREATE POLICY "Allow anonymous read sales" ON sales
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert sales
CREATE POLICY "Allow authenticated insert sales" ON sales
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update sales
CREATE POLICY "Allow authenticated update sales" ON sales
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- SALE ITEMS POLICIES
-- ========================================

-- Allow anonymous users to read sale items
CREATE POLICY "Allow anonymous read sale_items" ON sale_items
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert sale items
CREATE POLICY "Allow authenticated insert sale_items" ON sale_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- LAYBYE ORDERS POLICIES
-- ========================================

-- Allow anonymous users to read laybye orders
CREATE POLICY "Allow anonymous read laybye_orders" ON laybye_orders
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert laybye orders
CREATE POLICY "Allow authenticated insert laybye_orders" ON laybye_orders
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update laybye orders
CREATE POLICY "Allow authenticated update laybye_orders" ON laybye_orders
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- LAYBYE ITEMS POLICIES
-- ========================================

-- Allow anonymous users to read laybye items
CREATE POLICY "Allow anonymous read laybye_items" ON laybye_items
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert laybye items
CREATE POLICY "Allow authenticated insert laybye_items" ON laybye_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- LAYBYE PAYMENTS POLICIES
-- ========================================

-- Allow anonymous users to read laybye payments
CREATE POLICY "Allow anonymous read laybye_payments" ON laybye_payments
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert laybye payments
CREATE POLICY "Allow authenticated insert laybye_payments" ON laybye_payments
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- REFUNDS POLICIES
-- ========================================

-- Allow anonymous users to read refunds
CREATE POLICY "Allow anonymous read refunds" ON refunds
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert refunds
CREATE POLICY "Allow authenticated insert refunds" ON refunds
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update refunds
CREATE POLICY "Allow authenticated update refunds" ON refunds
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- REFUND ITEMS POLICIES
-- ========================================

-- Allow anonymous users to read refund items
CREATE POLICY "Allow anonymous read refund_items" ON refund_items
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert refund items
CREATE POLICY "Allow authenticated insert refund_items" ON refund_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- STOCK MOVEMENTS POLICIES
-- ========================================

-- Allow anonymous users to read stock movements
CREATE POLICY "Allow anonymous read stock_movements" ON stock_movements
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert stock movements
CREATE POLICY "Allow authenticated insert stock_movements" ON stock_movements
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- BUSINESS SETTINGS POLICIES
-- ========================================

-- Allow anonymous users to read business settings
CREATE POLICY "Allow anonymous read business_settings" ON business_settings
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert business settings
CREATE POLICY "Allow authenticated insert business_settings" ON business_settings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update business settings
CREATE POLICY "Allow authenticated update business_settings" ON business_settings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

SELECT 'KQS POS RLS policies created successfully!' as status; 