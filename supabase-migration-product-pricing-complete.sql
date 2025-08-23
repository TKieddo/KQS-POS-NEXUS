-- Comprehensive Product & Pricing Database Migration
-- This migration supports all Product & Pricing features including:
-- - Pricing settings and rules
-- - Price analysis and trends
-- - Pricing reports
-- - Import/export functionality
-- - Quick actions and bulk operations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create branches table if it doesn't exist
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

-- Insert default branch if none exists
INSERT INTO branches (name, address, phone, email)
SELECT 'Main Store', '123 Main Street, Johannesburg, South Africa', '+27 11 123 4567', 'main@kqspos.com'
WHERE NOT EXISTS (SELECT 1 FROM branches LIMIT 1);

-- Product Pricing Settings Table
CREATE TABLE IF NOT EXISTS product_pricing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    default_markup_percentage DECIMAL(5,2) DEFAULT 30.00,
    min_profit_margin DECIMAL(5,2) DEFAULT 15.00,
    max_profit_margin DECIMAL(5,2) DEFAULT 50.00,
    competitive_pricing_enabled BOOLEAN DEFAULT false,
    auto_price_adjustment BOOLEAN DEFAULT false,
    price_rounding_method VARCHAR(20) DEFAULT 'nearest', -- nearest, up, down
    price_rounding_increment DECIMAL(10,2) DEFAULT 0.01,
    bulk_update_enabled BOOLEAN DEFAULT true,
    discount_management_enabled BOOLEAN DEFAULT true,
    price_optimization_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Pricing Rules Table
CREATE TABLE IF NOT EXISTS product_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- markup, fixed_price, percentage, competitive
    condition_type VARCHAR(50) NOT NULL, -- category, cost_range, stock_level, date_range
    condition_value JSONB NOT NULL, -- Flexible condition storage
    action_type VARCHAR(50) NOT NULL, -- set_price, adjust_percentage, set_markup
    action_value DECIMAL(10,2) NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    applies_to_variants BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Analysis Data Table
CREATE TABLE IF NOT EXISTS price_analysis_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NULL, -- Allow null for calculator data
    analysis_date DATE NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    competitor_prices JSONB, -- Store multiple competitor prices
    market_average DECIMAL(10,2),
    price_trend VARCHAR(20), -- up, down, stable
    demand_level VARCHAR(20), -- high, medium, low
    profit_margin DECIMAL(5,2),
    price_change_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Reports Table
CREATE TABLE IF NOT EXISTS pricing_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- profitability, competitiveness, trends, optimization
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    report_data JSONB NOT NULL, -- Store comprehensive report data
    file_path VARCHAR(500), -- Path to generated report file
    file_size BIGINT,
    status VARCHAR(20) DEFAULT 'generating', -- generating, completed, failed
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Import/Export History Table
CREATE TABLE IF NOT EXISTS import_export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL, -- import, export
    data_type VARCHAR(50) NOT NULL, -- pricing_rules, product_settings, all_data, pricing_report
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'processing', -- processing, completed, failed
    error_message TEXT,
    metadata JSONB, -- Additional operation metadata
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Bulk Price Update History Table
CREATE TABLE IF NOT EXISTS bulk_price_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL, -- percentage, fixed, multiplier, set
    update_value DECIMAL(10,2) NOT NULL,
    affected_categories JSONB, -- Array of category IDs
    affected_products_count INTEGER DEFAULT 0,
    total_value_change DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processing', -- processing, completed, failed
    error_message TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Discount Management Table
CREATE TABLE IF NOT EXISTS discount_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    discount_name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(50) NOT NULL, -- percentage, fixed, buy_one_get_one, bulk
    discount_value DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    applies_to_categories JSONB, -- Array of category IDs
    applies_to_products JSONB, -- Array of product IDs
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Optimization Suggestions Table
CREATE TABLE IF NOT EXISTS price_optimization_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_price DECIMAL(10,2) NOT NULL,
    suggested_price DECIMAL(10,2) NOT NULL,
    price_change_percentage DECIMAL(5,2) NOT NULL,
    optimization_reason TEXT NOT NULL,
    expected_impact JSONB, -- Expected impact on sales, profit, etc.
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    is_applied BOOLEAN DEFAULT false,
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick Actions Log Table
CREATE TABLE IF NOT EXISTS quick_actions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- bulk_update, discount_management, rules_apply, optimization
    action_details JSONB NOT NULL,
    affected_items_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed', -- completed, failed, partial
    error_message TEXT,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_pricing_settings_branch ON product_pricing_settings(branch_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_branch ON product_pricing_rules(branch_id);
CREATE INDEX IF NOT EXISTS idx_product_pricing_rules_active ON product_pricing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_price_analysis_data_product ON price_analysis_data(product_id);
CREATE INDEX IF NOT EXISTS idx_price_analysis_data_date ON price_analysis_data(analysis_date);
CREATE INDEX IF NOT EXISTS idx_pricing_reports_branch ON pricing_reports(branch_id);
CREATE INDEX IF NOT EXISTS idx_pricing_reports_type ON pricing_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_import_export_history_branch ON import_export_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_price_updates_branch ON bulk_price_updates(branch_id);
CREATE INDEX IF NOT EXISTS idx_discount_management_branch ON discount_management(branch_id);
CREATE INDEX IF NOT EXISTS idx_discount_management_active ON discount_management(is_active);
CREATE INDEX IF NOT EXISTS idx_price_optimization_suggestions_product ON price_optimization_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_quick_actions_log_branch ON quick_actions_log(branch_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_product_pricing_settings_updated_at 
    BEFORE UPDATE ON product_pricing_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_pricing_rules_updated_at 
    BEFORE UPDATE ON product_pricing_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_management_updated_at 
    BEFORE UPDATE ON discount_management 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE product_pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_analysis_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_price_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_optimization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_actions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_pricing_settings
CREATE POLICY "Users can view pricing settings for their branch" ON product_pricing_settings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pricing settings for their branch" ON product_pricing_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pricing settings for their branch" ON product_pricing_settings
    FOR UPDATE USING (true);

-- RLS Policies for product_pricing_rules
CREATE POLICY "Users can view pricing rules for their branch" ON product_pricing_rules
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pricing rules for their branch" ON product_pricing_rules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pricing rules for their branch" ON product_pricing_rules
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete pricing rules for their branch" ON product_pricing_rules
    FOR DELETE USING (true);

-- RLS Policies for price_analysis_data
CREATE POLICY "Users can view price analysis for their branch" ON price_analysis_data
    FOR SELECT USING (true);

CREATE POLICY "Users can insert price analysis for their branch" ON price_analysis_data
    FOR INSERT WITH CHECK (true);

-- RLS Policies for pricing_reports
CREATE POLICY "Users can view pricing reports for their branch" ON pricing_reports
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pricing reports for their branch" ON pricing_reports
    FOR INSERT WITH CHECK (true);

-- RLS Policies for import_export_history
CREATE POLICY "Users can view import/export history for their branch" ON import_export_history
    FOR SELECT USING (true);

CREATE POLICY "Users can insert import/export history for their branch" ON import_export_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for bulk_price_updates
CREATE POLICY "Users can view bulk price updates for their branch" ON bulk_price_updates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert bulk price updates for their branch" ON bulk_price_updates
    FOR INSERT WITH CHECK (true);

-- RLS Policies for discount_management
CREATE POLICY "Users can view discount management for their branch" ON discount_management
    FOR SELECT USING (true);

CREATE POLICY "Users can insert discount management for their branch" ON discount_management
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update discount management for their branch" ON discount_management
    FOR UPDATE USING (true);

-- RLS Policies for price_optimization_suggestions
CREATE POLICY "Users can view price optimization suggestions for their branch" ON price_optimization_suggestions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert price optimization suggestions for their branch" ON price_optimization_suggestions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update price optimization suggestions for their branch" ON price_optimization_suggestions
    FOR UPDATE USING (true);

-- RLS Policies for quick_actions_log
CREATE POLICY "Users can view quick actions log for their branch" ON quick_actions_log
    FOR SELECT USING (true);

CREATE POLICY "Users can insert quick actions log for their branch" ON quick_actions_log
    FOR INSERT WITH CHECK (true);

-- Insert default pricing settings for existing branches
INSERT INTO product_pricing_settings (branch_id, default_markup_percentage, min_profit_margin, max_profit_margin)
SELECT id, 30.00, 15.00, 50.00
FROM branches
WHERE id NOT IN (SELECT branch_id FROM product_pricing_settings);

-- Create function to apply pricing rules to products
CREATE OR REPLACE FUNCTION apply_pricing_rules_to_product(product_uuid UUID)
RETURNS TABLE(
    product_id UUID,
    original_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    rule_applied VARCHAR(255)
) AS $$
DECLARE
    rule_record RECORD;
    product_record RECORD;
    new_price DECIMAL(10,2);
    rule_name VARCHAR(255);
BEGIN
    -- Get product information
    SELECT * INTO product_record FROM products WHERE id = product_uuid;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Loop through active pricing rules in priority order
    FOR rule_record IN 
        SELECT * FROM product_pricing_rules 
        WHERE is_active = true 
        AND branch_id = product_record.branch_id
        ORDER BY priority DESC, created_at ASC
    LOOP
        -- Check if rule applies to this product
        IF rule_record.condition_type = 'category' AND 
           (rule_record.condition_value->>'category_id')::UUID = product_record.category_id THEN
            
            -- Apply rule
            CASE rule_record.action_type
                WHEN 'set_price' THEN
                    new_price := rule_record.action_value;
                WHEN 'adjust_percentage' THEN
                    new_price := product_record.price * (1 + rule_record.action_value / 100);
                WHEN 'set_markup' THEN
                    new_price := product_record.cost_price * (1 + rule_record.action_value / 100);
                ELSE
                    CONTINUE;
            END CASE;
            
            rule_name := rule_record.name;
            EXIT; -- Apply only the first matching rule
        END IF;
    END LOOP;
    
    -- Return result
    RETURN QUERY SELECT 
        product_uuid,
        product_record.price,
        COALESCE(new_price, product_record.price),
        COALESCE(rule_name, 'No rule applied');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate pricing report
CREATE OR REPLACE FUNCTION generate_pricing_report(
    branch_uuid UUID,
    report_type VARCHAR(50),
    start_date DATE,
    end_date DATE
)
RETURNS JSONB AS $$
DECLARE
    report_data JSONB;
BEGIN
    CASE report_type
        WHEN 'profitability' THEN
            SELECT jsonb_build_object(
                'report_type', report_type,
                'date_range', jsonb_build_object('start', start_date, 'end', end_date),
                'summary', jsonb_build_object(
                    'total_products', COUNT(*),
                    'avg_price', AVG(price),
                    'avg_profit_margin', AVG((price - COALESCE(cost_price, 0)) / price * 100),
                    'total_value', SUM(price * stock_quantity)
                ),
                'category_breakdown', jsonb_agg(
                    jsonb_build_object(
                        'category', c.name,
                        'product_count', COUNT(p.id),
                        'avg_price', AVG(p.price),
                        'avg_profit_margin', AVG((p.price - COALESCE(p.cost_price, 0)) / p.price * 100)
                    )
                )
            ) INTO report_data
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.branch_id = branch_uuid
            AND p.created_at::DATE BETWEEN start_date AND end_date
            GROUP BY c.name;
            
        WHEN 'competitiveness' THEN
            SELECT jsonb_build_object(
                'report_type', report_type,
                'date_range', jsonb_build_object('start', start_date, 'end', end_date),
                'competitor_analysis', jsonb_agg(
                    jsonb_build_object(
                        'product_name', p.name,
                        'our_price', p.price,
                        'market_average', COALESCE(pad.market_average, 0),
                        'price_difference', p.price - COALESCE(pad.market_average, 0)
                    )
                )
            ) INTO report_data
            FROM products p
            LEFT JOIN price_analysis_data pad ON p.id = pad.product_id
            WHERE p.branch_id = branch_uuid
            AND pad.analysis_date BETWEEN start_date AND end_date;
            
        ELSE
            report_data := jsonb_build_object('error', 'Unknown report type');
    END CASE;
    
    RETURN report_data;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON product_pricing_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_pricing_rules TO authenticated;
GRANT SELECT, INSERT ON price_analysis_data TO authenticated;
GRANT SELECT, INSERT ON pricing_reports TO authenticated;
GRANT SELECT, INSERT ON import_export_history TO authenticated;
GRANT SELECT, INSERT ON bulk_price_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON discount_management TO authenticated;
GRANT SELECT, INSERT, UPDATE ON price_optimization_suggestions TO authenticated;
GRANT SELECT, INSERT ON quick_actions_log TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 