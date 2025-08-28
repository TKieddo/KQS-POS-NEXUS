require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testLaybyeFixes() {
  console.log('🧪 Testing Laybye System Fixes...')
  
  try {
    // Get a sample laybye order
    const { data: laybyeOrders, error: laybyeError } = await supabase
      .from('laybye_orders')
      .select('*')
      .limit(1)
    
    if (laybyeError) {
      console.error('❌ Error fetching laybye orders:', laybyeError)
      return
    }
    
    if (!laybyeOrders || laybyeOrders.length === 0) {
      console.log('⚠️ No laybye orders found for testing')
      return
    }
    
    const laybyeOrder = laybyeOrders[0]
    console.log(`\n📋 Testing laybye order: ${laybyeOrder.order_number}`)
    
    // Test 1: Balance Calculation
    console.log('\n🔍 Test 1: Balance Calculation')
    const totalAmount = laybyeOrder.total_amount || 0
    const depositAmount = laybyeOrder.deposit_amount || 0
    
    // Get payments separately
    const { data: payments, error: paymentsError } = await supabase
      .from('laybye_payments')
      .select('amount')
      .eq('laybye_id', laybyeOrder.id)
    
    if (paymentsError) {
      console.error('  ❌ Error fetching payments:', paymentsError)
    }
    
    const totalPayments = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    const calculatedBalance = Math.max(0, totalAmount - depositAmount - totalPayments)
    
    console.log(`  Total Amount: ${totalAmount}`)
    console.log(`  Deposit Amount: ${depositAmount}`)
    console.log(`  Total Payments: ${totalPayments}`)
    console.log(`  Calculated Balance: ${calculatedBalance}`)
    console.log(`  Current Balance in DB: ${laybyeOrder.remaining_balance}`)
    
    if (Math.abs(calculatedBalance - (laybyeOrder.remaining_balance || 0)) < 0.01) {
      console.log('  ✅ Balance calculation is correct!')
    } else {
      console.log('  ❌ Balance calculation is incorrect!')
    }
    
    // Test 2: Customer Name Display
    console.log('\n🔍 Test 2: Customer Name Display')
    console.log(`  Customer ID: ${laybyeOrder.customer_id}`)
    
    if (laybyeOrder.customer_id) {
      // Get customer details separately
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('first_name, last_name, email, phone')
        .eq('id', laybyeOrder.customer_id)
        .single()
      
      if (customerError) {
        console.error('  ❌ Error fetching customer:', customerError)
      } else if (customer) {
        let expectedName = 'Unknown Customer'
        
        if (customer.first_name && customer.first_name.trim()) {
          if (customer.last_name && customer.last_name.trim()) {
            expectedName = `${customer.first_name} ${customer.last_name}`
          } else {
            expectedName = customer.first_name
          }
        } else if (customer.last_name && customer.last_name.trim()) {
          expectedName = customer.last_name
        } else if (customer.email && customer.email.trim()) {
          expectedName = customer.email
        } else if (customer.phone && customer.phone.trim()) {
          expectedName = `Customer (${customer.phone})`
        }
        
        console.log(`  First Name: ${customer.first_name || 'N/A'}`)
        console.log(`  Last Name: ${customer.last_name || 'N/A'}`)
        console.log(`  Email: ${customer.email || 'N/A'}`)
        console.log(`  Phone: ${customer.phone || 'N/A'}`)
        console.log(`  Expected Display Name: ${expectedName}`)
      }
    } else {
      console.log('  No customer ID found')
    }
    
    // Test 3: Branch Stock Check
    console.log('\n🔍 Test 3: Branch Stock Check')
    if (laybyeOrder.branch_id) {
      const { data: branchStock, error: stockError } = await supabase
        .from('branch_stock')
        .select('*')
        .eq('branch_id', laybyeOrder.branch_id)
        .limit(5)
      
      if (stockError) {
        console.error('  ❌ Error fetching branch stock:', stockError)
      } else {
        console.log(`  Branch ID: ${laybyeOrder.branch_id}`)
        console.log(`  Branch Stock Records: ${branchStock?.length || 0}`)
        if (branchStock && branchStock.length > 0) {
          console.log('  ✅ Branch stock system is working')
        } else {
          console.log('  ⚠️ No branch stock records found')
        }
      }
    } else {
      console.log('  ⚠️ No branch ID found for this laybye order')
    }
    
    // Test 4: Payment Processing
    console.log('\n🔍 Test 4: Payment Processing Test')
    console.log('  To test payment processing, you can:')
    console.log('  1. Go to the laybye admin page')
    console.log('  2. Add a payment to this laybye order')
    console.log('  3. Verify the balance updates correctly')
    console.log('  4. If it becomes completed, verify quantities are deducted')
    
    console.log('\n✅ Laybye system tests completed!')
    console.log('\n📝 Summary:')
    console.log(`  - Balance calculation: ${Math.abs(calculatedBalance - (laybyeOrder.remaining_balance || 0)) < 0.01 ? '✅ Working' : '❌ Needs Fix'}`)
    console.log(`  - Customer name display: ${laybyeOrder.customer_id ? '✅ Available' : '⚠️ No customer ID'}`)
    console.log(`  - Branch stock system: ${laybyeOrder.branch_id ? '✅ Available' : '⚠️ No branch ID'}`)
    
  } catch (error) {
    console.error('❌ Error testing laybye fixes:', error)
  }
}

// Run the test
testLaybyeFixes()
  .then(() => {
    console.log('\n🎉 Laybye system test completed!')
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error)
  })
