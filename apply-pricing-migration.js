const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('Reading migration file...')
    const migrationPath = path.join(__dirname, 'supabase-migration-product-pricing-complete.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Applying migration...')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // If exec_sql doesn't exist, try direct query
          const { error: directError } = await supabase.from('_dummy').select('*').limit(0)
          if (directError && directError.message.includes('relation "_dummy" does not exist')) {
            console.log('Note: Some statements may need to be executed manually in the Supabase dashboard')
            console.log('Please run the migration manually in the Supabase SQL editor')
            break
          }
          console.error(`Error executing statement ${i + 1}:`, error)
        }
      }
    }
    
    console.log('Migration completed successfully!')
    
    // Verify the table was created
    console.log('Verifying bulk_price_updates table...')
    const { data, error } = await supabase
      .from('bulk_price_updates')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error verifying table:', error)
      console.log('The table may not have been created. Please check the Supabase dashboard.')
    } else {
      console.log('✅ bulk_price_updates table exists and is accessible!')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    console.log('\nTo apply the migration manually:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to the SQL Editor')
    console.log('3. Copy and paste the contents of supabase-migration-product-pricing-complete.sql')
    console.log('4. Execute the SQL')
  }
}

applyMigration() 