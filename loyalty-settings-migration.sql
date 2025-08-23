-- Loyalty Program Settings Migration
-- This migration adds loyalty program functionality to the KQS POS system
-- Note: order_id in loyalty_transactions is left as UUID without foreign key constraint
-- until the orders table is created in a future migration

-- Create loyalty_settings table
CREATE TABLE IF NOT EXISTS loyalty_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    points_per_rand DECIMAL(5,2) DEFAULT 1.00,
    points_expiry_months INTEGER DEFAULT 12,
    auto_tier_upgrade BOOLEAN DEFAULT true,
    birthday_bonus_enabled BOOLEAN DEFAULT true,
    welcome_bonus_points INTEGER DEFAULT 100,
    referral_bonus_points INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_tiers table
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_spend DECIMAL(10,2) DEFAULT 0.00,
    points_multiplier DECIMAL(3,2) DEFAULT 1.00,
    benefits TEXT[] DEFAULT '{}',
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_rewards table
CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    points_cost INTEGER NOT NULL,
    type VARCHAR(20) CHECK (type IN ('discount', 'service', 'bonus', 'multiplier')) DEFAULT 'discount',
    value DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_loyalty table to track customer loyalty data
CREATE TABLE IF NOT EXISTS customer_loyalty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
    points_balance INTEGER DEFAULT 0,
    points_earned_total INTEGER DEFAULT 0,
    points_redeemed_total INTEGER DEFAULT 0,
    current_tier_spend DECIMAL(10,2) DEFAULT 0.00,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Create loyalty_transactions table to track point transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')) NOT NULL,
    points_amount INTEGER NOT NULL,
    order_id UUID, -- Will reference orders table when it exists
    reward_id UUID REFERENCES loyalty_rewards(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default loyalty settings
INSERT INTO loyalty_settings (is_active, points_per_rand, points_expiry_months, auto_tier_upgrade, birthday_bonus_enabled, welcome_bonus_points, referral_bonus_points)
VALUES (false, 1.00, 12, true, true, 100, 50)
ON CONFLICT DO NOTHING;

-- Insert default loyalty tiers
INSERT INTO loyalty_tiers (name, min_spend, points_multiplier, benefits, color, is_default, is_active) VALUES
('Bronze', 0.00, 1.00, ARRAY['Basic rewards', 'Email updates'], '#CD7F32', true, true),
('Silver', 5000.00, 1.50, ARRAY['Priority support', 'Birthday bonus', 'Exclusive offers'], '#C0C0C0', false, true),
('Gold', 15000.00, 2.00, ARRAY['VIP support', 'Double points', 'Free delivery', 'Early access'], '#FFD700', false, true),
('Platinum', 50000.00, 3.00, ARRAY['Personal account manager', 'Triple points', 'Exclusive events', 'Custom rewards'], '#E5E4E2', false, true)
ON CONFLICT DO NOTHING;

-- Insert default loyalty rewards
INSERT INTO loyalty_rewards (name, points_cost, type, value, is_active) VALUES
('R50 Discount', 500, 'discount', 50.00, true),
('R100 Discount', 1000, 'discount', 100.00, true),
('Free Delivery', 200, 'service', 0.00, true),
('Birthday Bonus', 0, 'bonus', 100.00, true),
('Double Points Day', 0, 'multiplier', 2.00, false)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loyalty_settings_active ON loyalty_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_active ON loyalty_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_min_spend ON loyalty_tiers(min_spend);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer_id ON customer_loyalty(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_tier_id ON customer_loyalty(tier_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for loyalty_settings
CREATE POLICY "Enable read access for authenticated users" ON loyalty_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON loyalty_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON loyalty_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for loyalty_tiers
CREATE POLICY "Enable read access for authenticated users" ON loyalty_tiers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON loyalty_tiers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON loyalty_tiers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON loyalty_tiers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for loyalty_rewards
CREATE POLICY "Enable read access for authenticated users" ON loyalty_rewards
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON loyalty_rewards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON loyalty_rewards
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON loyalty_rewards
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for customer_loyalty
CREATE POLICY "Enable read access for authenticated users" ON customer_loyalty
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON customer_loyalty
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON customer_loyalty
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for loyalty_transactions
CREATE POLICY "Enable read access for authenticated users" ON loyalty_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON loyalty_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_loyalty_settings_updated_at BEFORE UPDATE ON loyalty_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_tiers_updated_at BEFORE UPDATE ON loyalty_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_rewards_updated_at BEFORE UPDATE ON loyalty_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_loyalty_updated_at BEFORE UPDATE ON customer_loyalty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically assign default tier to new customers
CREATE OR REPLACE FUNCTION assign_default_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_loyalty (customer_id, tier_id, points_balance, points_earned_total, points_redeemed_total)
    SELECT 
        NEW.id,
        lt.id,
        0,
        0,
        0
    FROM loyalty_tiers lt
    WHERE lt.is_default = true AND lt.is_active = true
    LIMIT 1;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to assign default tier to new customers
CREATE TRIGGER assign_default_loyalty_tier_trigger
    AFTER INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_loyalty_tier();

-- Grant necessary permissions
GRANT ALL ON loyalty_settings TO authenticated;
GRANT ALL ON loyalty_tiers TO authenticated;
GRANT ALL ON loyalty_rewards TO authenticated;
GRANT ALL ON customer_loyalty TO authenticated;
GRANT ALL ON loyalty_transactions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 