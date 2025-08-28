const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySplitPaymentSchema() {
  console.log('🚀 Applying enhanced split payment schema...')
  
  try {
    // Read the SQL file
    const fs = require('fs')
    const sqlContent = fs.readFileSync('create-split-payment-tables.sql', 'utf8')
    
    console.log('📋 Executing SQL schema...')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Error applying schema:', error)
      return false
    }
    
    console.log('✅ Enhanced split payment schema applied successfully!')
    console.log('')
    console.log('📋 What was added:')
    console.log('  • customer_id column to split_payments table')
    console.log('  • Enhanced create_sale_with_split_payments function with account payment handling')
    console.log('  • validate_account_payment function for credit validation')
    console.log('  • Updated get_sale_split_payments function with customer information')
    console.log('')
    console.log('🎯 Account payment features now available:')
    console.log('  • Customer selection with credit account validation')
    console.log('  • Real-time credit amount validation')
    console.log('  • Automatic credit account updates')
    console.log('  • Credit transaction recording')
    console.log('  • Split payment support with account payments')
    
    return true
  } catch (error) {
    console.error('❌ Error applying schema:', error)
    return false
  }
}

// Run the migration
applySplitPaymentSchema()
  .then((success) => {
    if (success) {
      console.log('🎉 Migration completed successfully!')
    } else {
      console.log('💥 Migration failed!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
