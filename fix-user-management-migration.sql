-- =====================================================
-- Simplified User Management Migration (Fix RLS Issues)
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROLE PERMISSIONS JUNCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- =====================================================
-- USERS TABLE (Simplified)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES user_roles(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECURITY SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    password_min_length INTEGER DEFAULT 8,
    password_complexity BOOLEAN DEFAULT TRUE,
    session_timeout INTEGER DEFAULT 480, -- minutes
    max_login_attempts INTEGER DEFAULT 5,
    lockout_duration INTEGER DEFAULT 30, -- minutes
    password_expiry_days INTEGER DEFAULT 90,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    account_lockout BOOLEAN DEFAULT TRUE,
    audit_log_access BOOLEAN DEFAULT FALSE,
    require_password_change BOOLEAN DEFAULT TRUE,
    enable_user_activity_logging BOOLEAN DEFAULT TRUE,
    default_user_role UUID REFERENCES user_roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Role permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- User activity logs indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_resource ON user_activity_logs(resource);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default permissions
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

-- Insert default roles
INSERT INTO user_roles (name, description, is_system_role) VALUES
('admin', 'Full system administrator with all permissions', TRUE),
('manager', 'Store manager with most permissions except user management', TRUE),
('cashier', 'Cashier with sales and basic inventory permissions', TRUE),
('viewer', 'Read-only access to most data', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'admin'),
    id
FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager gets most permissions except user/role management
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'manager'),
    id
FROM permissions
WHERE name NOT IN ('manage_users', 'view_users', 'manage_roles', 'view_roles')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Cashier gets sales and basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'cashier'),
    id
FROM permissions
WHERE name IN (
    'view_dashboard',
    'view_products',
    'view_customers',
    'manage_sales',
    'view_sales',
    'process_refunds',
    'view_refunds',
    'view_inventory',
    'view_laybye',
    'view_reports'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer gets read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM user_roles WHERE name = 'viewer'),
    id
FROM permissions
WHERE name LIKE 'view_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insert default security settings
INSERT INTO security_settings (
    password_min_length,
    password_complexity,
    session_timeout,
    max_login_attempts,
    lockout_duration,
    password_expiry_days,
    two_factor_auth,
    account_lockout,
    audit_log_access,
    require_password_change,
    enable_user_activity_logging,
    default_user_role
) VALUES (
    8,
    TRUE,
    480,
    5,
    30,
    90,
    FALSE,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    (SELECT id FROM user_roles WHERE name = 'cashier')
) ON CONFLICT DO NOTHING;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
DROP TRIGGER IF EXISTS update_security_settings_updated_at ON security_settings;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TEMPORARILY DISABLE RLS (Fix Recursion Issues)
-- =====================================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations on permissions" ON permissions;
DROP POLICY IF EXISTS "Allow all operations on role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Allow all operations on security_settings" ON security_settings;
DROP POLICY IF EXISTS "Allow all operations on user_activity_logs" ON user_activity_logs;

-- Temporarily DISABLE RLS to avoid recursion issues
-- We'll re-enable with proper policies later
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs DISABLE ROW LEVEL SECURITY;

-- Note: RLS will be re-enabled with proper policies in a future migration
-- after we have the authentication system properly set up

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
DROP FUNCTION IF EXISTS log_user_activity(UUID, VARCHAR, VARCHAR, UUID, JSONB);
DROP FUNCTION IF EXISTS log_user_activity(UUID, VARCHAR, VARCHAR, UUID);
DROP FUNCTION IF EXISTS log_user_activity(UUID, VARCHAR, VARCHAR);

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE(permission_name VARCHAR(100), resource VARCHAR(100), action VARCHAR(100)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.resource, p.action
    FROM users u
    JOIN user_roles ur ON u.role_id = ur.id
    JOIN role_permissions rp ON ur.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = user_id AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_resource VARCHAR(100),
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO user_activity_logs (user_id, action, resource, resource_id, details)
    VALUES (p_user_id, p_action, p_resource, p_resource_id, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 