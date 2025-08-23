-- =====================================================
-- Receipt Templates Migration
-- This migration ensures the receipt_templates table exists with all necessary fields
-- and handles conflicts gracefully
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- RECEIPT TEMPLATES TABLE
-- =====================================================

-- Create receipt_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'standard' CHECK (template_type IN ('standard', 'compact', 'detailed', 'custom')),
    layout JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns that might not exist (with conflict handling)
DO $$ 
BEGIN
    -- Add business_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'business_name') THEN
        ALTER TABLE receipt_templates ADD COLUMN business_name VARCHAR(255) DEFAULT 'KQS';
    END IF;

    -- Add business_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'business_address') THEN
        ALTER TABLE receipt_templates ADD COLUMN business_address TEXT DEFAULT 'Maseru, Husteds opposite Queen II';
    END IF;

    -- Add business_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'business_phone') THEN
        ALTER TABLE receipt_templates ADD COLUMN business_phone VARCHAR(20) DEFAULT '2700 7795';
    END IF;

    -- Add business_website column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'business_website') THEN
        ALTER TABLE receipt_templates ADD COLUMN business_website VARCHAR(255) DEFAULT 'www.kqsfootware.com';
    END IF;

    -- Add business_facebook column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'business_facebook') THEN
        ALTER TABLE receipt_templates ADD COLUMN business_facebook VARCHAR(255) DEFAULT 'KQSFOOTWARE';
    END IF;

    -- Add business_tagline column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'business_tagline') THEN
        ALTER TABLE receipt_templates ADD COLUMN business_tagline VARCHAR(255) DEFAULT 'Finest footware';
    END IF;

    -- Add return_policy_english column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'return_policy_english') THEN
        ALTER TABLE receipt_templates ADD COLUMN return_policy_english TEXT DEFAULT 'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.';
    END IF;

    -- Add return_policy_sesotho column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'return_policy_sesotho') THEN
        ALTER TABLE receipt_templates ADD COLUMN return_policy_sesotho TEXT DEFAULT 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.';
    END IF;

    -- Add thank_you_message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'thank_you_message') THEN
        ALTER TABLE receipt_templates ADD COLUMN thank_you_message VARCHAR(255) DEFAULT 'Thank You for shopping with Us';
    END IF;

    -- Add footer_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'footer_text') THEN
        ALTER TABLE receipt_templates ADD COLUMN footer_text VARCHAR(255) DEFAULT 'SHOP ONLINE - Stand a chance to win';
    END IF;

    -- Add show_qr_section column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'show_qr_section') THEN
        ALTER TABLE receipt_templates ADD COLUMN show_qr_section BOOLEAN DEFAULT true;
    END IF;

    -- Add show_policy_section column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'show_policy_section') THEN
        ALTER TABLE receipt_templates ADD COLUMN show_policy_section BOOLEAN DEFAULT true;
    END IF;

    -- Add show_points_section column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'show_points_section') THEN
        ALTER TABLE receipt_templates ADD COLUMN show_points_section BOOLEAN DEFAULT true;
    END IF;

    -- Add show_tagline column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'show_tagline') THEN
        ALTER TABLE receipt_templates ADD COLUMN show_tagline BOOLEAN DEFAULT true;
    END IF;

    -- Add template_settings column if it doesn't exist (for additional customization)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipt_templates' AND column_name = 'template_settings') THEN
        ALTER TABLE receipt_templates ADD COLUMN template_settings JSONB DEFAULT '{}';
    END IF;

END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_receipt_templates_branch_id ON receipt_templates(branch_id);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_type ON receipt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_active ON receipt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_default ON receipt_templates(is_default);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_receipt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_receipt_templates_updated_at ON receipt_templates;
CREATE TRIGGER update_receipt_templates_updated_at
    BEFORE UPDATE ON receipt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_receipt_templates_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view receipt templates for their branch" ON receipt_templates;
DROP POLICY IF EXISTS "Users can insert receipt templates for their branch" ON receipt_templates;
DROP POLICY IF EXISTS "Users can update receipt templates for their branch" ON receipt_templates;
DROP POLICY IF EXISTS "Users can delete receipt templates for their branch" ON receipt_templates;

-- Create RLS policies
CREATE POLICY "Users can view receipt templates for their branch" ON receipt_templates
    FOR SELECT USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        ) OR branch_id IS NULL
    );

CREATE POLICY "Users can insert receipt templates for their branch" ON receipt_templates
    FOR INSERT WITH CHECK (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        ) OR branch_id IS NULL
    );

CREATE POLICY "Users can update receipt templates for their branch" ON receipt_templates
    FOR UPDATE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        ) OR branch_id IS NULL
    );

CREATE POLICY "Users can delete receipt templates for their branch" ON receipt_templates
    FOR DELETE USING (
        branch_id IN (
            SELECT branch_id FROM users WHERE id = auth.uid()
        ) OR branch_id IS NULL
    );

-- =====================================================
-- DEFAULT TEMPLATES
-- =====================================================

-- Insert default KQS receipt template if it doesn't exist
INSERT INTO receipt_templates (
    branch_id,
    name,
    description,
    template_type,
    business_name,
    business_address,
    business_phone,
    business_website,
    business_facebook,
    business_tagline,
    return_policy_english,
    return_policy_sesotho,
    thank_you_message,
    footer_text,
    show_qr_section,
    show_policy_section,
    show_points_section,
    show_tagline,
    is_default,
    is_active,
    layout
) 
SELECT 
    b.id as branch_id,
    'KQS Standard Receipt',
    'Default KQS receipt template with customizable business information',
    'custom',
    'KQS',
    'Maseru, Husteds opposite Queen II',
    '2700 7795',
    'www.kqsfootware.com',
    'KQSFOOTWARE',
    'Finest footware',
    'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
    'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
    'Thank You for shopping with Us',
    'SHOP ONLINE - Stand a chance to win',
    true,
    true,
    true,
    true,
    true,
    true,
    '{}'::jsonb
FROM branches b
WHERE NOT EXISTS (
    SELECT 1 FROM receipt_templates 
    WHERE name = 'KQS Standard Receipt' 
    AND branch_id = b.id
)
LIMIT 1;

-- If no branches exist, create a default template without branch_id
INSERT INTO receipt_templates (
    name,
    description,
    template_type,
    business_name,
    business_address,
    business_phone,
    business_website,
    business_facebook,
    business_tagline,
    return_policy_english,
    return_policy_sesotho,
    thank_you_message,
    footer_text,
    show_qr_section,
    show_policy_section,
    show_points_section,
    show_tagline,
    is_default,
    is_active,
    layout
) 
SELECT 
    'KQS Standard Receipt',
    'Default KQS receipt template with customizable business information',
    'custom',
    'KQS',
    'Maseru, Husteds opposite Queen II',
    '2700 7795',
    'www.kqsfootware.com',
    'KQSFOOTWARE',
    'Finest footware',
    'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
    'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
    'Thank You for shopping with Us',
    'SHOP ONLINE - Stand a chance to win',
    true,
    true,
    true,
    true,
    true,
    true,
    '{}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM receipt_templates 
    WHERE name = 'KQS Standard Receipt'
);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify the migration was successful
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_templates,
    COUNT(CASE WHEN is_default = true THEN 1 END) as default_templates,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_templates
FROM receipt_templates; 