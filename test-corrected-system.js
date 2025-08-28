const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCorrectedSystem() {
  try {
    console.log('🧪 Testing Corrected Credit System...')
    
    // Test 1: Check if customers table exists and has data
    console.log('\n📋 Test 1: Checking customers table...')
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(3)
    
    if (customerError) {
      console.error('❌ Error fetching customers:', customerError)
      return
    }
    
    console.log('✅ Customers found:', customers.length)
    customers.forEach(customer => {
      console.log(`  - ${customer.first_name} ${customer.last_name}: Account Balance ${customer.account_balance}, Credit Limit ${customer.credit_limit}`)
    })
    
    // Test 2: Test credit purchase (subtract from account balance)
    console.log('\n💰 Test 2: Testing credit purchase...')
    if (customers.length > 0) {
      const testCustomer = customers[0]
      const testAmount = 300.00
      
      console.log(`Testing credit purchase of ${testAmount} for customer ${testCustomer.first_name} ${testCustomer.last_name}`)
      console.log(`Current account balance: ${testCustomer.account_balance}`)
      console.log(`Credit limit: ${testCustomer.credit_limit}`)
      
      const { data: purchaseResult, error: purchaseError } = await supabase
        .rpc('process_credit_purchase', {
          p_customer_id: testCustomer.id,
          p_amount: testAmount,
          p_sale_id: 'test-sale-123'
        })
      
      if (purchaseError) {
        console.error('❌ Error testing credit purchase:', purchaseError)
      } else {
        console.log('✅ Credit purchase result:', purchaseResult)
        
        // Verify balance was updated
        const { data: updatedCustomer, error: fetchError } = await supabase
          .from('customers')
          .select('account_balance')
          .eq('id', testCustomer.id)
          .single()
        
        if (fetchError) {
          console.error('Error fetching updated customer:', fetchError)
        } else {
          console.log(`Balance verification: ${testCustomer.account_balance} → ${updatedCustomer.account_balance}`)
          console.log(`Expected: ${testCustomer.account_balance - testAmount}`)
          console.log(`Match: ${updatedCustomer.account_balance === testCustomer.account_balance - testAmount}`)
        }
      }
    }
    
    // Test 3: Test account payment (add money to account)
    console.log('\n💳 Test 3: Testing account payment...')
    if (customers.length > 1) {
      const testCustomer = customers[1]
      const testAmount = 200.00
      
      console.log(`Testing account payment of ${testAmount} for customer ${testCustomer.first_name} ${testCustomer.last_name}`)
      console.log(`Current account balance: ${testCustomer.account_balance}`)
      
      const { data: paymentResult, error: paymentError } = await supabase
        .rpc('process_account_payment', {
          p_customer_id: testCustomer.id,
          p_amount: testAmount,
          p_sale_id: 'test-payment-123'
        })
      
      if (paymentError) {
        console.error('❌ Error testing account payment:', paymentError)
      } else {
        console.log('✅ Account payment result:', paymentResult)
        
        // Verify balance was updated
        const { data: updatedCustomer, error: fetchError } = await supabase
          .from('customers')
          .select('account_balance')
          .eq('id', testCustomer.id)
          .single()
        
        if (fetchError) {
          console.error('Error fetching updated customer:', fetchError)
        } else {
          console.log(`Balance verification: ${testCustomer.account_balance} → ${updatedCustomer.account_balance}`)
          console.log(`Expected: ${testCustomer.account_balance + testAmount}`)
          console.log(`Match: ${updatedCustomer.account_balance === testCustomer.account_balance + testAmount}`)
        }
      }
    }
    
    // Test 4: Test credit limit enforcement
    console.log('\n🚫 Test 4: Testing credit limit enforcement...')
    if (customers.length > 2) {
      const testCustomer = customers[2]
      const excessiveAmount = 5000.00 // Much more than their credit limit
      
      console.log(`Testing excessive purchase of ${excessiveAmount} for customer ${testCustomer.first_name} ${testCustomer.last_name}`)
      console.log(`Current account balance: ${testCustomer.account_balance}`)
      console.log(`Credit limit: ${testCustomer.credit_limit}`)
      
      const { data: purchaseResult, error: purchaseError } = await supabase
        .rpc('process_credit_purchase', {
          p_customer_id: testCustomer.id,
          p_amount: excessiveAmount,
          p_sale_id: 'test-excessive-123'
        })
      
      if (purchaseError) {
        console.error('❌ Error testing excessive purchase:', purchaseError)
      } else {
        console.log('✅ Excessive purchase result:', purchaseResult)
        if (!purchaseResult.success) {
          console.log('✅ Credit limit correctly enforced!')
        } else {
          console.log('❌ Credit limit not enforced properly')
        }
      }
    }
    
    // Test 5: Check credit transactions
    console.log('\n📊 Test 5: Checking credit transactions...')
    const { data: transactions, error: transactionError } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (transactionError) {
      console.error('❌ Error fetching transactions:', transactionError)
    } else {
      console.log('✅ Recent transactions:', transactions.length)
      transactions.forEach(tx => {
        console.log(`  - ${tx.type}: ${tx.amount} (Balance after: ${tx.balance_after})`)
      })
    }
    
    console.log('\n🎉 Corrected credit system test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCorrectedSystem()
