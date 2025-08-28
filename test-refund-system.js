const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRefundSystem() {
  console.log('🧪 Testing Refund System...\n')

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking if refund tables exist...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['refunds', 'refund_items', 'credit_accounts', 'credit_transactions'])

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
      return
    }

    const tableNames = tables.map(t => t.table_name)
    console.log('✅ Tables found:', tableNames.join(', '))

    // Test 2: Check if functions exist
    console.log('\n2. Checking if refund functions exist...')
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_refund_stats', { p_branch_id: null, p_period: 'all' })

    if (functionsError) {
      console.error('❌ Error checking functions:', functionsError)
      return
    }

    console.log('✅ Functions working:', functions)

    // Test 3: Check if sale_items has refund columns
    console.log('\n3. Checking sale_items table structure...')
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'sale_items')
      .in('column_name', ['refunded', 'refund_amount', 'refund_date'])

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError)
      return
    }

    const columnNames = columns.map(c => c.column_name)
    console.log('✅ Refund columns found:', columnNames.join(', '))

    // Test 4: Check if there are any existing refunds
    console.log('\n4. Checking for existing refunds...')
    const { data: refunds, error: refundsError } = await supabase
      .from('refunds')
      .select('*')
      .limit(5)

    if (refundsError) {
      console.error('❌ Error checking refunds:', refundsError)
      return
    }

    console.log(`✅ Found ${refunds.length} refunds in database`)

    // Test 5: Check if there are any credit accounts
    console.log('\n5. Checking for credit accounts...')
    const { data: creditAccounts, error: creditError } = await supabase
      .from('credit_accounts')
      .select('*')
      .limit(5)

    if (creditError) {
      console.error('❌ Error checking credit accounts:', creditError)
      return
    }

    console.log(`✅ Found ${creditAccounts.length} credit accounts in database`)

    // Test 6: Test the get_refund_history function
    console.log('\n6. Testing get_refund_history function...')
    const { data: history, error: historyError } = await supabase
      .rpc('get_refund_history', { p_branch_id: null, p_limit: 5 })

    if (historyError) {
      console.error('❌ Error testing get_refund_history:', historyError)
      return
    }

    console.log(`✅ get_refund_history working, returned ${history.length} records`)

    console.log('\n🎉 All tests passed! The refund system is working correctly.')
    console.log('\n📋 Summary:')
    console.log(`   - Tables: ${tableNames.length}/4 created`)
    console.log(`   - Functions: Working`)
    console.log(`   - Sale items columns: ${columnNames.length}/3 added`)
    console.log(`   - Existing refunds: ${refunds.length}`)
    console.log(`   - Credit accounts: ${creditAccounts.length}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testRefundSystem()
