// Test Frontend Authentication
// Run this in your browser console on the POS page

console.log('🔍 Testing Frontend Authentication...')

// Test 1: Check if Supabase client is available
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client found in window')
} else {
  console.log('❌ Supabase client not found in window')
}

// Test 2: Check current session
async function testSession() {
  try {
    const { data: { session }, error } = await window.supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Session error:', error)
      return
    }
    
    if (session) {
      console.log('✅ Session found:', {
        user: session.user?.email,
        role: session.user?.role,
        expires_at: session.expires_at
      })
    } else {
      console.log('❌ No session found - user not authenticated')
    }
  } catch (error) {
    console.log('❌ Error getting session:', error)
  }
}

// Test 3: Test customer table access
async function testCustomerAccess() {
  try {
    console.log('🔍 Testing customer table access...')
    
    const { data, error } = await window.supabase
      .from('customers')
      .select('id, customer_number, first_name, last_name')
      .limit(1)
    
    if (error) {
      console.log('❌ Customer access error:', error)
      console.log('❌ Error code:', error.code)
      console.log('❌ Error message:', error.message)
    } else {
      console.log('✅ Customer access successful:', data)
    }
  } catch (error) {
    console.log('❌ Error testing customer access:', error)
  }
}

// Test 4: Test customer creation
async function testCustomerCreation() {
  try {
    console.log('🔍 Testing customer creation...')
    
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
      notes: 'Test customer',
      tags: []
    }
    
    const { data, error } = await window.supabase
      .from('customers')
      .insert(testCustomer)
      .select()
      .single()
    
    if (error) {
      console.log('❌ Customer creation error:', error)
      console.log('❌ Error code:', error.code)
      console.log('❌ Error message:', error.message)
    } else {
      console.log('✅ Customer creation successful:', data)
      
      // Clean up - delete the test customer
      await window.supabase
        .from('customers')
        .delete()
        .eq('id', data.id)
      
      console.log('✅ Test customer cleaned up')
    }
  } catch (error) {
    console.log('❌ Error testing customer creation:', error)
  }
}

// Run all tests
console.log('🚀 Running authentication tests...')
testSession().then(() => {
  testCustomerAccess().then(() => {
    testCustomerCreation()
  })
})

console.log('📋 Test commands available:')
console.log('- testSession() - Check current session')
console.log('- testCustomerAccess() - Test reading customers')
console.log('- testCustomerCreation() - Test creating a customer')
