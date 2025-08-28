require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment variables:')
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('SUPABASE_KEY:', supabaseKey ? 'Set' : 'Not set')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRefundData() {
  console.log('🔍 Testing refund data retrieval...\n')

  try {
    // Test 1: Check if refunds table has data
    console.log('1. Checking refunds table...')
    const { data: refunds, error: refundsError } = await supabase
      .from('refunds')
      .select('*')
      .limit(5)

    if (refundsError) {
      console.error('❌ Error fetching refunds:', refundsError)
    } else {
      console.log(`✅ Found ${refunds.length} refunds in table`)
      if (refunds.length > 0) {
        console.log('Sample refund:', JSON.stringify(refunds[0], null, 2))
      }
    }

    // Test 2: Test the get_refund_history function
    console.log('\n2. Testing get_refund_history function...')
    const { data: history, error: historyError } = await supabase
      .rpc('get_refund_history', {
        p_branch_id: null,
        p_limit: 10
      })

    if (historyError) {
      console.error('❌ Error fetching refund history:', historyError)
    } else {
      console.log(`✅ Found ${history.length} refunds in history`)
      if (history.length > 0) {
        console.log('Sample history item:', JSON.stringify(history[0], null, 2))
      }
    }

    // Test 3: Test the get_refund_stats function
    console.log('\n3. Testing get_refund_stats function...')
    const { data: stats, error: statsError } = await supabase
      .rpc('get_refund_stats', {
        p_branch_id: null,
        p_period: 'all'
      })

    if (statsError) {
      console.error('❌ Error fetching refund stats:', statsError)
    } else {
      console.log('✅ Refund stats:', JSON.stringify(stats, null, 2))
    }

    // Test 4: Test the get_refund_analytics function
    console.log('\n4. Testing get_refund_analytics function...')
    const { data: analytics, error: analyticsError } = await supabase
      .rpc('get_refund_analytics', {
        p_branch_id: null,
        p_period: 'week'
      })

    if (analyticsError) {
      console.error('❌ Error fetching refund analytics:', analyticsError)
    } else {
      console.log('✅ Refund analytics:', JSON.stringify(analytics, null, 2))
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testRefundData()
