const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUserCreation() {
  try {
    console.log('Testing user creation...')
    
    // First, get the available roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, name')
    
    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
      return
    }
    
    console.log('Available roles:', roles)
    
    if (roles.length === 0) {
      console.log('No roles found. Creating default roles...')
      
      // Insert default roles
      const { data: newRoles, error: insertError } = await supabase
        .from('user_roles')
        .insert([
          { name: 'admin', description: 'Full system administrator', is_system_role: true },
          { name: 'manager', description: 'Store manager', is_system_role: true },
          { name: 'cashier', description: 'Cashier', is_system_role: true },
          { name: 'viewer', description: 'Read-only access', is_system_role: true }
        ])
        .select('id, name')
      
      if (insertError) {
        console.error('Error inserting roles:', insertError)
        return
      }
      
      console.log('Default roles created:', newRoles)
    }
    
    // Get the first role for testing
    const { data: testRoles, error: testRolesError } = await supabase
      .from('user_roles')
      .select('id, name')
      .limit(1)
    
    if (testRolesError || !testRoles || testRoles.length === 0) {
      console.error('No roles available for testing')
      return
    }
    
    const testRole = testRoles[0]
    console.log('Using role for test:', testRole)
    
    // Try to create a test user
    const testUser = {
      email: 'test@example.com',
      full_name: 'Test User',
      role_id: testRole.id,
      is_active: true
    }
    
    console.log('Attempting to create user:', testUser)
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(testUser)
      .select('*')
      .single()
    
    if (createError) {
      console.error('Error creating user:', createError)
      
      // Check if it's a column issue
      if (createError.message.includes('role')) {
        console.log('This appears to be a role column issue. Let\'s check the table structure...')
        
        // Try to get table info
        const { data: tableData, error: tableError } = await supabase
          .from('users')
          .select('*')
          .limit(1)
        
        if (tableError) {
          console.error('Error accessing users table:', tableError)
        } else {
          console.log('Users table structure sample:', Object.keys(tableData[0] || {}))
        }
      }
    } else {
      console.log('User created successfully:', newUser)
      
      // Clean up - delete the test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', newUser.id)
      
      if (deleteError) {
        console.error('Error deleting test user:', deleteError)
      } else {
        console.log('Test user cleaned up successfully')
      }
    }
    
  } catch (error) {
    console.error('Error in test:', error)
  }
}

testUserCreation() 