const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserManagement() {
  try {
    console.log('🧪 Testing user management tables...');
    
    // Test 1: Check if tables exist and are accessible
    console.log('\n1️⃣ Testing table access...');
    const tables = ['users', 'user_roles', 'permissions', 'role_permissions', 'security_settings', 'user_activity_logs'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: accessible`);
        }
      } catch (err) {
        console.error(`❌ ${table}: ${err.message}`);
      }
    }
    
    // Test 2: Check if roles exist
    console.log('\n2️⃣ Testing roles...');
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) {
        console.error(`❌ Error fetching roles: ${error.message}`);
      } else {
        console.log(`✅ Found ${roles?.length || 0} roles:`, roles?.map(r => r.name).join(', '));
      }
    } catch (err) {
      console.error(`❌ Error testing roles: ${err.message}`);
    }
    
    // Test 3: Check if permissions exist
    console.log('\n3️⃣ Testing permissions...');
    try {
      const { data: permissions, error } = await supabase
        .from('permissions')
        .select('*');
      
      if (error) {
        console.error(`❌ Error fetching permissions: ${error.message}`);
      } else {
        console.log(`✅ Found ${permissions?.length || 0} permissions`);
      }
    } catch (err) {
      console.error(`❌ Error testing permissions: ${err.message}`);
    }
    
    // Test 4: Check if security settings exist
    console.log('\n4️⃣ Testing security settings...');
    try {
      const { data: settings, error } = await supabase
        .from('security_settings')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error fetching security settings: ${error.message}`);
      } else {
        console.log(`✅ Security settings: ${settings?.length ? 'configured' : 'not found'}`);
      }
    } catch (err) {
      console.error(`❌ Error testing security settings: ${err.message}`);
    }
    
    // Test 5: Try to create a test user
    console.log('\n5️⃣ Testing user creation...');
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'admin')
        .limit(1);
      
      if (roles && roles.length > 0) {
        const { data: user, error } = await supabase
          .from('users')
          .insert({
            email: 'test@example.com',
            full_name: 'Test User',
            role_id: roles[0].id,
            is_active: true
          })
          .select();
        
        if (error) {
          console.error(`❌ Error creating test user: ${error.message}`);
        } else {
          console.log('✅ Test user created successfully');
          
          // Clean up
          await supabase
            .from('users')
            .delete()
            .eq('email', 'test@example.com');
          console.log('🧹 Test user cleaned up');
        }
      } else {
        console.log('⚠️ No admin role found, skipping user creation test');
      }
    } catch (err) {
      console.error(`❌ Error in user creation test: ${err.message}`);
    }
    
    console.log('\n🎉 User management test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserManagement(); 