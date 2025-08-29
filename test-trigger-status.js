require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTriggerStatus() {
  console.log('🔍 Checking database trigger status...')
  
  try {
    // Check if the trigger exists using raw SQL
    const { data: triggers, error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            trigger_name, 
            event_manipulation, 
            action_statement 
          FROM information_schema.triggers 
          WHERE trigger_name = 'update_stock_on_sale_item';
        `
      })
    
    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError)
      console.log('🔧 Trying alternative approach...')
      
      // Try direct query
      const { data: directTriggers, error: directError } = await supabase
        .from('pg_trigger')
        .select('tgname, tgrelid')
        .eq('tgname', 'update_stock_on_sale_item')
      
      if (directError) {
        console.error('❌ Direct query also failed:', directError)
      } else {
        console.log('📋 Direct trigger check:', directTriggers)
      }
      return
    }
    
    console.log('📋 Trigger status:', triggers)
    
    if (triggers && triggers.length > 0) {
      console.log('✅ Trigger exists and is active')
    } else {
      console.log('❌ Trigger does not exist - this is the problem!')
    }
    
    // Check if the function exists
    const { data: functions, error: functionError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            routine_name, 
            routine_type 
          FROM information_schema.routines 
          WHERE routine_name = 'update_product_stock';
        `
      })
    
    if (functionError) {
      console.error('❌ Error checking functions:', functionError)
    } else {
      console.log('📋 Function status:', functions)
      
      if (functions && functions.length > 0) {
        console.log('✅ Function exists')
      } else {
        console.log('❌ Function does not exist - this is the problem!')
      }
    }
    
    // Test with a simple product query
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(1)
    
    if (productError) {
      console.error('❌ Error checking products:', productError)
      return
    }
    
    console.log('📋 Sample product:', products)
    
    // Check if branch_stock table exists
    const { data: branchStock, error: branchError } = await supabase
      .from('branch_stock')
      .select('*')
      .limit(1)
    
    if (branchError) {
      console.log('📋 Branch stock table error (may not exist):', branchError.message)
    } else {
      console.log('📋 Branch stock table exists and accessible')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkTriggerStatus()
