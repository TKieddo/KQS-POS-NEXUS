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
    const remainingAmount = laybyeData.total_amount - laybyeData.deposit_amount
    
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
    // Note: Temporarily disabled until laybye_payments table structure is confirmed
    if (laybyeData.deposit_amount > 0) {
      console.log('Initial deposit payment would be created:', {
        laybye_id: laybyeOrder.id,
        amount: laybyeData.deposit_amount,
        payment_method: 'deposit',
        payment_date: new Date().toISOString(),
        notes: 'Initial deposit'
      })
      
      // TODO: Re-enable when laybye_payments table is properly structured
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

    // Update product stock quantities (reserve items for laybye)
    for (const item of laybyeData.items) {
      const newStockQuantity = item.product.stock_quantity - item.quantity
      
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', item.product.id)

      if (stockError) {
        console.error('Error updating stock for product:', item.product.id, stockError)
      }
    }

    // Create stock movement records
    const stockMovements = laybyeData.items.map(item => ({
      product_id: item.product.id,
      movement_type: 'out', // 'out' for laybye (reserved)
      quantity: -item.quantity, // Negative for laybye (reserved)
      previous_stock: item.product.stock_quantity,
      new_stock: item.product.stock_quantity - item.quantity,
      reference_type: 'laybye',
      reference_id: laybyeOrder.id,
      notes: `Laybye order - ${item.quantity} units reserved via order ${orderNumber}`
    }))

    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert(stockMovements)

    if (movementError) {
      console.error('Error creating stock movements:', movementError)
      // This is not critical, so we don't rollback the laybye order
    }

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
}): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // First, get the laybye orders
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

    // Get customer IDs
    const customerIds = [...new Set(laybyeOrders.map(order => order.customer_id).filter(Boolean))]
    
    // Get laybye order IDs
    const laybyeOrderIds = laybyeOrders.map(order => order.id)

    // Fetch customers separately
    let customers: any[] = []
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds)

      if (customersError) {
        console.error('Error fetching customers for laybye orders:', customersError)
      } else {
        customers = customersData || []
      }
    }

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
    const enrichedLaybyeOrders = laybyeOrders.map(order => {
      // Find customer
      const customer = customers.find(c => c.id === order.customer_id)
      
      // Find items for this order
      const orderItems = laybyeItems.filter(item => item.laybye_id === order.id)
      
      // Enrich items with product data
      const enrichedItems = orderItems.map(item => ({
        ...item,
        products: products.find(p => p.id === item.product_id)
      }))
      
      // Find payments for this order
      const orderPayments = laybyePayments.filter(payment => payment.laybye_id === order.id)
      
      // Calculate remaining amount if not in database
      const totalPayments = orderPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      const calculatedRemaining = (order.total_amount || 0) - totalPayments
      
      return {
        ...order,
        customers: customer,
        laybye_items: enrichedItems,
        laybye_payments: orderPayments,
        // Ensure remaining_amount is available (use from DB or calculate)
        remaining_amount: order.remaining_amount !== undefined ? order.remaining_amount : calculatedRemaining
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

    // Update laybye order remaining balance and status
    const { data: laybyeOrder, error: fetchError } = await supabase
      .from('laybye_orders')
      .select('total_amount, deposit_amount, remaining_balance, remaining_amount')
      .eq('id', paymentData.laybye_id)
      .single()

    if (fetchError) {
      console.error('Error fetching laybye order for payment:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Calculate current remaining balance
    let currentRemaining: number
    if (laybyeOrder.remaining_balance !== undefined) {
      currentRemaining = laybyeOrder.remaining_balance
    } else {
      // Calculate from total payments if remaining_balance column doesn't exist
      const { data: allPayments } = await supabase
        .from('laybye_payments')
        .select('amount')
        .eq('laybye_id', paymentData.laybye_id)
        
      const totalPayments = (allPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
      currentRemaining = (laybyeOrder.total_amount || 0) - totalPayments
    }

    const newRemainingBalance = currentRemaining - paymentData.amount
    const newStatus = newRemainingBalance <= 0 ? 'completed' : 'active'

    // Update the order (update both remaining_balance and remaining_amount)
    const updateData: any = { 
      status: newStatus,
      remaining_balance: newRemainingBalance,
      remaining_amount: newRemainingBalance
    }

    const { error: updateError } = await supabase
      .from('laybye_orders')
      .update(updateData)
      .eq('id', paymentData.laybye_id)

    if (updateError) {
      console.error('Error updating laybye order after payment:', updateError)
      return { success: false, error: updateError.message }
    }

    // If laybye is completed, release stock back to inventory
    if (newStatus === 'completed') {
      const { data: laybyeItems, error: itemsError } = await supabase
        .from('laybye_items')
        .select('product_id, quantity')
        .eq('laybye_id', paymentData.laybye_id)

      if (!itemsError && laybyeItems) {
        for (const item of laybyeItems) {
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
              console.error('Error releasing stock for product:', item.product_id, stockError)
            }
          }
        }
      }
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