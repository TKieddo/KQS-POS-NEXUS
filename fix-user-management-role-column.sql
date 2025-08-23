-- =====================================================
-- Fix User Management Role Column Issue
-- =====================================================

-- Add role_id column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES user_roles(id) ON DELETE SET NULL;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles if they don't exist
INSERT INTO user_roles (name, description, is_system_role) VALUES
('admin', 'Full system administrator with all permissions', TRUE),
('manager', 'Store manager with most permissions except user management', TRUE),
('cashier', 'Cashier with sales and basic inventory permissions', TRUE),
('viewer', 'Read-only access to most data', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Create permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Insert basic permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('view_dashboard', 'View dashboard and analytics', 'dashboard', 'read'),
('manage_products', 'Full product management', 'products', 'manage'),
('view_products', 'View products only', 'products', 'read'),
('manage_customers', 'Full customer management', 'customers', 'manage'),
('view_customers', 'View customers only', 'customers', 'read'),
('manage_sales', 'Full sales management', 'sales', 'manage'),
('view_sales', 'View sales only', 'sales', 'read'),
('process_refunds', 'Process refunds and exchanges', 'refunds', 'manage'),
('view_refunds', 'View refunds only', 'refunds', 'read'),
('manage_inventory', 'Full inventory management', 'inventory', 'manage'),
('view_inventory', 'View inventory only', 'inventory', 'read'),
('manage_laybye', 'Full laybye management', 'laybye', 'manage'),
('view_laybye', 'View laybye only', 'laybye', 'read'),
('manage_reports', 'Full reports access', 'reports', 'manage'),
('view_reports', 'View reports only', 'reports', 'read'),
('manage_settings', 'Full settings management', 'settings', 'manage'),
('view_settings', 'View settings only', 'settings', 'read'),
('manage_users', 'Full user management', 'users', 'manage'),
('view_users', 'View users only', 'users', 'read'),
('manage_roles', 'Full role management', 'roles', 'manage'),
('view_roles', 'View roles only', 'roles', 'read')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'admin'),
    id
FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign basic permissions to manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'manager'),
    id
FROM permissions
WHERE name IN (
    'view_dashboard', 'manage_products', 'view_products', 'manage_customers', 
    'view_customers', 'manage_sales', 'view_sales', 'process_refunds', 
    'view_refunds', 'manage_inventory', 'view_inventory', 'manage_laybye', 
    'view_laybye', 'manage_reports', 'view_reports', 'view_settings'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign sales permissions to cashier role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'cashier'),
    id
FROM permissions
WHERE name IN (
    'view_dashboard', 'view_products', 'view_customers', 'manage_sales', 
    'view_sales', 'process_refunds', 'view_refunds', 'view_inventory', 
    'manage_laybye', 'view_laybye'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign view permissions to viewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'viewer'),
    id
FROM permissions
WHERE name IN (
    'view_dashboard', 'view_products', 'view_customers', 'view_sales', 
    'view_refunds', 'view_inventory', 'view_laybye', 'view_reports'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may need to adjust these based on your auth setup)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view roles" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view permissions" ON permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Update function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 