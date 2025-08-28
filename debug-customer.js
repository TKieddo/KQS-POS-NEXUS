require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugCustomer() {
  console.log('🔍 Debugging Customer Data...')
  
  try {
    // Get the laybye order first
    const { data: laybyeOrders, error: laybyeError } = await supabase
      .from('laybye_orders')
      .select('*')
      .limit(1)
    
    if (laybyeError) {
      console.error('❌ Error fetching laybye orders:', laybyeError)
      return
    }
    
    if (!laybyeOrders || laybyeOrders.length === 0) {
      console.log('⚠️ No laybye orders found')
      return
    }
    
    const laybyeOrder = laybyeOrders[0]
    console.log(`\n📋 Laybye Order: ${laybyeOrder.order_number}`)
    console.log(`Customer ID: ${laybyeOrder.customer_id}`)
    
    // Check if customer exists
    if (laybyeOrder.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', laybyeOrder.customer_id)
      
      if (customerError) {
        console.error('❌ Error fetching customer:', customerError)
      } else {
        console.log('\n👤 Customer Data:')
        console.log(customer)
        
        if (customer && customer.length > 0) {
          const cust = customer[0]
          console.log('\n📝 Customer Details:')
          console.log(`  First Name: ${cust.first_name || 'N/A'}`)
          console.log(`  Last Name: ${cust.last_name || 'N/A'}`)
          console.log(`  Email: ${cust.email || 'N/A'}`)
          console.log(`  Phone: ${cust.phone || 'N/A'}`)
          
          // Test the customer name function
          let customerName = 'Unknown Customer'
          if (cust.first_name && cust.first_name.trim()) {
            if (cust.last_name && cust.last_name.trim()) {
              customerName = `${cust.first_name} ${cust.last_name}`
            } else {
              customerName = cust.first_name
            }
          } else if (cust.last_name && cust.last_name.trim()) {
            customerName = cust.last_name
          } else if (cust.email && cust.email.trim()) {
            customerName = cust.email
          } else if (cust.phone && cust.phone.trim()) {
            customerName = `Customer (${cust.phone})`
          }
          
          console.log(`\n🎯 Expected Customer Name: ${customerName}`)
        } else {
          console.log('❌ No customer found with this ID')
        }
      }
    } else {
      console.log('⚠️ No customer ID in laybye order')
    }
    
    // Check all customers
    console.log('\n🔍 All Customers:')
    const { data: allCustomers, error: allCustomersError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone')
      .limit(5)
    
    if (allCustomersError) {
      console.error('❌ Error fetching all customers:', allCustomersError)
    } else {
      console.log(`Found ${allCustomers?.length || 0} customers:`)
      allCustomers?.forEach((cust, index) => {
        console.log(`  ${index + 1}. ID: ${cust.id}`)
        console.log(`     Name: ${cust.first_name || 'N/A'} ${cust.last_name || 'N/A'}`)
        console.log(`     Email: ${cust.email || 'N/A'}`)
        console.log(`     Phone: ${cust.phone || 'N/A'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error debugging customer:', error)
  }
}

// Run the debug
debugCustomer()
  .then(() => {
    console.log('\n🎉 Customer debug completed!')
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error)
  })
