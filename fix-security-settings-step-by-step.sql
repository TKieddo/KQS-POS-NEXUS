-- Step 1: Add branch_id column to security_settings table
ALTER TABLE security_settings 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE CASCADE;

-- Step 2: Create index for branch_id
CREATE INDEX IF NOT EXISTS idx_security_settings_branch_id ON security_settings(branch_id);

-- Step 3: Update existing security settings to have NULL branch_id (global defaults)
UPDATE security_settings 
SET branch_id = NULL 
WHERE branch_id IS NULL;

-- Step 4: Check current state
SELECT 
    'Current security settings' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as null_branch_records,
    COUNT(CASE WHEN branch_id IS NOT NULL THEN 1 END) as branch_specific_records
FROM security_settings;

-- Step 5: Keep only the most recent record for NULL branch_id (global settings)
DELETE FROM security_settings 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM security_settings 
        WHERE branch_id IS NULL
    ) ranked 
    WHERE rn = 1
);

-- Step 6: Keep only the most recent record for each branch_id
DELETE FROM security_settings 
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY branch_id ORDER BY created_at DESC) as rn
        FROM security_settings 
        WHERE branch_id IS NOT NULL
    ) ranked 
    WHERE rn = 1
);

-- Step 7: Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_security_settings_branch_unique 
ON security_settings (COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Step 8: Update RLS policies to include branch filtering
DROP POLICY IF EXISTS "Authenticated users can view security settings" ON security_settings;
DROP POLICY IF EXISTS "Admins can manage security settings" ON security_settings;

-- New policies that include branch context
CREATE POLICY "Users can view security settings for their branch" ON security_settings
    FOR SELECT USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage security settings for their branch" ON security_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            JOIN role_permissions rp ON ur.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = auth.uid() 
            AND p.name = 'manage_settings'
            AND (
                security_settings.branch_id IS NULL OR -- Global settings
                security_settings.branch_id = u.branch_id OR -- Same branch
                u.branch_id IS NULL -- Admin without branch restriction
            )
        )
    );

-- Step 9: Insert default security settings for each existing branch
INSERT INTO security_settings (
    branch_id,
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
)
SELECT 
    b.id as branch_id,
    8 as password_min_length,
    TRUE as password_complexity,
    480 as session_timeout,
    5 as max_login_attempts,
    30 as lockout_duration,
    90 as password_expiry_days,
    FALSE as two_factor_auth,
    TRUE as account_lockout,
    FALSE as audit_log_access,
    TRUE as require_password_change,
    TRUE as enable_user_activity_logging,
    (SELECT id FROM user_roles WHERE name = 'cashier') as default_user_role
FROM branches b
WHERE b.is_active = TRUE
ON CONFLICT (COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)) DO NOTHING;

-- Step 10: Verify the migration
SELECT 
    'Security settings migration completed' as status,
    COUNT(*) as total_security_settings,
    COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as global_settings,
    COUNT(CASE WHEN branch_id IS NOT NULL THEN 1 END) as branch_specific_settings
FROM security_settings; 