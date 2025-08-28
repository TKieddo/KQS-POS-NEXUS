const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCustomerConnection() {
  try {
    console.log('🔍 Testing Customer Database Connection...')
    
    // Test 1: Check if customers table exists and has data
    console.log('\n📋 Test 1: Checking customers table...')
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
    
    if (customerError) {
      console.error('❌ Error fetching customers:', customerError)
      return
    }
    
    console.log('✅ Customers found:', customers.length)
    
    if (customers.length === 0) {
      console.log('⚠️  No customers found in database!')
      console.log('Creating sample customers...')
      
      // Create sample customers
      const sampleCustomers = [
        {
          customer_number: 'CUST001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          account_balance: 200.00,
          credit_limit: 1000.00,
          status: 'active',
          customer_type: 'regular'
        },
        {
          customer_number: 'CUST002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          account_balance: 0.00,
          credit_limit: 1500.00,
          status: 'active',
          customer_type: 'regular'
        },
        {
          customer_number: 'CUST003',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1234567892',
          account_balance: 500.00,
          credit_limit: 2000.00,
          status: 'active',
          customer_type: 'vip'
        }
      ]
      
      for (const customerData of sampleCustomers) {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert(customerData)
          .select()
          .single()
        
        if (insertError) {
          console.error('❌ Error creating customer:', insertError)
        } else {
          console.log(`✅ Created customer: ${newCustomer.first_name} ${newCustomer.last_name}`)
        }
      }
      
      // Fetch customers again
      const { data: newCustomers, error: newError } = await supabase
        .from('customers')
        .select('*')
      
      if (newError) {
        console.error('❌ Error fetching new customers:', newError)
      } else {
        console.log('✅ Total customers after creation:', newCustomers.length)
        newCustomers.forEach(customer => {
          console.log(`  - ${customer.first_name} ${customer.last_name}: Balance ${customer.account_balance}, Limit ${customer.credit_limit}`)
        })
      }
    } else {
      customers.forEach(customer => {
        console.log(`  - ${customer.first_name} ${customer.last_name}: Balance ${customer.account_balance}, Limit ${customer.credit_limit}`)
      })
    }
    
    // Test 2: Check if the query with specific fields works
    console.log('\n🔍 Test 2: Testing specific field query...')
    const { data: specificCustomers, error: specificError } = await supabase
      .from('customers')
      .select(`
        id,
        customer_number,
        first_name,
        last_name,
        email,
        phone,
        account_balance,
        credit_limit,
        status,
        customer_type
      `)
      .eq('status', 'active')
      .order('first_name')
    
    if (specificError) {
      console.error('❌ Error with specific field query:', specificError)
    } else {
      console.log('✅ Specific field query successful:', specificCustomers.length, 'customers')
      if (specificCustomers.length > 0) {
        console.log('Sample customer data:', specificCustomers[0])
      }
    }
    
    console.log('\n🎉 Customer connection test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCustomerConnection()
