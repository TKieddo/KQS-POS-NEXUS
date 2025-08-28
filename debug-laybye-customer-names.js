// Debug script to investigate laybye customer name issues
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugLaybyeCustomerNames() {
  console.log('🔍 Debugging Laybye Customer Names...')

  try {
    // 1. Get all laybye orders
    const { data: laybyeOrders, error: laybyeError } = await supabase
      .from('laybye_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (laybyeError) {
      console.error('❌ Error fetching laybye orders:', laybyeError)
      return
    }

    console.log(`📋 Found ${laybyeOrders.length} laybye orders`)

    // 2. Check each laybye order
    for (const laybyeOrder of laybyeOrders) {
      console.log(`\n🔍 Laybye Order: ${laybyeOrder.order_number}`)
      console.log(`  Customer ID: ${laybyeOrder.customer_id || 'NULL'}`)
      
      if (laybyeOrder.customer_id) {
        // 3. Get customer details
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', laybyeOrder.customer_id)
          .single()

        if (customerError) {
          console.error(`  ❌ Error fetching customer:`, customerError)
        } else if (customer) {
          console.log(`  👤 Customer Data:`)
          console.log(`    First Name: ${customer.first_name || 'NULL'}`)
          console.log(`    Last Name: ${customer.last_name || 'NULL'}`)
          console.log(`    Email: ${customer.email || 'NULL'}`)
          console.log(`    Phone: ${customer.phone || 'NULL'}`)
          
          // 4. Test the customer name function
          let customerName = 'Unknown Customer'
          if (customer.first_name && customer.first_name.trim()) {
            if (customer.last_name && customer.last_name.trim()) {
              customerName = `${customer.first_name} ${customer.last_name}`
            } else {
              customerName = customer.first_name
            }
          } else if (customer.last_name && customer.last_name.trim()) {
            customerName = customer.last_name
          } else if (customer.email && customer.email.trim()) {
            customerName = customer.email
          } else if (customer.phone && customer.phone.trim()) {
            customerName = `Customer (${customer.phone})`
          }
          
          console.log(`  🎯 Expected Customer Name: ${customerName}`)
          
          // 5. Check if customer has any data at all
          const hasAnyData = customer.first_name || customer.last_name || customer.email || customer.phone
          if (!hasAnyData) {
            console.log(`  ⚠️ Customer has no identifying data!`)
          }
        } else {
          console.log(`  ❌ No customer found with ID: ${laybyeOrder.customer_id}`)
        }
      } else {
        console.log(`  ⚠️ No customer ID in laybye order`)
      }
    }

    // 6. Check all customers to see if there are any issues
    console.log(`\n🔍 Checking all customers...`)
    const { data: allCustomers, error: allCustomersError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone')
      .limit(20)

    if (allCustomersError) {
      console.error('❌ Error fetching all customers:', allCustomersError)
    } else {
      console.log(`📋 Found ${allCustomers.length} customers`)
      
      // Check for customers with no identifying data
      const customersWithNoData = allCustomers.filter(c => 
        !c.first_name && !c.last_name && !c.email && !c.phone
      )
      
      if (customersWithNoData.length > 0) {
        console.log(`⚠️ Found ${customersWithNoData.length} customers with no identifying data:`)
        customersWithNoData.forEach(c => {
          console.log(`  - Customer ID: ${c.id}`)
        })
      }
      
      // Show sample of customers with data
      const customersWithData = allCustomers.filter(c => 
        c.first_name || c.last_name || c.email || c.phone
      ).slice(0, 5)
      
      console.log(`\n✅ Sample customers with data:`)
      customersWithData.forEach(c => {
        let name = 'Unknown'
        if (c.first_name && c.last_name) {
          name = `${c.first_name} ${c.last_name}`
        } else if (c.first_name) {
          name = c.first_name
        } else if (c.last_name) {
          name = c.last_name
        } else if (c.email) {
          name = c.email
        } else if (c.phone) {
          name = `Customer (${c.phone})`
        }
        console.log(`  - ${name} (ID: ${c.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Error in debug function:', error)
  }
}

// Test the getLaybyeOrders function structure
async function testGetLaybyeOrdersStructure() {
  console.log('\n🧪 Testing getLaybyeOrders function structure...')
  
  try {
    // Simulate the getLaybyeOrders function logic
    const { data: laybyeOrders, error: laybyeError } = await supabase
      .from('laybye_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (laybyeError) {
      console.error('❌ Error fetching laybye orders:', laybyeError)
      return
    }

    // Get customer IDs
    const customerIds = [...new Set(laybyeOrders.map(order => order.customer_id).filter(Boolean))]
    console.log(`📋 Customer IDs found: ${customerIds.length}`)

    // Fetch customers separately
    let customers = []
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds)

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError)
      } else {
        customers = customersData || []
        console.log(`✅ Fetched ${customers.length} customers`)
      }
    }

    // Simulate the enrichment process
    const enrichedLaybyeOrders = laybyeOrders.map(order => {
      const customer = customers.find(c => c.id === order.customer_id)
      
      // Build customer display name
      let customerDisplayName = 'Unknown Customer'
      if (customer) {
        if (customer.first_name && customer.first_name.trim()) {
          if (customer.last_name && customer.last_name.trim()) {
            customerDisplayName = `${customer.first_name} ${customer.last_name}`
          } else {
            customerDisplayName = customer.first_name
          }
        } else if (customer.last_name && customer.last_name.trim()) {
          customerDisplayName = customer.last_name
        } else if (customer.email && customer.email.trim()) {
          customerDisplayName = customer.email
        } else if (customer.phone && customer.phone.trim()) {
          customerDisplayName = `Customer (${customer.phone})`
        }
      }
      
      return {
        ...order,
        customers: customer,
        customer_display_name: customerDisplayName
      }
    })

    console.log('\n📊 Enriched laybye orders:')
    enrichedLaybyeOrders.forEach(order => {
      console.log(`\n  Order: ${order.order_number}`)
      console.log(`    Customer ID: ${order.customer_id}`)
      console.log(`    Customer Object:`, order.customers)
      console.log(`    Display Name: ${order.customer_display_name}`)
    })

  } catch (error) {
    console.error('❌ Error in test function:', error)
  }
}

// Run the debug functions
debugLaybyeCustomerNames()
  .then(() => testGetLaybyeOrdersStructure())
  .then(() => {
    console.log('\n✅ Debug complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })
