import { supabase, generateTransactionNumber } from './supabase'
import type { CartItem, Customer, Sale } from '@/features/pos/types'

export interface CreateSaleData {
  customer_id?: string
  cashier_id?: string // Made optional since we don't have auth yet
  branch_id: string
  items: CartItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  sale_type: 'regular' | 'credit' | 'laybye'
  notes?: string
}

export interface SalesStats {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  salesToday: number
  revenueToday: number
  salesThisMonth: number
  revenueThisMonth: number
  salesThisWeek: number
  revenueThisWeek: number
  paymentMethodBreakdown: {
    cash: number
    card: number
    credit: number
    mpesa: number
    ecocash: number
    transfer: number
  }
}

// Create a new sale
export const createSale = async (saleData: CreateSaleData): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    console.log('Creating sale with data:', saleData)
    const transactionNumber = generateTransactionNumber()
    
    // Start a transaction
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        transaction_number: transactionNumber,
        customer_id: saleData.customer_id,
        // cashier_id: saleData.cashier_id, // Temporarily commented out until auth is implemented
        branch_id: saleData.branch_id,
        subtotal: saleData.subtotal,
        tax_amount: saleData.tax_amount,
        discount_amount: saleData.discount_amount,
        total_amount: saleData.total_amount,
        payment_method: saleData.payment_method,
        payment_status: saleData.payment_status,
        sale_type: saleData.sale_type,
        notes: saleData.notes
      })
      .select()
      .single()

    if (saleError) {
      console.error('Error creating sale:', saleError)
      return { success: false, error: saleError.message }
    }

    // Insert sale items
    if (saleData.items && saleData.items.length > 0) {
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        variant_id: item.variantId || null, // Include variant_id if available
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        discount_amount: item.discount || 0
      }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      console.error('Error creating sale items:', itemsError)
        // Try to delete the sale if items failed
      await supabase.from('sales').delete().eq('id', sale.id)
      return { success: false, error: itemsError.message }
      }
    }

    // Stock decrement handled by DB trigger on sale_items insert (update_stock_on_sale_item)

    console.log('Sale created successfully:', sale)
    return { success: true, data: sale }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create sale' }
  }
}

// Get sales with details
export const getSales = async (filters?: {
  startDate?: string
  endDate?: string
  customer_id?: string
  payment_status?: string
  sale_type?: string
  branch_id?: string
  limit?: number
}): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // Build base query for sales
    let salesQuery = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.startDate) {
      salesQuery = salesQuery.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      salesQuery = salesQuery.lte('created_at', filters.endDate)
    }
    if (filters?.customer_id) {
      salesQuery = salesQuery.eq('customer_id', filters.customer_id)
    }
    if (filters?.payment_status) {
      salesQuery = salesQuery.eq('payment_status', filters.payment_status)
    }
    if (filters?.sale_type) {
      salesQuery = salesQuery.eq('sale_type', filters.sale_type)
    }
    if (filters?.branch_id && filters.branch_id !== '00000000-0000-0000-0000-000000000001') {
      salesQuery = salesQuery.eq('branch_id', filters.branch_id)
    }
    if (filters?.limit) {
      salesQuery = salesQuery.limit(filters.limit)
    }

    const { data: sales, error: salesError } = await salesQuery

    if (salesError) {
      console.error('Error fetching sales:', salesError)
      return { success: false, error: salesError.message }
    }

    if (!sales || sales.length === 0) {
      return { success: true, data: [] }
    }

    // Get unique customer IDs and branch IDs
    const customerIds = [...new Set(sales.map(sale => sale.customer_id).filter(Boolean))]
    const branchIds = [...new Set(sales.map(sale => sale.branch_id).filter(Boolean))]
    const saleIds = sales.map(sale => sale.id)

    // Fetch customers data
    let customersData: any[] = []
    if (customerIds.length > 0) {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds)

      if (customersError) {
        console.error('Error fetching customers:', customersError)
      } else {
        customersData = customers || []
      }
    }

    // Fetch branches data
    let branchesData: any[] = []
    if (branchIds.length > 0) {
      const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('id, name')
        .in('id', branchIds)

      if (branchesError) {
        console.error('Error fetching branches:', branchesError)
      } else {
        branchesData = branches || []
      }
    }

    // Fetch sale items and products
    let saleItemsData: any[] = []
    if (saleIds.length > 0) {
      const { data: saleItems, error: saleItemsError } = await supabase
        .from('sale_items')
        .select('*')
        .in('sale_id', saleIds)

      if (saleItemsError) {
        console.error('Error fetching sale items:', saleItemsError)
      } else {
        saleItemsData = saleItems || []
      }
    }

    // Get unique product IDs from sale items
    const productIds = [...new Set(saleItemsData.map(item => item.product_id).filter(Boolean))]

    // Fetch products data
    let productsData: any[] = []
    if (productIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, barcode')
        .in('id', productIds)

      if (productsError) {
        console.error('Error fetching products:', productsError)
      } else {
        productsData = products || []
      }
    }

    // Create lookup maps
    const customersMap = new Map(customersData.map(c => [c.id, c]))
    const branchesMap = new Map(branchesData.map(b => [b.id, b]))
    const productsMap = new Map(productsData.map(p => [p.id, p]))

    // Group sale items by sale_id
    const saleItemsMap = new Map()
    saleItemsData.forEach(item => {
      if (!saleItemsMap.has(item.sale_id)) {
        saleItemsMap.set(item.sale_id, [])
      }
      saleItemsMap.get(item.sale_id).push({
        ...item,
        products: productsMap.get(item.product_id) || null
      })
    })

    // Combine the data
    const combinedSales = sales.map(sale => ({
      ...sale,
      customers: customersMap.get(sale.customer_id) || null,
      sale_items: saleItemsMap.get(sale.id) || [],
      branches: branchesMap.get(sale.branch_id) || null
    }))

    return { success: true, data: combinedSales }
  } catch (error) {
    console.error('Error fetching sales:', error)
    return { success: false, error: 'Failed to fetch sales' }
  }
}

// Get a single sale by ID
export const getSaleById = async (saleId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Get the sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single()

    if (saleError) {
      console.error('Error fetching sale:', saleError)
      return { success: false, error: saleError.message }
    }

    if (!sale) {
      return { success: false, error: 'Sale not found' }
    }

    // Get customer data if customer_id exists
    let customerData = null
    if (sale.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .eq('id', sale.customer_id)
        .single()

      if (!customerError) {
        customerData = customer
      }
    }

    // Get branch data if branch_id exists
    let branchData = null
    if (sale.branch_id) {
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('id, name')
        .eq('id', sale.branch_id)
        .single()

      if (!branchError) {
        branchData = branch
      }
    }

    // Get sale items
    const { data: saleItems, error: saleItemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId)

    let saleItemsWithProducts: any[] = []
    if (!saleItemsError && saleItems && saleItems.length > 0) {
      // Get product IDs
      const productIds = saleItems.map(item => item.product_id).filter(Boolean)

      if (productIds.length > 0) {
        // Get products data
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku, barcode')
          .in('id', productIds)

        if (!productsError && products) {
          const productsMap = new Map(products.map(p => [p.id, p]))
          
          // Combine sale items with products
          saleItemsWithProducts = saleItems.map(item => ({
            ...item,
            products: productsMap.get(item.product_id) || null
          }))
        }
      }
    }

    // Combine all data
    const combinedSale = {
      ...sale,
      customers: customerData,
      sale_items: saleItemsWithProducts,
      branches: branchData
    }

    return { success: true, data: combinedSale }
  } catch (error) {
    console.error('Error fetching sale:', error)
    return { success: false, error: 'Failed to fetch sale' }
  }
}

// Update sale status
export const updateSaleStatus = async (saleId: string, status: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('sales')
      .update({ payment_status: status })
      .eq('id', saleId)

    if (error) {
      console.error('Error updating sale status:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating sale status:', error)
    return { success: false, error: 'Failed to update sale status' }
  }
}

// Get sales statistics
export const getSalesStats = async (period: 'today' | 'week' | 'month' | 'year' = 'today', branchId?: string): Promise<{ success: boolean; data?: SalesStats; error?: string }> => {
  try {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    let query = supabase
      .from('sales')
      .select('total_amount, payment_method, payment_status, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('payment_status', 'completed')

    if (branchId && branchId !== '00000000-0000-0000-0000-000000000001') {
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching sales stats:', error)
      return { success: false, error: error.message }
    }

    const totalSales = data.length
    const totalRevenue = data.reduce((sum, sale) => sum + sale.total_amount, 0)
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Get today's stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todaySales = data.filter(sale => new Date(sale.created_at) >= todayStart)
    const salesToday = todaySales.length
    const revenueToday = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0)

    // Get this month's stats
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthSales = data.filter(sale => new Date(sale.created_at) >= monthStart)
    const salesThisMonth = monthSales.length
    const revenueThisMonth = monthSales.reduce((sum, sale) => sum + sale.total_amount, 0)

    // Get this week's stats
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekSales = data.filter(sale => new Date(sale.created_at) >= weekStart)
    const salesThisWeek = weekSales.length
    const revenueThisWeek = weekSales.reduce((sum, sale) => sum + sale.total_amount, 0)

    // Payment method breakdown
    const paymentMethodBreakdown = {
      cash: data.filter(sale => sale.payment_method === 'cash').reduce((sum, sale) => sum + sale.total_amount, 0),
      card: data.filter(sale => sale.payment_method === 'card').reduce((sum, sale) => sum + sale.total_amount, 0),
      credit: data.filter(sale => sale.payment_method === 'credit').reduce((sum, sale) => sum + sale.total_amount, 0),
      mpesa: data.filter(sale => sale.payment_method === 'mpesa').reduce((sum, sale) => sum + sale.total_amount, 0),
      ecocash: data.filter(sale => sale.payment_method === 'ecocash').reduce((sum, sale) => sum + sale.total_amount, 0),
      transfer: data.filter(sale => sale.payment_method === 'transfer').reduce((sum, sale) => sum + sale.total_amount, 0)
    }

    const stats: SalesStats = {
      totalSales,
      totalRevenue,
      averageOrderValue,
      salesToday,
      revenueToday,
      salesThisMonth,
      revenueThisMonth,
      salesThisWeek,
      revenueThisWeek,
      paymentMethodBreakdown
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching sales stats:', error)
    return { success: false, error: 'Failed to fetch sales statistics' }
  }
}

// Delete a sale (for refunds/cancellations)
export const deleteSale = async (saleId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First get the sale to restore stock
    const { data: sale, error: fetchError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (
            id,
            stock_quantity
          )
        )
      `)
      .eq('id', saleId)
      .single()

    if (fetchError) {
      console.error('Error fetching sale for deletion:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Restore stock levels
    for (const item of sale.sale_items) {
      // First get current stock
      const { data: product, error: fetchStockError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.products.id)
        .single()

      if (fetchStockError) {
        console.error('Error fetching product stock for restoration:', fetchStockError)
        continue
      }

      if (product) {
        const newStockQuantity = product.stock_quantity + item.quantity
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', item.products.id)

        if (stockError) {
          console.error('Error restoring stock for product:', item.products.id, stockError)
        }
      }
    }

    // Delete the sale (cascade will delete sale_items)
    const { error: deleteError } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId)

    if (deleteError) {
      console.error('Error deleting sale:', deleteError)
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting sale:', error)
    return { success: false, error: 'Failed to delete sale' }
  }
} 