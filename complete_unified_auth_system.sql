-- =====================================================
-- COMPLETE UNIFIED AUTHENTICATION SYSTEM
-- Clean slate setup - drops existing and creates new
-- =====================================================

-- 1. DROP ALL EXISTING AUTH TABLES (Clean slate)
DROP TABLE IF EXISTS public.pos_public_user_branches CASCADE;
DROP TABLE IF EXISTS public.pos_public_users CASCADE;
DROP TABLE IF EXISTS public.user_activity_logs CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.user_branches CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.security_settings CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.pos_sign_in(text, text, uuid);
DROP FUNCTION IF EXISTS public.pos_create_public_user(text, text, text, uuid[]);
DROP FUNCTION IF EXISTS public.pos_set_pin(uuid, text);
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, text, uuid);

-- 2. CREATE USER ROLES TABLE (Simple but complete)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    can_access_admin BOOLEAN NOT NULL DEFAULT FALSE,
    can_access_pos BOOLEAN NOT NULL DEFAULT FALSE,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE USERS TABLE (Unified for both admin and POS)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES public.user_roles(id),
    branch_id UUID REFERENCES public.branches(id),
    
    -- Authentication fields
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    pos_pin VARCHAR(6), -- For quick POS access
    
    -- Tracking fields
    last_login TIMESTAMP WITH TIME ZONE,
    last_pos_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE USER BRANCHES (For multi-branch access)
CREATE TABLE public.user_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, branch_id)
);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role_id ON public.users(role_id);
CREATE INDEX idx_users_branch_id ON public.users(branch_id);
CREATE INDEX idx_users_is_active ON public.users(is_active);
CREATE INDEX idx_users_pos_pin ON public.users(pos_pin) WHERE pos_pin IS NOT NULL;

CREATE INDEX idx_user_branches_user_id ON public.user_branches(user_id);
CREATE INDEX idx_user_branches_branch_id ON public.user_branches(branch_id);

-- 6. INSERT SYSTEM ROLES
INSERT INTO public.user_roles (name, display_name, description, permissions, can_access_admin, can_access_pos) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', 
 '{"users": "manage", "roles": "manage", "branches": "manage", "products": "manage", "sales": "manage", "reports": "manage", "settings": "manage"}', 
 TRUE, TRUE),

('admin', 'Administrator', 'Full administrative access except user management', 
 '{"branches": "manage", "products": "manage", "sales": "manage", "reports": "manage", "settings": "manage", "customers": "manage", "inventory": "manage"}', 
 TRUE, TRUE),

('manager', 'Store Manager', 'Store management with reporting access', 
 '{"products": "manage", "sales": "manage", "reports": "view", "customers": "manage", "inventory": "manage", "laybye": "manage"}', 
 TRUE, TRUE),

('cashier', 'Cashier', 'POS operations and basic customer management', 
 '{"sales": "manage", "customers": "view", "products": "view", "laybye": "manage"}', 
 FALSE, TRUE),

('pos_only', 'POS Only User', 'Limited POS access for specific operations', 
 '{"sales": "create", "customers": "view", "products": "view"}', 
 FALSE, TRUE);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_branches ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT TO authenticated
    USING (email = auth.email());

DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- User roles policies (readable by authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;
CREATE POLICY "Service role can manage roles" ON public.user_roles
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- User branches policies
DROP POLICY IF EXISTS "Users can view their branch assignments" ON public.user_branches;
CREATE POLICY "Users can view their branch assignments" ON public.user_branches
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE email = auth.email())
    );

DROP POLICY IF EXISTS "Service role can manage branch assignments" ON public.user_branches;
CREATE POLICY "Service role can manage branch assignments" ON public.user_branches
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- 9. GRANT PERMISSIONS
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.user_branches TO authenticated;

GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.user_branches TO service_role;

-- 10. CREATE AUTHENTICATION FUNCTIONS

-- Function to get user with role information
CREATE OR REPLACE FUNCTION public.get_user_with_role(user_email text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'full_name', u.full_name,
        'role_id', u.role_id,
        'branch_id', u.branch_id,
        'is_active', u.is_active,
        'role', jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'display_name', r.display_name,
            'permissions', r.permissions,
            'can_access_admin', r.can_access_admin,
            'can_access_pos', r.can_access_pos
        ),
        'branches', COALESCE(
            (SELECT jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name))
             FROM public.user_branches ub
             JOIN public.branches b ON b.id = ub.branch_id
             WHERE ub.user_id = u.id),
            '[]'::jsonb
        )
    ) INTO result
    FROM public.users u
    JOIN public.user_roles r ON r.id = u.role_id
    WHERE u.email = user_email AND u.is_active = TRUE;
    
    RETURN result;
END;
$$;

-- Function for POS authentication with PIN
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(
    user_email text,
    user_pin text DEFAULT NULL,
    branch_id uuid DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
    user_data JSONB;
    has_branch_access BOOLEAN := FALSE;
BEGIN
    -- Get user with role info
    SELECT public.get_user_with_role(user_email) INTO user_data;
    
    IF user_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check if user can access POS
    IF NOT (user_data->'role'->>'can_access_pos')::BOOLEAN THEN
        RETURN NULL;
    END IF;
    
    -- Verify PIN if provided and user has PIN set
    IF user_pin IS NOT NULL AND (user_data->>'pos_pin') IS NOT NULL THEN
        IF (user_data->>'pos_pin') != user_pin THEN
            RETURN NULL;
        END IF;
    END IF;
    
    -- Check branch access if branch_id provided
    IF branch_id IS NOT NULL THEN
        -- Check if user is assigned to this branch
        SELECT EXISTS(
            SELECT 1 FROM public.user_branches ub
            WHERE ub.user_id = (user_data->>'id')::UUID
            AND ub.branch_id = authenticate_pos_user.branch_id
        ) INTO has_branch_access;
        
        -- If no specific assignment, check primary branch
        IF NOT has_branch_access THEN
            SELECT ((user_data->>'branch_id')::UUID = authenticate_pos_user.branch_id)
            INTO has_branch_access;
        END IF;
        
        IF NOT has_branch_access THEN
            RETURN NULL;
        END IF;
    END IF;
    
    -- Update last POS login
    UPDATE public.users 
    SET last_pos_login = NOW()
    WHERE id = (user_data->>'id')::UUID;
    
    RETURN user_data;
END;
$$;

-- 11. GRANT EXECUTE PERMISSIONS ON FUNCTIONS
GRANT EXECUTE ON FUNCTION public.get_user_with_role(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.authenticate_pos_user(text, text, uuid) TO authenticated, anon;

-- 12. CREATE DEFAULT SUPER ADMIN USER
-- This creates a user account that needs to be matched with Supabase Auth
INSERT INTO public.users (
    email, 
    full_name, 
    role_id, 
    is_active
) VALUES (
    'admin@kqs.com', 
    'System Administrator', 
    (SELECT id FROM public.user_roles WHERE name = 'super_admin'),
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 13. CREATE SAMPLE USERS FOR TESTING
INSERT INTO public.users (email, full_name, role_id, pos_pin, is_active) VALUES
('manager@kqs.com', 'Store Manager', (SELECT id FROM public.user_roles WHERE name = 'manager'), '1234', TRUE),
('cashier@kqs.com', 'Main Cashier', (SELECT id FROM public.user_roles WHERE name = 'cashier'), '5678', TRUE),
('pos@kqs.com', 'POS User', (SELECT id FROM public.user_roles WHERE name = 'pos_only'), '9999', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 14. CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. FINAL VERIFICATION QUERY
SELECT 
    'Setup Complete' as status,
    (SELECT COUNT(*) FROM public.user_roles) as total_roles,
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.users WHERE pos_pin IS NOT NULL) as pos_users,
    (SELECT email FROM public.users WHERE role_id = (SELECT id FROM public.user_roles WHERE name = 'super_admin') LIMIT 1) as admin_email;

-- 16. INSTRUCTIONS
/*
SETUP INSTRUCTIONS:

1. Run this entire script in Supabase SQL Editor

2. Create Supabase Auth users for each email:
   - admin@kqs.com (password: choose strong password)
   - manager@kqs.com (password: manager123 or choose your own)
   - cashier@kqs.com (password: cashier123 or choose your own)  
   - pos@kqs.com (password: pos123 or choose your own)

3. Test admin access:
   - Login with admin@kqs.com → should access admin dashboard

4. Test POS access:
   - Login with cashier@kqs.com + PIN 5678 → should access POS
   - Login with pos@kqs.com + PIN 9999 → should access POS only

ROLE PERMISSIONS:
- super_admin: Full access to everything
- admin: Admin dashboard + POS (no user management)
- manager: Admin dashboard + POS (limited)
- cashier: POS only + basic admin views
- pos_only: POS only (no admin dashboard)

The system is now unified and simple!
*/
