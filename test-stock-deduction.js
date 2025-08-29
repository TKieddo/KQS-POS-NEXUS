require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testStockDeduction() {
  console.log('🧪 Testing Stock Deduction System...')
  
  try {
    // Step 1: Check current trigger status
    console.log('\n📋 Step 1: Checking trigger status...')
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('trigger_name', 'update_stock_on_sale_item')
      .eq('event_object_table', 'sale_items')
    
    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError)
    } else {
      console.log('✅ Triggers found:', triggers)
    }
    
    // Step 2: Get sample products with variants
    console.log('\n📋 Step 2: Getting sample products with variants...')
    const { data: products, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        stock_quantity,
        product_variants (
          id,
          name,
          stock_quantity
        )
      `)
      .not('product_variants', 'is', null)
      .limit(3)
    
    if (productError) {
      console.error('❌ Error fetching products:', productError)
      return
    }
    
    console.log('📦 Products with variants found:', products.length)
    products.forEach(product => {
      console.log(`  • ${product.name} (Main stock: ${product.stock_quantity})`)
      product.product_variants.forEach(variant => {
        console.log(`    - ${variant.name} (Variant stock: ${variant.stock_quantity})`)
      })
    })
    
    // Step 3: Get recent sales to test with
    console.log('\n📋 Step 3: Getting recent sales...')
    const { data: recentSales, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        transaction_number,
        created_at,
        sale_items (
          id,
          product_id,
          variant_id,
          quantity,
          products (name),
          product_variants (name)
        )
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (salesError) {
      console.error('❌ Error fetching recent sales:', salesError)
      return
    }
    
    console.log('🛒 Recent sales found:', recentSales.length)
    recentSales.forEach(sale => {
      console.log(`  • Sale ${sale.transaction_number} (${sale.sale_items.length} items)`)
      sale.sale_items.forEach(item => {
        const productName = item.products?.name || 'Unknown'
        const variantName = item.product_variants?.name || 'No variant'
        console.log(`    - ${productName} (${variantName}) - Qty: ${item.quantity}`)
      })
    })
    
    // Step 4: Test manual stock update for a recent sale
    if (recentSales.length > 0) {
      console.log('\n📋 Step 4: Testing manual stock update...')
      const testSale = recentSales[0]
      
      console.log(`Testing with sale: ${testSale.transaction_number}`)
      
      // Call the manual update function
      const { data: updateResult, error: updateError } = await supabase
        .rpc('manual_update_stock_for_sale', {
          p_sale_id: testSale.id
        })
      
      if (updateError) {
        console.error('❌ Error in manual stock update:', updateError)
      } else {
        console.log('✅ Manual stock update result:', updateResult)
      }
    }
    
    // Step 5: Check stock levels after update
    console.log('\n📋 Step 5: Checking stock levels after update...')
    const { data: updatedProducts, error: updatedError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        stock_quantity,
        product_variants (
          id,
          name,
          stock_quantity
        )
      `)
      .not('product_variants', 'is', null)
      .limit(3)
    
    if (updatedError) {
      console.error('❌ Error fetching updated products:', updatedError)
    } else {
      console.log('📦 Updated stock levels:')
      updatedProducts.forEach(product => {
        console.log(`  • ${product.name} (Main stock: ${product.stock_quantity})`)
        product.product_variants.forEach(variant => {
          console.log(`    - ${variant.name} (Variant stock: ${variant.stock_quantity})`)
        })
      })
    }
    
    // Step 6: Create a test sale to verify trigger works
    console.log('\n📋 Step 6: Creating test sale to verify trigger...')
    
    // Get a product with variants for testing
    const testProduct = products[0]
    if (testProduct && testProduct.product_variants.length > 0) {
      const testVariant = testProduct.product_variants[0]
      
      console.log(`Creating test sale for: ${testProduct.name} - ${testVariant.name}`)
      
      // Create a test sale
      const { data: testSale, error: testSaleError } = await supabase
        .from('sales')
        .insert({
          transaction_number: `TEST-${Date.now()}`,
          customer_id: null,
          branch_id: '00000000-0000-0000-0000-000000000001',
          subtotal: 100.00,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: 100.00,
          payment_method: 'cash',
          payment_status: 'completed',
          sale_type: 'regular',
          notes: 'Test sale for stock deduction verification'
        })
        .select()
        .single()
      
      if (testSaleError) {
        console.error('❌ Error creating test sale:', testSaleError)
      } else {
        console.log('✅ Test sale created:', testSale.id)
        
        // Create test sale item
        const { data: testItem, error: testItemError } = await supabase
          .from('sale_items')
          .insert({
            sale_id: testSale.id,
            product_id: testProduct.id,
            variant_id: testVariant.id,
            quantity: 1,
            unit_price: 100.00,
            total_price: 100.00,
            discount_amount: 0
          })
          .select()
          .single()
        
        if (testItemError) {
          console.error('❌ Error creating test sale item:', testItemError)
        } else {
          console.log('✅ Test sale item created:', testItem.id)
          
          // Check if stock was updated
          setTimeout(async () => {
            console.log('\n📋 Step 7: Verifying stock update after test sale...')
            
            const { data: finalStock, error: finalError } = await supabase
              .from('product_variants')
              .select('stock_quantity')
              .eq('id', testVariant.id)
              .single()
            
            if (finalError) {
              console.error('❌ Error checking final stock:', finalError)
            } else {
              console.log(`✅ Final variant stock: ${finalStock.stock_quantity}`)
              console.log(`📊 Stock change: ${testVariant.stock_quantity} → ${finalStock.stock_quantity} (Expected: ${testVariant.stock_quantity - 1})`)
              
              if (finalStock.stock_quantity === testVariant.stock_quantity - 1) {
                console.log('🎉 SUCCESS: Stock deduction is working correctly!')
              } else {
                console.log('❌ FAILURE: Stock deduction is not working correctly!')
              }
            }
          }, 1000) // Wait 1 second for trigger to execute
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testStockDeduction()
  .then(() => {
    console.log('\n🏁 Stock deduction test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
