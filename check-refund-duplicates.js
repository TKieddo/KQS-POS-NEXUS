require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRefundDuplicates() {
  console.log('🔍 Checking for duplicate refund records...\n')

  try {
    // Get all refunds
    const { data: refunds, error } = await supabase
      .from('refunds')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching refunds:', error)
      return
    }

    console.log(`📊 Total refunds found: ${refunds.length}`)

    // Check for duplicate refund numbers
    const refundNumbers = refunds.map(r => r.refund_number)
    const uniqueNumbers = [...new Set(refundNumbers)]
    
    console.log(`📋 Unique refund numbers: ${uniqueNumbers.length}`)
    console.log(`🔄 Duplicate refund numbers: ${refundNumbers.length - uniqueNumbers.length}`)

    if (refundNumbers.length !== uniqueNumbers.length) {
      console.log('\n🚨 DUPLICATE REFUND NUMBERS FOUND:')
      
      // Find duplicates
      const duplicates = refundNumbers.filter((item, index) => refundNumbers.indexOf(item) !== index)
      const uniqueDuplicates = [...new Set(duplicates)]
      
      uniqueDuplicates.forEach(number => {
        const duplicateRefunds = refunds.filter(r => r.refund_number === number)
        console.log(`\n📝 Refund Number: ${number}`)
        console.log(`   Found ${duplicateRefunds.length} records:`)
        
        duplicateRefunds.forEach((refund, index) => {
          console.log(`   ${index + 1}. ID: ${refund.id}`)
          console.log(`      Created: ${refund.created_at}`)
          console.log(`      Amount: ${refund.refund_amount}`)
          console.log(`      Method: ${refund.refund_method}`)
          console.log(`      Reason: ${refund.reason}`)
        })
      })
    }

    // Check for duplicate sale_item_id in refund_items
    console.log('\n🔍 Checking refund_items for duplicates...')
    const { data: refundItems, error: itemsError } = await supabase
      .from('refund_items')
      .select('*')

    if (itemsError) {
      console.error('❌ Error fetching refund items:', itemsError)
      return
    }

    const saleItemIds = refundItems.map(ri => ri.original_sale_item_id)
    const uniqueSaleItemIds = [...new Set(saleItemIds)]
    
    console.log(`📊 Total refund items: ${refundItems.length}`)
    console.log(`📋 Unique sale item IDs: ${uniqueSaleItemIds.length}`)
    console.log(`🔄 Duplicate sale item IDs: ${saleItemIds.length - uniqueSaleItemIds.length}`)

    if (saleItemIds.length !== uniqueSaleItemIds.length) {
      console.log('\n🚨 DUPLICATE SALE ITEM REFUNDS FOUND:')
      
      const duplicateSaleItemIds = saleItemIds.filter((item, index) => saleItemIds.indexOf(item) !== index)
      const uniqueDuplicateSaleItemIds = [...new Set(duplicateSaleItemIds)]
      
      uniqueDuplicateSaleItemIds.forEach(saleItemId => {
        const duplicateItems = refundItems.filter(ri => ri.original_sale_item_id === saleItemId)
        console.log(`\n📝 Sale Item ID: ${saleItemId}`)
        console.log(`   Found ${duplicateItems.length} refund records:`)
        
        duplicateItems.forEach((item, index) => {
          console.log(`   ${index + 1}. Refund Item ID: ${item.id}`)
          console.log(`      Refund ID: ${item.refund_id}`)
          console.log(`      Quantity: ${item.quantity}`)
          console.log(`      Amount: ${item.refund_amount}`)
        })
      })
    }

    // Check if sale_items are marked as refunded multiple times
    console.log('\n🔍 Checking sale_items refund status...')
    const { data: saleItems, error: saleItemsError } = await supabase
      .from('sale_items')
      .select('id, refunded, refund_amount, refund_date')
      .eq('refunded', true)

    if (saleItemsError) {
      console.error('❌ Error fetching sale items:', saleItemsError)
      return
    }

    console.log(`📊 Sale items marked as refunded: ${saleItems.length}`)
    
    // Check for sale items with multiple refund records
    const refundedSaleItemIds = saleItems.map(si => si.id)
    const refundedSaleItemIdsInRefundItems = refundItems.map(ri => ri.original_sale_item_id)
    
    const multipleRefunds = refundedSaleItemIds.filter(id => 
      refundedSaleItemIdsInRefundItems.filter(refundId => refundId === id).length > 1
    )

    if (multipleRefunds.length > 0) {
      console.log(`🚨 Sale items with multiple refund records: ${multipleRefunds.length}`)
      multipleRefunds.forEach(saleItemId => {
        const refundRecords = refundItems.filter(ri => ri.original_sale_item_id === saleItemId)
        console.log(`\n📝 Sale Item ID: ${saleItemId}`)
        console.log(`   Has ${refundRecords.length} refund records`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkRefundDuplicates()
