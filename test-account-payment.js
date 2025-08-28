const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAccountPayment() {
  try {
    console.log('🧪 Testing account payment functions...')
    
    // First, let's get a customer to test with
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, current_balance, credit_limit')
      .limit(1)
    
    if (customerError) {
      console.error('Error fetching customers:', customerError)
      return
    }
    
    if (!customers || customers.length === 0) {
      console.error('No customers found in database')
      return
    }
    
    const customer = customers[0]
    console.log('📋 Testing with customer:', {
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      current_balance: customer.current_balance,
      credit_limit: customer.credit_limit
    })
    
    // Test the update_customer_balance function
    const testAmount = 50.00
    console.log(`💰 Testing account payment of ${testAmount}...`)
    
    const { data: result, error } = await supabase
      .rpc('update_customer_balance', {
        p_customer_id: customer.id,
        p_amount: testAmount
      })
    
    if (error) {
      console.error('❌ Error testing account payment:', error)
      return
    }
    
    console.log('✅ Account payment test result:', result)
    
    // Verify the balance was updated
    const { data: updatedCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('id', customer.id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching updated customer:', fetchError)
      return
    }
    
    console.log('📊 Balance verification:')
    console.log('  - Old balance:', customer.current_balance)
    console.log('  - New balance:', updatedCustomer.current_balance)
    console.log('  - Expected:', customer.current_balance - testAmount)
    console.log('  - Match:', updatedCustomer.current_balance === customer.current_balance - testAmount)
    
    // Check credit_accounts table
    const { data: creditAccount, error: creditError } = await supabase
      .from('credit_accounts')
      .select('current_balance')
      .eq('customer_id', customer.id)
      .single()
    
    if (creditError) {
      console.log('⚠️  No credit_accounts record found (this is OK if customer doesn\'t have one)')
    } else {
      console.log('📈 Credit account balance:', creditAccount.current_balance)
      console.log('  - Synced correctly:', creditAccount.current_balance === updatedCustomer.current_balance)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAccountPayment()
