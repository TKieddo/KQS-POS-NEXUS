import { supabase } from '@/lib/supabase'
import type { 
  Customer, 
  CreditAccount, 
  LoyaltyAccount, 
  CreditTransaction, 
  LoyaltyTransaction,
  CustomerFilter,
  CustomerStats,
  CreateCustomerData,
  UpdateCustomerData
} from '../types/fresh-types'

export class FreshCustomersService {
  // ========================================
  // CUSTOMER CRUD OPERATIONS
  // ========================================

  static async getCustomers(filter?: CustomerFilter): Promise<{ data: Customer[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          credit_accounts!credit_accounts_customer_id_fkey (
            id,
            customer_id,
            account_number,
            is_active,
            credit_limit,
            current_balance,
            available_credit,
            payment_terms,
            last_payment_date,
            last_payment_amount,
            overdue_amount,
            credit_score
          ),
          loyalty_accounts!loyalty_accounts_customer_id_fkey (
            id,
            customer_id,
            card_number,
            is_active,
            current_points,
            lifetime_points,
            tier,
            tier_points,
            next_tier_points,
            points_to_next_tier,
            last_earned_date,
            last_redeemed_date
          ),
          branches (id, name)
        `)

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

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match our types
      const customers = data?.map(customer => {
        // Handle credit account
        let creditAccount = undefined
        if (customer.credit_accounts && customer.credit_accounts.length > 0) {
          creditAccount = {
            id: customer.credit_accounts[0].id,
            customerId: customer.credit_accounts[0].customer_id,
            isActive: customer.credit_accounts[0].is_active,
            creditLimit: customer.credit_accounts[0].credit_limit,
            currentBalance: customer.credit_accounts[0].current_balance,
            availableCredit: customer.credit_accounts[0].available_credit,
            paymentTerms: customer.credit_accounts[0].payment_terms,
            lastPaymentDate: customer.credit_accounts[0].last_payment_date || undefined,
            lastPaymentAmount: customer.credit_accounts[0].last_payment_amount || undefined,
            overdueAmount: customer.credit_accounts[0].overdue_amount,
            creditScore: customer.credit_accounts[0].credit_score,
            creditHistory: []
          }
        }

        // Handle loyalty account
        let loyaltyAccount = undefined
        if (customer.loyalty_accounts && customer.loyalty_accounts.length > 0) {
          loyaltyAccount = {
            id: customer.loyalty_accounts[0].id,
            customerId: customer.loyalty_accounts[0].customer_id,
            cardNumber: customer.loyalty_accounts[0].card_number,
            currentPoints: customer.loyalty_accounts[0].current_points,
            lifetimePoints: customer.loyalty_accounts[0].lifetime_points,
            tier: customer.loyalty_accounts[0].tier,
            tierPoints: customer.loyalty_accounts[0].tier_points,
            nextTierPoints: customer.loyalty_accounts[0].next_tier_points,
            pointsToNextTier: customer.loyalty_accounts[0].points_to_next_tier,
            lastEarnedDate: customer.loyalty_accounts[0].last_earned_date || undefined,
            lastRedeemedDate: customer.loyalty_accounts[0].last_redeemed_date || undefined,
            transactions: []
          }
        }

        const transformedCustomer: Customer = {
          id: customer.id,
          customerNumber: customer.customer_number,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          dateOfBirth: customer.date_of_birth,
          gender: customer.gender,
          address: {
            street: customer.address_street || '',
            city: customer.address_city || '',
            state: customer.address_state || '',
            zipCode: customer.address_zip_code || '',
            country: customer.address_country || 'South Africa'
          },
          status: customer.status,
          customerType: customer.customer_type,
          notes: customer.notes,
          tags: customer.tags || [],
          branchId: customer.branch_id,
          totalPurchases: customer.total_purchases,
          totalSpent: customer.total_spent,
          lastPurchaseDate: customer.last_purchase_date,
          creditAccount,
          loyaltyAccount,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at
        }

        return transformedCustomer
      }) || []

      return { data: customers, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customers' }
    }
  }

  static async createCustomer(customerData: CreateCustomerData): Promise<{ data: Customer | null; error: string | null }> {
    try {
      // Generate customer number
      const { data: lastCustomer } = await supabase
        .from('customers')
        .select('customer_number')
        .order('customer_number', { ascending: false })
        .limit(1)

      const lastNumber = lastCustomer?.[0]?.customer_number || 'CUST-000000'
      const nextNumber = parseInt(lastNumber.split('-')[1]) + 1
      const customerNumber = `CUST-${nextNumber.toString().padStart(6, '0')}`

      // Create the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          customer_number: customerNumber,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          date_of_birth: customerData.dateOfBirth,
          gender: customerData.gender,
          address_street: customerData.address.street,
          address_city: customerData.address.city,
          address_state: customerData.address.state,
          address_zip_code: customerData.address.zipCode,
          address_country: customerData.address.country,
          status: customerData.status,
          customer_type: customerData.customerType,
          notes: customerData.notes,
          tags: customerData.tags,
          branch_id: customerData.branchId
        })
        .select()
        .single()

      if (customerError) throw customerError

      // Create credit account if requested
      if (customerData.createCreditAccount) {
        // Generate account number
        const { data: lastCreditAccount } = await supabase
          .from('credit_accounts')
          .select('account_number')
          .order('account_number', { ascending: false })
          .limit(1)

        const lastCreditNumber = lastCreditAccount?.[0]?.account_number || 'CRED-000000'
        const nextCreditNumber = parseInt(lastCreditNumber.split('-')[1]) + 1
        const accountNumber = `CRED-${nextCreditNumber.toString().padStart(6, '0')}`

        const { error: creditError } = await supabase
          .from('credit_accounts')
          .insert({
            customer_id: customer.id,
            account_number: accountNumber,
            is_active: customerData.createCreditAccount.isActive,
            credit_limit: customerData.createCreditAccount.creditLimit,
            payment_terms: customerData.createCreditAccount.paymentTerms,
            credit_score: 'good'
          })

        if (creditError) {
          console.error('Failed to create credit account:', creditError)
        }
      }

      // Create loyalty account if requested
      if (customerData.createLoyaltyAccount) {
        // Generate card number
        const { data: lastLoyaltyAccount } = await supabase
          .from('loyalty_accounts')
          .select('card_number')
          .order('card_number', { ascending: false })
          .limit(1)

        const lastLoyaltyNumber = lastLoyaltyAccount?.[0]?.card_number || 'LOY-000000'
        const nextLoyaltyNumber = parseInt(lastLoyaltyNumber.split('-')[1]) + 1
        const cardNumber = customerData.createLoyaltyAccount.cardNumber || `LOY-${nextLoyaltyNumber.toString().padStart(6, '0')}`
        
        const { error: loyaltyError } = await supabase
          .from('loyalty_accounts')
          .insert({
            customer_id: customer.id,
            card_number: cardNumber,
            tier: customerData.createLoyaltyAccount.tier
          })

        if (loyaltyError) {
          console.error('Failed to create loyalty account:', loyaltyError)
        }
      }

      // Fetch the complete customer data with accounts
      return await this.getCustomerById(customer.id)
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create customer' }
    }
  }

  static async updateCustomer(id: string, customerData: UpdateCustomerData): Promise<{ data: Customer | null; error: string | null }> {
    try {
      const updateData: any = {}
      
      if (customerData.firstName) updateData.first_name = customerData.firstName
      if (customerData.lastName) updateData.last_name = customerData.lastName
      if (customerData.email) updateData.email = customerData.email
      if (customerData.phone) updateData.phone = customerData.phone
      if (customerData.dateOfBirth) updateData.date_of_birth = customerData.dateOfBirth
      if (customerData.gender) updateData.gender = customerData.gender
      if (customerData.address) {
        updateData.address_street = customerData.address.street
        updateData.address_city = customerData.address.city
        updateData.address_state = customerData.address.state
        updateData.address_zip_code = customerData.address.zipCode
        updateData.address_country = customerData.address.country
      }
      if (customerData.status) updateData.status = customerData.status
      if (customerData.customerType) updateData.customer_type = customerData.customerType
      if (customerData.notes !== undefined) updateData.notes = customerData.notes
      if (customerData.tags) updateData.tags = customerData.tags
      if (customerData.branchId) updateData.branch_id = customerData.branchId

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      // Handle credit account updates
      if (customerData.creditAccount) {
        const { data: existingCredit } = await supabase
          .from('credit_accounts')
          .select('id')
          .eq('customer_id', id)
          .single()

        if (existingCredit) {
          // Update existing credit account
          const { error: creditError } = await supabase
            .from('credit_accounts')
            .update({
              is_active: customerData.creditAccount.isActive,
              credit_limit: customerData.creditAccount.creditLimit,
              payment_terms: customerData.creditAccount.paymentTerms
            })
            .eq('customer_id', id)

          if (creditError) {
            console.error('Failed to update credit account:', creditError)
          }
        } else {
          // Create new credit account
          const { data: lastCreditAccount } = await supabase
            .from('credit_accounts')
            .select('account_number')
            .order('account_number', { ascending: false })
            .limit(1)

          const lastCreditNumber = lastCreditAccount?.[0]?.account_number || 'CRED-000000'
          const nextCreditNumber = parseInt(lastCreditNumber.split('-')[1]) + 1
          const accountNumber = `CRED-${nextCreditNumber.toString().padStart(6, '0')}`

          const { error: creditError } = await supabase
            .from('credit_accounts')
            .insert({
              customer_id: id,
              account_number: accountNumber,
              is_active: customerData.creditAccount.isActive,
              credit_limit: customerData.creditAccount.creditLimit,
              payment_terms: customerData.creditAccount.paymentTerms,
              credit_score: 'good'
            })

          if (creditError) {
            console.error('Failed to create credit account:', creditError)
          }
        }
      }

      // Handle loyalty account updates
      if (customerData.loyaltyAccount) {
        const { data: existingLoyalty } = await supabase
          .from('loyalty_accounts')
          .select('id')
          .eq('customer_id', id)
          .single()

        if (existingLoyalty) {
          // Update existing loyalty account
          const { error: loyaltyError } = await supabase
            .from('loyalty_accounts')
            .update({
              card_number: customerData.loyaltyAccount.cardNumber,
              tier: customerData.loyaltyAccount.tier
            })
            .eq('customer_id', id)

          if (loyaltyError) {
            console.error('Failed to update loyalty account:', loyaltyError)
          }
        } else {
          // Create new loyalty account
          const { data: lastLoyaltyAccount } = await supabase
            .from('loyalty_accounts')
            .select('card_number')
            .order('card_number', { ascending: false })
            .limit(1)

          const lastLoyaltyNumber = lastLoyaltyAccount?.[0]?.card_number || 'LOY-000000'
          const nextLoyaltyNumber = parseInt(lastLoyaltyNumber.split('-')[1]) + 1
          const cardNumber = customerData.loyaltyAccount.cardNumber || `LOY-${nextLoyaltyNumber.toString().padStart(6, '0')}`

          const { error: loyaltyError } = await supabase
            .from('loyalty_accounts')
            .insert({
              customer_id: id,
              card_number: cardNumber,
              tier: customerData.loyaltyAccount.tier
            })

          if (loyaltyError) {
            console.error('Failed to create loyalty account:', loyaltyError)
          }
        }
      }

      return await this.getCustomerById(id)
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update customer' }
    }
  }

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

  static async getCustomerById(id: string): Promise<{ data: Customer | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          credit_accounts!credit_accounts_customer_id_fkey (*),
          loyalty_accounts!loyalty_accounts_customer_id_fkey (*),
          branches (id, name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        return { data: null, error: 'Customer not found' }
      }

      // Transform the data
      const creditAccount = data.credit_accounts?.[0] ? {
        id: data.credit_accounts[0].id,
        customerId: data.credit_accounts[0].customer_id,
        isActive: data.credit_accounts[0].is_active,
        creditLimit: data.credit_accounts[0].credit_limit,
        currentBalance: data.credit_accounts[0].current_balance,
        availableCredit: data.credit_accounts[0].available_credit,
        paymentTerms: data.credit_accounts[0].payment_terms,
        lastPaymentDate: data.credit_accounts[0].last_payment_date || undefined,
        lastPaymentAmount: data.credit_accounts[0].last_payment_amount || undefined,
        overdueAmount: data.credit_accounts[0].overdue_amount,
        creditScore: data.credit_accounts[0].credit_score,
        creditHistory: []
      } : undefined

      const loyaltyAccount = data.loyalty_accounts?.[0] ? {
        id: data.loyalty_accounts[0].id,
        customerId: data.loyalty_accounts[0].customer_id,
        cardNumber: data.loyalty_accounts[0].card_number,
        currentPoints: data.loyalty_accounts[0].current_points,
        lifetimePoints: data.loyalty_accounts[0].lifetime_points,
        tier: data.loyalty_accounts[0].tier,
        tierPoints: data.loyalty_accounts[0].tier_points,
        nextTierPoints: data.loyalty_accounts[0].next_tier_points,
        pointsToNextTier: data.loyalty_accounts[0].points_to_next_tier,
        lastEarnedDate: data.loyalty_accounts[0].last_earned_date || undefined,
        lastRedeemedDate: data.loyalty_accounts[0].last_redeemed_date || undefined,
        transactions: []
      } : undefined

      const customer: Customer = {
        id: data.id,
        customerNumber: data.customer_number,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        address: {
          street: data.address_street || '',
          city: data.address_city || '',
          state: data.address_state || '',
          zipCode: data.address_zip_code || '',
          country: data.address_country || 'South Africa'
        },
        status: data.status,
        customerType: data.customer_type,
        notes: data.notes,
        tags: data.tags || [],
        branchId: data.branch_id,
        totalPurchases: data.total_purchases,
        totalSpent: data.total_spent,
        lastPurchaseDate: data.last_purchase_date,
        creditAccount,
        loyaltyAccount,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return { data: customer, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customer' }
    }
  }

  // ========================================
  // CUSTOMER STATISTICS
  // ========================================

  static async getCustomerStats(): Promise<{ data: CustomerStats | null; error: string | null }> {
    try {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')

      if (customersError) throw customersError

      const { data: creditAccounts, error: creditError } = await supabase
        .from('credit_accounts')
        .select('*')

      if (creditError) throw creditError

      const { data: loyaltyAccounts, error: loyaltyError } = await supabase
        .from('loyalty_accounts')
        .select('*')

      if (loyaltyError) throw loyaltyError

      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()

      const stats: CustomerStats = {
        totalCustomers: customers?.length || 0,
        activeCustomers: customers?.filter(c => c.status === 'active').length || 0,
        creditAccounts: creditAccounts?.filter(c => c.is_active).length || 0,
        loyaltyAccounts: loyaltyAccounts?.filter(c => c.is_active).length || 0,
        totalCreditOutstanding: creditAccounts?.reduce((sum, c) => sum + (c.current_balance || 0), 0) || 0,
        averageCreditBalance: creditAccounts?.length ? creditAccounts.reduce((sum, c) => sum + (c.current_balance || 0), 0) / creditAccounts.length : 0,
        customersWithOverdue: creditAccounts?.filter(c => (c.overdue_amount || 0) > 0).length || 0,
        newCustomersThisMonth: customers?.filter(c => {
          const createdAt = new Date(c.created_at)
          return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear
        }).length || 0,
        topSpenders: customers?.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 5).map(c => ({
          id: c.id,
          customerNumber: c.customer_number,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          phone: c.phone,
          address: {
            street: c.address_street || '',
            city: c.address_city || '',
            state: c.address_state || '',
            zipCode: c.address_zip_code || '',
            country: c.address_country || 'South Africa'
          },
          status: c.status,
          customerType: c.customer_type,
          notes: c.notes,
          tags: c.tags || [],
          branchId: c.branch_id,
          totalPurchases: c.total_purchases,
          totalSpent: c.total_spent,
          lastPurchaseDate: c.last_purchase_date,
          creditAccount: creditAccounts?.find(ca => ca.customer_id === c.id) ? {
            id: creditAccounts.find(ca => ca.customer_id === c.id)!.id,
            customerId: c.id,
            isActive: creditAccounts.find(ca => ca.customer_id === c.id)!.is_active,
            creditLimit: creditAccounts.find(ca => ca.customer_id === c.id)!.credit_limit,
            currentBalance: creditAccounts.find(ca => ca.customer_id === c.id)!.current_balance,
            availableCredit: creditAccounts.find(ca => ca.customer_id === c.id)!.available_credit,
            paymentTerms: creditAccounts.find(ca => ca.customer_id === c.id)!.payment_terms,
            lastPaymentDate: creditAccounts.find(ca => ca.customer_id === c.id)!.last_payment_date || undefined,
            lastPaymentAmount: creditAccounts.find(ca => ca.customer_id === c.id)!.last_payment_amount || undefined,
            overdueAmount: creditAccounts.find(ca => ca.customer_id === c.id)!.overdue_amount,
            creditScore: creditAccounts.find(ca => ca.customer_id === c.id)!.credit_score,
            creditHistory: []
          } : undefined,
          loyaltyAccount: loyaltyAccounts?.find(la => la.customer_id === c.id) ? {
            id: loyaltyAccounts.find(la => la.customer_id === c.id)!.id,
            customerId: c.id,
            cardNumber: loyaltyAccounts.find(la => la.customer_id === c.id)!.card_number,
            currentPoints: loyaltyAccounts.find(la => la.customer_id === c.id)!.current_points,
            lifetimePoints: loyaltyAccounts.find(la => la.customer_id === c.id)!.lifetime_points,
            tier: loyaltyAccounts.find(la => la.customer_id === c.id)!.tier,
            tierPoints: loyaltyAccounts.find(la => la.customer_id === c.id)!.tier_points,
            nextTierPoints: loyaltyAccounts.find(la => la.customer_id === c.id)!.next_tier_points,
            pointsToNextTier: loyaltyAccounts.find(la => la.customer_id === c.id)!.points_to_next_tier,
            lastEarnedDate: loyaltyAccounts.find(la => la.customer_id === c.id)!.last_earned_date || undefined,
            lastRedeemedDate: loyaltyAccounts.find(la => la.customer_id === c.id)!.last_redeemed_date || undefined,
            transactions: []
          } : undefined,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        })) || [],
        recentActivity: []
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customer stats' }
    }
  }

  // ========================================
  // TRANSACTION OPERATIONS
  // ========================================

  static async getCreditTransactions(customerId: string): Promise<{ data: CreditTransaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transactions = data?.map(tx => ({
        id: tx.id,
        customerId: tx.customer_id,
        creditAccountId: tx.credit_account_id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        reference: tx.reference,
        balanceAfter: tx.balance_after,
        createdBy: tx.created_by,
        date: tx.created_at
      })) || []

      return { data: transactions, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch credit transactions' }
    }
  }

  static async getLoyaltyTransactions(customerId: string): Promise<{ data: LoyaltyTransaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transactions = data?.map(tx => ({
        id: tx.id,
        customerId: tx.customer_id,
        loyaltyAccountId: tx.loyalty_account_id,
        type: tx.type,
        points: tx.points,
        description: tx.description,
        orderId: tx.order_id,
        balanceAfter: tx.balance_after,
        date: tx.created_at
      })) || []

      return { data: transactions, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch loyalty transactions' }
    }
  }
} 