-- =====================================================
-- Fix User Activity Logs Schema - Allow Null User ID
-- =====================================================

-- Drop the existing table if it exists
DROP TABLE IF EXISTS user_activity_logs;

-- Recreate the table with nullable user_id
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_resource ON user_activity_logs(resource);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "Allow authenticated users to view activity logs" ON user_activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert activity logs" ON user_activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Alternative: If you want to disable RLS temporarily
-- ALTER TABLE user_activity_logs DISABLE ROW LEVEL SECURITY; 