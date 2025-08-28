require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixLaybyeDatabaseBalances() {
  console.log('🔧 Fixing Laybye Database Balances...')
  
  try {
    // Get all laybye orders
    const { data: laybyeOrders, error: laybyeError } = await supabase
      .from('laybye_orders')
      .select('*')
    
    if (laybyeError) {
      console.error('❌ Error fetching laybye orders:', laybyeError)
      return
    }
    
    if (!laybyeOrders || laybyeOrders.length === 0) {
      console.log('⚠️ No laybye orders found')
      return
    }
    
    console.log(`\n📋 Found ${laybyeOrders.length} laybye orders to fix`)
    
    let fixedCount = 0
    let errorCount = 0
    
    for (const laybyeOrder of laybyeOrders) {
      try {
        console.log(`\n🔍 Processing: ${laybyeOrder.order_number}`)
        console.log(`  Current balance in DB: ${laybyeOrder.remaining_balance}`)
        
        // Get all payments for this laybye order
        const { data: payments, error: paymentsError } = await supabase
          .from('laybye_payments')
          .select('amount')
          .eq('laybye_id', laybyeOrder.id)
        
        if (paymentsError) {
          console.error(`  ❌ Error fetching payments for ${laybyeOrder.order_number}:`, paymentsError)
          errorCount++
          continue
        }
        
        // Calculate correct balance: Total - (Deposit + All Payments)
        const totalAmount = laybyeOrder.total_amount || 0
        const depositAmount = laybyeOrder.deposit_amount || 0
        const totalPayments = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
        const correctBalance = Math.max(0, totalAmount - depositAmount - totalPayments)
        
        console.log(`  Total Amount: ${totalAmount}`)
        console.log(`  Deposit Amount: ${depositAmount}`)
        console.log(`  Total Payments: ${totalPayments}`)
        console.log(`  Correct Balance: ${correctBalance}`)
        
        // Check if balance needs fixing
        const currentBalance = laybyeOrder.remaining_balance || 0
        const balanceDifference = Math.abs(correctBalance - currentBalance)
        
        if (balanceDifference > 0.01) { // Only update if difference is more than 1 cent
          console.log(`  ⚠️ Balance needs fixing! Difference: ${balanceDifference}`)
          
          // Update the laybye order with correct balance
          const { error: updateError } = await supabase
            .from('laybye_orders')
            .update({
              remaining_balance: correctBalance,
              remaining_amount: correctBalance,
              status: correctBalance <= 0 ? 'completed' : 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', laybyeOrder.id)
          
          if (updateError) {
            console.error(`  ❌ Error updating ${laybyeOrder.order_number}:`, updateError)
            errorCount++
          } else {
            console.log(`  ✅ Fixed balance for ${laybyeOrder.order_number}`)
            fixedCount++
          }
        } else {
          console.log(`  ✅ Balance is already correct`)
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing ${laybyeOrder.order_number}:`, error)
        errorCount++
      }
    }
    
    console.log(`\n🎉 Database Balance Fix Complete!`)
    console.log(`  ✅ Fixed: ${fixedCount} orders`)
    console.log(`  ❌ Errors: ${errorCount} orders`)
    console.log(`  📊 Total processed: ${laybyeOrders.length} orders`)
    
    // Verify the fix by checking a sample order
    console.log(`\n🔍 Verifying fix...`)
    const { data: sampleOrder, error: sampleError } = await supabase
      .from('laybye_orders')
      .select('*')
      .limit(1)
    
    if (!sampleError && sampleOrder && sampleOrder.length > 0) {
      const order = sampleOrder[0]
      console.log(`\n📋 Sample Order: ${order.order_number}`)
      console.log(`  Total Amount: ${order.total_amount}`)
      console.log(`  Deposit Amount: ${order.deposit_amount}`)
      console.log(`  Updated Balance: ${order.remaining_balance}`)
      console.log(`  Status: ${order.status}`)
    }
    
  } catch (error) {
    console.error('❌ Error fixing laybye database balances:', error)
  }
}

// Run the fix
fixLaybyeDatabaseBalances()
  .then(() => {
    console.log('\n🎉 Laybye database balance fix completed!')
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error)
  })
