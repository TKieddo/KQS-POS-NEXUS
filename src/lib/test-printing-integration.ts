import { printTransactionReceipt } from './receipt-printing-service'
import { getReceiptTemplateForTransaction } from './receipt-printing-service'

/**
 * Test function to verify printing integration is working
 */
export const testPrintingIntegration = async (branchId: string) => {
  console.log('🧪 Testing printing integration...')
  
  try {
    // Test 1: Check if templates exist
    console.log('📋 Testing template retrieval...')
    const saleTemplate = await getReceiptTemplateForTransaction('sale', branchId)
    const refundTemplate = await getReceiptTemplateForTransaction('refund', branchId)
    const cashUpTemplate = await getReceiptTemplateForTransaction('cash_up', branchId)
    
    console.log('Sale template found:', saleTemplate?.name || 'NOT FOUND')
    console.log('Refund template found:', refundTemplate?.name || 'NOT FOUND')
    console.log('Cash Up template found:', cashUpTemplate?.name || 'NOT FOUND')
    
    if (!saleTemplate) {
      console.error('❌ Sale template not found! Templates may not be created.')
      return { success: false, error: 'Sale template not found' }
    }
    
    // Test 2: Test sale receipt printing
    console.log('🖨️ Testing sale receipt printing...')
    const saleTestData = {
      transactionType: 'sale' as const,
      branchId: branchId,
      transactionData: {
        transactionNumber: 'TEST-SALE-001',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        cashier: 'Test Cashier',
        customer: 'Test Customer',
        items: [
          { name: 'Test Product 1', quantity: 2, price: 10.00, total: 20.00 },
          { name: 'Test Product 2', quantity: 1, price: 15.00, total: 15.00 }
        ],
        subtotal: 35.00,
        tax: 0,
        discount: 5.00,
        total: 30.00,
        paymentMethod: 'Cash',
        amountPaid: 50.00,
        change: 20.00
      }
    }
    
    const saleResult = await printTransactionReceipt(saleTestData)
    console.log('Sale printing result:', saleResult)
    
    // Test 3: Test refund receipt printing
    console.log('🔄 Testing refund receipt printing...')
    const refundTestData = {
      transactionType: 'refund' as const,
      branchId: branchId,
      transactionData: {
        transactionNumber: 'TEST-REFUND-001',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        cashier: 'Test Cashier',
        customer: 'Test Customer',
        items: [
          { name: 'Refunded Product', quantity: 1, price: 25.00, total: 25.00 }
        ],
        refundAmount: 25.00,
        refundReason: 'Customer request',
        originalSaleNumber: 'ORIGINAL-SALE-001'
      }
    }
    
    const refundResult = await printTransactionReceipt(refundTestData)
    console.log('Refund printing result:', refundResult)
    
    // Test 4: Test cash up receipt printing
    console.log('💰 Testing cash up receipt printing...')
    const cashUpTestData = {
      transactionType: 'cash_up' as const,
      branchId: branchId,
      transactionData: {
        transactionNumber: 'TEST-CASHUP-001',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        cashier: 'Test Cashier',
        openingFloat: 1000.00,
        cashSales: 2500.00,
        cardSales: 1500.00,
        cashDrops: 500.00,
        cashPayouts: 200.00,
        closingBalance: 3300.00,
        countedCash: 3250.00,
        variance: -50.00,
        notes: 'Test cash up session'
      }
    }
    
    const cashUpResult = await printTransactionReceipt(cashUpTestData)
    console.log('Cash Up printing result:', cashUpResult)
    
    console.log('✅ All printing tests completed!')
    return { 
      success: true, 
      results: {
        sale: saleResult,
        refund: refundResult,
        cashUp: cashUpResult
      }
    }
    
  } catch (error) {
    console.error('❌ Printing integration test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Quick test to check if templates exist
 */
export const checkTemplatesExist = async (branchId: string) => {
  const templates = [
    'sale',
    'refund', 
    'cash_up',
    'laybye_payment',
    'laybye_reserve',
    'account_payment',
    'till_session',
    'cash_drop',
    'delivery',
    'quotation',
    'order',
    'returns_exchange',
    'laybye_cancellation',
    'customer_statement',
    'intermediate_bill'
  ]
  
  const results: Record<string, boolean> = {}
  
  for (const templateType of templates) {
    try {
      const template = await getReceiptTemplateForTransaction(templateType, branchId)
      results[templateType] = !!template
      console.log(`${templateType}: ${template?.name || 'NOT FOUND'}`)
    } catch (error) {
      results[templateType] = false
      console.error(`${templateType}: ERROR - ${error}`)
    }
  }
  
  const missing = Object.entries(results).filter(([_, exists]) => !exists).map(([type]) => type)
  
  return {
    allExist: missing.length === 0,
    missing,
    results
  }
}
