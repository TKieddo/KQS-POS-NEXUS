const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  try {
    console.log('🔍 Checking Database Tables...\n')

    // Try to access common tables to see what exists
    const tablesToCheck = [
      'receipt_templates',
      'branches', 
      'users',
      'products',
      'categories',
      'customers',
      'sales',
      'business_settings'
    ]

    console.log('Checking table access:\n')
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   - ${tableName}: ❌ ${error.message}`)
        } else {
          console.log(`   - ${tableName}: ✅ (${data.length} rows accessible)`)
        }
      } catch (err) {
        console.log(`   - ${tableName}: ❌ ${err.message}`)
      }
    }

    // Try to create a simple test query
    console.log('\n🔍 Testing database connection...')
    try {
      const { data, error } = await supabase
        .rpc('version')
      
      if (error) {
        console.log('❌ Database connection test failed:', error.message)
      } else {
        console.log('✅ Database connection successful')
      }
    } catch (err) {
      console.log('❌ Database connection test failed:', err.message)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run check
checkTables() 