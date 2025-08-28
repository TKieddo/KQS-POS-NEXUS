const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySplitPaymentFix() {
  console.log('🚀 Applying split payment fix...')
  
  try {
    // Read the SQL file
    const fs = require('fs')
    const sqlContent = fs.readFileSync('fix-split-payments-customer-id.sql', 'utf8')
    
    console.log('📋 Executing SQL fix...')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Error applying fix:', error)
      return false
    }
    
    console.log('✅ Split payment fix applied successfully!')
    console.log('')
    console.log('📋 What was fixed:')
    console.log('  • Added customer_id column to existing split_payments table')
    console.log('  • Added index for customer_id column')
    console.log('  • Updated create_sale_with_split_payments function')
    console.log('  • Updated get_sale_split_payments function')
    console.log('  • Added validate_account_payment function')
    console.log('')
    console.log('🎯 Account payment features now available:')
    console.log('  • Customer selection with credit account validation')
    console.log('  • Real-time credit amount validation')
    console.log('  • Automatic credit account updates')
    console.log('  • Credit transaction recording')
    console.log('  • Split payment support with account payments')
    
    return true
  } catch (error) {
    console.error('❌ Error applying fix:', error)
    return false
  }
}

// Run the fix
applySplitPaymentFix()
  .then((success) => {
    if (success) {
      console.log('🎉 Fix completed successfully!')
    } else {
      console.log('💥 Fix failed!')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
