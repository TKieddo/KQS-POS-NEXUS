require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testInventoryFix() {
  console.log('🧪 Testing inventory fix...')
  
  try {
    // Get a sample product to test with
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(1)
    
    if (productError) {
      console.error('❌ Error getting products:', productError)
      return
    }
    
    if (!products || products.length === 0) {
      console.log('❌ No products found to test with')
      return
    }
    
    const testProduct = products[0]
    console.log('📋 Test product:', testProduct)
    
    // Get a sample branch
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id, name')
      .limit(1)
    
    if (branchError) {
      console.error('❌ Error getting branches:', branchError)
      return
    }
    
    if (!branches || branches.length === 0) {
      console.log('❌ No branches found to test with')
      return
    }
    
    const testBranch = branches[0]
    console.log('📋 Test branch:', testBranch)
    
    // Get a sample customer
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .limit(1)
    
    if (customerError) {
      console.error('❌ Error getting customers:', customerError)
      return
    }
    
    if (!customers || customers.length === 0) {
      console.log('❌ No customers found to test with')
      return
    }
    
    const testCustomer = customers[0]
    console.log('📋 Test customer:', testCustomer)
    
    // Get a sample user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (userError) {
      console.error('❌ Error getting users:', userError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found to test with')
      return
    }
    
    const testUser = users[0]
    console.log('📋 Test user:', testUser)
    
    console.log('')
    console.log('🎯 Testing inventory update with sample sale...')
    
    // Create a test sale using the create_sale_with_split_payments function
    const testSaleData = {
      p_customer_id: testCustomer.id,
      p_total_amount: 10.00,
      p_payment_methods: [{
        method: 'cash',
        amount: 10.00
      }],
      p_processed_by: testUser.id,
      p_branch_id: testBranch.id,
      p_sale_items: [{
        product_id: testProduct.id,
        variant_id: null,
        quantity: 1,
        unit_price: 10.00,
        total_price: 10.00
      }]
    }
    
    console.log('📋 Test sale data:', testSaleData)
    
    // Create the sale
    const { data: saleId, error: saleError } = await supabase
      .rpc('create_sale_with_split_payments', testSaleData)
    
    if (saleError) {
      console.error('❌ Error creating test sale:', saleError)
      return
    }
    
    console.log('✅ Test sale created with ID:', saleId)
    
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check the updated product stock
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, updated_at')
      .eq('id', testProduct.id)
      .single()
    
    if (updateError) {
      console.error('❌ Error getting updated product:', updateError)
      return
    }
    
    console.log('📋 Product after sale:', updatedProduct)
    
    // Check if stock was reduced
    const stockReduced = updatedProduct.stock_quantity === testProduct.stock_quantity - 1
    console.log('')
    console.log('🎯 Test Results:')
    console.log(`   Original stock: ${testProduct.stock_quantity}`)
    console.log(`   New stock: ${updatedProduct.stock_quantity}`)
    console.log(`   Stock reduced: ${stockReduced ? '✅ YES' : '❌ NO'}`)
    
    if (stockReduced) {
      console.log('')
      console.log('🎉 SUCCESS! Inventory management is working correctly.')
      console.log('   Product quantities are now being deducted when sales are made.')
    } else {
      console.log('')
      console.log('❌ FAILURE! Inventory management is still not working.')
      console.log('   Please check the database triggers and functions.')
    }
    
    // Check if branch_stock table exists and was updated
    const { data: branchStock, error: branchStockError } = await supabase
      .from('branch_stock')
      .select('*')
      .eq('product_id', testProduct.id)
      .eq('branch_id', testBranch.id)
      .limit(1)
    
    if (branchStockError) {
      console.log('📋 Branch stock table not accessible or doesn\'t exist')
    } else if (branchStock && branchStock.length > 0) {
      console.log('📋 Branch stock updated:', branchStock[0])
    } else {
      console.log('📋 No branch stock record found for this product/branch')
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  }
}

testInventoryFix()
