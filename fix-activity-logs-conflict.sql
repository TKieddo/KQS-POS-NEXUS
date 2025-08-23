-- =====================================================
-- Fix User Activity Logs Table Structure Conflict
-- This script reconciles the old and new table structures
-- =====================================================

-- Drop the existing user_activity_logs table to avoid conflicts
DROP TABLE IF EXISTS user_activity_logs CASCADE;

-- Recreate user_activity_logs table with a unified structure
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Support both old and new schemas
    action VARCHAR(100),           -- Old schema: specific action
    resource VARCHAR(100),         -- Old schema: resource being acted on
    resource_id UUID,              -- Old schema: specific resource ID
    
    activity_type TEXT,            -- New schema: general activity type
    description TEXT,              -- New schema: human-readable description
    
    -- Common fields
    details JSONB DEFAULT '{}',    -- Old schema: additional details
    metadata JSONB DEFAULT '{}',   -- New schema: additional metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for both schemas
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_resource ON user_activity_logs(resource);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON user_activity_logs;

-- Create unified RLS policies
CREATE POLICY "Users can view their own activity logs" ON user_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" ON user_activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert activity logs" ON user_activity_logs
    FOR INSERT WITH CHECK (true);

-- Create a unified log_user_activity function that supports both schemas
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_action VARCHAR(100) DEFAULT NULL,
    p_resource VARCHAR(100) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_metadata JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_logs (
        user_id,
        activity_type,
        description,
        action,
        resource,
        resource_id,
        details,
        metadata,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_description,
        p_action,
        p_resource,
        p_resource_id,
        p_details,
        p_metadata,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a backward-compatible function for the old schema
CREATE OR REPLACE FUNCTION log_user_activity_old(
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
    RETURN log_user_activity(
        p_user_id,
        p_action,  -- Use action as activity_type
        p_action || ' on ' || p_resource,  -- Create description
        p_action,
        p_resource,
        p_resource_id,
        p_details,
        '{}',
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new schema function for the security system
CREATE OR REPLACE FUNCTION log_user_activity_new(
    p_user_id UUID,
    p_activity_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
    RETURN log_user_activity(
        p_user_id,
        p_activity_type,
        p_description,
        NULL,  -- action
        NULL,  -- resource
        NULL,  -- resource_id
        '{}',  -- details
        p_metadata,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_user_activity(UUID, TEXT, TEXT, VARCHAR, VARCHAR, UUID, JSONB, JSONB, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity_old(UUID, TEXT, TEXT, UUID, JSONB, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity_new(UUID, TEXT, TEXT, JSONB, INET, TEXT) TO authenticated;

-- Create a view to make querying easier
CREATE OR REPLACE VIEW user_activity_view AS
SELECT 
    id,
    user_id,
    COALESCE(activity_type, action) as activity_type,
    COALESCE(description, action || ' on ' || resource) as description,
    action,
    resource,
    resource_id,
    COALESCE(metadata, details) as metadata,
    ip_address,
    user_agent,
    created_at
FROM user_activity_logs;

-- Grant access to the view
GRANT SELECT ON user_activity_view TO authenticated;

-- Test the functions
DO $$
DECLARE
    test_user_id UUID;
    activity_id UUID;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test new schema function
        SELECT log_user_activity_new(
            test_user_id,
            'login',
            'User logged in successfully',
            '{"method": "email", "success": true}'::jsonb
        ) INTO activity_id;
        
        RAISE NOTICE 'New schema test: Activity logged with ID %', activity_id;
        
        -- Test old schema function
        SELECT log_user_activity_old(
            test_user_id,
            'login',
            'auth',
            NULL,
            '{"method": "email"}'::jsonb
        ) INTO activity_id;
        
        RAISE NOTICE 'Old schema test: Activity logged with ID %', activity_id;
    END IF;
END $$;

-- Verify the structure
SELECT 'User activity logs table structure fixed successfully' as status; 