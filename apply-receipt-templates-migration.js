const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Starting Receipt Templates Migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'create-receipt-templates-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded successfully')
    
    // Execute the migration
    console.log('⚡ Executing migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('⚠️  exec_sql not available, trying direct SQL execution...')
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
            if (stmtError) {
              console.warn(`⚠️  Statement failed (this might be expected): ${stmtError.message}`)
            }
          } catch (e) {
            console.warn(`⚠️  Statement failed (this might be expected): ${e.message}`)
          }
        }
      }
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration...')
    const { data: verificationData, error: verificationError } = await supabase
      .from('receipt_templates')
      .select('*')
      .limit(1)
    
    if (verificationError) {
      console.error('❌ Migration verification failed:', verificationError.message)
      console.log('\n📋 Manual Migration Instructions:')
      console.log('1. Go to your Supabase Dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy the contents of create-receipt-templates-migration.sql')
      console.log('4. Paste and execute the SQL')
      console.log('5. Verify the receipt_templates table was created')
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('📊 Receipt templates table is ready for use.')
    
    // Show some stats
    const { data: stats } = await supabase
      .from('receipt_templates')
      .select('*')
    
    console.log(`📈 Found ${stats?.length || 0} receipt templates`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n📋 Manual Migration Instructions:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy the contents of create-receipt-templates-migration.sql')
    console.log('4. Paste and execute the SQL')
    console.log('5. Verify the receipt_templates table was created')
    process.exit(1)
  }
}

// Run the migration
applyMigration() 