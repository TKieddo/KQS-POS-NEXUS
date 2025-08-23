-- =====================================================
-- Create Sample Branches
-- =====================================================

-- Insert sample branches if they don't exist
INSERT INTO branches (name, address, phone, email) VALUES
('Main Store', '123 Main Street, Johannesburg, South Africa', '+27 11 123 4567', 'main@kqspos.com'),
('North Branch', '456 North Avenue, Pretoria, South Africa', '+27 12 345 6789', 'north@kqspos.com'),
('South Branch', '789 South Road, Cape Town, South Africa', '+27 21 987 6543', 'south@kqspos.com'),
('East Branch', '321 East Boulevard, Durban, South Africa', '+27 31 456 7890', 'east@kqspos.com'),
('West Branch', '654 West Drive, Port Elizabeth, South Africa', '+27 41 123 4567', 'west@kqspos.com')
ON CONFLICT (name) DO NOTHING;

-- Update existing users to assign them to branches (optional)
-- Uncomment the lines below if you want to assign existing users to branches

-- Assign users to Main Store if they don't have a branch
-- UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Main Store' LIMIT 1) 
-- WHERE branch_id IS NULL;

-- Show current branches
SELECT id, name, address, phone, email, is_active, created_at FROM branches ORDER BY name; 