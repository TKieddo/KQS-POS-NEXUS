const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTableExists() {
  try {
    console.log('Testing connection to Supabase...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ Connection failed:', testError)
      return
    }
    
    console.log('✅ Connection successful')
    
    // Test if bulk_price_updates table exists
    console.log('Checking if bulk_price_updates table exists...')
    const { data, error } = await supabase
      .from('bulk_price_updates')
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.message && error.message.includes('relation "bulk_price_updates" does not exist')) {
        console.log('❌ bulk_price_updates table does NOT exist')
        console.log('\nTo fix this:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Navigate to the SQL Editor')
        console.log('3. Copy and paste the contents of supabase-migration-product-pricing-complete.sql')
        console.log('4. Execute the SQL')
        console.log('\nSee MIGRATION_GUIDE.md for detailed instructions')
      } else {
        console.error('❌ Error checking table:', error)
      }
    } else {
      console.log('✅ bulk_price_updates table exists and is accessible!')
      console.log('The bulk price update functionality should work now.')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testTableExists() 