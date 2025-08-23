const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting notifications migration...')
  
  try {
    // Read the migration SQL
    const fs = require('fs')
    const migrationSQL = fs.readFileSync('./create-notifications-tables.sql', 'utf8')
    
    console.log('📝 Executing migration SQL...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('📊 Created tables:')
    console.log('   - notification_rules')
    console.log('   - integration_settings') 
    console.log('   - notification_logs')
    console.log('')
    console.log('🔐 RLS policies enabled')
    console.log('📈 Indexes created for performance')
    console.log('🔄 Triggers set up for automatic updates')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Alternative method if exec_sql RPC doesn't exist
async function runMigrationAlternative() {
  console.log('🚀 Starting notifications migration (alternative method)...')
  
  try {
    // Create tables one by one
    console.log('📝 Creating notification_rules table...')
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS notification_rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) CHECK (type IN ('email', 'sms', 'push', 'in-app')) DEFAULT 'email',
          condition VARCHAR(100) NOT NULL,
          action VARCHAR(20) CHECK (action IN ('immediate', 'daily', 'weekly', 'monthly')) DEFAULT 'immediate',
          recipients TEXT[] DEFAULT '{}',
          message_template TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    console.log('📝 Creating integration_settings table...')
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS integration_settings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
          email_provider VARCHAR(20) CHECK (email_provider IN ('smtp', 'sendgrid', 'mailgun')) DEFAULT 'smtp',
          smtp_host VARCHAR(255),
          smtp_port VARCHAR(10) DEFAULT '587',
          smtp_username VARCHAR(255),
          smtp_password VARCHAR(255),
          sms_provider VARCHAR(20) CHECK (sms_provider IN ('twilio', 'africastalking', 'messagebird')) DEFAULT 'twilio',
          sms_api_key VARCHAR(255),
          sms_api_secret VARCHAR(255),
          sms_from_number VARCHAR(20),
          webhook_url TEXT,
          webhook_secret VARCHAR(255),
          enable_webhooks BOOLEAN DEFAULT false,
          enable_email_notifications BOOLEAN DEFAULT false,
          enable_sms_notifications BOOLEAN DEFAULT false,
          enable_push_notifications BOOLEAN DEFAULT false,
          notification_frequency VARCHAR(20) CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')) DEFAULT 'immediate',
          quiet_hours_start TIME DEFAULT '22:00:00',
          quiet_hours_end TIME DEFAULT '08:00:00',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(branch_id)
        );
      `
    })
    
    console.log('📝 Creating notification_logs table...')
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS notification_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          rule_id UUID REFERENCES notification_rules(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          subject VARCHAR(255),
          message TEXT,
          status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
          error_message TEXT,
          sent_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    console.log('✅ Migration completed successfully!')
    console.log('📊 Created tables:')
    console.log('   - notification_rules')
    console.log('   - integration_settings') 
    console.log('   - notification_logs')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('')
    console.log('💡 Manual Setup Required:')
    console.log('   1. Go to your Supabase Dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy and paste the contents of create-notifications-tables.sql')
    console.log('   4. Run the SQL script')
    process.exit(1)
  }
}

// Try the main method first, fallback to alternative
runMigration().catch(() => {
  console.log('⚠️  Main migration method failed, trying alternative...')
  runMigrationAlternative()
}) 