const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndCreateTables() {
  try {
    console.log('Checking user management tables...')
    
    // Check if users table exists
    const { data: usersTable, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('Users table does not exist. Creating user management tables...')
      
      // Read and execute the migration
      const migrationPath = path.join(__dirname, 'supabase-migration-user-management.sql')
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
        
        // Split the SQL into individual statements
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
        
        for (const statement of statements) {
          if (statement.trim()) {
            console.log('Executing:', statement.substring(0, 50) + '...')
            const { error } = await supabase.rpc('exec_sql', { sql: statement })
            if (error) {
              console.error('Error executing statement:', error)
              console.error('Statement:', statement)
            }
          }
        }
        
        console.log('User management tables created successfully!')
      } else {
        console.error('Migration file not found:', migrationPath)
      }
    } else if (usersError) {
      console.error('Error checking users table:', usersError)
    } else {
      console.log('Users table already exists.')
    }
    
    // Check if user_roles table exists
    const { data: rolesTable, error: rolesError } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1)
    
    if (rolesError && rolesError.code === 'PGRST116') {
      console.log('User roles table does not exist. Please run the migration manually.')
    } else if (rolesError) {
      console.error('Error checking user_roles table:', rolesError)
    } else {
      console.log('User roles table exists.')
    }
    
    // Check if permissions table exists
    const { data: permissionsTable, error: permissionsError } = await supabase
      .from('permissions')
      .select('id')
      .limit(1)
    
    if (permissionsError && permissionsError.code === 'PGRST116') {
      console.log('Permissions table does not exist. Please run the migration manually.')
    } else if (permissionsError) {
      console.error('Error checking permissions table:', permissionsError)
    } else {
      console.log('Permissions table exists.')
    }
    
    console.log('User management tables check completed!')
    
  } catch (error) {
    console.error('Error checking tables:', error)
  }
}

checkAndCreateTables() 