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

async function applyUserManagementMigration() {
  try {
    console.log('Applying user management migration...')
    
    // First, let's check if the users table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('Error accessing users table:', tableError)
      return
    }
    
    console.log('Users table exists. Checking for role_id column...')
    
    // Try to add the role_id column if it doesn't exist
    try {
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES user_roles(id) ON DELETE SET NULL;
        `
      })
      
      if (alterError) {
        console.log('role_id column might already exist or there was an error:', alterError.message)
      } else {
        console.log('role_id column added successfully!')
      }
    } catch (error) {
      console.log('Could not add role_id column (might already exist):', error.message)
    }
    
    // Check if user_roles table exists
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, name')
        .limit(5)
      
      if (rolesError) {
        console.log('user_roles table does not exist. Creating it...')
        
        // Create the user_roles table
        const createRolesTable = `
          CREATE TABLE IF NOT EXISTS user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            is_system_role BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createRolesTable })
        if (createError) {
          console.error('Error creating user_roles table:', createError)
        } else {
          console.log('user_roles table created successfully!')
          
          // Insert default roles
          const insertRoles = `
            INSERT INTO user_roles (name, description, is_system_role) VALUES
            ('admin', 'Full system administrator with all permissions', TRUE),
            ('manager', 'Store manager with most permissions except user management', TRUE),
            ('cashier', 'Cashier with sales and basic inventory permissions', TRUE),
            ('viewer', 'Read-only access to most data', TRUE)
            ON CONFLICT (name) DO NOTHING;
          `
          
          const { error: insertError } = await supabase.rpc('exec_sql', { sql: insertRoles })
          if (insertError) {
            console.error('Error inserting default roles:', insertError)
          } else {
            console.log('Default roles inserted successfully!')
          }
        }
      } else {
        console.log('user_roles table exists with roles:', rolesData?.map(r => r.name))
      }
    } catch (error) {
      console.error('Error checking/creating user_roles table:', error)
    }
    
    console.log('User management migration completed!')
    
  } catch (error) {
    console.error('Error applying migration:', error)
  }
}

applyUserManagementMigration() 