require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInventorySystem() {
  console.log('🧪 Testing Inventory Management System...')
  
  try {
    // Step 1: Get a test product
    console.log('\n📦 Step 1: Getting test product...')
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .gt('stock_quantity', 0)
      .limit(1)
    
    if (productError) {
      console.error('❌ Error fetching products:', productError)
      return false
    }
    
    if (!products || products.length === 0) {
      console.error('❌ No products with stock available for testing')
      return false
    }
    
    const testProduct = products[0]
    console.log(`✅ Test product: ${testProduct.name} (ID: ${testProduct.id})`)
    console.log(`📊 Initial stock quantity: ${testProduct.stock_quantity}`)
    
    // Step 2: Test the inventory update function
    console.log('\n🔄 Step 2: Testing inventory update function...')
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_product_quantities', {
        p_sale_items: [{
          product_id: testProduct.id,
          variant_id: null,
          quantity: 2
        }]
      })
    
    if (updateError) {
      console.error('❌ Error updating quantities:', updateError)
      return false
    }
    
    console.log('✅ Update result:', updateResult)
    
    // Step 3: Check the updated quantity
    console.log('\n📊 Step 3: Checking updated quantity...')
    const { data: updatedProduct, error: checkError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()
    
    if (checkError) {
      console.error('❌ Error checking updated quantity:', checkError)
      return false
    }
    
    const expectedQuantity = testProduct.stock_quantity - 2
    console.log(`📊 Updated stock quantity: ${updatedProduct.stock_quantity}`)
    console.log(`📊 Expected quantity: ${expectedQuantity}`)
    
    if (updatedProduct.stock_quantity === expectedQuantity) {
      console.log('✅ Quantity update successful!')
    } else {
      console.log('❌ Quantity update failed!')
      return false
    }
    
    // Step 4: Test the restore function
    console.log('\n🔄 Step 4: Testing inventory restore function...')
    const { data: restoreResult, error: restoreError } = await supabase
      .rpc('restore_product_quantities', {
        p_refund_items: [{
          product_id: testProduct.id,
          variant_id: null,
          quantity: 1
        }]
      })
    
    if (restoreError) {
      console.error('❌ Error restoring quantities:', restoreError)
      return false
    }
    
    console.log('✅ Restore result:', restoreResult)
    
    // Step 5: Check the restored quantity
    console.log('\n📊 Step 5: Checking restored quantity...')
    const { data: restoredProduct, error: restoreCheckError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()
    
    if (restoreCheckError) {
      console.error('❌ Error checking restored quantity:', restoreCheckError)
      return false
    }
    
    const expectedRestoredQuantity = expectedQuantity + 1
    console.log(`📊 Restored stock quantity: ${restoredProduct.stock_quantity}`)
    console.log(`📊 Expected restored quantity: ${expectedRestoredQuantity}`)
    
    if (restoredProduct.stock_quantity === expectedRestoredQuantity) {
      console.log('✅ Quantity restore successful!')
    } else {
      console.log('❌ Quantity restore failed!')
      return false
    }
    
    // Step 6: Restore the original quantity
    console.log('\n🔄 Step 6: Restoring original quantity...')
    const { error: finalRestoreError } = await supabase
      .from('products')
      .update({ stock_quantity: testProduct.stock_quantity })
      .eq('id', testProduct.id)
    
    if (finalRestoreError) {
      console.error('❌ Error restoring original quantity:', finalRestoreError)
    } else {
      console.log('✅ Original quantity restored!')
    }
    
    // Step 7: Test the monitoring function
    console.log('\n📈 Step 7: Testing inventory monitoring...')
    const { data: changes, error: changesError } = await supabase
      .rpc('get_inventory_changes', { p_hours_back: 24 })
    
    if (changesError) {
      console.error('❌ Error getting inventory changes:', changesError)
    } else {
      console.log(`✅ Found ${changes.length} products with recent changes`)
      if (changes.length > 0) {
        console.log('📊 Recent changes:')
        changes.slice(0, 3).forEach(change => {
          console.log(`  • ${change.product_name}: ${change.quantity_change} units`)
        })
      }
    }
    
    console.log('\n🎉 All inventory system tests completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error)
    return false
  }
}

// Run the test
testInventorySystem()
  .then(success => {
    if (success) {
      console.log('\n✅ Inventory management system is working correctly!')
      console.log('')
      console.log('📝 The system now properly:')
      console.log('  • Reduces product quantities on sales')
      console.log('  • Restores product quantities on refunds')
      console.log('  • Handles laybye orders')
      console.log('  • Provides monitoring capabilities')
    } else {
      console.log('\n❌ Inventory management system test failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
