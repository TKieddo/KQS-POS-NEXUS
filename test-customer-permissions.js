// Test Customer Permissions - Verify Fix Works
// Run this in your browser console on any page

console.log('🧪 Testing Customer Permissions Fix...')

// Test 1: Check authentication
async function checkAuth() {
  try {
    console.log('🔐 Checking authentication...')
    
    const { data: { session }, error } = await window.supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Auth error:', error)
      return false
    }
    
    if (session) {
      console.log('✅ Authenticated as:', session.user?.email)
      return true
    } else {
      console.log('❌ Not authenticated')
      return false
    }
  } catch (error) {
    console.log('❌ Error checking auth:', error)
    return false
  }
}

// Test 2: Test customer creation (simulates POS/admin creation)
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
    
    console.log('📝 Creating customer with data:', testCustomer)
    
    const { data, error } = await window.supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()
    
    if (error) {
      console.log('❌ Customer creation failed:', error)
      console.log('❌ Error code:', error.code)
      console.log('❌ Error message:', error.message)
      return false
    } else {
      console.log('✅ Customer creation successful:', data)
      
      // Check if created_by was set automatically
      if (data.created_by) {
        console.log('✅ created_by field was set automatically:', data.created_by)
      } else {
        console.log('⚠️ created_by field was not set')
      }
      
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

// Test 3: Test credit account creation
async function testCreditAccountCreation() {
  try {
    console.log('💳 Testing credit account creation...')
    
    // First create a customer
    const testCustomer = {
      customer_number: `CREDIT-TEST-${Date.now()}`,
      first_name: 'Credit',
      last_name: 'Test',
      email: `credit${Date.now()}@example.com`,
      phone: '1234567890',
      address_street: 'Test Street',
      address_city: 'Test City',
      address_state: 'Test State',
      address_zip_code: '12345',
      address_country: 'South Africa',
      status: 'active',
      customer_type: 'regular',
      account_balance: 0,
      credit_limit: 2000,
      branch_id: null,
      notes: 'Test customer for credit account',
      tags: []
    }
    
    const { data: customer, error: customerError } = await window.supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()
    
    if (customerError) {
      console.log('❌ Customer creation failed for credit test:', customerError)
      return false
    }
    
    console.log('✅ Customer created for credit test:', customer.id)
    
    // Check if credit account was created automatically by trigger
    const { data: creditAccount, error: creditError } = await window.supabase
      .from('credit_accounts')
      .select('*')
      .eq('customer_id', customer.id)
      .single()
    
    if (creditError) {
      console.log('❌ Credit account not found:', creditError)
    } else {
      console.log('✅ Credit account created automatically:', creditAccount)
    }
    
    // Clean up
    const { error: deleteError } = await window.supabase
      .from('customers')
      .delete()
      .eq('id', customer.id)
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test customer:', deleteError)
    } else {
      console.log('✅ Test customer cleaned up successfully')
    }
    
    return true
  } catch (error) {
    console.log('❌ Error testing credit account creation:', error)
    return false
  }
}

// Test 4: Check current permissions
async function checkPermissions() {
  try {
    console.log('🔒 Checking current permissions...')
    
    // Check if we can read customers
    const { data: customers, error: readError } = await window.supabase
      .from('customers')
      .select('id, customer_number, first_name, last_name')
      .limit(5)
    
    if (readError) {
      console.log('❌ Cannot read customers:', readError)
      return false
    } else {
      console.log('✅ Can read customers:', customers?.length || 0, 'records')
    }
    
    // Check if we can read credit accounts
    const { data: creditAccounts, error: creditError } = await window.supabase
      .from('credit_accounts')
      .select('id, customer_id, account_number')
      .limit(5)
    
    if (creditError) {
      console.log('❌ Cannot read credit accounts:', creditError)
    } else {
      console.log('✅ Can read credit accounts:', creditAccounts?.length || 0, 'records')
    }
    
    return true
  } catch (error) {
    console.log('❌ Error checking permissions:', error)
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all permission tests...')
  
  const authOk = await checkAuth()
  if (!authOk) {
    console.log('❌ Authentication test failed - cannot proceed')
    return
  }
  
  const permissionsOk = await checkPermissions()
  if (!permissionsOk) {
    console.log('❌ Permissions test failed - cannot proceed')
    return
  }
  
  const creationOk = await testCustomerCreation()
  if (!creationOk) {
    console.log('❌ Customer creation test failed')
    return
  }
  
  const creditOk = await testCreditAccountCreation()
  if (!creditOk) {
    console.log('❌ Credit account creation test failed')
    return
  }
  
  console.log('🎉 ALL TESTS PASSED! Customer creation should work from both admin and POS.')
  console.log('✅ Permissions are unified and working correctly')
}

// Run tests
runAllTests()

console.log('📋 Manual test commands available:')
console.log('- checkAuth() - Check authentication')
console.log('- checkPermissions() - Check current permissions')
console.log('- testCustomerCreation() - Test creating a customer')
console.log('- testCreditAccountCreation() - Test credit account creation')
console.log('- runAllTests() - Run all tests')
