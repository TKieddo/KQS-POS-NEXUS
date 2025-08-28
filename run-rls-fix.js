const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runRlsFix() {
  try {
    console.log('🔧 Running RLS fix for receipt_templates table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-receipt-templates-rls.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error)
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    console.log('🎉 RLS fix completed!')
    
    // Verify the policies were created
    console.log('\n📋 Verifying policies...')
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'receipt_templates')
    
    if (policyError) {
      console.error('Error checking policies:', policyError)
    } else {
      console.log('Current policies for receipt_templates:')
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error running RLS fix:', error)
    process.exit(1)
  }
}

// Alternative approach using direct SQL execution
async function runRlsFixAlternative() {
  try {
    console.log('🔧 Running RLS fix (alternative method)...')
    
    // Drop existing policies
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON receipt_templates;',
      'DROP POLICY IF EXISTS "Enable insert for authenticated users" ON receipt_templates;',
      'DROP POLICY IF EXISTS "Enable update for authenticated users" ON receipt_templates;',
      'DROP POLICY IF EXISTS "Enable delete for authenticated users" ON receipt_templates;'
    ]
    
    for (const dropPolicy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: dropPolicy })
      if (error) {
        console.log('Note: Could not drop policy (may not exist):', error.message)
      }
    }
    
    // Create new policies
    const createPolicies = [
      `CREATE POLICY "Enable read access for authenticated users" ON receipt_templates
       FOR SELECT TO authenticated USING (true);`,
      
      `CREATE POLICY "Enable insert for authenticated users" ON receipt_templates
       FOR INSERT TO authenticated WITH CHECK (true);`,
      
      `CREATE POLICY "Enable update for authenticated users" ON receipt_templates
       FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`,
      
      `CREATE POLICY "Enable delete for authenticated users" ON receipt_templates
       FOR DELETE TO authenticated USING (true);`
    ]
    
    for (const createPolicy of createPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: createPolicy })
      if (error) {
        console.error('Error creating policy:', error)
      } else {
        console.log('✅ Policy created successfully')
      }
    }
    
    console.log('🎉 RLS fix completed (alternative method)!')
    
  } catch (error) {
    console.error('❌ Error running RLS fix (alternative):', error)
  }
}

// Run the fix
runRlsFixAlternative()
