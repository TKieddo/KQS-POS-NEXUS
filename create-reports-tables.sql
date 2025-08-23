-- ========================================
-- REPORTS & EXPORT TABLES MIGRATION
-- ========================================

-- Create report_schedules table
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

-- Create report_templates table
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

-- Create export_settings table
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

-- Create data_exports table
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create report_executions table
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

-- Create indexes
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

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_report_schedules_updated_at 
  BEFORE UPDATE ON report_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at 
  BEFORE UPDATE ON report_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_settings_updated_at 
  BEFORE UPDATE ON export_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- Report schedules policies
CREATE POLICY "Users can view report schedules for their branch" ON report_schedules
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can insert report schedules for their branch" ON report_schedules
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can update report schedules for their branch" ON report_schedules
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can delete report schedules for their branch" ON report_schedules
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

-- Report templates policies
CREATE POLICY "Users can view report templates for their branch" ON report_templates
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can insert report templates for their branch" ON report_templates
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can update report templates for their branch" ON report_templates
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can delete report templates for their branch" ON report_templates
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

-- Export settings policies
CREATE POLICY "Users can view export settings for their branch" ON export_settings
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can insert export settings for their branch" ON export_settings
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can update export settings for their branch" ON export_settings
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can delete export settings for their branch" ON export_settings
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

-- Data exports policies
CREATE POLICY "Users can view data exports for their branch" ON data_exports
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can insert data exports for their branch" ON data_exports
  FOR INSERT WITH CHECK (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can update data exports for their branch" ON data_exports
  FOR UPDATE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

CREATE POLICY "Users can delete data exports for their branch" ON data_exports
  FOR DELETE USING (
    branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
    OR branch_id IS NULL
  );

-- Report executions policies
CREATE POLICY "Users can view report executions for their branch" ON report_executions
  FOR SELECT USING (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
  );

CREATE POLICY "Users can insert report executions for their branch" ON report_executions
  FOR INSERT WITH CHECK (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
  );

CREATE POLICY "Users can update report executions for their branch" ON report_executions
  FOR UPDATE USING (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
  );

CREATE POLICY "Users can delete report executions for their branch" ON report_executions
  FOR DELETE USING (
    schedule_id IN (
      SELECT id FROM report_schedules 
      WHERE branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
      OR branch_id IS NULL
    )
  );

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