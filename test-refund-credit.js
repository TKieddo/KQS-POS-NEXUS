require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRefundCredit() {
  try {
    console.log('🧪 Testing Refund Credit Functionality...\n')

    // 1. Get a customer with credit account
    console.log('1. Finding a customer with credit account...')
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select(`
        id,
        first_name,
        last_name,
        credit_accounts(current_balance, credit_limit)
      `)
      .eq('status', 'active')
      .limit(1)

    if (customerError) {
      console.error('❌ Error fetching customers:', customerError)
      return
    }

    if (!customers || customers.length === 0) {
      console.log('❌ No customers found')
      return
    }

    const customer = customers[0]
    console.log(`✅ Found customer: ${customer.first_name} ${customer.last_name}`)
    console.log(`   Current balance: ${customer.credit_accounts?.[0]?.current_balance || 0}`)
    console.log(`   Credit limit: ${customer.credit_accounts?.[0]?.credit_limit || 0}\n`)

    // 2. Get a sale item to refund
    console.log('2. Finding a sale item to refund...')
    const { data: saleItems, error: saleError } = await supabase
      .from('sale_items')
      .select(`
        id,
        sale_id,
        quantity,
        unit_price,
        refunded
      `)
      .eq('refunded', false)
      .limit(1)

    if (saleError) {
      console.error('❌ Error fetching sale items:', saleError)
      return
    }

    if (!saleItems || saleItems.length === 0) {
      console.log('❌ No unrefunded sale items found')
      return
    }

    const saleItem = saleItems[0]
    const refundAmount = saleItem.unit_price * saleItem.quantity
    console.log(`✅ Found sale item: ID ${saleItem.id}`)
    console.log(`   Refund amount: ${refundAmount}\n`)

    // 3. Process refund to account
    console.log('3. Processing refund to customer account...')
    const { data: refundResult, error: refundError } = await supabase
      .rpc('process_complete_refund', {
        p_item_id: saleItem.id,
        p_refund_amount: refundAmount,
        p_reason: 'Test refund credit',
        p_refund_method: 'account',
        p_customer_id: customer.id,
        p_processed_by: '00000000-0000-0000-0000-000000000000', // Test user ID
        p_branch_id: '00000000-0000-0000-0000-000000000000' // Test branch ID
      })

    if (refundError) {
      console.error('❌ Error processing refund:', refundError)
      return
    }

    console.log('✅ Refund processed successfully!')
    console.log(`   Refund ID: ${refundResult.refund_id}`)
    console.log(`   Refund Number: ${refundResult.refund_number}\n`)

    // 4. Check updated customer balance
    console.log('4. Checking updated customer balance...')
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .select(`
        id,
        first_name,
        last_name,
        credit_accounts(current_balance, credit_limit)
      `)
      .eq('id', customer.id)
      .single()

    if (updateError) {
      console.error('❌ Error fetching updated customer:', updateError)
      return
    }

    const oldBalance = customer.credit_accounts?.[0]?.current_balance || 0
    const newBalance = updatedCustomer.credit_accounts?.[0]?.current_balance || 0
    const balanceChange = newBalance - oldBalance

    console.log('✅ Customer balance updated!')
    console.log(`   Old balance: ${oldBalance}`)
    console.log(`   New balance: ${newBalance}`)
    console.log(`   Balance change: ${balanceChange}`)
    console.log(`   Expected change: -${refundAmount} (more credit available)`)
    console.log(`   Credit available: ${Math.abs(newBalance)}`)

    if (balanceChange === -refundAmount) {
      console.log('\n🎉 SUCCESS: Refund credit working correctly!')
      console.log('   Customer now has more credit available for future purchases.')
    } else {
      console.log('\n❌ ISSUE: Balance change does not match expected amount')
    }

    // 5. Check credit transaction record
    console.log('\n5. Checking credit transaction record...')
    const { data: transactions, error: transactionError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (transactionError) {
      console.error('❌ Error fetching transactions:', transactionError)
      return
    }

    if (transactions && transactions.length > 0) {
      const transaction = transactions[0]
      console.log('✅ Credit transaction created!')
      console.log(`   Transaction type: ${transaction.transaction_type}`)
      console.log(`   Amount: ${transaction.amount}`)
      console.log(`   Description: ${transaction.description}`)
      console.log(`   Balance after: ${transaction.balance_after}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testRefundCredit()
