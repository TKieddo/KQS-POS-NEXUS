-- =====================================================
-- Add Authentication Fields to Users Table
-- =====================================================

-- Add authentication-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_password_reset TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_failed_login_attempts ON users(failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Create security_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password_min_length INTEGER NOT NULL DEFAULT 8,
    password_complexity BOOLEAN NOT NULL DEFAULT TRUE,
    session_timeout INTEGER NOT NULL DEFAULT 480, -- minutes
    max_login_attempts INTEGER NOT NULL DEFAULT 5,
    lockout_duration INTEGER NOT NULL DEFAULT 30, -- minutes
    password_expiry_days INTEGER NOT NULL DEFAULT 90,
    two_factor_auth BOOLEAN NOT NULL DEFAULT FALSE,
    account_lockout BOOLEAN NOT NULL DEFAULT TRUE,
    audit_log_access BOOLEAN NOT NULL DEFAULT FALSE,
    require_password_change BOOLEAN NOT NULL DEFAULT TRUE,
    enable_user_activity_logging BOOLEAN NOT NULL DEFAULT TRUE,
    default_user_role UUID REFERENCES user_roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default security settings if none exist
-- First, get the cashier role ID
DO $$
DECLARE
    cashier_role_id UUID;
BEGIN
    -- Get the cashier role ID
    SELECT id INTO cashier_role_id 
    FROM user_roles 
    WHERE name = 'cashier' 
    LIMIT 1;
    
    -- If no cashier role exists, create it
    IF cashier_role_id IS NULL THEN
        INSERT INTO user_roles (name, description, is_system_role)
        VALUES ('cashier', 'Cashier role with basic POS access', TRUE)
        RETURNING id INTO cashier_role_id;
    END IF;
    
    -- Insert security settings with the actual role ID
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
        cashier_role_id
    ) ON CONFLICT DO NOTHING;
END $$;

-- Create user_activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for user activity logs
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- Create RLS policies for security_settings
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view security settings" ON security_settings;
DROP POLICY IF EXISTS "Admins can manage security settings" ON security_settings;

CREATE POLICY "Authenticated users can view security settings" ON security_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage security settings" ON security_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON user_activity_logs;

CREATE POLICY "Users can view their own activity logs" ON user_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" ON user_activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert activity logs" ON user_activity_logs
    FOR INSERT WITH CHECK (true);

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_logs (
        user_id,
        activity_type,
        description,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_description,
        p_ip_address,
        p_user_agent,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user account is locked
CREATE OR REPLACE FUNCTION is_user_locked(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT locked_until, failed_login_attempts INTO user_record
    FROM users WHERE id = p_user_id;
    
    IF user_record.locked_until IS NOT NULL AND user_record.locked_until > NOW() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_login_attempts(p_user_id UUID) RETURNS VOID AS $$
DECLARE
    max_attempts INTEGER;
    lockout_duration INTEGER;
BEGIN
    -- Get security settings
    SELECT max_login_attempts, lockout_duration INTO max_attempts, lockout_duration
    FROM security_settings LIMIT 1;
    
    -- Update failed attempts
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = p_user_id;
    
    -- Lock account if max attempts reached
    UPDATE users 
    SET locked_until = NOW() + (lockout_duration || ' minutes')::INTERVAL
    WHERE id = p_user_id 
    AND failed_login_attempts >= max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id UUID) RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET failed_login_attempts = 0, locked_until = NULL
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_user_activity(UUID, TEXT, TEXT, INET, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_locked(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_failed_login_attempts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_failed_login_attempts(UUID) TO authenticated; 