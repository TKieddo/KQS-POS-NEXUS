import { supabase } from './supabase'
import type { Customer } from '@/features/pos/types'

export interface CreateCustomerData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  customer_type?: 'regular' | 'credit' | 'laybye'
  credit_limit?: number
  notes?: string
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  customersWithCredit: number
  customersWithOverdue: number
}

// Create a new customer
export const createCustomer = async (customerData: CreateCustomerData): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        postal_code: customerData.postal_code,
        country: customerData.country || 'South Africa',
        customer_type: customerData.customer_type || 'regular',
        credit_limit: customerData.credit_limit || 0,
        current_balance: 0,
        loyalty_points: 0,
        is_active: true,
        notes: customerData.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { success: false, error: 'Failed to create customer' }
  }
}

// Get all customers
export const getCustomers = async (filters?: {
  search?: string
  customer_type?: string
  is_active?: boolean
  limit?: number
  branch_id?: string
}): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    let query = supabase
      .from('customers')
      .select('*')
      .order('first_name')

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    if (filters?.customer_type) {
      query = query.eq('customer_type', filters.customer_type)
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters?.branch_id && filters.branch_id !== '00000000-0000-0000-0000-000000000001') {
      query = query.eq('branch_id', filters.branch_id)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { success: false, error: 'Failed to fetch customers' }
  }
}

// Get a single customer by ID
export const getCustomerById = async (customerId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return { success: false, error: 'Failed to fetch customer' }
  }
}

// Search customers by name, email, or phone
export const searchCustomers = async (searchTerm: string, branchId?: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    let query = supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .eq('status', 'active')
      .order('first_name')

    // Add branch filtering if specific branch is selected
    if (branchId && branchId !== '00000000-0000-0000-0000-000000000001') {
      query = query.eq('branch_id', branchId)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Error searching customers:', error)
      return { success: false, error: error.message }
    }

    if (!customers || customers.length === 0) {
      return { success: true, data: [] }
    }

    // Get customer IDs for related data
    const customerIds = customers.map(c => c.id)

    // Fetch credit accounts separately
    const { data: creditAccounts } = await supabase
      .from('credit_accounts')
      .select('*')
      .in('customer_id', customerIds)

    // Fetch loyalty accounts separately
    const { data: loyaltyAccounts } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .in('customer_id', customerIds)

    // Fetch branches separately
    const branchIds = [...new Set(customers.map(c => c.branch_id).filter(Boolean))]
    const { data: branches } = await supabase
      .from('branches')
      .select('id, name')
      .in('id', branchIds)

    // Combine the data
    const enrichedCustomers = customers.map(customer => {
      const creditAccount = creditAccounts?.find(ca => ca.customer_id === customer.id)
      const loyaltyAccount = loyaltyAccounts?.find(la => la.customer_id === customer.id)
      const branch = branches?.find(b => b.id === customer.branch_id)

      return {
        ...customer,
        creditAccount: creditAccount || null,
        loyaltyAccount: loyaltyAccount || null,
        branchName: branch?.name || undefined
      }
    })

    return { success: true, data: enrichedCustomers }
  } catch (error) {
    console.error('Error searching customers:', error)
    return { success: false, error: 'Failed to search customers' }
  }
}

// Update a customer
export const updateCustomer = async (
  customerId: string, 
  updates: Partial<CreateCustomerData>
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { success: false, error: 'Failed to update customer' }
  }
}

// Delete a customer (soft delete)
export const deleteCustomer = async (customerId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', customerId)

    if (error) {
      console.error('Error deleting customer:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { success: false, error: 'Failed to delete customer' }
  }
}

// Get customer statistics
export const getCustomerStats = async (): Promise<{ success: boolean; data?: CustomerStats; error?: string }> => {
  try {
    // Get total customers
    const { data: totalCustomers, error: totalError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })

    if (totalError) {
      console.error('Error fetching total customers:', totalError)
      return { success: false, error: totalError.message }
    }

    // Get active customers
    const { data: activeCustomers, error: activeError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    if (activeError) {
      console.error('Error fetching active customers:', activeError)
      return { success: false, error: activeError.message }
    }

    // Get new customers this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: newCustomers, error: newError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString())

    if (newError) {
      console.error('Error fetching new customers:', newError)
      return { success: false, error: newError.message }
    }

    // Get customers with credit
    const { data: creditCustomers, error: creditError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('customer_type', 'credit')

    if (creditError) {
      console.error('Error fetching credit customers:', creditError)
      return { success: false, error: creditError.message }
    }

    // Get customers with overdue balances
    const { data: overdueCustomers, error: overdueError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .gt('current_balance', 0)

    if (overdueError) {
      console.error('Error fetching overdue customers:', overdueError)
      return { success: false, error: overdueError.message }
    }

    const stats: CustomerStats = {
      totalCustomers: totalCustomers?.length || 0,
      activeCustomers: activeCustomers?.length || 0,
      newCustomersThisMonth: newCustomers?.length || 0,
      customersWithCredit: creditCustomers?.length || 0,
      customersWithOverdue: overdueCustomers?.length || 0
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error calculating customer stats:', error)
    return { success: false, error: 'Failed to calculate customer stats' }
  }
}

// Update customer balance (for credit sales)
export const updateCustomerBalance = async (
  customerId: string, 
  amount: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // First get current balance
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('id', customerId)
      .single()

    if (fetchError) {
      console.error('Error fetching customer balance:', fetchError)
      return { success: false, error: fetchError.message }
    }

    const newBalance = (customer.current_balance || 0) + amount

    const { data, error } = await supabase
      .from('customers')
      .update({ current_balance: newBalance })
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer balance:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating customer balance:', error)
    return { success: false, error: 'Failed to update customer balance' }
  }
}

// Get customers with overdue balances
export const getOverdueCustomers = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .gt('current_balance', 0)
      .eq('is_active', true)
      .order('current_balance', { ascending: false })

    if (error) {
      console.error('Error fetching overdue customers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching overdue customers:', error)
    return { success: false, error: 'Failed to fetch overdue customers' }
  }
} 