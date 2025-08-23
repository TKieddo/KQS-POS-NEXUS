-- =====================================================
-- PRINTING SYSTEM DATABASE SCHEMA (Simplified)
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRINTING SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS printing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    receipt_template VARCHAR(50) DEFAULT 'standard',
    receipt_header TEXT DEFAULT 'Thank you for shopping with us!',
    receipt_footer TEXT DEFAULT 'No refunds after 7 days. T&Cs apply.',
    default_printer VARCHAR(100),
    paper_size VARCHAR(20) DEFAULT '80mm',
    paper_width INTEGER DEFAULT 80,
    print_logo BOOLEAN DEFAULT false,
    print_barcode BOOLEAN DEFAULT true,
    print_tax_breakdown BOOLEAN DEFAULT true,
    print_customer_info BOOLEAN DEFAULT true,
    print_cashier_info BOOLEAN DEFAULT true,
    print_time_date BOOLEAN DEFAULT true,
    print_receipt_number BOOLEAN DEFAULT true,
    auto_print BOOLEAN DEFAULT true,
    print_copies INTEGER DEFAULT 1,
    slip_types JSONB DEFAULT '{}',
    custom_layouts JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. PRINTERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS printers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('thermal', 'inkjet', 'laser', 'dot_matrix')),
    connection VARCHAR(20) NOT NULL CHECK (connection IN ('usb', 'network', 'bluetooth', 'serial')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
    paper_size VARCHAR(20) DEFAULT '80mm',
    is_default BOOLEAN DEFAULT false,
    ip_address INET,
    port INTEGER,
    driver_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. RECEIPT TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_type VARCHAR(20) NOT NULL CHECK (template_type IN ('standard', 'compact', 'detailed', 'custom')),
    layout JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. PRINT JOBS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS print_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    printer_id UUID REFERENCES printers(id) ON DELETE SET NULL,
    template_id UUID REFERENCES receipt_templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'completed', 'failed')),
    copies INTEGER DEFAULT 1,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 5. RECEIPT HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS receipt_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    receipt_number VARCHAR(50) NOT NULL,
    template_id UUID REFERENCES receipt_templates(id) ON DELETE SET NULL,
    printer_id UUID REFERENCES printers(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    receipt_data JSONB NOT NULL,
    print_job_id UUID REFERENCES print_jobs(id) ON DELETE SET NULL,
    copies_printed INTEGER DEFAULT 1,
    print_status VARCHAR(20) DEFAULT 'printed' CHECK (print_status IN ('printed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Printing settings indexes
CREATE INDEX IF NOT EXISTS idx_printing_settings_branch_id ON printing_settings(branch_id);
CREATE INDEX IF NOT EXISTS idx_printing_settings_updated_at ON printing_settings(updated_at);

-- Printers indexes
CREATE INDEX IF NOT EXISTS idx_printers_branch_id ON printers(branch_id);
CREATE INDEX IF NOT EXISTS idx_printers_status ON printers(status);
CREATE INDEX IF NOT EXISTS idx_printers_is_default ON printers(is_default);
CREATE INDEX IF NOT EXISTS idx_printers_type ON printers(type);

-- Receipt templates indexes
CREATE INDEX IF NOT EXISTS idx_receipt_templates_branch_id ON receipt_templates(branch_id);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_type ON receipt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_active ON receipt_templates(is_active);

-- Print jobs indexes
CREATE INDEX IF NOT EXISTS idx_print_jobs_branch_id ON print_jobs(branch_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_printer_id ON print_jobs(printer_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created_at ON print_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_user_id ON print_jobs(user_id);

-- Receipt history indexes
CREATE INDEX IF NOT EXISTS idx_receipt_history_branch_id ON receipt_history(branch_id);
CREATE INDEX IF NOT EXISTS idx_receipt_history_sale_id ON receipt_history(sale_id);
CREATE INDEX IF NOT EXISTS idx_receipt_history_receipt_number ON receipt_history(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipt_history_created_at ON receipt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_receipt_history_user_id ON receipt_history(user_id);

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE printing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES
-- =====================================================

-- Printing settings policies
CREATE POLICY "Users can view printing settings for their branch" ON printing_settings
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert printing settings for their branch" ON printing_settings
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update printing settings for their branch" ON printing_settings
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete printing settings for their branch" ON printing_settings
    FOR DELETE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Printers policies
CREATE POLICY "Users can view printers for their branch" ON printers
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert printers for their branch" ON printers
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update printers for their branch" ON printers
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete printers for their branch" ON printers
    FOR DELETE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Receipt templates policies
CREATE POLICY "Users can view receipt templates for their branch" ON receipt_templates
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert receipt templates for their branch" ON receipt_templates
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update receipt templates for their branch" ON receipt_templates
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete receipt templates for their branch" ON receipt_templates
    FOR DELETE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Print jobs policies
CREATE POLICY "Users can view print jobs for their branch" ON print_jobs
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert print jobs for their branch" ON print_jobs
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update print jobs for their branch" ON print_jobs
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- Receipt history policies
CREATE POLICY "Users can view receipt history for their branch" ON receipt_history
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert receipt history for their branch" ON receipt_history
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        )
    );

-- =====================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_printing_settings_updated_at 
    BEFORE UPDATE ON printing_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_printers_updated_at 
    BEFORE UPDATE ON printers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipt_templates_updated_at 
    BEFORE UPDATE ON receipt_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. INSERT DEFAULT DATA
-- =====================================================

-- Insert default receipt templates (removed ON CONFLICT clause)
INSERT INTO receipt_templates (branch_id, name, description, template_type, layout, is_active) VALUES
(NULL, 'Standard Receipt', 'Default receipt template with business header and footer', 'standard', 
'{
  "header": [
    {"id": "logo", "type": "logo", "content": "", "alignment": "center", "font_size": "medium", "font_weight": "normal", "position": 1},
    {"id": "business_name", "type": "text", "content": "{{business_name}}", "alignment": "center", "font_size": "large", "font_weight": "bold", "position": 2},
    {"id": "business_address", "type": "text", "content": "{{business_address}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 3},
    {"id": "business_phone", "type": "text", "content": "{{business_phone}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 4},
    {"id": "divider1", "type": "divider", "content": "--------------------------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 5}
  ],
  "body": [
    {"id": "receipt_number", "type": "text", "content": "Receipt #: {{receipt_number}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 1},
    {"id": "date_time", "type": "text", "content": "Date: {{date}} Time: {{time}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 2},
    {"id": "cashier", "type": "text", "content": "Cashier: {{cashier_name}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 3},
    {"id": "divider2", "type": "divider", "content": "--------------------------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 4},
    {"id": "items_table", "type": "table", "content": "{{items_table}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 5},
    {"id": "divider3", "type": "divider", "content": "--------------------------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 6},
    {"id": "subtotal", "type": "total", "content": "Subtotal: {{subtotal}}", "alignment": "right", "font_size": "medium", "font_weight": "normal", "position": 7},
    {"id": "tax", "type": "tax_breakdown", "content": "Tax: {{tax_amount}}", "alignment": "right", "font_size": "small", "font_weight": "normal", "position": 8},
    {"id": "total", "type": "total", "content": "TOTAL: {{total}}", "alignment": "right", "font_size": "large", "font_weight": "bold", "position": 9},
    {"id": "payment_method", "type": "text", "content": "Payment: {{payment_method}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 10}
  ],
  "footer": [
    {"id": "divider4", "type": "divider", "content": "--------------------------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 1},
    {"id": "footer_text", "type": "text", "content": "{{receipt_footer}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 2},
    {"id": "barcode", "type": "barcode", "content": "{{receipt_number}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 3}
  ],
  "styling": {
    "font_family": "monospace",
    "line_height": 1.2,
    "margins": {"top": 0, "bottom": 0, "left": 0, "right": 0},
    "colors": {"primary": "#000000", "secondary": "#666666", "accent": "#000000"}
  }
}', true),

(NULL, 'Compact Receipt', 'Minimal receipt template for quick printing', 'compact',
'{
  "header": [
    {"id": "business_name", "type": "text", "content": "{{business_name}}", "alignment": "center", "font_size": "medium", "font_weight": "bold", "position": 1},
    {"id": "divider1", "type": "divider", "content": "----------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 2}
  ],
  "body": [
    {"id": "receipt_number", "type": "text", "content": "#{{receipt_number}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 1},
    {"id": "date_time", "type": "text", "content": "{{date}} {{time}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 2},
    {"id": "items_table", "type": "table", "content": "{{items_table}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 3},
    {"id": "total", "type": "total", "content": "TOTAL: {{total}}", "alignment": "right", "font_size": "medium", "font_weight": "bold", "position": 4}
  ],
  "footer": [
    {"id": "divider2", "type": "divider", "content": "----------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 1},
    {"id": "footer_text", "type": "text", "content": "{{receipt_footer}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 2}
  ],
  "styling": {
    "font_family": "monospace",
    "line_height": 1.1,
    "margins": {"top": 0, "bottom": 0, "left": 0, "right": 0},
    "colors": {"primary": "#000000", "secondary": "#666666", "accent": "#000000"}
  }
}', true),

(NULL, 'Detailed Receipt', 'Comprehensive receipt with all information', 'detailed',
'{
  "header": [
    {"id": "logo", "type": "logo", "content": "", "alignment": "center", "font_size": "medium", "font_weight": "normal", "position": 1},
    {"id": "business_name", "type": "text", "content": "{{business_name}}", "alignment": "center", "font_size": "large", "font_weight": "bold", "position": 2},
    {"id": "business_address", "type": "text", "content": "{{business_address}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 3},
    {"id": "business_phone", "type": "text", "content": "{{business_phone}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 4},
    {"id": "business_email", "type": "text", "content": "{{business_email}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 5},
    {"id": "divider1", "type": "divider", "content": "========================================", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 6}
  ],
  "body": [
    {"id": "receipt_number", "type": "text", "content": "Receipt Number: {{receipt_number}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 1},
    {"id": "date_time", "type": "text", "content": "Date: {{date}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 2},
    {"id": "time", "type": "text", "content": "Time: {{time}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 3},
    {"id": "cashier", "type": "text", "content": "Cashier: {{cashier_name}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 4},
    {"id": "customer", "type": "text", "content": "Customer: {{customer_name}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 5},
    {"id": "divider2", "type": "divider", "content": "----------------------------------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 6},
    {"id": "items_table", "type": "table", "content": "{{items_table}}", "alignment": "left", "font_size": "small", "font_size": "small", "font_weight": "normal", "position": 7},
    {"id": "divider3", "type": "divider", "content": "----------------------------------------", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 8},
    {"id": "subtotal", "type": "total", "content": "Subtotal: {{subtotal}}", "alignment": "right", "font_size": "medium", "font_weight": "normal", "position": 9},
    {"id": "tax_breakdown", "type": "tax_breakdown", "content": "{{tax_breakdown}}", "alignment": "right", "font_size": "small", "font_weight": "normal", "position": 10},
    {"id": "discount", "type": "text", "content": "Discount: {{discount}}", "alignment": "right", "font_size": "small", "font_weight": "normal", "position": 11},
    {"id": "total", "type": "total", "content": "TOTAL: {{total}}", "alignment": "right", "font_size": "large", "font_weight": "bold", "position": 12},
    {"id": "payment_method", "type": "text", "content": "Payment Method: {{payment_method}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 13},
    {"id": "change", "type": "text", "content": "Change: {{change}}", "alignment": "left", "font_size": "small", "font_weight": "normal", "position": 14}
  ],
  "footer": [
    {"id": "divider4", "type": "divider", "content": "========================================", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 1},
    {"id": "footer_text", "type": "text", "content": "{{receipt_footer}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 2},
    {"id": "qr_code", "type": "qr_code", "content": "{{receipt_url}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 3},
    {"id": "barcode", "type": "barcode", "content": "{{receipt_number}}", "alignment": "center", "font_size": "small", "font_weight": "normal", "position": 4}
  ],
  "styling": {
    "font_family": "monospace",
    "line_height": 1.3,
    "margins": {"top": 0, "bottom": 0, "left": 0, "right": 0},
    "colors": {"primary": "#000000", "secondary": "#666666", "accent": "#000000"}
  }
}', true);

-- =====================================================
-- 11. VERIFICATION
-- =====================================================

-- Show summary of created tables
SELECT 
    'Printing system schema created successfully' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_name IN ('printing_settings', 'printers', 'receipt_templates', 'print_jobs', 'receipt_history');

-- Show default templates
SELECT 
    name,
    template_type,
    is_active,
    created_at
FROM receipt_templates 
ORDER BY name; 