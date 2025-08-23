-- Create price optimization suggestions table (simplified version without branch_id)
CREATE TABLE IF NOT EXISTS price_optimization_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_price_optimization_suggestions_product ON price_optimization_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_price_optimization_suggestions_applied ON price_optimization_suggestions(is_applied);

-- Enable RLS
ALTER TABLE price_optimization_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified without branch_id)
CREATE POLICY "Users can view price optimization suggestions" ON price_optimization_suggestions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert price optimization suggestions" ON price_optimization_suggestions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update price optimization suggestions" ON price_optimization_suggestions
    FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON price_optimization_suggestions TO authenticated; 