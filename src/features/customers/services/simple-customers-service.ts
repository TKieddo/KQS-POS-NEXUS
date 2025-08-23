import { supabase } from '@/lib/supabase'
import type { 
  Customer, 
  CreditAccount, 
  LoyaltyAccount, 
  CustomerFilter,
  CustomerStats
} from '../types'

export class SimpleCustomersService {
  // ========================================
  // SIMPLE CUSTOMER CRUD OPERATIONS
  // ========================================

  static async getCustomers(filter?: CustomerFilter, branchId?: string): Promise<{ data: Customer[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('customers')
        .select('*')

      // Apply filters
      if (filter) {
        if (filter.search) {
          query = query.or(`first_name.ilike.%${filter.search}%,last_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,phone.ilike.%${filter.search}%`)
        }
        
        if (filter.status !== 'all') {
          query = query.eq('status', filter.status)
        }
        
        if (filter.customerType !== 'all') {
          query = query.eq('customer_type', filter.customerType)
        }

        if (filter.dateRange.start && filter.dateRange.end) {
          query = query.gte('created_at', filter.dateRange.start).lte('created_at', filter.dateRange.end)
        }
      }

      // Filter by branch if provided
      console.log('=== DEBUG: Branch filtering ===')
      console.log('branchId:', branchId)
      console.log('branchId type:', typeof branchId)
      
      if (branchId && branchId !== 'all' && branchId !== 'undefined') {
        console.log('Applying branch filter for:', branchId)
        query = query.eq('branch_id', branchId)
      } else {
        console.log('No branch filter applied - showing all customers')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Debug: Log the raw data to see what's being returned
      console.log('=== DEBUG: Raw customer data ===')
      console.log('Total customers:', data?.length)
      if (data && data.length > 0) {
        console.log('First customer:', {
          id: data[0].id,
          name: `${data[0].first_name} ${data[0].last_name}`,
          email: data[0].email,
          branch_id: data[0].branch_id
        })
      }

      // Transform data to match our types
      const customers = data?.map(customer => {
        const customerObj: Customer = {
          id: customer.id,
          customerNumber: customer.customer_number || `CUST-${customer.id.slice(0, 8).toUpperCase()}`,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          dateOfBirth: customer.date_of_birth,
          gender: customer.gender,
          address: {
            street: customer.address_street || customer.address || '',
            city: customer.address_city || customer.city || '',
            state: customer.address_state || '',
            zipCode: customer.address_zip_code || customer.postal_code || '',
            country: customer.address_country || customer.country || 'South Africa'
          },
          status: customer.status || (customer.is_active ? 'active' : 'inactive'),
          customerType: customer.customer_type,
          notes: customer.notes,
          tags: customer.tags || [],
          branchId: customer.branch_id,
          branchName: undefined, // We'll add this later
          totalPurchases: customer.total_purchases || 0,
          totalSpent: customer.total_spent || 0,
          lastPurchaseDate: customer.last_purchase_date,
          creditAccount: undefined, // We'll add this later
          loyaltyAccount: undefined, // We'll add this later
          createdAt: customer.created_at,
          updatedAt: customer.updated_at
        }

        return customerObj
      })

      return { data: customers || [], error: null }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customers' }
    }
  }

  // ========================================
  // CUSTOMER STATISTICS
  // ========================================

  static async getCustomerStats(): Promise<{ data: CustomerStats | null; error: string | null }> {
    try {
      // Get basic stats
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')

      if (customersError) throw customersError

      const totalCustomers = customers?.length || 0
      const activeCustomers = customers?.filter(c => c.status === 'active' || c.is_active).length || 0

      // Get credit accounts count
      const { data: creditAccounts, error: creditError } = await supabase
        .from('credit_accounts')
        .select('id')

      if (creditError) {
        console.error('Error fetching credit accounts:', creditError)
      }

      // Get loyalty accounts count
      const { data: loyaltyAccounts, error: loyaltyError } = await supabase
        .from('loyalty_accounts')
        .select('id')

      if (loyaltyError) {
        console.error('Error fetching loyalty accounts:', loyaltyError)
      }

      const stats: CustomerStats = {
        totalCustomers,
        activeCustomers,
        creditAccounts: creditAccounts?.length || 0,
        loyaltyAccounts: loyaltyAccounts?.length || 0,
        totalCreditOutstanding: 0,
        averageCreditBalance: 0,
        customersWithOverdue: 0,
        newCustomersThisMonth: 0,
        topSpenders: [],
        recentActivity: []
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customer stats' }
    }
  }

  // ========================================
  // DELETE CUSTOMER
  // ========================================

  static async deleteCustomer(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete customer' }
    }
  }
} 