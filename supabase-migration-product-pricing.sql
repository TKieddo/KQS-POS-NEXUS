-- Product & Pricing Settings Migration
-- This migration creates tables for product pricing rules, settings, and configurations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Product Pricing Settings Table
CREATE TABLE IF NOT EXISTS product_pricing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Pricing Configuration
    default_markup DECIMAL(5,2) DEFAULT 25.00,
    price_rounding VARCHAR(10) DEFAULT 'nearest' CHECK (price_rounding IN ('nearest', 'up', 'down')),
    
    -- Inventory Settings
    low_stock_threshold INTEGER DEFAULT 10,
    reorder_point INTEGER DEFAULT 5,
    
    -- Product Options
    enable_barcode_scanning BOOLEAN DEFAULT true,
    auto_generate_sku BOOLEAN DEFAULT true,
    require_barcode BOOLEAN DEFAULT false,
    allow_negative_stock BOOLEAN DEFAULT false,
    enable_auto_pricing BOOLEAN DEFAULT true,
    enable_bulk_pricing BOOLEAN DEFAULT false,
    enable_seasonal_pricing BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Product Pricing Rules Table
CREATE TABLE IF NOT EXISTS product_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Rule Details
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('markup', 'discount', 'fixed')),
    value DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Rule Conditions (for future use)
    conditions JSONB DEFAULT '{}',
    
    -- Priority for rule ordering
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Product Categories Pricing Rules (for category-specific pricing)
CREATE TABLE IF NOT EXISTS product_category_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    pricing_rule_id UUID REFERENCES product_pricing_rules(id) ON DELETE CASCADE,
    
    -- Override settings
    override_markup DECIMAL(5,2),
    override_price_rounding VARCHAR(10),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(category_id, pricing_rule_id)
);

-- Product Pricing History (for audit trail)
CREATE TABLE IF NOT EXISTS product_pricing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Price Changes
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    price_change_reason VARCHAR(255),
    
    -- Applied Rules
    applied_rules JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Bulk Pricing Operations (for bulk price updates)
CREATE TABLE IF NOT EXISTS bulk_pricing_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Operation Details
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('markup_update', 'discount_apply', 'price_fix', 'bulk_import')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Operation Parameters
    parameters JSONB NOT NULL,
    affected_products_count INTEGER DEFAULT 0,
    
    -- Results
    results JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id)
);

-- Seasonal Pricing Rules
CREATE TABLE IF NOT EXISTS seasonal_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Seasonal Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Date Range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Pricing Rules
    markup_adjustment DECIMAL(5,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Applicable Categories/Products
    applicable_categories JSONB DEFAULT '[]',
    applicable_products JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_pricing_settings_business_id ON product_pricing_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_business_id ON product_pricing_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_type ON product_pricing_rules(type);
CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_active ON product_pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_product_category_pricing_rules_category ON product_category_pricing_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_history_product ON product_pricing_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_history_created_at ON product_pricing_history(created_at);
CREATE INDEX IF NOT EXISTS idx_bulk_pricing_operations_business ON bulk_pricing_operations(business_id);
CREATE INDEX IF NOT EXISTS idx_bulk_pricing_operations_status ON bulk_pricing_operations(status);
CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_rules_business ON seasonal_pricing_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_rules_dates ON seasonal_pricing_rules(start_date, end_date);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_product_pricing_settings_updated_at 
    BEFORE UPDATE ON product_pricing_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_pricing_rules_updated_at 
    BEFORE UPDATE ON product_pricing_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_category_pricing_rules_updated_at 
    BEFORE UPDATE ON product_category_pricing_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_pricing_rules_updated_at 
    BEFORE UPDATE ON seasonal_pricing_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default pricing settings for existing businesses
INSERT INTO product_pricing_settings (business_id, default_markup, price_rounding, low_stock_threshold, reorder_point)
SELECT id, 25.00, 'nearest', 10, 5
FROM businesses
WHERE id NOT IN (SELECT business_id FROM product_pricing_settings);

-- Insert default pricing rules for existing businesses
INSERT INTO product_pricing_rules (business_id, name, type, value, description, is_active, priority)
SELECT 
    b.id,
    'Standard Markup',
    'markup',
    25.00,
    'Default markup for regular products',
    true,
    1
FROM businesses b
WHERE b.id NOT IN (SELECT business_id FROM product_pricing_rules WHERE name = 'Standard Markup');

INSERT INTO product_pricing_rules (business_id, name, type, value, description, is_active, priority)
SELECT 
    b.id,
    'Premium Markup',
    'markup',
    40.00,
    'Higher markup for premium products',
    true,
    2
FROM businesses b
WHERE b.id NOT IN (SELECT business_id FROM product_pricing_rules WHERE name = 'Premium Markup');

INSERT INTO product_pricing_rules (business_id, name, type, value, description, is_active, priority)
SELECT 
    b.id,
    'Bulk Discount',
    'discount',
    10.00,
    'Discount for bulk purchases',
    true,
    3
FROM businesses b
WHERE b.id NOT IN (SELECT business_id FROM product_pricing_rules WHERE name = 'Bulk Discount');

-- Row Level Security (RLS) Policies
ALTER TABLE product_pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_pricing_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_pricing_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_pricing_settings
CREATE POLICY "Users can view their business pricing settings" ON product_pricing_settings
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their business pricing settings" ON product_pricing_settings
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert pricing settings for their business" ON product_pricing_settings
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies for product_pricing_rules
CREATE POLICY "Users can view their business pricing rules" ON product_pricing_rules
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their business pricing rules" ON product_pricing_rules
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Users can view their business category pricing rules" ON product_category_pricing_rules
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their business category pricing rules" ON product_category_pricing_rules
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can view their business pricing history" ON product_pricing_history
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their business bulk operations" ON bulk_pricing_operations
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their business bulk operations" ON bulk_pricing_operations
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can view their business seasonal rules" ON seasonal_pricing_rules
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their business seasonal rules" ON seasonal_pricing_rules
    FOR ALL USING (
        business_id IN (
            SELECT business_id FROM user_business_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Comments for documentation
COMMENT ON TABLE product_pricing_settings IS 'Stores business-wide product pricing configuration settings';
COMMENT ON TABLE product_pricing_rules IS 'Stores custom pricing rules that can be applied to products';
COMMENT ON TABLE product_category_pricing_rules IS 'Links pricing rules to specific product categories';
COMMENT ON TABLE product_pricing_history IS 'Audit trail of all product price changes';
COMMENT ON TABLE bulk_pricing_operations IS 'Tracks bulk pricing operations and their results';
COMMENT ON TABLE seasonal_pricing_rules IS 'Stores seasonal pricing rules for time-based price adjustments'; 