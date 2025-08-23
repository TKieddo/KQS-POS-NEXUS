import { supabase } from '@/lib/supabase'
import { 
  Customer, 
  LoyaltyAccount, 
  CreditAccount, 
  LoyaltyTransaction, 
  CreditTransaction,
  CustomerStats,
  CustomerFilter,
  CustomerApiResponse,
  CustomersApiResponse,
  CustomerStatsApiResponse
} from '@/types/loyalty'

export class CustomerService {
  // Customer operations
  static async getCustomers(filter?: CustomerFilter): Promise<CustomersApiResponse> {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          loyalty_accounts (*),
          credit_accounts (*)
        `)

      if (filter?.search) {
        query = query.or(`first_name.ilike.%${filter.search}%,last_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,customer_number.ilike.%${filter.search}%`)
      }

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }

      if (filter?.customerType && filter.customerType !== 'all') {
        query = query.eq('customer_type', filter.customerType)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const customers: Customer[] = data?.map(customer => ({
        id: customer.id,
        customerNumber: customer.customer_number,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address_street || '',
          city: customer.address_city || '',
          state: customer.address_state || '',
          zipCode: customer.address_zip_code || '',
          country: customer.address_country || 'USA'
        },
        status: customer.status,
        customerType: customer.customer_type,
        loyaltyAccount: customer.loyalty_accounts?.[0] ? {
          id: customer.loyalty_accounts[0].id,
          customerId: customer.loyalty_accounts[0].customer_id,
          cardNumber: customer.loyalty_accounts[0].card_number,
          isActive: customer.loyalty_accounts[0].is_active,
          currentPoints: customer.loyalty_accounts[0].current_points,
          lifetimePoints: customer.loyalty_accounts[0].lifetime_points,
          tier: customer.loyalty_accounts[0].tier,
          tierPoints: customer.loyalty_accounts[0].tier_points,
          nextTierPoints: customer.loyalty_accounts[0].next_tier_points,
          pointsToNextTier: customer.loyalty_accounts[0].points_to_next_tier,
          lastEarnedDate: customer.loyalty_accounts[0].last_earned_date,
          lastRedeemedDate: customer.loyalty_accounts[0].last_redeemed_date,
          transactions: [],
          createdAt: customer.loyalty_accounts[0].created_at,
          updatedAt: customer.loyalty_accounts[0].updated_at
        } : undefined,
        creditAccount: customer.credit_accounts?.[0] ? {
          id: customer.credit_accounts[0].id,
          customerId: customer.credit_accounts[0].customer_id,
          accountNumber: customer.credit_accounts[0].account_number,
          isActive: customer.credit_accounts[0].is_active,
          creditLimit: customer.credit_accounts[0].credit_limit,
          currentBalance: customer.credit_accounts[0].current_balance,
          availableCredit: customer.credit_accounts[0].available_credit,
          paymentTerms: customer.credit_accounts[0].payment_terms,
          lastPaymentDate: customer.credit_accounts[0].last_payment_date,
          lastPaymentAmount: customer.credit_accounts[0].last_payment_amount,
          overdueAmount: customer.credit_accounts[0].overdue_amount,
          creditScore: customer.credit_accounts[0].credit_score,
          creditHistory: [],
          createdAt: customer.credit_accounts[0].created_at,
          updatedAt: customer.credit_accounts[0].updated_at
        } : undefined,
        notes: customer.notes || '',
        tags: customer.tags || [],
        branchId: customer.branch_id,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        lastPurchaseDate: customer.last_purchase_date,
        totalPurchases: customer.total_purchases,
        totalSpent: customer.total_spent
      })) || []

      return { data: customers, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customers' }
    }
  }

  static async getCustomer(id: string): Promise<CustomerApiResponse> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          loyalty_accounts (*),
          credit_accounts (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Transform the data to match our interface
      const customer: Customer = {
        id: data.id,
        customerNumber: data.customer_number,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street || '',
          city: data.address_city || '',
          state: data.address_state || '',
          zipCode: data.address_zip_code || '',
          country: data.address_country || 'USA'
        },
        status: data.status,
        customerType: data.customer_type,
        loyaltyAccount: data.loyalty_accounts?.[0] ? {
          id: data.loyalty_accounts[0].id,
          customerId: data.loyalty_accounts[0].customer_id,
          cardNumber: data.loyalty_accounts[0].card_number,
          isActive: data.loyalty_accounts[0].is_active,
          currentPoints: data.loyalty_accounts[0].current_points,
          lifetimePoints: data.loyalty_accounts[0].lifetime_points,
          tier: data.loyalty_accounts[0].tier,
          tierPoints: data.loyalty_accounts[0].tier_points,
          nextTierPoints: data.loyalty_accounts[0].next_tier_points,
          pointsToNextTier: data.loyalty_accounts[0].points_to_next_tier,
          lastEarnedDate: data.loyalty_accounts[0].last_earned_date,
          lastRedeemedDate: data.loyalty_accounts[0].last_redeemed_date,
          transactions: [],
          createdAt: data.loyalty_accounts[0].created_at,
          updatedAt: data.loyalty_accounts[0].updated_at
        } : undefined,
        creditAccount: data.credit_accounts?.[0] ? {
          id: data.credit_accounts[0].id,
          customerId: data.credit_accounts[0].customer_id,
          accountNumber: data.credit_accounts[0].account_number,
          isActive: data.credit_accounts[0].is_active,
          creditLimit: data.credit_accounts[0].credit_limit,
          currentBalance: data.credit_accounts[0].current_balance,
          availableCredit: data.credit_accounts[0].available_credit,
          paymentTerms: data.credit_accounts[0].payment_terms,
          lastPaymentDate: data.credit_accounts[0].last_payment_date,
          lastPaymentAmount: data.credit_accounts[0].last_payment_amount,
          overdueAmount: data.credit_accounts[0].overdue_amount,
          creditScore: data.credit_accounts[0].credit_score,
          creditHistory: [],
          createdAt: data.credit_accounts[0].created_at,
          updatedAt: data.credit_accounts[0].updated_at
        } : undefined,
        notes: data.notes || '',
        tags: data.tags || [],
        branchId: data.branch_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastPurchaseDate: data.last_purchase_date,
        totalPurchases: data.total_purchases,
        totalSpent: data.total_spent
      }

      return { data: customer, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customer' }
    }
  }

  static async createCustomer(customerData: Partial<Customer>): Promise<CustomerApiResponse> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_number: customerData.customerNumber,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address_street: customerData.address?.street,
          address_city: customerData.address?.city,
          address_state: customerData.address?.state,
          address_zip_code: customerData.address?.zipCode,
          address_country: customerData.address?.country,
          status: customerData.status,
          customer_type: customerData.customerType,
          notes: customerData.notes,
          tags: customerData.tags,
          branch_id: customerData.branchId,
          total_purchases: customerData.totalPurchases || 0,
          total_spent: customerData.totalSpent || 0
        })
        .select()
        .single()

      if (error) throw error

      return { data: data as any, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create customer' }
    }
  }

  static async updateCustomer(id: string, customerData: Partial<Customer>): Promise<CustomerApiResponse> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address_street: customerData.address?.street,
          address_city: customerData.address?.city,
          address_state: customerData.address?.state,
          address_zip_code: customerData.address?.zipCode,
          address_country: customerData.address?.country,
          status: customerData.status,
          customer_type: customerData.customerType,
          notes: customerData.notes,
          tags: customerData.tags,
          branch_id: customerData.branchId,
          total_purchases: customerData.totalPurchases,
          total_spent: customerData.totalSpent
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: data as any, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update customer' }
    }
  }

  static async deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete customer' }
    }
  }

  // Stats operations
  static async getStats(): Promise<CustomerStatsApiResponse> {
    try {
      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      // Get active customers
      const { count: activeCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get loyalty accounts count
      const { count: loyaltyAccounts } = await supabase
        .from('loyalty_accounts')
        .select('*', { count: 'exact', head: true })

      // Get credit accounts count
      const { count: creditAccounts } = await supabase
        .from('credit_accounts')
        .select('*', { count: 'exact', head: true })

      // Get total points issued
      const { data: loyaltyTransactions } = await supabase
        .from('loyalty_transactions')
        .select('points')
        .eq('type', 'earned')

      const totalPointsIssued = loyaltyTransactions?.reduce((sum, transaction) => sum + transaction.points, 0) || 0

      // Get total points redeemed
      const { data: redeemedTransactions } = await supabase
        .from('loyalty_transactions')
        .select('points')
        .eq('type', 'redeemed')

      const totalPointsRedeemed = redeemedTransactions?.reduce((sum, transaction) => sum + transaction.points, 0) || 0

      // Get average points per customer
      const averagePointsPerCustomer = loyaltyAccounts > 0 ? totalPointsIssued / loyaltyAccounts : 0

      // Get customers with overdue credit
      const { count: customersWithOverdue } = await supabase
        .from('credit_accounts')
        .select('*', { count: 'exact', head: true })
        .gt('overdue_amount', 0)

      // Get new customers this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: newCustomersThisMonth } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      // Get top spenders
      const { data: topSpenders } = await supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false })
        .limit(5)

      const stats: CustomerStats = {
        totalCustomers: totalCustomers || 0,
        activeCustomers: activeCustomers || 0,
        loyaltyAccounts: loyaltyAccounts || 0,
        creditAccounts: creditAccounts || 0,
        totalPointsIssued,
        totalPointsRedeemed,
        averagePointsPerCustomer,
        customersWithOverdue: customersWithOverdue || 0,
        newCustomersThisMonth: newCustomersThisMonth || 0,
        topSpenders: topSpenders?.map(customer => ({
          id: customer.id,
          customerNumber: customer.customer_number,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: {
            street: customer.address_street || '',
            city: customer.address_city || '',
            state: customer.address_state || '',
            zipCode: customer.address_zip_code || '',
            country: customer.address_country || 'USA'
          },
          status: customer.status,
          customerType: customer.customer_type,
          notes: customer.notes || '',
          tags: customer.tags || [],
          totalPurchases: customer.total_purchases,
          totalSpent: customer.total_spent,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at
        })) || [],
        recentActivity: []
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch stats' }
    }
  }

  // Loyalty account operations
  static async createLoyaltyAccount(customerId: string, accountData: Partial<LoyaltyAccount>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('loyalty_accounts')
        .insert({
          customer_id: customerId,
          card_number: accountData.cardNumber,
          tier: accountData.tier,
          current_points: accountData.currentPoints || 0,
          lifetime_points: accountData.lifetimePoints || 0,
          is_active: accountData.isActive ?? true
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create loyalty account' }
    }
  }

  // Credit account operations
  static async createCreditAccount(customerId: string, accountData: Partial<CreditAccount>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('credit_accounts')
        .insert({
          customer_id: customerId,
          account_number: accountData.accountNumber,
          credit_limit: accountData.creditLimit || 0,
          current_balance: accountData.currentBalance || 0,
          payment_terms: accountData.paymentTerms || 30,
          credit_score: accountData.creditScore || 'fair',
          is_active: accountData.isActive ?? true
        })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create credit account' }
    }
  }
} 