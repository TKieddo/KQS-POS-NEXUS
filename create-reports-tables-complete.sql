-- ========================================
-- COMPLETE REPORTS & EXPORT TABLES MIGRATION
-- ========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- BRANCHES TABLE (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- USERS TABLE (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role_id UUID,
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

-- ========================================
-- REPORT SCHEDULES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
  recipients TEXT[] DEFAULT '{}',
  template_id UUID,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REPORT TEMPLATES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('sales', 'inventory', 'financial', 'customers', 'analytics')),
  template_data JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- EXPORT SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS export_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  default_format VARCHAR(10) NOT NULL DEFAULT 'pdf' CHECK (default_format IN ('pdf', 'excel', 'csv', 'json')),
  include_charts BOOLEAN DEFAULT true,
  include_summaries BOOLEAN DEFAULT true,
  compression_enabled BOOLEAN DEFAULT false,
  auto_backup BOOLEAN DEFAULT true,
  backup_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
  retention_days INTEGER DEFAULT 30 CHECK (retention_days >= 1 AND retention_days <= 365),
  storage_limit_gb INTEGER DEFAULT 10 CHECK (storage_limit_gb >= 1 AND storage_limit_gb <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- DATA EXPORTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tables TEXT[] NOT NULL,
  filters JSONB DEFAULT '{}',
  format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'excel', 'json')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  file_size BIGINT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- REPORT EXECUTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES report_schedules(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  file_size BIGINT,
  recipients_sent TEXT[] DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_report_schedules_branch_id ON report_schedules(branch_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_is_active ON report_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run);

CREATE INDEX IF NOT EXISTS idx_report_templates_branch_id ON report_templates(branch_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_is_active ON report_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_export_settings_branch_id ON export_settings(branch_id);

CREATE INDEX IF NOT EXISTS idx_data_exports_branch_id ON data_exports(branch_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);
CREATE INDEX IF NOT EXISTS idx_data_exports_created_at ON data_exports(created_at);

CREATE INDEX IF NOT EXISTS idx_report_executions_schedule_id ON report_executions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_status ON report_executions(status);
CREATE INDEX IF NOT EXISTS idx_report_executions_started_at ON report_executions(started_at);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_branches_updated_at 
  BEFORE UPDATE ON branches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at 
  BEFORE UPDATE ON report_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at 
  BEFORE UPDATE ON report_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_settings_updated_at 
  BEFORE UPDATE ON export_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- Branches policies
CREATE POLICY "Authenticated users can view branches" ON branches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage branches" ON branches
  FOR ALL USING (auth.role() = 'authenticated');

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Report schedules policies
CREATE POLICY "Users can view report schedules for their branch" ON report_schedules
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert report schedules for their branch" ON report_schedules
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update report schedules for their branch" ON report_schedules
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete report schedules for their branch" ON report_schedules
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

-- Report templates policies
CREATE POLICY "Users can view report templates for their branch" ON report_templates
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert report templates for their branch" ON report_templates
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update report templates for their branch" ON report_templates
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete report templates for their branch" ON report_templates
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

-- Export settings policies
CREATE POLICY "Users can view export settings for their branch" ON export_settings
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert export settings for their branch" ON export_settings
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update export settings for their branch" ON export_settings
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete export settings for their branch" ON export_settings
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

-- Data exports policies
CREATE POLICY "Users can view data exports for their branch" ON data_exports
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert data exports for their branch" ON data_exports
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update data exports for their branch" ON data_exports
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete data exports for their branch" ON data_exports
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
    OR auth.role() = 'authenticated'
  );

-- Report executions policies
CREATE POLICY "Users can view report executions for their branch" ON report_executions
  FOR SELECT USING (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can insert report executions for their branch" ON report_executions
  FOR INSERT WITH CHECK (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update report executions for their branch" ON report_executions
  FOR UPDATE USING (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete report executions for their branch" ON report_executions
  FOR DELETE USING (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
    OR auth.role() = 'authenticated'
  );

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Insert default branches if none exist
INSERT INTO branches (name, address, phone, email, is_active)
SELECT 'Main Store', '123 Main Street, Johannesburg, South Africa', '+27 11 123 4567', 'main@kqspos.com', true
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Main Store');

INSERT INTO branches (name, address, phone, email, is_active)
SELECT 'North Branch', '456 North Avenue, Pretoria, South Africa', '+27 12 345 6789', 'north@kqspos.com', true
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'North Branch');

INSERT INTO branches (name, address, phone, email, is_active)
SELECT 'South Branch', '789 South Road, Cape Town, South Africa', '+27 21 987 6543', 'south@kqspos.com', true
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'South Branch');

-- Insert default export settings for existing branches
INSERT INTO export_settings (branch_id, default_format, include_charts, include_summaries, compression_enabled, auto_backup, backup_frequency, retention_days, storage_limit_gb)
SELECT 
  id as branch_id,
  'pdf' as default_format,
  true as include_charts,
  true as include_summaries,
  false as compression_enabled,
  true as auto_backup,
  'weekly' as backup_frequency,
  30 as retention_days,
  10 as storage_limit_gb
FROM branches
WHERE id NOT IN (SELECT branch_id FROM export_settings WHERE branch_id IS NOT NULL);

-- Insert global default export settings
INSERT INTO export_settings (branch_id, default_format, include_charts, include_summaries, compression_enabled, auto_backup, backup_frequency, retention_days, storage_limit_gb)
SELECT 
  NULL as branch_id,
  'pdf' as default_format,
  true as include_charts,
  true as include_summaries,
  false as compression_enabled,
  true as auto_backup,
  'weekly' as backup_frequency,
  30 as retention_days,
  10 as storage_limit_gb
WHERE NOT EXISTS (SELECT 1 FROM export_settings WHERE branch_id IS NULL);

-- Insert sample report templates
INSERT INTO report_templates (branch_id, name, description, category, template_data, is_default, is_active)
SELECT 
  NULL as branch_id,
  'Daily Sales Report' as name,
  'Comprehensive daily sales summary with charts and analytics' as description,
  'sales' as category,
  '{"include_charts": true, "include_summaries": true, "sections": ["sales_summary", "top_products", "payment_methods"]}' as template_data,
  true as is_default,
  true as is_active
WHERE NOT EXISTS (SELECT 1 FROM report_templates WHERE name = 'Daily Sales Report');

INSERT INTO report_templates (branch_id, name, description, category, template_data, is_default, is_active)
SELECT 
  NULL as branch_id,
  'Inventory Status Report' as name,
  'Current inventory levels with low stock alerts' as description,
  'inventory' as category,
  '{"include_charts": true, "include_summaries": true, "sections": ["stock_levels", "low_stock_alerts", "movement_history"]}' as template_data,
  false as is_default,
  true as is_active
WHERE NOT EXISTS (SELECT 1 FROM report_templates WHERE name = 'Inventory Status Report');

INSERT INTO report_templates (branch_id, name, description, category, template_data, is_default, is_active)
SELECT 
  NULL as branch_id,
  'Monthly Financial Report' as name,
  'Monthly financial summary with profit and loss analysis' as description,
  'financial' as category,
  '{"include_charts": true, "include_summaries": true, "sections": ["revenue_summary", "expenses", "profit_analysis"]}' as template_data,
  false as is_default,
  true as is_active
WHERE NOT EXISTS (SELECT 1 FROM report_templates WHERE name = 'Monthly Financial Report'); 