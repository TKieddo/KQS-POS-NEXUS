import { supabase } from '@/lib/supabase'
import type { 
  Customer, 
  CreditAccount, 
  LoyaltyAccount, 
  CreditTransaction, 
  LoyaltyTransaction,
  CustomerFilter,
  CustomerStats
} from '../types'

export class CustomersService {
  // ========================================
  // CUSTOMER CRUD OPERATIONS
  // ========================================

  static async getCustomers(filter?: CustomerFilter, branchId?: string): Promise<{ data: Customer[] | null; error: string | null }> {
    try {
      // First, get all customers with basic info
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
      if (branchId && branchId !== 'all' && branchId !== 'undefined') {
        query = query.eq('branch_id', branchId)
      }

      const { data: customers, error: customersError } = await query.order('created_at', { ascending: false })

      if (customersError) throw customersError

      if (!customers || customers.length === 0) {
        return { data: [], error: null }
      }

      // Get customer IDs
      const customerIds = customers.map(c => c.id)

      // Fetch credit accounts for these customers
      const { data: creditAccounts, error: creditError } = await supabase
        .from('credit_accounts')
        .select('*')
        .in('customer_id', customerIds)

      if (creditError) {
        console.error('Error fetching credit accounts:', creditError)
      }

      // Fetch loyalty accounts for these customers
      const { data: loyaltyAccounts, error: loyaltyError } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .in('customer_id', customerIds)

      if (loyaltyError) {
        console.error('Error fetching loyalty accounts:', loyaltyError)
      }

      // Fetch branch information
      const branchIds = customers.map(c => c.branch_id).filter(id => id)
      let branches: any[] = []
      if (branchIds.length > 0) {
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('id, name')
          .in('id', branchIds)

        if (!branchError) {
          branches = branchData || []
        }
      }

      // Create a map for quick lookup
      const creditAccountsMap = new Map()
      const loyaltyAccountsMap = new Map()
      const branchesMap = new Map()

      creditAccounts?.forEach(account => {
        creditAccountsMap.set(account.customer_id, account)
      })

      loyaltyAccounts?.forEach(account => {
        loyaltyAccountsMap.set(account.customer_id, account)
      })

      branches.forEach(branch => {
        branchesMap.set(branch.id, branch)
      })

      // Transform data to match our types
      const transformedCustomers = customers.map(customer => {
        // Get credit account for this customer
        const creditAccountData = creditAccountsMap.get(customer.id)
        let creditAccount = undefined
        if (creditAccountData) {
          creditAccount = {
            id: creditAccountData.id,
            customerId: creditAccountData.customer_id,
            isActive: creditAccountData.is_active,
            creditLimit: creditAccountData.credit_limit,
            currentBalance: creditAccountData.current_balance,
            availableCredit: creditAccountData.available_credit,
            paymentTerms: creditAccountData.payment_terms,
            lastPaymentDate: creditAccountData.last_payment_date || undefined,
            lastPaymentAmount: creditAccountData.last_payment_amount || undefined,
            overdueAmount: creditAccountData.overdue_amount,
            creditScore: creditAccountData.credit_score,
            creditHistory: []
          }
        }

        // Get loyalty account for this customer
        const loyaltyAccountData = loyaltyAccountsMap.get(customer.id)
        let loyaltyAccount = undefined
        if (loyaltyAccountData) {
          loyaltyAccount = {
            id: loyaltyAccountData.id,
            customerId: loyaltyAccountData.customer_id,
            cardNumber: loyaltyAccountData.card_number,
            isActive: true, // Loyalty accounts are always active if they exist
            currentPoints: loyaltyAccountData.current_points,
            lifetimePoints: loyaltyAccountData.lifetime_points,
            tier: loyaltyAccountData.tier,
            tierPoints: loyaltyAccountData.tier_points,
            nextTierPoints: loyaltyAccountData.next_tier_points,
            pointsToNextTier: loyaltyAccountData.points_to_next_tier,
            lastEarnedDate: loyaltyAccountData.last_earned_date || undefined,
            lastRedeemedDate: loyaltyAccountData.last_redeemed_date || undefined,
            transactions: []
          }
        }

        // Get branch name
        const branchData = branchesMap.get(customer.branch_id)
        const branchName = branchData?.name

        const transformedCustomer: Customer = {
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
          branchName,
          totalPurchases: customer.total_purchases || 0,
          totalSpent: customer.total_spent || 0,
        lastPurchaseDate: customer.last_purchase_date,
          creditAccount,
          loyaltyAccount,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
        }

        return transformedCustomer
      })

      console.log('=== DEBUG: Final transformed customers ===')
      console.log('Total customers:', transformedCustomers.length)
      if (transformedCustomers.length > 0) {
        console.log('First customer:', {
          id: transformedCustomers[0].id,
          name: `${transformedCustomers[0].firstName} ${transformedCustomers[0].lastName}`,
          hasCreditAccount: !!transformedCustomers[0].creditAccount,
          hasLoyaltyAccount: !!transformedCustomers[0].loyaltyAccount,
          branchName: transformedCustomers[0].branchName
        })
      }

      return { data: transformedCustomers, error: null }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch customers' }
    }
  }

  static async createCustomer(customerData: Omit<Customer, 'id' | 'customerNumber' | 'createdAt' | 'updatedAt'> & { creditAccount?: { isActive: boolean; creditLimit: number; paymentTerms: number }; loyaltyAccount?: { cardNumber?: string; tier: string; nextTierPoints?: number; pointsToNextTier?: number } }): Promise<{ data: Customer | null; error: string | null }> {
    try {
      console.log('Creating customer with data:', customerData)
      
      // Generate customer number
      const customerNumber = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      
      // Create the customer first
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          customer_number: customerNumber,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address_street: customerData.address.street,
          address_city: customerData.address.city,
          address_state: customerData.address.state,
          address_zip_code: customerData.address.zipCode,
          address_country: customerData.address.country,
          status: customerData.status,
          customer_type: customerData.customerType,
          notes: customerData.notes || null,
          tags: customerData.tags || [],
          branch_id: customerData.branchId,
          total_purchases: customerData.totalPurchases || 0,
          total_spent: customerData.totalSpent || 0
        })
        .select()
        .single()

      if (customerError) {
        console.error('Customer creation error:', customerError)
        throw customerError
      }

      // Create or update credit account if enabled
      if (customerData.creditAccount?.isActive) {
        console.log('Creating/updating credit account for customer:', customer.id)
        
        // Check if credit account already exists (created by trigger)
        const { data: existingCredit } = await supabase
          .from('credit_accounts')
          .select('id')
          .eq('customer_id', customer.id)
          .single()

        if (existingCredit) {
          // Update existing credit account
          const { data: creditData, error: creditError } = await supabase
            .from('credit_accounts')
            .update({
              is_active: true,
              credit_limit: customerData.creditAccount.creditLimit,
              available_credit: customerData.creditAccount.creditLimit,
              payment_terms: customerData.creditAccount.paymentTerms,
              credit_score: 'good'
            })
            .eq('customer_id', customer.id)
            .select()

          if (creditError) {
            console.error('Failed to update credit account:', creditError)
          } else {
            console.log('Credit account updated successfully:', creditData)
          }
        } else {
          // Generate account number for credit account
          const accountNumber = `CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
          
          // Create new credit account
          const { data: creditData, error: creditError } = await supabase
            .from('credit_accounts')
            .insert({
              customer_id: customer.id,
              account_number: accountNumber,
              is_active: true,
              credit_limit: customerData.creditAccount.creditLimit,
              available_credit: customerData.creditAccount.creditLimit,
              payment_terms: customerData.creditAccount.paymentTerms,
              credit_score: 'good'
            })
            .select()

          if (creditError) {
            console.error('Failed to create credit account:', creditError)
          } else {
            console.log('Credit account created successfully:', creditData)
          }
        }
      }

      // Create or update loyalty account
      console.log('Creating/updating loyalty account for customer:', customer.id)
      console.log('Loyalty account data:', customerData.loyaltyAccount)
      
      // Check if loyalty account already exists (created by trigger)
      const { data: existingLoyalty } = await supabase
        .from('loyalty_accounts')
        .select('id')
        .eq('customer_id', customer.id)
        .single()

      if (existingLoyalty) {
        // Update existing loyalty account
        const { data: loyaltyData, error: loyaltyError } = await supabase
          .from('loyalty_accounts')
          .update({
            card_number: customerData.loyaltyAccount?.cardNumber || `LOY-${customer.customer_number}`,
            tier: customerData.loyaltyAccount?.tier || 'bronze',
            next_tier_points: customerData.loyaltyAccount?.nextTierPoints || 1000,
            points_to_next_tier: customerData.loyaltyAccount?.pointsToNextTier || 1000
          })
          .eq('customer_id', customer.id)
          .select()

        if (loyaltyError) {
          console.error('Failed to update loyalty account:', loyaltyError)
        } else {
          console.log('Loyalty account updated successfully:', loyaltyData)
        }
      } else {
        // Create new loyalty account
        const loyaltyInsertData = {
            customer_id: customer.id,
            card_number: customerData.loyaltyAccount?.cardNumber || `LOY-${customer.customer_number}`,
            tier: customerData.loyaltyAccount?.tier || 'bronze',
            next_tier_points: customerData.loyaltyAccount?.nextTierPoints || 1000,
            points_to_next_tier: customerData.loyaltyAccount?.pointsToNextTier || 1000
        }
        
        console.log('Inserting loyalty account with data:', loyaltyInsertData)
        
        const { data: loyaltyData, error: loyaltyError } = await supabase
          .from('loyalty_accounts')
          .insert(loyaltyInsertData)
          .select()

        if (loyaltyError) {
          console.error('Failed to create loyalty account:', loyaltyError)
        } else {
          console.log('Loyalty account created successfully:', loyaltyData)
        }
      }

      // Return the created customer data directly
      // Transform the raw customer data to match our Customer interface
      const transformedCustomer: Customer = {
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
          country: customer.address_country || ''
        },
        status: customer.status,
        customerType: customer.customer_type,
        notes: customer.notes || '',
        tags: customer.tags || [],
        totalPurchases: customer.total_purchases || 0,
        totalSpent: customer.total_spent || 0,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        branchId: customer.branch_id,
        branchName: undefined, // Will be populated when fetched with joins
        creditAccount: undefined, // Will be populated when fetched with joins
        loyaltyAccount: undefined // Will be populated when fetched with joins
      }
      
      return { data: transformedCustomer, error: null }
    } catch (error) {
      console.error('Customer creation failed:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create customer' }
    }
  }

  static async updateCustomer(id: string, customerData: Partial<Customer> & { creditAccount?: { isActive: boolean; creditLimit: number; paymentTerms: number }; loyaltyAccount?: { cardNumber?: string; tier: string; nextTierPoints?: number; pointsToNextTier?: number } }): Promise<{ data: Customer | null; error: string | null }> {
    try {
      console.log('=== UPDATE CUSTOMER DEBUG ===')
      console.log('Customer ID:', id)
      console.log('Updating customer with data:', customerData)
      console.log('Credit account data:', customerData.creditAccount)
      console.log('Loyalty account data:', customerData.loyaltyAccount)
      
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

      console.log('Customer update data:', updateData)

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Customer update error:', error)
        throw error
      }
      
      console.log('Customer updated successfully')

      // Handle credit account updates
      if (customerData.creditAccount !== undefined) {
        if (customerData.creditAccount.isActive) {
          // Check if credit account exists
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
                available_credit: customerData.creditAccount.creditLimit,
                payment_terms: customerData.creditAccount.paymentTerms
              })
              .eq('customer_id', id)

            if (creditError) {
              console.error('Failed to update credit account:', creditError)
            }
          } else {
            // Create new credit account
            const { error: creditError } = await supabase
              .from('credit_accounts')
              .insert({
                customer_id: id,
                is_active: customerData.creditAccount.isActive,
                credit_limit: customerData.creditAccount.creditLimit,
                available_credit: customerData.creditAccount.creditLimit,
                payment_terms: customerData.creditAccount.paymentTerms,
                credit_score: 'good'
              })

            if (creditError) {
              console.error('Failed to create credit account:', creditError)
            }
          }
        } else {
          // Deactivate credit account
          const { error: creditError } = await supabase
            .from('credit_accounts')
            .update({ is_active: false })
            .eq('customer_id', id)

          if (creditError) {
            console.error('Failed to deactivate credit account:', creditError)
          }
        }
      }

      // Handle loyalty account updates
      if (customerData.loyaltyAccount !== undefined) {
        console.log('=== LOYALTY ACCOUNT UPDATE DEBUG ===')
        console.log('Customer ID:', id)
        console.log('Loyalty account data:', customerData.loyaltyAccount)
        console.log('Tier being set:', customerData.loyaltyAccount.tier)
        console.log('Card number being set:', customerData.loyaltyAccount.cardNumber)
        
        const { data: existingLoyalty, error: checkError } = await supabase
          .from('loyalty_accounts')
          .select('id, tier, card_number')
          .eq('customer_id', id)
          .single()

        if (checkError) {
          console.log('No existing loyalty account found (this is normal for new customers)')
        } else {
          console.log('Existing loyalty account found:', existingLoyalty)
        }

        if (existingLoyalty) {
          // Update existing loyalty account
          console.log('=== UPDATING EXISTING LOYALTY ACCOUNT ===')
          console.log('Current tier:', existingLoyalty.tier)
          console.log('New tier:', customerData.loyaltyAccount.tier)
          
          const updateData = {
              card_number: customerData.loyaltyAccount.cardNumber,
              tier: customerData.loyaltyAccount.tier,
              next_tier_points: customerData.loyaltyAccount.nextTierPoints,
              points_to_next_tier: customerData.loyaltyAccount.pointsToNextTier
          }
          
          console.log('Update data:', updateData)
          
          const { error: loyaltyError } = await supabase
            .from('loyalty_accounts')
            .update(updateData)
            .eq('customer_id', id)

          if (loyaltyError) {
            console.error('Failed to update loyalty account:', loyaltyError)
            console.error('Error details:', loyaltyError.message)
          } else {
            console.log('Successfully updated loyalty account')
          }
        } else {
          // Create new loyalty account
          console.log('=== CREATING NEW LOYALTY ACCOUNT ===')
          console.log('Tier to create:', customerData.loyaltyAccount.tier)
          
          const insertData = {
              customer_id: id,
              card_number: customerData.loyaltyAccount.cardNumber,
              tier: customerData.loyaltyAccount.tier,
              next_tier_points: customerData.loyaltyAccount.nextTierPoints,
              points_to_next_tier: customerData.loyaltyAccount.pointsToNextTier
          }
          
          console.log('Insert data:', insertData)
          
          const { error: loyaltyError } = await supabase
            .from('loyalty_accounts')
            .insert(insertData)

          if (loyaltyError) {
            console.error('Failed to create loyalty account:', loyaltyError)
            console.error('Error details:', loyaltyError.message)
          } else {
            console.log('Successfully created loyalty account')
          }
        }
      }

      console.log('Fetching updated customer data...')
      
      // Return the updated customer data directly instead of calling getCustomerById
      // to avoid the complex join issues that cause 400 errors
      const { data: updatedCustomerData, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Error fetching updated customer:', fetchError)
        return { data: null, error: `Failed to fetch updated customer: ${fetchError.message}` }
      }

      if (!updatedCustomerData) {
        console.error('Customer not found after update')
        return { data: null, error: 'Customer not found after update' }
      }
      
      console.log('Successfully fetched updated customer data')

      // Transform the updated customer data to match our Customer interface
      const transformedCustomer: Customer = {
        id: updatedCustomerData.id,
        customerNumber: updatedCustomerData.customer_number,
        firstName: updatedCustomerData.first_name,
        lastName: updatedCustomerData.last_name,
        email: updatedCustomerData.email,
        phone: updatedCustomerData.phone,
        address: {
          street: updatedCustomerData.address_street || '',
          city: updatedCustomerData.address_city || '',
          state: updatedCustomerData.address_state || '',
          zipCode: updatedCustomerData.address_zip_code || '',
          country: updatedCustomerData.address_country || ''
        },
        status: updatedCustomerData.status,
        customerType: updatedCustomerData.customer_type,
        notes: updatedCustomerData.notes || '',
        tags: updatedCustomerData.tags || [],
        totalPurchases: updatedCustomerData.total_purchases || 0,
        totalSpent: updatedCustomerData.total_spent || 0,
        createdAt: updatedCustomerData.created_at,
        updatedAt: updatedCustomerData.updated_at,
        branchId: updatedCustomerData.branch_id,
        branchName: undefined, // Will be populated when fetched with joins
        creditAccount: undefined, // Will be populated when fetched with joins
        loyaltyAccount: undefined // Will be populated when fetched with joins
      }

      console.log('=== UPDATE CUSTOMER SUCCESS ===')
      return { data: transformedCustomer, error: null }
    } catch (error) {
      console.error('=== UPDATE CUSTOMER ERROR ===')
      console.error('Error type:', typeof error)
      console.error('Error message:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
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
          credit_accounts (
            id,
            customer_id,
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
          loyalty_accounts (
            id,
            customer_id,
            card_number,
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
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        return { data: null, error: 'Customer not found' }
      }

      // Handle credit account - only use real data from credit_accounts table
      let creditAccount = undefined
      if (data.credit_accounts?.[0]) {
        creditAccount = {
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
        }
      }

      // Handle loyalty account - only use real data from loyalty_accounts table
      let loyaltyAccount = undefined
      if (data.loyalty_accounts?.[0]) {
        loyaltyAccount = {
          id: data.loyalty_accounts[0].id,
          customerId: data.loyalty_accounts[0].customer_id,
          cardNumber: data.loyalty_accounts[0].card_number,
          isActive: true, // Loyalty accounts are always active if they exist
          currentPoints: data.loyalty_accounts[0].current_points,
          lifetimePoints: data.loyalty_accounts[0].lifetime_points,
          tier: data.loyalty_accounts[0].tier,
          tierPoints: data.loyalty_accounts[0].tier_points,
          nextTierPoints: data.loyalty_accounts[0].next_tier_points,
          pointsToNextTier: data.loyalty_accounts[0].points_to_next_tier,
          lastEarnedDate: data.loyalty_accounts[0].last_earned_date || undefined,
          lastRedeemedDate: data.loyalty_accounts[0].last_redeemed_date || undefined,
          transactions: []
        }
      }

      const customer: Customer = {
        id: data.id,
        customerNumber: data.customer_number || `CUST-${data.id.slice(0, 8).toUpperCase()}`,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        address: {
          street: data.address_street || data.address || '',
          city: data.address_city || data.city || '',
          state: data.address_state || '',
          zipCode: data.address_zip_code || data.postal_code || '',
          country: data.address_country || data.country || 'South Africa'
        },
        status: data.status || (data.is_active ? 'active' : 'inactive'),
        customerType: data.customer_type,
        notes: data.notes,
        tags: data.tags || [],
        branchId: data.branch_id,
        branchName: data.branches?.name,
        totalPurchases: data.total_purchases || 0,
        totalSpent: data.total_spent || 0,
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

  static async getCustomerStats(branchId?: string): Promise<{ data: CustomerStats | null; error: string | null }> {
    try {
      // Get basic stats
      let customersQuery = supabase
        .from('customers')
        .select('*')

      // Filter by branch if provided
      if (branchId && branchId !== 'all' && branchId !== 'undefined') {
        customersQuery = customersQuery.eq('branch_id', branchId)
      }

      const { data: customers, error: customersError } = await customersQuery

      if (customersError) throw customersError

      // Get customer IDs for filtering credit and loyalty accounts
      const customerIds = customers?.map(c => c.id) || []

      // Get credit accounts from separate table (filtered by customer IDs)
      let creditAccounts: any[] = []
      if (customerIds.length > 0) {
        try {
          const { data: creditData, error: creditError } = await supabase
        .from('credit_accounts')
        .select('*')
            .in('customer_id', customerIds)
          
          if (!creditError) {
            creditAccounts = creditData || []
          }
        } catch (error) {
          console.log('Credit accounts table not found')
        }
      }

      // Get loyalty accounts from separate table (filtered by customer IDs)
      let loyaltyAccounts: any[] = []
      if (customerIds.length > 0) {
        try {
          const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_accounts')
        .select('*')
            .in('customer_id', customerIds)
          
          if (!loyaltyError) {
            loyaltyAccounts = loyaltyData || []
          }
        } catch (error) {
          console.log('Loyalty accounts table not found')
        }
      }

      const stats: CustomerStats = {
        totalCustomers: customers?.length || 0,
        activeCustomers: customers?.filter(c => c.status === 'active' || c.is_active).length || 0,
        creditAccounts: creditAccounts?.filter(c => c.is_active).length || 0,
        loyaltyAccounts: loyaltyAccounts?.length || 0,
        totalCreditOutstanding: creditAccounts?.reduce((sum, c) => sum + (c.current_balance || 0), 0) || 0,
        averageCreditBalance: creditAccounts?.length ? creditAccounts.reduce((sum, c) => sum + (c.current_balance || 0), 0) / creditAccounts.length : 0,
        customersWithOverdue: creditAccounts?.filter(c => (c.overdue_amount || 0) > 0).length || 0,
        newCustomersThisMonth: customers?.filter(c => {
          const createdAt = new Date(c.created_at)
          const now = new Date()
          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
        }).length || 0,
        topSpenders: customers?.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 5).map(c => ({
          id: c.id,
          customerNumber: c.customer_number || `CUST-${c.id.slice(0, 8).toUpperCase()}`,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          phone: c.phone,
          address: {
            street: c.address_street || c.address || '',
            city: c.address_city || c.city || '',
            state: c.address_state || '',
            zipCode: c.address_zip_code || c.postal_code || '',
            country: c.address_country || c.country || 'South Africa'
          },
          status: c.status || (c.is_active ? 'active' : 'inactive'),
          customerType: c.customer_type,
          notes: c.notes,
          tags: c.tags || [],
          branchId: c.branch_id,
          totalPurchases: c.total_purchases || 0,
          totalSpent: c.total_spent || 0,
          lastPurchaseDate: c.last_purchase_date,
          creditAccount: creditAccounts.find(ca => ca.customer_id === c.id) ? {
            id: creditAccounts.find(ca => ca.customer_id === c.id)?.id,
            customerId: c.id,
            isActive: creditAccounts.find(ca => ca.customer_id === c.id)?.is_active,
            creditLimit: creditAccounts.find(ca => ca.customer_id === c.id)?.credit_limit,
            currentBalance: creditAccounts.find(ca => ca.customer_id === c.id)?.current_balance,
            availableCredit: creditAccounts.find(ca => ca.customer_id === c.id)?.available_credit,
            paymentTerms: creditAccounts.find(ca => ca.customer_id === c.id)?.payment_terms,
            lastPaymentDate: creditAccounts.find(ca => ca.customer_id === c.id)?.last_payment_date || undefined,
            lastPaymentAmount: creditAccounts.find(ca => ca.customer_id === c.id)?.last_payment_amount || undefined,
            overdueAmount: creditAccounts.find(ca => ca.customer_id === c.id)?.overdue_amount,
            creditScore: creditAccounts.find(ca => ca.customer_id === c.id)?.credit_score,
            creditHistory: []
          } : undefined,
          loyaltyAccount: loyaltyAccounts.find(la => la.customer_id === c.id) ? {
            id: loyaltyAccounts.find(la => la.customer_id === c.id)?.id,
            customerId: c.id,
            cardNumber: loyaltyAccounts.find(la => la.customer_id === c.id)?.card_number,
            isActive: true, // Loyalty accounts are always active if they exist
            currentPoints: loyaltyAccounts.find(la => la.customer_id === c.id)?.current_points,
            lifetimePoints: loyaltyAccounts.find(la => la.customer_id === c.id)?.lifetime_points,
            tier: loyaltyAccounts.find(la => la.customer_id === c.id)?.tier,
            tierPoints: loyaltyAccounts.find(la => la.customer_id === c.id)?.tier_points,
            nextTierPoints: loyaltyAccounts.find(la => la.customer_id === c.id)?.next_tier_points,
            pointsToNextTier: loyaltyAccounts.find(la => la.customer_id === c.id)?.points_to_next_tier,
            lastEarnedDate: loyaltyAccounts.find(la => la.customer_id === c.id)?.last_earned_date || undefined,
            lastRedeemedDate: loyaltyAccounts.find(la => la.customer_id === c.id)?.last_redeemed_date || undefined,
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
  // CREDIT ACCOUNT OPERATIONS
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
        date: tx.created_at,
        balanceAfter: tx.balance_after,
        createdBy: tx.created_by
      })) || []

      return { data: transactions, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch credit transactions' }
    }
  }

  static async addCreditTransaction(transactionData: Omit<CreditTransaction, 'id' | 'date'>): Promise<{ data: CreditTransaction | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({
          customer_id: transactionData.customerId,
          credit_account_id: transactionData.creditAccountId,
          type: transactionData.type,
          amount: transactionData.amount,
          description: transactionData.description,
          reference: transactionData.reference,
          balance_after: transactionData.balanceAfter,
          created_by: transactionData.createdBy
        })
        .select()
        .single()

      if (error) throw error

      const transaction: CreditTransaction = {
        id: data.id,
        customerId: data.customer_id,
        creditAccountId: data.credit_account_id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        reference: data.reference,
        date: data.created_at,
        balanceAfter: data.balance_after,
        createdBy: data.created_by
      }

      return { data: transaction, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to add credit transaction' }
    }
  }

  static async updateCreditAccount(customerId: string, creditData: Partial<CreditAccount>): Promise<{ data: CreditAccount | null; error: string | null }> {
    try {
      const updateData: any = {}
      
      if (creditData.isActive !== undefined) updateData.is_active = creditData.isActive
      if (creditData.creditLimit !== undefined) updateData.credit_limit = creditData.creditLimit
      if (creditData.paymentTerms !== undefined) updateData.payment_terms = creditData.paymentTerms
      if (creditData.creditScore !== undefined) updateData.credit_score = creditData.creditScore

      const { error } = await supabase
        .from('credit_accounts')
        .update(updateData)
        .eq('customer_id', customerId)

      if (error) throw error

      // Fetch updated credit account
      const { data, error: fetchError } = await supabase
        .from('credit_accounts')
        .select('*')
        .eq('customer_id', customerId)
        .single()

      if (fetchError) throw fetchError

      const creditAccount: CreditAccount = {
        id: data.id,
        customerId: data.customer_id,
        isActive: data.is_active,
        creditLimit: data.credit_limit,
        currentBalance: data.current_balance,
        availableCredit: data.available_credit,
        paymentTerms: data.payment_terms,
        lastPaymentDate: data.last_payment_date,
        lastPaymentAmount: data.last_payment_amount,
        overdueAmount: data.overdue_amount,
        creditScore: data.credit_score,
        creditHistory: []
      }

      return { data: creditAccount, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update credit account' }
    }
  }

  // ========================================
  // LOYALTY ACCOUNT OPERATIONS
  // ========================================

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
        date: tx.created_at,
        balanceAfter: tx.balance_after
      })) || []

      return { data: transactions, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch loyalty transactions' }
    }
  }

  static async addLoyaltyTransaction(transactionData: Omit<LoyaltyTransaction, 'id' | 'date'>): Promise<{ data: LoyaltyTransaction | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: transactionData.customerId,
          loyalty_account_id: transactionData.loyaltyAccountId,
          type: transactionData.type,
          points: transactionData.points,
          description: transactionData.description,
          order_id: transactionData.orderId,
          balance_after: transactionData.balanceAfter
        })
        .select()
        .single()

      if (error) throw error

      const transaction: LoyaltyTransaction = {
        id: data.id,
        customerId: data.customer_id,
        loyaltyAccountId: data.loyalty_account_id,
        type: data.type,
        points: data.points,
        description: data.description,
        orderId: data.order_id,
        date: data.created_at,
        balanceAfter: data.balance_after
      }

      return { data: transaction, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to add loyalty transaction' }
    }
  }

  static async updateLoyaltyAccount(customerId: string, loyaltyData: Partial<LoyaltyAccount>): Promise<{ data: LoyaltyAccount | null; error: string | null }> {
    try {
      const updateData: any = {}
      
      if (loyaltyData.tier !== undefined) updateData.tier = loyaltyData.tier
      if (loyaltyData.tierPoints !== undefined) updateData.tier_points = loyaltyData.tierPoints
      if (loyaltyData.nextTierPoints !== undefined) updateData.next_tier_points = loyaltyData.nextTierPoints
      if (loyaltyData.pointsToNextTier !== undefined) updateData.points_to_next_tier = loyaltyData.pointsToNextTier

      const { error } = await supabase
        .from('loyalty_accounts')
        .update(updateData)
        .eq('customer_id', customerId)

      if (error) throw error

      // Fetch updated loyalty account
      const { data, error: fetchError } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('customer_id', customerId)
        .single()

      if (fetchError) throw fetchError

      const loyaltyAccount: LoyaltyAccount = {
        id: data.id,
        customerId: data.customer_id,
        cardNumber: data.card_number,
        isActive: data.is_active,
        currentPoints: data.current_points,
        lifetimePoints: data.lifetime_points,
        tier: data.tier,
        tierPoints: data.tier_points,
        nextTierPoints: data.next_tier_points,
        pointsToNextTier: data.points_to_next_tier,
        lastEarnedDate: data.last_earned_date,
        lastRedeemedDate: data.last_redeemed_date,
        transactions: []
      }

      return { data: loyaltyAccount, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update loyalty account' }
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async deleteCustomers(ids: string[]): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', ids)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete customers' }
    }
  }
} 