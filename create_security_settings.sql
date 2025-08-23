-- =====================================================
-- CREATE SECURITY SETTINGS TABLE
-- This table is needed for the old auth service compatibility
-- =====================================================

-- Create security_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id),
    max_failed_login_attempts INTEGER DEFAULT 5,
    lockout_duration_minutes INTEGER DEFAULT 30,
    password_expiry_days INTEGER DEFAULT 90,
    require_password_change BOOLEAN DEFAULT FALSE,
    session_timeout_minutes INTEGER DEFAULT 480,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(branch_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_settings_branch_id ON public.security_settings(branch_id);

-- Enable RLS
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Security settings are viewable by authenticated users" ON public.security_settings;
CREATE POLICY "Security settings are viewable by authenticated users" ON public.security_settings
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role can manage security settings" ON public.security_settings;
CREATE POLICY "Service role can manage security settings" ON public.security_settings
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.security_settings TO authenticated;
GRANT ALL ON public.security_settings TO service_role;

-- Insert default security settings for each branch
INSERT INTO public.security_settings (branch_id, max_failed_login_attempts, lockout_duration_minutes, password_expiry_days, require_password_change, session_timeout_minutes)
SELECT 
    id as branch_id,
    5 as max_failed_login_attempts,
    30 as lockout_duration_minutes,
    90 as password_expiry_days,
    false as require_password_change,
    480 as session_timeout_minutes
FROM public.branches
ON CONFLICT (branch_id) DO NOTHING;

-- Also insert a global setting (no branch_id)
INSERT INTO public.security_settings (branch_id, max_failed_login_attempts, lockout_duration_minutes, password_expiry_days, require_password_change, session_timeout_minutes)
VALUES (NULL, 5, 30, 90, FALSE, 480)
ON CONFLICT (branch_id) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_security_settings_updated_at ON public.security_settings;
CREATE TRIGGER update_security_settings_updated_at
    BEFORE UPDATE ON public.security_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_security_settings_updated_at();

-- Verify the table was created
SELECT 'Security settings table created successfully' as status;
SELECT COUNT(*) as total_settings FROM public.security_settings;
