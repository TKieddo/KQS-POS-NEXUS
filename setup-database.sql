-- KQS POS Database Setup Script
-- Run this in your Supabase SQL editor to create the basic tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- BRANCHES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PRODUCTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit VARCHAR(50) DEFAULT 'piece',
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CUSTOMERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'South Africa',
    customer_type VARCHAR(50) DEFAULT 'regular',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SALES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    cashier_id UUID, -- Will reference users table when auth is implemented
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'completed',
    sale_type VARCHAR(50) DEFAULT 'retail',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SALE ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LAYBYE ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS laybye_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    remaining_balance DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LAYBYE ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS laybye_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laybye_order_id UUID REFERENCES laybye_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LAYBYE PAYMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS laybye_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laybye_order_id UUID REFERENCES laybye_orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REFUNDS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_method VARCHAR(50) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    processed_by UUID, -- Will reference users table when auth is implemented
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REFUND ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS refund_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id UUID REFERENCES refunds(id) ON DELETE CASCADE,
    original_sale_item_id UUID REFERENCES sale_items(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STOCK MOVEMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'sale', 'laybye', 'refund', 'manual'
    reference_id UUID,
    notes TEXT,
    created_by UUID, -- Will reference users table when auth is implemented
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- BUSINESS SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    tax_rate DECIMAL(5,2) DEFAULT 15.00,
    currency VARCHAR(10) DEFAULT 'ZAR',
    currency_symbol VARCHAR(5) DEFAULT 'R',
    logo_url TEXT,
    receipt_footer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_customer ON laybye_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_laybye_orders_status ON laybye_orders(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Insert sample categories (only if they don't exist)
INSERT INTO categories (name, description, color) 
SELECT 'Clothing', 'Apparel and fashion items', '#3B82F6'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Clothing');

INSERT INTO categories (name, description, color) 
SELECT 'Shoes', 'Footwear and accessories', '#10B981'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Shoes');

INSERT INTO categories (name, description, color) 
SELECT 'Accessories', 'Jewelry, bags, and accessories', '#F59E0B'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Accessories');

INSERT INTO categories (name, description, color) 
SELECT 'Electronics', 'Electronic devices and gadgets', '#EF4444'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Electronics');

INSERT INTO categories (name, description, color) 
SELECT 'Home & Garden', 'Home improvement and garden items', '#8B5CF6'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Home & Garden');

-- Insert sample products (only if they don't exist)
INSERT INTO products (name, description, sku, category_id, price, cost_price, stock_quantity, min_stock_level, unit) 
SELECT 
    'Summer Dress',
    'Blue floral summer dress, perfect for warm weather',
    'SKU-001',
    c.id,
    79.99,
    45.00,
    45,
    5,
    'piece'
FROM categories c WHERE c.name = 'Clothing'
AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-001');

INSERT INTO products (name, description, sku, category_id, price, cost_price, stock_quantity, min_stock_level, unit)
SELECT 
    'Slim Fit Jeans',
    'Dark blue, stretch denim jeans',
    'SKU-002',
    c.id,
    59.99,
    35.00,
    32,
    3,
    'piece'
FROM categories c WHERE c.name = 'Clothing'
AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-002');

INSERT INTO products (name, description, sku, category_id, price, cost_price, stock_quantity, min_stock_level, unit)
SELECT 
    'Classic Blazer',
    'Black, tailored fit blazer for professional wear',
    'SKU-003',
    c.id,
    129.99,
    75.00,
    18,
    2,
    'piece'
FROM categories c WHERE c.name = 'Clothing'
AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SKU-003');

-- Insert business settings (only if none exist)
INSERT INTO business_settings (business_name, business_address, business_phone, business_email, tax_rate, currency, currency_symbol)
SELECT 
    'KQS POS Store',
    '123 Main Street, Johannesburg, South Africa',
    '+27 11 123 4567',
    'info@kqspos.com',
    15.00,
    'ZAR',
    'R'
WHERE NOT EXISTS (SELECT 1 FROM business_settings);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
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

-- Drop existing policies if they exist, then recreate them
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Allow all operations on branches" ON branches;
    DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
    DROP POLICY IF EXISTS "Allow all operations on products" ON products;
    DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
    DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;
    DROP POLICY IF EXISTS "Allow all operations on sale_items" ON sale_items;
    DROP POLICY IF EXISTS "Allow all operations on laybye_orders" ON laybye_orders;
    DROP POLICY IF EXISTS "Allow all operations on laybye_items" ON laybye_items;
    DROP POLICY IF EXISTS "Allow all operations on laybye_payments" ON laybye_payments;
    DROP POLICY IF EXISTS "Allow all operations on refunds" ON refunds;
    DROP POLICY IF EXISTS "Allow all operations on refund_items" ON refund_items;
    DROP POLICY IF EXISTS "Allow all operations on stock_movements" ON stock_movements;
    DROP POLICY IF EXISTS "Allow all operations on business_settings" ON business_settings;
    
    -- Create new policies
    CREATE POLICY "Allow all operations on branches" ON branches FOR ALL USING (true);
    CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
    CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
    CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
    CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);
    CREATE POLICY "Allow all operations on sale_items" ON sale_items FOR ALL USING (true);
    CREATE POLICY "Allow all operations on laybye_orders" ON laybye_orders FOR ALL USING (true);
    CREATE POLICY "Allow all operations on laybye_items" ON laybye_items FOR ALL USING (true);
    CREATE POLICY "Allow all operations on laybye_payments" ON laybye_payments FOR ALL USING (true);
    CREATE POLICY "Allow all operations on refunds" ON refunds FOR ALL USING (true);
    CREATE POLICY "Allow all operations on refund_items" ON refund_items FOR ALL USING (true);
    CREATE POLICY "Allow all operations on stock_movements" ON stock_movements FOR ALL USING (true);
    CREATE POLICY "Allow all operations on business_settings" ON business_settings FOR ALL USING (true);
END $$;

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE branches IS 'Store branches/locations';
COMMENT ON TABLE categories IS 'Product categories for organization';
COMMENT ON TABLE products IS 'Product catalog with inventory tracking';
COMMENT ON TABLE customers IS 'Customer information and credit accounts';
COMMENT ON TABLE sales IS 'Sales transactions';
COMMENT ON TABLE sale_items IS 'Individual items in sales transactions';
COMMENT ON TABLE laybye_orders IS 'Laybye orders for customers';
COMMENT ON TABLE laybye_items IS 'Items in laybye orders';
COMMENT ON TABLE laybye_payments IS 'Payments made on laybye orders';
COMMENT ON TABLE refunds IS 'Refund transactions';
COMMENT ON TABLE refund_items IS 'Individual items being refunded';
COMMENT ON TABLE stock_movements IS 'Stock movement history for audit trail';
COMMENT ON TABLE business_settings IS 'Business configuration and settings'; 