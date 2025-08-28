// Test Customer Creation - Frontend Test
// Run this in your browser console on the POS page

console.log('🧪 Testing Customer Creation...')

// Test 1: Check if we can access the customers table
async function testCustomerAccess() {
  try {
    console.log('📋 Testing customer table access...')
    
    const { data, error } = await window.supabase
      .from('customers')
      .select('id, customer_number, first_name, last_name')
      .limit(1)
    
    if (error) {
      console.log('❌ Customer access error:', error)
      console.log('❌ Error code:', error.code)
      console.log('❌ Error message:', error.message)
      return false
    } else {
      console.log('✅ Customer access successful:', data)
      return true
    }
  } catch (error) {
    console.log('❌ Error testing customer access:', error)
    return false
  }
}

// Test 2: Test creating a customer
async function testCustomerCreation() {
  try {
    console.log('➕ Testing customer creation...')
    
    const testCustomer = {
      customer_number: `TEST-${Date.now()}`,
      first_name: 'Test',
      last_name: 'Customer',
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      address_street: 'Test Street',
      address_city: 'Test City',
      address_state: 'Test State',
      address_zip_code: '12345',
      address_country: 'South Africa',
      status: 'active',
      customer_type: 'regular',
      account_balance: 0,
      credit_limit: 1000,
      branch_id: null,
      notes: 'Test customer created from console',
      tags: []
    }
    
    console.log('📝 Inserting customer data:', testCustomer)
    
    const { data, error } = await window.supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()
    
    if (error) {
      console.log('❌ Customer creation error:', error)
      console.log('❌ Error code:', error.code)
      console.log('❌ Error message:', error.message)
      console.log('❌ Error details:', error.details)
      return false
    } else {
      console.log('✅ Customer creation successful:', data)
      
      // Clean up - delete the test customer
      console.log('🧹 Cleaning up test customer...')
      const { error: deleteError } = await window.supabase
        .from('customers')
        .delete()
        .eq('id', data.id)
      
      if (deleteError) {
        console.log('⚠️ Warning: Could not clean up test customer:', deleteError)
      } else {
        console.log('✅ Test customer cleaned up successfully')
      }
      
      return true
    }
  } catch (error) {
    console.log('❌ Error testing customer creation:', error)
    return false
  }
}

// Test 3: Check current session
async function checkSession() {
  try {
    console.log('🔐 Checking current session...')
    
    const { data: { session }, error } = await window.supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Session error:', error)
      return false
    }
    
    if (session) {
      console.log('✅ Session found:', {
        user: session.user?.email,
        role: session.user?.role,
        expires_at: session.expires_at
      })
      return true
    } else {
      console.log('❌ No session found - user not authenticated')
      return false
    }
  } catch (error) {
    console.log('❌ Error checking session:', error)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all tests...')
  
  const sessionOk = await checkSession()
  if (!sessionOk) {
    console.log('❌ Session test failed - cannot proceed')
    return
  }
  
  const accessOk = await testCustomerAccess()
  if (!accessOk) {
    console.log('❌ Access test failed - cannot proceed')
    return
  }
  
  const creationOk = await testCustomerCreation()
  if (creationOk) {
    console.log('🎉 ALL TESTS PASSED! Customer creation should work in the app.')
  } else {
    console.log('❌ Customer creation test failed - check RLS policies')
  }
}

// Run tests
runAllTests()

console.log('📋 Manual test commands available:')
console.log('- checkSession() - Check authentication')
console.log('- testCustomerAccess() - Test reading customers')
console.log('- testCustomerCreation() - Test creating a customer')
console.log('- runAllTests() - Run all tests')
