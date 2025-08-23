-- Migration for Data Management Settings
-- This creates tables for backup, export, and data management settings

-- =====================================================
-- DATA MANAGEMENT SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS data_management_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    
    -- Backup settings
    auto_backup_enabled BOOLEAN DEFAULT TRUE,
    backup_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    backup_time TIME DEFAULT '02:00:00',
    backup_retention_days INTEGER DEFAULT 30,
    backup_include_files BOOLEAN DEFAULT TRUE,
    backup_include_media BOOLEAN DEFAULT TRUE,
    
    -- Export settings
    default_export_format VARCHAR(10) DEFAULT 'csv', -- csv, excel, pdf, json
    export_date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    export_include_headers BOOLEAN DEFAULT TRUE,
    export_max_rows INTEGER DEFAULT 10000,
    export_compression_enabled BOOLEAN DEFAULT TRUE,
    
    -- Cleanup settings
    auto_cleanup_enabled BOOLEAN DEFAULT FALSE,
    cleanup_frequency VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, quarterly
    cleanup_retention_days INTEGER DEFAULT 365,
    cleanup_include_logs BOOLEAN DEFAULT TRUE,
    cleanup_include_temp_files BOOLEAN DEFAULT TRUE,
    cleanup_include_old_backups BOOLEAN DEFAULT TRUE,
    
    -- Archive settings
    archive_enabled BOOLEAN DEFAULT FALSE,
    archive_frequency VARCHAR(20) DEFAULT 'yearly', -- monthly, quarterly, yearly
    archive_retention_years INTEGER DEFAULT 7,
    archive_compression_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BACKUP HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    backup_type VARCHAR(20) NOT NULL, -- manual, automatic, scheduled
    backup_size BIGINT, -- in bytes
    backup_format VARCHAR(10) DEFAULT 'sql', -- sql, zip, tar
    backup_location VARCHAR(500), -- file path or cloud location
    backup_status VARCHAR(20) DEFAULT 'completed', -- pending, in_progress, completed, failed
    backup_notes TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPORT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    export_type VARCHAR(50) NOT NULL, -- sales, inventory, customers, etc.
    export_format VARCHAR(10) NOT NULL, -- csv, excel, pdf, json
    export_size BIGINT, -- in bytes
    export_location VARCHAR(500), -- file path or download URL
    export_status VARCHAR(20) DEFAULT 'completed', -- pending, in_progress, completed, failed
    export_filters JSONB, -- filters applied to export
    export_notes TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CLEANUP HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cleanup_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    cleanup_type VARCHAR(50) NOT NULL, -- logs, temp_files, old_backups, etc.
    items_processed INTEGER DEFAULT 0,
    items_deleted INTEGER DEFAULT 0,
    space_freed BIGINT, -- in bytes
    cleanup_status VARCHAR(20) DEFAULT 'completed', -- pending, in_progress, completed, failed
    cleanup_notes TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Data management settings indexes
CREATE INDEX IF NOT EXISTS idx_data_management_settings_branch_id ON data_management_settings(branch_id);

-- Backup history indexes
CREATE INDEX IF NOT EXISTS idx_backup_history_branch_id ON backup_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_user_id ON backup_history(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(backup_status);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at);

-- Export history indexes
CREATE INDEX IF NOT EXISTS idx_export_history_branch_id ON export_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(export_status);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);

-- Cleanup history indexes
CREATE INDEX IF NOT EXISTS idx_cleanup_history_branch_id ON cleanup_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_user_id ON cleanup_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_status ON cleanup_history(cleanup_status);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_created_at ON cleanup_history(created_at);

-- =====================================================
-- UNIQUE CONSTRAINTS
-- =====================================================

-- One data management setting per branch
CREATE UNIQUE INDEX IF NOT EXISTS idx_data_management_settings_branch_unique 
ON data_management_settings (COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default data management settings for each branch
INSERT INTO data_management_settings (
    branch_id,
    auto_backup_enabled,
    backup_frequency,
    backup_time,
    backup_retention_days,
    backup_include_files,
    backup_include_media,
    default_export_format,
    export_date_format,
    export_include_headers,
    export_max_rows,
    export_compression_enabled,
    auto_cleanup_enabled,
    cleanup_frequency,
    cleanup_retention_days,
    cleanup_include_logs,
    cleanup_include_temp_files,
    cleanup_include_old_backups,
    archive_enabled,
    archive_frequency,
    archive_retention_years,
    archive_compression_enabled
)
SELECT 
    b.id as branch_id,
    TRUE as auto_backup_enabled,
    'daily' as backup_frequency,
    '02:00:00' as backup_time,
    30 as backup_retention_days,
    TRUE as backup_include_files,
    TRUE as backup_include_media,
    'csv' as default_export_format,
    'YYYY-MM-DD' as export_date_format,
    TRUE as export_include_headers,
    10000 as export_max_rows,
    TRUE as export_compression_enabled,
    FALSE as auto_cleanup_enabled,
    'monthly' as cleanup_frequency,
    365 as cleanup_retention_days,
    TRUE as cleanup_include_logs,
    TRUE as cleanup_include_temp_files,
    TRUE as cleanup_include_old_backups,
    FALSE as archive_enabled,
    'yearly' as archive_frequency,
    7 as archive_retention_years,
    TRUE as archive_compression_enabled
FROM branches b
WHERE b.is_active = TRUE
ON CONFLICT (COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)) DO NOTHING;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp trigger for data management settings
CREATE TRIGGER update_data_management_settings_updated_at BEFORE UPDATE ON data_management_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE data_management_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_history ENABLE ROW LEVEL SECURITY;

-- Data management settings policies
CREATE POLICY "Users can view data management settings for their branch" ON data_management_settings
    FOR SELECT USING (
        branch_id IS NULL OR -- Global settings
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage data management settings for their branch" ON data_management_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.role_id = ur.id
            JOIN role_permissions rp ON ur.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = auth.uid() 
            AND p.name = 'manage_settings'
            AND (
                data_management_settings.branch_id IS NULL OR -- Global settings
                data_management_settings.branch_id = u.branch_id OR -- Same branch
                u.branch_id IS NULL -- Admin without branch restriction
            )
        )
    );

-- Backup history policies
CREATE POLICY "Users can view backup history for their branch" ON backup_history
    FOR SELECT USING (
        branch_id IS NULL OR -- Global backups
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create backup history for their branch" ON backup_history
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global backups
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Export history policies
CREATE POLICY "Users can view export history for their branch" ON export_history
    FOR SELECT USING (
        branch_id IS NULL OR -- Global exports
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create export history for their branch" ON export_history
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global exports
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Cleanup history policies
CREATE POLICY "Users can view cleanup history for their branch" ON cleanup_history
    FOR SELECT USING (
        branch_id IS NULL OR -- Global cleanups
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create cleanup history for their branch" ON cleanup_history
    FOR INSERT WITH CHECK (
        branch_id IS NULL OR -- Global cleanups
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
    'Data management migration completed' as status,
    COUNT(*) as total_data_management_settings,
    COUNT(CASE WHEN branch_id IS NULL THEN 1 END) as global_settings,
    COUNT(CASE WHEN branch_id IS NOT NULL THEN 1 END) as branch_specific_settings
FROM data_management_settings; 