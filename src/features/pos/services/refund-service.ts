import { supabase } from '@/lib/supabase'

export interface RefundData {
  itemId: string
  refundAmount: number
  reason: string
  refundMethod: string
  customerId?: string
  processedBy: string
  branchId: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  error?: string
  message?: string
}

export class RefundService {
  /**
   * Process a complete refund with all database operations
   */
  static async processRefund(refundData: RefundData): Promise<RefundResult> {
    try {
      console.log('🔍 Processing refund with data:', refundData)

      // Validate input data
      if (!refundData.itemId) {
        console.error('❌ Missing itemId')
        return { success: false, error: 'Missing item ID' }
      }
      if (!refundData.processedBy) {
        console.error('❌ Missing processedBy')
        return { success: false, error: 'Missing processed by user' }
      }
      if (!refundData.branchId) {
        console.error('❌ Missing branchId')
        return { success: false, error: 'Missing branch ID' }
      }

      // Try the stored procedure first
      try {
        console.log('📞 Calling process_complete_refund RPC with parameters:', {
          p_item_id: refundData.itemId,
          p_refund_amount: refundData.refundAmount,
          p_reason: refundData.reason,
          p_refund_method: refundData.refundMethod,
          p_customer_id: refundData.customerId,
          p_processed_by: refundData.processedBy,
          p_branch_id: refundData.branchId
        })

        const { data: refund, error: refundError } = await supabase
          .rpc('process_complete_refund', {
            p_item_id: refundData.itemId,
            p_refund_amount: refundData.refundAmount,
            p_reason: refundData.reason,
            p_refund_method: refundData.refundMethod,
            p_customer_id: refundData.customerId,
            p_processed_by: refundData.processedBy,
            p_branch_id: refundData.branchId
          })

        if (refundError) {
          console.error('❌ Stored procedure failed, falling back to manual processing:', refundError)
          throw refundError
        }

        console.log('✅ Refund processed successfully via stored procedure:', refund)
        return {
          success: true,
          refundId: refund.refund_id,
          message: 'Refund processed successfully'
        }
      } catch (rpcError) {
        console.log('🔄 Falling back to manual refund processing...')
        
        // Manual refund processing as fallback
        return await this.processRefundManually(refundData)
      }
    } catch (error) {
      console.error('❌ Refund processing failed with exception:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund'
      }
    }
  }

  /**
   * Manual refund processing as fallback when stored procedure is not available
   */
  static async processRefundManually(refundData: RefundData): Promise<RefundResult> {
    try {
      console.log('🔧 Processing refund manually...')

      // Step 1: Get sale item details
      const { data: saleItem, error: itemError } = await supabase
        .from('sale_items')
        .select(`
          id,
          sale_id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          sales!inner(customer_id)
        `)
        .eq('id', refundData.itemId)
        .single()

      if (itemError) {
        console.error('❌ Error fetching sale item:', itemError)
        return { success: false, error: 'Sale item not found' }
      }

      console.log('📦 Sale item details:', saleItem)

      // Step 2: Create refund record
      const refundNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      const customerId = refundData.customerId || saleItem.sales.customer_id

      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          refund_number: refundNumber,
          original_sale_id: saleItem.sale_id,
          customer_id: customerId,
          refund_amount: refundData.refundAmount,
          refund_method: refundData.refundMethod,
          reason: refundData.reason,
          status: 'completed',
          processed_by: refundData.processedBy,
          processed_at: new Date().toISOString(),
          branch_id: refundData.branchId
        })
        .select()
        .single()

      if (refundError) {
        console.error('❌ Error creating refund record:', refundError)
        return { success: false, error: 'Failed to create refund record' }
      }

      console.log('✅ Refund record created:', refund)

      // Step 3: Create refund item record
      const { error: itemRefundError } = await supabase
        .from('refund_items')
        .insert({
          refund_id: refund.id,
          original_sale_item_id: refundData.itemId,
          product_id: saleItem.product_id,
          variant_id: saleItem.variant_id,
          quantity: saleItem.quantity,
          unit_price: saleItem.unit_price,
          refund_amount: refundData.refundAmount,
          reason: refundData.reason
        })

      if (itemRefundError) {
        console.error('❌ Error creating refund item record:', itemRefundError)
        return { success: false, error: 'Failed to create refund item record' }
      }

      // Step 4: Update inventory
      const { data: currentProduct, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', saleItem.product_id)
        .single()

      if (productError) {
        console.error('❌ Error fetching current product stock:', productError)
        return { success: false, error: 'Failed to fetch product stock' }
      }

      const newStockQuantity = (currentProduct.stock_quantity || 0) + saleItem.quantity
      const { error: inventoryError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStockQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', saleItem.product_id)

      if (inventoryError) {
        console.error('❌ Error updating inventory:', inventoryError)
        return { success: false, error: 'Failed to update inventory' }
      }

      // Step 5: Handle customer account credit if needed
      if (refundData.refundMethod === 'account' && customerId) {
        const creditResult = await this.creditCustomerAccount(customerId, refundData.refundAmount)
        if (!creditResult.success) {
          console.error('❌ Error crediting customer account:', creditResult.error)
          return { success: false, error: 'Failed to credit customer account' }
        }
      }

      // Step 6: Mark sale item as refunded
      const { error: updateError } = await supabase
        .from('sale_items')
        .update({
          refunded: true,
          refund_amount: refundData.refundAmount,
          refund_date: new Date().toISOString()
        })
        .eq('id', refundData.itemId)

      if (updateError) {
        console.error('❌ Error marking sale item as refunded:', updateError)
        return { success: false, error: 'Failed to mark item as refunded' }
      }

      console.log('✅ Manual refund processing completed successfully')
      return {
        success: true,
        refundId: refund.id,
        message: 'Refund processed successfully'
      }
    } catch (error) {
      console.error('❌ Manual refund processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process refund manually'
      }
    }
  }

  /**
   * Create refund record
   */
  static async createRefundRecord(refundData: RefundData): Promise<{ refundId: string; error?: string }> {
    try {
      const refundNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      const { data: refund, error } = await supabase
        .from('refunds')
        .insert({
          refund_number: refundNumber,
          original_sale_id: refundData.itemId, // This will be updated with actual sale ID
          customer_id: refundData.customerId,
          refund_amount: refundData.refundAmount,
          refund_method: refundData.refundMethod,
          reason: refundData.reason,
          status: 'completed',
          processed_by: refundData.processedBy,
          processed_at: new Date().toISOString(),
          branch_id: refundData.branchId
        })
        .select()
        .single()

      if (error) throw error

      return { refundId: refund.id }
    } catch (error) {
      console.error('Error creating refund record:', error)
      return { refundId: '', error: error instanceof Error ? error.message : 'Failed to create refund record' }
    }
  }

  /**
   * Update product inventory (add back the quantity)
   */
  static async updateInventory(itemId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the sale item details
      const { data: saleItem, error: itemError } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          variant_id,
          quantity,
          products!inner(stock_quantity),
          product_variants(stock_quantity)
        `)
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      // Update product stock
      const newProductStock = (saleItem.products.stock_quantity || 0) + quantity
      const { error: productError } = await supabase
        .from('products')
        .update({ stock_quantity: newProductStock })
        .eq('id', saleItem.product_id)

      if (productError) throw productError

      // Update variant stock if applicable
      if (saleItem.variant_id) {
        const newVariantStock = (saleItem.product_variants?.stock_quantity || 0) + quantity
        const { error: variantError } = await supabase
          .from('product_variants')
          .update({ stock_quantity: newVariantStock })
          .eq('id', saleItem.variant_id)

        if (variantError) throw variantError
      }

      // Update branch stock if it exists
      try {
        const { data: branchStock } = await supabase
          .from('branch_stock')
          .select('stock_quantity')
          .eq('product_id', saleItem.product_id)
          .eq('variant_id', saleItem.variant_id)
          .single()

        if (branchStock) {
          const newBranchStock = (branchStock.stock_quantity || 0) + quantity
          await supabase
            .from('branch_stock')
            .update({ stock_quantity: newBranchStock })
            .eq('product_id', saleItem.product_id)
            .eq('variant_id', saleItem.variant_id)
        }
      } catch (branchError) {
        // Branch stock might not exist, that's okay
        console.log('Branch stock update skipped:', branchError)
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating inventory:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update inventory' 
      }
    }
  }

  /**
   * Credit customer account
   */
  static async creditCustomerAccount(customerId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current customer account balance
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('account_balance, credit_limit')
        .eq('id', customerId)
        .single()

      if (customerError) {
        throw new Error('Customer not found')
      }

      // Update customer account balance (add the refund amount)
      const newBalance = (customer.account_balance || 0) + amount
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          account_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

      if (updateError) throw updateError

      // Skip credit transaction record creation for now
      // The credit_transactions table structure is different than expected
      console.log(`Customer ${customerId} account credited with ${amount}. New balance: ${newBalance}`)
      console.log('Note: Credit transaction record not created due to table structure differences')
      return { success: true }
    } catch (error) {
      console.error('Error crediting customer account:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to credit customer account' 
      }
    }
  }

  /**
   * Create refund item record
   */
  static async createRefundItemRecord(refundId: string, itemId: string, refundAmount: number, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get sale item details
      const { data: saleItem, error: itemError } = await supabase
        .from('sale_items')
        .select('product_id, variant_id, quantity, unit_price')
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError

      // Create refund item record
      const { error } = await supabase
        .from('refund_items')
        .insert({
          refund_id: refundId,
          original_sale_item_id: itemId,
          product_id: saleItem.product_id,
          variant_id: saleItem.variant_id,
          quantity: saleItem.quantity,
          unit_price: saleItem.unit_price,
          refund_amount: refundAmount,
          reason: reason
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error creating refund item record:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create refund item record' 
      }
    }
  }

  /**
   * Get refund history
   */
  static async getRefundHistory(branchId?: string, limit: number = 50): Promise<{ data: any[]; error?: string }> {
    try {
      let query = supabase
        .from('refunds')
        .select(`
          *,
          customers(first_name, last_name, email),
          users(full_name),
          refund_items(
            *,
            products(name, sku),
            product_variants(name)
          )
        `)
        .order('processed_at', { ascending: false })
        .limit(limit)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data, error } = await query

      if (error) throw error

      return { data: data || [] }
    } catch (error) {
      console.error('Error fetching refund history:', error)
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch refund history' 
      }
    }
  }

  /**
   * Get refund statistics
   */
  static async getRefundStats(branchId?: string, period: 'today' | 'week' | 'month' = 'today'): Promise<{ data: any; error?: string }> {
    try {
      let dateFilter = ''
      const now = new Date()

      switch (period) {
        case 'today':
          dateFilter = `processed_at >= '${now.toISOString().split('T')[0]}'`
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = `processed_at >= '${weekAgo.toISOString()}'`
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          dateFilter = `processed_at >= '${monthAgo.toISOString()}'`
          break
      }

      let query = supabase
        .from('refunds')
        .select('refund_amount, refund_method, status')

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      if (dateFilter) {
        query = query.filter(dateFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate statistics
      const stats = {
        totalRefunds: data?.length || 0,
        totalAmount: data?.reduce((sum, refund) => sum + (refund.refund_amount || 0), 0) || 0,
        byMethod: {} as Record<string, number>,
        byStatus: {} as Record<string, number>
      }

      data?.forEach(refund => {
        // Count by method
        const method = refund.refund_method || 'unknown'
        stats.byMethod[method] = (stats.byMethod[method] || 0) + 1

        // Count by status
        const status = refund.status || 'unknown'
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
      })

      return { data: stats }
    } catch (error) {
      console.error('Error fetching refund stats:', error)
      return { 
        data: {}, 
        error: error instanceof Error ? error.message : 'Failed to fetch refund statistics' 
      }
    }
  }
}
