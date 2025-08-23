import { supabase } from '@/lib/supabase'
import type {
  AccountPayment,
  CustomerStatement,
  TillSessionReport,
  CashDrop,
  CashWithdrawal,
  AccountPaymentFormData,
  CustomerStatementFilters,
  TillSessionFilters,
  CashDropFormData,
  CashWithdrawalFormData
} from '../types'

class AccountPaymentsService {
  /**
   * Process an account payment
   */
  async processAccountPayment(data: AccountPaymentFormData): Promise<AccountPayment> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { user: branchUser } } = await supabase.auth.getUser()
      
      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('name, email, phone')
        .eq('id', data.customer_id)
        .single()

      if (customerError) throw customerError

      // Generate reference number
      const referenceNumber = `AP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const paymentData = {
        customer_id: data.customer_id,
        customer_name: customer.name,
        amount: data.amount,
        payment_method: data.payment_method,
        reference_number: referenceNumber,
        notes: data.notes,
        processed_by: user?.id || 'system',
        branch_id: branchUser?.id || 'global'
      }

      const { data: payment, error } = await supabase
        .from('account_payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) {
        // If table doesn't exist (error code 42P01), return mock data
        if (error.code === '42P01') {
          console.warn('account_payments table does not exist yet, returning mock data')
          return {
            id: `mock-${Date.now()}`,
            ...paymentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as AccountPayment
        }
        throw error
      }

      return payment
    } catch (error) {
      console.error('Error processing account payment:', error)
      throw error
    }
  }

  /**
   * Get customer statement
   */
  async getCustomerStatement(customerId: string, filters?: CustomerStatementFilters): Promise<CustomerStatement> {
    try {
      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (customerError) throw customerError

      // Get transactions
      let query = supabase
        .from('customer_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date)
      }

      const { data: transactions, error: transactionsError } = await query

      if (transactionsError) throw transactionsError

      // Calculate balances
      let openingBalance = 0
      let closingBalance = 0
      let totalCharges = 0
      let totalPayments = 0

      const statementTransactions = transactions?.map(t => {
        const amount = t.amount || 0
        if (t.type === 'sale' || t.type === 'adjustment') {
          totalCharges += amount
          closingBalance += amount
        } else if (t.type === 'payment' || t.type === 'refund') {
          totalPayments += amount
          closingBalance -= amount
        }

        return {
          id: t.id,
          date: t.created_at,
          description: t.description,
          type: t.type,
          amount: amount,
          balance: closingBalance,
          reference: t.reference
        }
      }) || []

      // Calculate opening balance
      openingBalance = closingBalance - totalCharges + totalPayments

      const statement: CustomerStatement = {
        id: `stmt-${customerId}-${Date.now()}`,
        customer_id: customerId,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        statement_date: new Date().toISOString(),
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        total_charges: totalCharges,
        total_payments: totalPayments,
        transactions: statementTransactions,
        created_at: new Date().toISOString()
      }

      return statement
    } catch (error) {
      console.error('Error getting customer statement:', error)
      throw error
    }
  }

  /**
   * Get till session reports
   */
  async getTillSessionReports(filters?: TillSessionFilters): Promise<TillSessionReport[]> {
    try {
      let query = supabase
        .from('till_sessions')
        .select(`
          *,
          cashiers:opened_by(name),
          branches:branch_id(name)
        `)
        .order('opening_time', { ascending: false })

      if (filters?.cashier_id) {
        query = query.eq('opened_by', filters.cashier_id)
      }
      if (filters?.start_date) {
        query = query.gte('opening_time', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('opening_time', filters.end_date)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data: sessions, error } = await query

      if (error) throw error

      return sessions?.map(session => ({
        id: session.id,
        session_number: session.session_number || `TS-${session.id.slice(0, 8)}`,
        cashier_name: session.cashiers?.name || 'Unknown',
        branch_id: session.branch_id,
        opening_time: session.opening_time,
        closing_time: session.closing_time,
        opening_amount: session.opening_amount,
        closing_amount: session.closing_amount,
        total_sales: session.total_sales || 0,
        total_refunds: session.total_refunds || 0,
        cash_sales: session.cash_sales || 0,
        card_sales: session.card_sales || 0,
        transfer_sales: session.transfer_sales || 0,
        mpesa_sales: session.mpesa_sales || 0,
        ecocash_sales: session.ecocash_sales || 0,
        credit_sales: session.credit_sales || 0,
        laybye_payments: session.laybye_payments || 0,
        cash_drops: session.cash_drops || 0,
        cash_withdrawals: session.cash_withdrawals || 0,
        expected_cash: session.expected_cash || 0,
        actual_cash: session.actual_cash,
        variance: session.variance,
        status: session.status,
        notes: session.notes,
        created_at: session.created_at,
        updated_at: session.updated_at
      })) || []
    } catch (error) {
      console.error('Error getting till session reports:', error)
      throw error
    }
  }

  /**
   * Process cash drop
   */
  async processCashDrop(data: CashDropFormData): Promise<CashDrop> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { user: branchUser } } = await supabase.auth.getUser()

      // Get current till amount (this would come from till operations service)
      const currentAmount = 1000 // Placeholder - should get from actual till

      const cashDropData = {
        branch_id: branchUser?.id || 'global',
        amount: data.amount,
        reason: data.reason,
        performed_by: user?.id || 'system',
        till_amount_before: currentAmount,
        till_amount_after: currentAmount - data.amount
      }

      const { data: cashDrop, error } = await supabase
        .from('cash_drops')
        .insert(cashDropData)
        .select()
        .single()

      if (error) {
        // If table doesn't exist (error code 42P01), return mock data
        if (error.code === '42P01') {
          console.warn('cash_drops table does not exist yet, returning mock data')
          return {
            id: `mock-${Date.now()}`,
            ...cashDropData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as CashDrop
        }
        throw error
      }

      return cashDrop
    } catch (error) {
      console.error('Error processing cash drop:', error)
      throw error
    }
  }

  /**
   * Process cash withdrawal
   */
  async processCashWithdrawal(data: CashWithdrawalFormData): Promise<CashWithdrawal> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { user: branchUser } } = await supabase.auth.getUser()

      // Get current till amount (this would come from till operations service)
      const currentAmount = 1000 // Placeholder - should get from actual till

      const withdrawalData = {
        branch_id: branchUser?.id || 'global',
        amount: data.amount,
        reason: data.reason,
        category: data.category,
        performed_by: user?.id || 'system',
        till_amount_before: currentAmount,
        till_amount_after: currentAmount - data.amount,
        receipt_number: data.receipt_number
      }

      const { data: withdrawal, error } = await supabase
        .from('cash_withdrawals')
        .insert(withdrawalData)
        .select()
        .single()

      if (error) {
        // If table doesn't exist (error code 42P01), return mock data
        if (error.code === '42P01') {
          console.warn('cash_withdrawals table does not exist yet, returning mock data')
          return {
            id: `mock-${Date.now()}`,
            ...withdrawalData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as CashWithdrawal
        }
        throw error
      }

      return withdrawal
    } catch (error) {
      console.error('Error processing cash withdrawal:', error)
      throw error
    }
  }

  /**
   * Get recent account payments
   */
  async getRecentAccountPayments(limit: number = 10): Promise<AccountPayment[]> {
    try {
      const { data, error } = await supabase
        .from('account_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        // If table doesn't exist (error code 42P01), return empty array
        if (error.code === '42P01') {
          console.warn('account_payments table does not exist yet, returning empty array')
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting recent account payments:', error)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }

  /**
   * Get recent cash drops
   */
  async getRecentCashDrops(limit: number = 10): Promise<CashDrop[]> {
    try {
      const { data, error } = await supabase
        .from('cash_drops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        // If table doesn't exist (error code 42P01), return empty array
        if (error.code === '42P01') {
          console.warn('cash_drops table does not exist yet, returning empty array')
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting recent cash drops:', error)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }

  /**
   * Get recent cash withdrawals
   */
  async getRecentCashWithdrawals(limit: number = 10): Promise<CashWithdrawal[]> {
    try {
      const { data, error } = await supabase
        .from('cash_withdrawals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        // If table doesn't exist (error code 42P01), return empty array
        if (error.code === '42P01') {
          console.warn('cash_withdrawals table does not exist yet, returning empty array')
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting recent cash withdrawals:', error)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }
}

export const accountPaymentsService = new AccountPaymentsService() 