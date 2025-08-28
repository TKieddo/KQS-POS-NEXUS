import { supabase, generateOrderNumber } from './supabase'
import type { CartItem, Customer } from '@/features/pos/types'

export interface CreateLaybyeData {
  customer_id?: string // Made optional to match schema (nullable in DB)
  cashier_id?: string // Made optional since we don't have auth yet
  branch_id?: string // Made optional to match schema
  items: CartItem[]
  subtotal?: number // Optional with fallback
  tax_amount?: number // Optional with fallback
  discount_amount?: number // Optional with fallback
  total_amount: number
  deposit_amount: number
  remaining_balance?: number // Optional, will be calculated
  due_date: string
  notes?: string
}

export interface LaybyePaymentData {
  laybye_id: string
  amount: number
  payment_method: string
  payment_date: string
  notes?: string
}

export interface LaybyeStats {
  totalLaybyeOrders: number
  activeLaybyeOrders: number
  overdueLaybyeOrders: number
  totalLaybyeValue: number
  totalDeposits: number
  totalRemaining: number
}

// Create a new laybye order
export const createLaybyeOrder = async (laybyeData: CreateLaybyeData): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const orderNumber = generateOrderNumber()
    
    // Create laybye order with all required fields (both remaining_balance and remaining_amount)
    // Calculate correct remaining balance: Total - Deposit (no payments yet)
    const remainingAmount = Math.max(0, laybyeData.total_amount - laybyeData.deposit_amount)
    
    const insertData: any = {
      order_number: orderNumber,
      subtotal: laybyeData.subtotal || laybyeData.total_amount,
      tax_amount: laybyeData.tax_amount || 0,
      discount_amount: laybyeData.discount_amount || 0,
      total_amount: laybyeData.total_amount,
      deposit_amount: laybyeData.deposit_amount,
      remaining_balance: remainingAmount, // Primary remaining balance field
      remaining_amount: remainingAmount,  // Secondary remaining amount field
      due_date: laybyeData.due_date,
      status: 'active'
    }

    // Add optional fields only if they exist
    if (laybyeData.customer_id) insertData.customer_id = laybyeData.customer_id
    if (laybyeData.branch_id) insertData.branch_id = laybyeData.branch_id
    if (laybyeData.cashier_id) insertData.cashier_id = laybyeData.cashier_id
    if (laybyeData.notes) insertData.notes = laybyeData.notes

    const { data: laybyeOrder, error: orderError } = await supabase
      .from('laybye_orders')
      .insert(insertData)
      .select()
      .single()

    if (orderError) {
      console.error('Error creating laybye order:', orderError)
      return { success: false, error: orderError.message }
    }

    // Create laybye items (without discount_amount since it doesn't exist in the table)
    const laybyeItems = laybyeData.items.map(item => ({
      laybye_id: laybyeOrder.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
      // discount_amount removed - column doesn't exist in laybye_items table
      // cost_price: item.product.cost_price // Not in schema
    }))

    const { error: itemsError } = await supabase
      .from('laybye_items')
      .insert(laybyeItems)

    if (itemsError) {
      console.error('Error creating laybye items:', itemsError)
      // Rollback laybye order creation
      await supabase.from('laybye_orders').delete().eq('id', laybyeOrder.id)
      return { success: false, error: itemsError.message }
    }

    // Create initial deposit payment if deposit amount > 0
    // FIXED: Don't create a separate payment record for the deposit
    // The deposit amount is already tracked in laybye_orders.deposit_amount
    // Only create payment records for additional payments beyond the deposit
    if (laybyeData.deposit_amount > 0) {
      console.log('Initial deposit payment would be created:', {
        laybye_id: laybyeOrder.id,
        amount: laybyeData.deposit_amount,
        payment_method: 'deposit',
        payment_date: new Date().toISOString(),
        notes: 'Initial deposit'
      })
      
      // FIXED: Commented out to prevent double-counting the deposit
      // The deposit is already tracked in laybye_orders.deposit_amount field
      /*
      const { error: paymentError } = await supabase
        .from('laybye_payments')
        .insert({
          laybye_id: laybyeOrder.id,
          amount: laybyeData.deposit_amount,
          payment_method: 'deposit',
          payment_date: new Date().toISOString(),
          notes: 'Initial deposit'
        })

      if (paymentError) {
        console.error('Error creating initial deposit payment:', paymentError)
        // This is not critical, so we don't rollback the laybye order
      }
      */
    }

    // NEW LOGIC: Deduct quantities from branch stock when creating laybye order
    // This reserves the items for the laybye order
    if (laybyeData.branch_id) {
      for (const item of laybyeData.items) {
        try {
          // Deduct from main product stock in branch_stock table
          const { data: currentStock, error: fetchError } = await supabase
            .from('branch_stock')
            .select('stock_quantity')
            .eq('product_id', item.product.id)
            .eq('branch_id', laybyeData.branch_id)
            .is('variant_id', null)
            .single()

          if (!fetchError && currentStock) {
            const currentQuantity = currentStock.stock_quantity || 0
            const newQuantity = Math.max(0, currentQuantity - item.quantity)

            const { error: stockError } = await supabase
              .from('branch_stock')
              .update({ 
                stock_quantity: newQuantity,
                updated_at: new Date().toISOString()
              })
              .eq('product_id', item.product.id)
              .eq('branch_id', laybyeData.branch_id)
              .is('variant_id', null)

            if (stockError) {
              console.error('Error deducting stock for product:', item.product.id, stockError)
            }
          }
        } catch (error) {
          console.error('Error processing stock deduction for item:', item.product.id, error)
        }
      }
    }

    console.log('Laybye order created - quantities deducted from branch stock during creation')

    return { success: true, data: laybyeOrder }
  } catch (error) {
    console.error('Error creating laybye order:', error)
    return { success: false, error: 'Failed to create laybye order' }
  }
}

// Get laybye orders with details
export const getLaybyeOrders = async (filters?: {
  status?: string
  customer_id?: string
  branch_id?: string
  startDate?: string
  endDate?: string
  limit?: number
  search?: string // Add search parameter
}): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // Get the laybye orders with customer name already populated in the table
    let query = supabase
      .from('laybye_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    // Add search functionality for customer name, order number, and customer phone
    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.trim()
      query = query.or(`customer_name.ilike.%${searchTerm}%,order_number.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: laybyeOrders, error: laybyeError } = await query

    if (laybyeError) {
      console.error('Error fetching laybye orders:', laybyeError)
      return { success: false, error: laybyeError.message }
    }

    if (!laybyeOrders || laybyeOrders.length === 0) {
      return { success: true, data: [] }
    }

    console.log(`🔍 Fetched ${laybyeOrders.length} laybye orders with customer names`)

    // Get laybye order IDs for fetching related data
    const laybyeOrderIds = laybyeOrders.map(order => order.id)

    // Fetch laybye items separately
    let laybyeItems: any[] = []
    if (laybyeOrderIds.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('laybye_items')
        .select('*')
        .in('laybye_id', laybyeOrderIds)

      if (itemsError) {
        console.error('Error fetching laybye items:', itemsError)
      } else {
        laybyeItems = itemsData || []
      }
    }

    // Fetch products for the items
    let products: any[] = []
    if (laybyeItems.length > 0) {
      const productIds = [...new Set(laybyeItems.map(item => item.product_id).filter(Boolean))]
      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku, barcode')
          .in('id', productIds)

        if (productsError) {
          console.error('Error fetching products for laybye items:', productsError)
        } else {
          products = productsData || []
        }
      }
    }

    // Fetch laybye payments separately
    let laybyePayments: any[] = []
    if (laybyeOrderIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('laybye_payments')
        .select('*')
        .in('laybye_id', laybyeOrderIds)
        .order('payment_date', { ascending: false })

      if (paymentsError) {
        console.error('Error fetching laybye payments:', paymentsError)
      } else {
        laybyePayments = paymentsData || []
      }
    }

    // Combine the data
    const enrichedLaybyeOrders = laybyeOrders.map((order) => {
      // Customer name is already available in the order data
      const customerName = order.customer_name || 'Unknown Customer'
      
      // Debug: Log customer name from database
      console.log(`🔍 Debug: Order ${order.order_number}`)
      console.log(`  Customer ID: ${order.customer_id}`)
      console.log(`  Customer Name from DB: ${customerName}`)
      console.log(`  Customer Phone: ${order.customer_phone}`)
      console.log(`  Customer Email: ${order.customer_email}`)
      
      // Find items for this order
      const orderItems = laybyeItems.filter(item => item.laybye_id === order.id)
      
      // Enrich items with product data
      const enrichedItems = orderItems.map(item => ({
        ...item,
        products: products.find(p => p.id === item.product_id)
      }))
      
      // Find payments for this order
      const orderPayments = laybyePayments.filter(payment => payment.laybye_id === order.id)
      
      // Calculate correct remaining amount: Total - (Deposit + All Payments)
      const totalPayments = orderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      const calculatedRemaining = Math.max(0, (order.total_amount || 0) - (order.deposit_amount || 0) - totalPayments)
      
      return {
        ...order,
        customer_display_name: customerName, // Use the name from database
        customers: {
          id: order.customer_id,
          first_name: '', // We don't need these anymore since we have the display name
          last_name: '',
          email: order.customer_email,
          phone: order.customer_phone
        },
        laybye_items: enrichedItems,
        laybye_payments: orderPayments,
        // Use calculated remaining amount for consistency
        remaining_amount: calculatedRemaining,
        remaining_balance: calculatedRemaining
      }
    })

    return { success: true, data: enrichedLaybyeOrders }
  } catch (error) {
    console.error('Error fetching laybye orders:', error)
    return { success: false, error: 'Failed to fetch laybye orders' }
  }
}

// Get a single laybye order by ID
export const getLaybyeOrderById = async (laybyeId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Get the laybye order
    const { data: laybyeOrder, error: laybyeError } = await supabase
      .from('laybye_orders')
      .select('*')
      .eq('id', laybyeId)
      .single()

    if (laybyeError) {
      console.error('Error fetching laybye order:', laybyeError)
      return { success: false, error: laybyeError.message }
    }

    // Get customer
    let customer = null
    if (laybyeOrder.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .eq('id', laybyeOrder.customer_id)
        .single()

      if (customerError) {
        console.error('Error fetching customer for laybye order:', customerError)
      } else {
        customer = customerData
      }
    }

    // Get laybye items
    const { data: laybyeItems, error: itemsError } = await supabase
      .from('laybye_items')
      .select('*')
      .eq('laybye_id', laybyeId)

    let enrichedItems: any[] = []
    if (itemsError) {
      console.error('Error fetching laybye items:', itemsError)
    } else if (laybyeItems && laybyeItems.length > 0) {
      // Get products for the items
      const productIds = [...new Set(laybyeItems.map(item => item.product_id).filter(Boolean))]
      let products: any[] = []
      
      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku, barcode, image_url')
          .in('id', productIds)

        if (productsError) {
          console.error('Error fetching products for laybye items:', productsError)
        } else {
          products = productsData || []
        }
      }

      // Enrich items with product data
      enrichedItems = laybyeItems.map(item => ({
        ...item,
        products: products.find(p => p.id === item.product_id)
      }))
    }

    // Get laybye payments
    const { data: laybyePayments, error: paymentsError } = await supabase
      .from('laybye_payments')
      .select('*')
      .eq('laybye_id', laybyeId)
      .order('payment_date', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching laybye payments:', paymentsError)
    }

    // Calculate remaining amount if not in database
    const totalPayments = (laybyePayments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const calculatedRemaining = (laybyeOrder.total_amount || 0) - totalPayments

    // Combine the data
    const enrichedLaybyeOrder = {
      ...laybyeOrder,
      customers: customer,
      laybye_items: enrichedItems,
      laybye_payments: laybyePayments || [],
      // Ensure remaining_amount is available (use from DB or calculate)
      remaining_amount: laybyeOrder.remaining_amount !== undefined ? laybyeOrder.remaining_amount : calculatedRemaining
    }

    return { success: true, data: enrichedLaybyeOrder }
  } catch (error) {
    console.error('Error fetching laybye order:', error)
    return { success: false, error: 'Failed to fetch laybye order' }
  }
}

// Add payment to laybye order
export const addLaybyePayment = async (paymentData: LaybyePaymentData): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('laybye_payments')
      .insert({
        laybye_id: paymentData.laybye_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date,
        notes: paymentData.notes
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating laybye payment:', paymentError)
      return { success: false, error: paymentError.message }
    }

    // Get laybye order details
    const { data: laybyeOrder, error: fetchError } = await supabase
      .from('laybye_orders')
      .select('total_amount, deposit_amount, remaining_balance, remaining_amount, branch_id')
      .eq('id', paymentData.laybye_id)
      .single()

    if (fetchError) {
      console.error('Error fetching laybye order for payment:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Get all payments for this laybye order
    const { data: allPayments } = await supabase
      .from('laybye_payments')
      .select('amount')
      .eq('laybye_id', paymentData.laybye_id)
      
    const totalPayments = (allPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    
    // Calculate correct remaining balance: Total - (Deposit + All Payments)
    const calculatedBalance = Math.max(0, (laybyeOrder.total_amount || 0) - (laybyeOrder.deposit_amount || 0) - totalPayments)
    const newStatus = calculatedBalance <= 0 ? 'completed' : 'active'

    // Update the order with correct balance
    const updateData: any = { 
      status: newStatus,
      remaining_balance: calculatedBalance,
      remaining_amount: calculatedBalance,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('laybye_orders')
      .update(updateData)
      .eq('id', paymentData.laybye_id)

    if (updateError) {
      console.error('Error updating laybye order after payment:', updateError)
      return { success: false, error: updateError.message }
    }

    // Note: No quantity deduction on completion since quantities were already deducted when laybye was created
    // The laybye completion only changes the status from 'active' to 'completed'
    if (newStatus === 'completed') {
      console.log('Laybye order completed - quantities already deducted during creation')
    }

    return { success: true, data: payment }
  } catch (error) {
    console.error('Error adding laybye payment:', error)
    return { success: false, error: 'Failed to add laybye payment' }
  }
}

// Update laybye order status
export const updateLaybyeStatus = async (
  laybyeId: string, 
  status: 'active' | 'completed' | 'cancelled' | 'expired'
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('laybye_orders')
      .update({ status })
      .eq('id', laybyeId)
      .select()
      .single()

    if (error) {
      console.error('Error updating laybye status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating laybye status:', error)
    return { success: false, error: 'Failed to update laybye status' }
  }
}

// Get laybye statistics
export const getLaybyeStats = async (branchId?: string): Promise<{ success: boolean; data?: LaybyeStats; error?: string }> => {
  try {
    // Get total laybye orders
    let ordersQuery = supabase.from('laybye_orders').select('*')
    if (branchId && branchId !== '00000000-0000-0000-0000-000000000001') {
      ordersQuery = ordersQuery.eq('branch_id', branchId)
    }
    const { data: totalOrders, error: totalError } = await ordersQuery

    if (totalError) {
      console.error('Error fetching laybye orders for stats:', totalError)
      return { success: false, error: totalError.message }
    }

    // Debug: Log the first order to see available columns
    if (totalOrders && totalOrders.length > 0) {
      console.log('Sample laybye order columns:', Object.keys(totalOrders[0]))
    }

    const totalLaybyeOrders = totalOrders?.length || 0
    const activeLaybyeOrders = totalOrders?.filter(order => order.status === 'active').length || 0
    const overdueLaybyeOrders = totalOrders?.filter(order => {
      if (!order.due_date) return false
      const dueDate = new Date(order.due_date)
      return order.status === 'active' && dueDate < new Date()
    }).length || 0

    const totalLaybyeValue = totalOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    
    // Calculate deposits and remaining amounts based on available columns
    let totalDeposits = 0
    let totalRemaining = 0
    
    if (totalOrders) {
      totalOrders.forEach(order => {
        const depositAmount = order.deposit_amount || 0
        const totalAmount = order.total_amount || 0
        
        totalDeposits += depositAmount
        
        // Calculate remaining amount
        if (order.remaining_amount !== undefined) {
          totalRemaining += order.remaining_amount
        } else {
          // Calculate from total - deposit if remaining_amount column doesn't exist
          totalRemaining += Math.max(0, totalAmount - depositAmount)
        }
      })
    }

    const stats: LaybyeStats = {
      totalLaybyeOrders,
      activeLaybyeOrders,
      overdueLaybyeOrders,
      totalLaybyeValue,
      totalDeposits,
      totalRemaining
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error calculating laybye stats:', error)
    return { success: false, error: 'Failed to calculate laybye stats' }
  }
}

// Cancel laybye order and restore stock
export const cancelLaybyeOrder = async (laybyeId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get laybye items to restore stock
    const { data: laybyeItems, error: itemsError } = await supabase
      .from('laybye_items')
      .select('product_id, quantity')
      .eq('laybye_id', laybyeId)

    if (itemsError) {
      console.error('Error fetching laybye items for cancellation:', itemsError)
      return { success: false, error: itemsError.message }
    }

    // Restore stock quantities
    for (const item of laybyeItems || []) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const newStockQuantity = product.stock_quantity + item.quantity
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', item.product_id)

        if (stockError) {
          console.error('Error restoring stock for product:', item.product_id, stockError)
        }
      }
    }

    // Optionally append cancellation reason to notes
    let newNotes: string | undefined
    if (reason && reason.trim()) {
      const { data: orderData } = await supabase
        .from('laybye_orders')
        .select('notes')
        .eq('id', laybyeId)
        .single()
      const existing = (orderData?.notes as string) || ''
      newNotes = `${existing ? existing + ' ' : ''}[Cancelled] Reason: ${reason.trim()}`
    }

    // Update laybye order status (and notes if provided)
    const { error: updateError } = await supabase
      .from('laybye_orders')
      .update(newNotes !== undefined ? { status: 'cancelled', notes: newNotes } : { status: 'cancelled' })
      .eq('id', laybyeId)

    if (updateError) {
      console.error('Error cancelling laybye order:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error cancelling laybye order:', error)
    return { success: false, error: 'Failed to cancel laybye order' }
  }
}

// Update laybye order editable details
export const updateLaybyeOrderDetails = async (
  laybyeId: string,
  updates: { due_date?: string; notes?: string; customer_id?: string }
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const updatePayload: any = {}
    if (updates.due_date !== undefined) updatePayload.due_date = updates.due_date
    if (updates.notes !== undefined) updatePayload.notes = updates.notes
    if (updates.customer_id !== undefined) updatePayload.customer_id = updates.customer_id

    const { data, error } = await supabase
      .from('laybye_orders')
      .update(updatePayload)
      .eq('id', laybyeId)
      .select()
      .single()

    if (error) {
      console.error('Error updating laybye order details:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating laybye order details:', error)
    return { success: false, error: 'Failed to update laybye order' }
  }
}