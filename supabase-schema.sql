-- KQS POS Database Schema
-- This file contains all tables, relationships, and security policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE BUSINESS TABLES
-- ========================================

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variant option types table
CREATE TABLE variant_option_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'size', 'color', 'gender', 'brand', 'style'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variant options table (stores all possible options like sizes, colors, etc.)
CREATE TABLE variant_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_id UUID REFERENCES variant_option_types(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    label VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7), -- For color options
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(type_id, value)
);

-- Category variant configurations (which variant types apply to which categories)
CREATE TABLE category_variant_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    variant_type_id UUID REFERENCES variant_option_types(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, variant_type_id)
);

-- Products table
CREATE TABLE products (
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
    has_variants BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table (for products with multiple variants)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variant options (links variants to specific option values)
CREATE TABLE product_variant_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    option_id UUID REFERENCES variant_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(variant_id, option_id)
);

-- Product images table (for multiple images per product)
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    image_size INTEGER, -- in bytes
    is_main_image BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'South Africa',
    customer_type VARCHAR(20) DEFAULT 'regular', -- regular, credit, laybye
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SALES & TRANSACTIONS
-- ========================================

-- Sales transactions table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    cashier_id UUID, -- Will reference auth.users when auth is set up
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, card, credit, laybye
    payment_status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, refunded
    sale_type VARCHAR(20) DEFAULT 'regular', -- regular, credit, laybye
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items table
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- LAYBYE SYSTEM
-- ========================================

-- Laybye orders table
CREATE TABLE laybye_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    remaining_balance DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laybye items table
CREATE TABLE laybye_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laybye_order_id UUID REFERENCES laybye_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laybye payments table
CREATE TABLE laybye_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laybye_order_id UUID REFERENCES laybye_orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REFUNDS & EXCHANGES
-- ========================================

-- Refunds table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_sale_id UUID REFERENCES sales(id) ON DELETE RESTRICT,
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_method VARCHAR(50) NOT NULL, -- cash, card, credit, exchange
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, completed, rejected
    processed_by UUID, -- Will reference auth.users when auth is set up
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refund items table
CREATE TABLE refund_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id UUID REFERENCES refunds(id) ON DELETE CASCADE,
    original_sale_item_id UUID REFERENCES sale_items(id) ON DELETE RESTRICT,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INVENTORY MANAGEMENT
-- ========================================

-- Stock movements table
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL, -- in, out, adjustment, transfer
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50), -- sale, purchase, adjustment, refund
    reference_id UUID,
    notes TEXT,
    created_by UUID, -- Will reference auth.users when auth is set up
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SETTINGS & CONFIGURATION
-- ========================================

-- Business settings table
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    tax_rate DECIMAL(5,2) DEFAULT 15.00,
    currency VARCHAR(3) DEFAULT 'ZAR',
    currency_symbol VARCHAR(5) DEFAULT 'R',
    logo_url TEXT,
    receipt_footer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_has_variants ON products(has_variants);

-- Product variants indexes
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);

-- Variant options indexes
CREATE INDEX idx_variant_options_type ON variant_options(type_id);
CREATE INDEX idx_variant_options_active ON variant_options(is_active);
CREATE INDEX idx_variant_options_sort ON variant_options(sort_order);

-- Product variant options indexes
CREATE INDEX idx_product_variant_options_variant ON product_variant_options(variant_id);
CREATE INDEX idx_product_variant_options_option ON product_variant_options(option_id);

-- Product images indexes
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_variant ON product_images(variant_id);
CREATE INDEX idx_product_images_main ON product_images(is_main_image);
CREATE INDEX idx_product_images_sort ON product_images(sort_order);

-- Sales indexes
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_transaction_number ON sales(transaction_number);

-- Sale items indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_variant ON sale_items(variant_id);

-- Laybye indexes
CREATE INDEX idx_laybye_customer ON laybye_orders(customer_id);
CREATE INDEX idx_laybye_status ON laybye_orders(status);
CREATE INDEX idx_laybye_due_date ON laybye_orders(due_date);

-- Stock movements indexes
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variant_option_types_updated_at BEFORE UPDATE ON variant_option_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variant_options_updated_at BEFORE UPDATE ON variant_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_laybye_orders_updated_at BEFORE UPDATE ON laybye_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product stock when sale items are added
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product stock
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Update variant stock if variant exists
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE product_variants 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.variant_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update stock on sale item insert
CREATE TRIGGER update_stock_on_sale_item AFTER INSERT ON sale_items FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default variant option types
INSERT INTO variant_option_types (name, display_name, description, sort_order) VALUES
('size', 'Size', 'Product size options', 1),
('color', 'Color', 'Product color options', 2),
('gender', 'Gender', 'Target gender', 3),
('brand', 'Brand', 'Product brand', 4),
('style', 'Style', 'Product style', 5);

-- Insert default variant options
INSERT INTO variant_options (type_id, value, label, color_hex, sort_order) 
SELECT 
    (SELECT id FROM variant_option_types WHERE name = 'size'),
    value,
    label,
    NULL,
    sort_order
FROM (VALUES 
    ('XS', 'XS', 1),
    ('S', 'S', 2),
    ('M', 'M', 3),
    ('L', 'L', 4),
    ('XL', 'XL', 5),
    ('XXL', 'XXL', 6),
    ('XXXL', 'XXXL', 7),
    ('1', '1 UK', 8),
    ('2', '2 UK', 9),
    ('3', '3 UK', 10),
    ('4', '4 UK', 11),
    ('5', '5 UK', 12),
    ('6', '6 UK', 13),
    ('7', '7 UK', 14),
    ('8', '8 UK', 15),
    ('9', '9 UK', 16),
    ('10', '10 UK', 17),
    ('11', '11 UK', 18),
    ('12', '12 UK', 19),
    ('13', '13 UK', 20),
    ('14', '14 UK', 21),
    ('15', '15 UK', 22),
    ('20', '20 UK', 23),
    ('22', '22 UK', 24),
    ('24', '24 UK', 25),
    ('26', '26 UK', 26),
    ('28', '28 UK', 27),
    ('30', '30 UK', 28),
    ('32', '32 UK', 29),
    ('34', '34 UK', 30),
    ('36', '36 UK', 31),
    ('38', '38 UK', 32),
    ('40', '40 UK', 33),
    ('42', '42 UK', 34),
    ('44', '44 UK', 35),
    ('46', '46 UK', 36),
    ('48', '48 UK', 37),
    ('50', '50 UK', 38),
    ('One Size', 'One Size', 39)
) AS size_data(value, label, sort_order);

INSERT INTO variant_options (type_id, value, label, color_hex, sort_order) 
SELECT 
    (SELECT id FROM variant_option_types WHERE name = 'color'),
    value,
    label,
    color_hex,
    sort_order
FROM (VALUES 
    ('Black', 'Black', '#000000', 1),
    ('White', 'White', '#FFFFFF', 2),
    ('Red', 'Red', '#FF0000', 3),
    ('Blue', 'Blue', '#0000FF', 4),
    ('Green', 'Green', '#008000', 5),
    ('Yellow', 'Yellow', '#FFFF00', 6),
    ('Purple', 'Purple', '#800080', 7),
    ('Orange', 'Orange', '#FFA500', 8),
    ('Pink', 'Pink', '#FFC0CB', 9),
    ('Brown', 'Brown', '#A52A2A', 10),
    ('Gray', 'Gray', '#808080', 11),
    ('Navy', 'Navy', '#000080', 12),
    ('Beige', 'Beige', '#F5F5DC', 13),
    ('Cream', 'Cream', '#FFFDD0', 14),
    ('Maroon', 'Maroon', '#800000', 15),
    ('Burgundy', 'Burgundy', '#800020', 16),
    ('Teal', 'Teal', '#008080', 17),
    ('Olive', 'Olive', '#808000', 18),
    ('Coral', 'Coral', '#FF7F50', 19),
    ('Lavender', 'Lavender', '#E6E6FA', 20),
    ('Tan', 'Tan', '#D2B48C', 21),
    ('Silver', 'Silver', '#C0C0C0', 22),
    ('Gold', 'Gold', '#FFD700', 23)
) AS color_data(value, label, color_hex, sort_order);

INSERT INTO variant_options (type_id, value, label, sort_order) 
SELECT 
    (SELECT id FROM variant_option_types WHERE name = 'gender'),
    value,
    label,
    sort_order
FROM (VALUES 
    ('Men', 'Men', 1),
    ('Women', 'Women', 2),
    ('Unisex', 'Unisex', 3),
    ('Boys', 'Boys', 4),
    ('Girls', 'Girls', 5)
) AS gender_data(value, label, sort_order);

INSERT INTO variant_options (type_id, value, label, sort_order) 
SELECT 
    (SELECT id FROM variant_option_types WHERE name = 'brand'),
    value,
    label,
    sort_order
FROM (VALUES 
    ('Nike', 'Nike', 1),
    ('Adidas', 'Adidas', 2),
    ('Puma', 'Puma', 3),
    ('Under Armour', 'Under Armour', 4),
    ('Reebok', 'Reebok', 5),
    ('New Balance', 'New Balance', 6),
    ('Converse', 'Converse', 7),
    ('Vans', 'Vans', 8),
    ('Levi\'s', 'Levi\'s', 9),
    ('H&M', 'H&M', 10),
    ('Zara', 'Zara', 11),
    ('Uniqlo', 'Uniqlo', 12),
    ('Gap', 'Gap', 13),
    ('Tommy Hilfiger', 'Tommy Hilfiger', 14),
    ('Calvin Klein', 'Calvin Klein', 15),
    ('Ralph Lauren', 'Ralph Lauren', 16),
    ('Dr. Martens', 'Dr. Martens', 17),
    ('Timberland', 'Timberland', 18),
    ('Clarks', 'Clarks', 19),
    ('Skechers', 'Skechers', 20),
    ('ASICS', 'ASICS', 21),
    ('Brooks', 'Brooks', 22),
    ('Saucony', 'Saucony', 23),
    ('Mizuno', 'Mizuno', 24)
) AS brand_data(value, label, sort_order);

INSERT INTO variant_options (type_id, value, label, sort_order) 
SELECT 
    (SELECT id FROM variant_option_types WHERE name = 'style'),
    value,
    label,
    sort_order
FROM (VALUES 
    ('Casual', 'Casual', 1),
    ('Formal', 'Formal', 2),
    ('Sport', 'Sport', 3),
    ('Business', 'Business', 4),
    ('Evening', 'Evening', 5),
    ('Boots', 'Boots', 6),
    ('Sneakers', 'Sneakers', 7),
    ('Sandals', 'Sandals', 8),
    ('Heels', 'Heels', 9),
    ('Flats', 'Flats', 10)
) AS style_data(value, label, sort_order);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
('Clothing', 'Apparel and clothing items', '#3B82F6'),
('Shoes', 'Footwear and shoes', '#10B981'),
('Accessories', 'Fashion accessories', '#F59E0B'),
('Electronics', 'Electronic devices and gadgets', '#EF4444'),
('Home & Garden', 'Home and garden products', '#8B5CF6'),
('Sports', 'Sports equipment and gear', '#06B6D4'),
('Beauty', 'Beauty and personal care', '#EC4899'),
('Books', 'Books and publications', '#84CC16');

-- Insert default category variant configurations
INSERT INTO category_variant_configs (category_id, variant_type_id, is_required, sort_order)
SELECT 
    c.id,
    vt.id,
    CASE WHEN vt.name IN ('size', 'color') THEN true ELSE false END,
    vt.sort_order
FROM categories c
CROSS JOIN variant_option_types vt
WHERE c.name IN ('Clothing', 'Shoes', 'Accessories');

-- Insert default business settings
INSERT INTO business_settings (business_name, business_address, business_phone, business_email, tax_rate, currency, currency_symbol) VALUES
('KQS POS Store', '123 Main Street, Johannesburg, South Africa', '+27 11 123 4567', 'info@kqspos.com', 15.00, 'ZAR', 'R'); 