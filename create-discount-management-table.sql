-- Create Discount Management Table
-- Run this in your Supabase Dashboard SQL Editor

-- Create the discount_management table if it doesn't exist
CREATE TABLE IF NOT EXISTS discount_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    discount_name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'buy_one_get_one', 'bulk')),
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discount_management_branch_id ON discount_management(branch_id);
CREATE INDEX IF NOT EXISTS idx_discount_management_is_active ON discount_management(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_management_start_date ON discount_management(start_date);
CREATE INDEX IF NOT EXISTS idx_discount_management_end_date ON discount_management(end_date);

-- Enable Row Level Security
ALTER TABLE discount_management ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discount_management
CREATE POLICY "Users can view discount management for their branch" ON discount_management
    FOR SELECT USING (true);

CREATE POLICY "Users can insert discount management for their branch" ON discount_management
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update discount management for their branch" ON discount_management
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete discount management for their branch" ON discount_management
    FOR DELETE USING (true);

-- Verify the table was created
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'discount_management' 
ORDER BY ordinal_position; 