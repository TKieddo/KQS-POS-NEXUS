const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFreshSystem() {
  try {
    console.log('🧪 Testing Fresh Customer and Credit System...')
    
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
      console.log(`  - ${customer.first_name} ${customer.last_name}: Balance ${customer.current_balance}, Credit Limit ${customer.credit_limit}`)
    })
    
    // Test 2: Check if credit_accounts table is synced
    console.log('\n📈 Test 2: Checking credit_accounts sync...')
    const { data: creditAccounts, error: creditError } = await supabase
      .from('credit_accounts')
      .select('*')
    
    if (creditError) {
      console.error('❌ Error fetching credit accounts:', creditError)
    } else {
      console.log('✅ Credit accounts found:', creditAccounts.length)
      creditAccounts.forEach(account => {
        console.log(`  - Customer ${account.customer_id}: Balance ${account.current_balance}`)
      })
    }
    
    // Test 3: Test account payment function
    console.log('\n💰 Test 3: Testing account payment...')
    if (customers.length > 0) {
      const testCustomer = customers[0]
      const testAmount = 50.00
      
      console.log(`Testing payment of ${testAmount} for customer ${testCustomer.first_name} ${testCustomer.last_name}`)
      console.log(`Current balance: ${testCustomer.current_balance}`)
      
      const { data: paymentResult, error: paymentError } = await supabase
        .rpc('process_account_payment', {
          p_customer_id: testCustomer.id,
          p_amount: testAmount,
          p_sale_id: 'test-sale-123'
        })
      
      if (paymentError) {
        console.error('❌ Error testing account payment:', paymentError)
      } else {
        console.log('✅ Account payment result:', paymentResult)
        
        // Verify balance was updated
        const { data: updatedCustomer, error: fetchError } = await supabase
          .from('customers')
          .select('current_balance')
          .eq('id', testCustomer.id)
          .single()
        
        if (fetchError) {
          console.error('Error fetching updated customer:', fetchError)
        } else {
          console.log(`Balance verification: ${testCustomer.current_balance} → ${updatedCustomer.current_balance}`)
          console.log(`Expected: ${testCustomer.current_balance - testAmount}`)
          console.log(`Match: ${updatedCustomer.current_balance === testCustomer.current_balance - testAmount}`)
        }
      }
    }
    
    // Test 4: Check credit transactions
    console.log('\n📊 Test 4: Checking credit transactions...')
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
    
    // Test 5: Test product quantity update function
    console.log('\n📦 Test 5: Testing product quantity update...')
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(1)
    
    if (productError) {
      console.error('❌ Error fetching products:', productError)
    } else if (products.length > 0) {
      const testProduct = products[0]
      console.log(`Testing quantity update for product: ${testProduct.name}`)
      console.log(`Current quantity: ${testProduct.stock_quantity}`)
      
      const { data: quantityResult, error: quantityError } = await supabase
        .rpc('update_product_quantities', {
          p_sale_items: [{
            product_id: testProduct.id,
            variant_id: null,
            quantity: 2
          }]
        })
      
      if (quantityError) {
        console.error('❌ Error testing quantity update:', quantityError)
      } else {
        console.log('✅ Quantity update result:', quantityResult)
        
        // Verify quantity was updated
        const { data: updatedProduct, error: fetchError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', testProduct.id)
          .single()
        
        if (fetchError) {
          console.error('Error fetching updated product:', fetchError)
        } else {
          console.log(`Quantity verification: ${testProduct.stock_quantity} → ${updatedProduct.stock_quantity}`)
          console.log(`Expected: ${testProduct.stock_quantity - 2}`)
          console.log(`Match: ${updatedProduct.stock_quantity === testProduct.stock_quantity - 2}`)
        }
      }
    }
    
    console.log('\n🎉 Fresh system test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testFreshSystem()
