const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyInventoryTables() {
  try {
    console.log('📋 Reading inventory schema file...')
    
    const schemaPath = path.join(__dirname, 'supabase-multi-branch-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🚀 Applying inventory tables to Supabase...')
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            console.error(`❌ Error executing: ${statement.substring(0, 50)}...`)
            console.error(`   ${error.message}`)
            errorCount++
          } else {
            console.log(`✅ Executed: ${statement.substring(0, 50)}...`)
            successCount++
          }
        } catch (err) {
          console.error(`❌ Failed to execute statement: ${err.message}`)
          errorCount++
        }
      }
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Inventory tables created successfully!')
      console.log('   - central_stock table')
      console.log('   - branch_allocations table')
      console.log('   - Related triggers and functions')
    } else {
      console.log('\n⚠️  Some errors occurred. Check the output above.')
    }
    
  } catch (error) {
    console.error('❌ Failed to apply inventory tables:', error.message)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function applyInventoryTablesDirect() {
  try {
    console.log('📋 Reading inventory schema file...')
    
    const schemaPath = path.join(__dirname, 'supabase-multi-branch-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🚀 Applying inventory tables to Supabase...')
    
    // Execute the entire SQL file
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (error) {
      console.error('❌ Error applying schema:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Inventory tables created successfully!')
    console.log('   - central_stock table')
    console.log('   - branch_allocations table')
    console.log('   - Related triggers and functions')
    
  } catch (error) {
    console.error('❌ Failed to apply inventory tables:', error.message)
    process.exit(1)
  }
}

// Check if tables exist
async function checkTablesExist() {
  try {
    console.log('🔍 Checking if inventory tables exist...')
    
    const { data: centralStockExists } = await supabase
      .from('central_stock')
      .select('id')
      .limit(1)
    
    const { data: branchAllocationsExists } = await supabase
      .from('branch_allocations')
      .select('id')
      .limit(1)
    
    console.log('📊 Table Status:')
    console.log(`   central_stock: ${centralStockExists ? '✅ Exists' : '❌ Missing'}`)
    console.log(`   branch_allocations: ${branchAllocationsExists ? '✅ Exists' : '❌ Missing'}`)
    
    if (!centralStockExists || !branchAllocationsExists) {
      console.log('\n🔄 Tables missing. Applying migration...')
      await applyInventoryTablesDirect()
    } else {
      console.log('\n✅ All inventory tables exist!')
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message)
    console.log('\n🔄 Tables likely missing. Applying migration...')
    await applyInventoryTablesDirect()
  }
}

// Run the script
checkTablesExist() 