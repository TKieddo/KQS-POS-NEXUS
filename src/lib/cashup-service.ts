import { supabase } from './supabase'

export interface CashUpSession {
  id: string
  session_number: string
  cashier_id?: string
  cashier_name: string
  branch_id: string
  start_time: string
  end_time?: string
  status: 'active' | 'closed' | 'reconciled'
  opening_amount: number
  closing_amount?: number
  expected_amount: number
  actual_amount?: number
  difference?: number
  sales: {
    cash: number
    card: number
    transfer: number
    mpesa: number
    ecocash: number
    total: number
  }
  refunds: {
    cash: number
    card: number
    transfer: number
    mpesa: number
    ecocash: number
    total: number
  }
  expenses: {
    description: string
    amount: number
    type: 'cash' | 'card' | 'transfer' | 'mpesa' | 'ecocash'
  }[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateCashUpSessionData {
  cashier_name: string
  branch_id: string
  opening_amount: number
  notes?: string
}

export interface CloseCashUpSessionData {
  session_id: string
  closing_amount: number
  actual_amount: number
  expenses: {
    description: string
    amount: number
    type: 'cash' | 'card' | 'transfer' | 'mpesa' | 'ecocash'
  }[]
  notes?: string
}

// Create a new cashup session
export const createCashUpSession = async (data: CreateCashUpSessionData): Promise<{ success: boolean; data?: CashUpSession; error?: string }> => {
  try {
    const sessionNumber = `CASHUP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
    const { data: session, error } = await supabase
      .from('cashup_sessions')
      .insert({
        session_number: sessionNumber,
        cashier_name: data.cashier_name,
        branch_id: data.branch_id,
        opening_amount: data.opening_amount,
        status: 'active',
        sales: {
          cash: 0,
          card: 0,
          transfer: 0,
          mpesa: 0,
          ecocash: 0,
          total: 0
        },
        refunds: {
          cash: 0,
          card: 0,
          transfer: 0,
          mpesa: 0,
          ecocash: 0,
          total: 0
        },
        expenses: [],
        notes: data.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating cashup session:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: session }
  } catch (error) {
    console.error('Error creating cashup session:', error)
    return { success: false, error: 'Failed to create cashup session' }
  }
}

// Get current active session for a branch
export const getCurrentCashUpSession = async (branchId: string): Promise<{ success: boolean; data?: CashUpSession; error?: string }> => {
  try {
    const { data: session, error } = await supabase
      .from('cashup_sessions')
      .select('*')
      .eq('branch_id', branchId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching current cashup session:', error)
      return { success: false, error: error.message }
    }

    if (!session) {
      return { success: true, data: undefined }
    }

    // Calculate sales and refunds for this session
    const sessionData = await calculateSessionTotals(session.id, branchId)
    
    // Calculate expected amount based on session period sales
    const totalExpenses = session.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0
    const expectedAmount = session.opening_amount + sessionData.sales.total - sessionData.refunds.total - totalExpenses
    
    const updatedSession = {
      ...session,
      ...sessionData,
      expected_amount: expectedAmount
    }

    return { success: true, data: updatedSession }
  } catch (error) {
    console.error('Error fetching current cashup session:', error)
    return { success: false, error: 'Failed to fetch current cashup session' }
  }
}

// Calculate sales and refunds for a session
const calculateSessionTotals = async (sessionId: string, branchId: string) => {
  try {
    // Get the session start time first
    const { data: session, error: sessionError } = await supabase
      .from('cashup_sessions')
      .select('start_time')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('Error fetching session start time:', sessionError)
      return { sales: { cash: 0, card: 0, transfer: 0, mpesa: 0, ecocash: 0, total: 0 }, refunds: { cash: 0, card: 0, transfer: 0, mpesa: 0, ecocash: 0, total: 0 } }
    }

    // Get sales for this session period (only after session start time)
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('total_amount, payment_method, created_at')
      .eq('branch_id', branchId)
      .eq('payment_status', 'completed')
      .gte('created_at', session.start_time) // Only sales after session started

    if (salesError) {
      console.error('Error fetching sales for cashup:', salesError)
      return { sales: { cash: 0, card: 0, transfer: 0, mpesa: 0, ecocash: 0, total: 0 }, refunds: { cash: 0, card: 0, transfer: 0, mpesa: 0, ecocash: 0, total: 0 } }
    }

    // Calculate sales by payment method
    const salesByMethod = {
      cash: 0,
      card: 0,
      transfer: 0,
      mpesa: 0,
      ecocash: 0,
      total: 0
    }

    sales?.forEach(sale => {
      const method = sale.payment_method.toLowerCase()
      if (method in salesByMethod) {
        salesByMethod[method as keyof typeof salesByMethod] += sale.total_amount
      }
      salesByMethod.total += sale.total_amount
    })

    // For now, refunds are 0 (we can add refund tracking later)
    const refunds = {
      cash: 0,
      card: 0,
      transfer: 0,
      mpesa: 0,
      ecocash: 0,
      total: 0
    }

    return { sales: salesByMethod, refunds }
  } catch (error) {
    console.error('Error calculating session totals:', error)
    return { sales: { cash: 0, card: 0, transfer: 0, mpesa: 0, ecocash: 0, total: 0 }, refunds: { cash: 0, card: 0, transfer: 0, mpesa: 0, ecocash: 0, total: 0 } }
  }
}

// Close a cashup session
export const closeCashUpSession = async (data: CloseCashUpSessionData): Promise<{ success: boolean; data?: CashUpSession; error?: string }> => {
  try {
    // Get current session data
    const { data: currentSession, error: fetchError } = await supabase
      .from('cashup_sessions')
      .select('*')
      .eq('id', data.session_id)
      .single()

    if (fetchError) {
      console.error('Error fetching session to close:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Calculate sales for this session period
    const sessionData = await calculateSessionTotals(data.session_id, currentSession.branch_id)
    
    // Calculate expected amount based on session period sales
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const expectedAmount = currentSession.opening_amount + sessionData.sales.total - sessionData.refunds.total - totalExpenses

    const { data: updatedSession, error } = await supabase
      .from('cashup_sessions')
      .update({
        status: 'closed',
        end_time: new Date().toISOString(),
        closing_amount: data.closing_amount,
        actual_amount: data.actual_amount,
        difference: data.actual_amount - expectedAmount,
        expenses: data.expenses,
        notes: data.notes,
        expected_amount: expectedAmount,
        sales: sessionData.sales,
        refunds: sessionData.refunds
      })
      .eq('id', data.session_id)
      .select()
      .single()

    if (error) {
      console.error('Error closing cashup session:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: updatedSession }
  } catch (error) {
    console.error('Error closing cashup session:', error)
    return { success: false, error: 'Failed to close cashup session' }
  }
}

// Get all cashup sessions for a branch
export const getCashUpSessions = async (branchId: string, filters?: {
  startDate?: string
  endDate?: string
  status?: string
  limit?: number
}): Promise<{ success: boolean; data?: CashUpSession[]; error?: string }> => {
  try {
    let query = supabase
      .from('cashup_sessions')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cashup sessions:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching cashup sessions:', error)
    return { success: false, error: 'Failed to fetch cashup sessions' }
  }
}

// Get cashup session by ID
export const getCashUpSessionById = async (sessionId: string): Promise<{ success: boolean; data?: CashUpSession; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('cashup_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching cashup session:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching cashup session:', error)
    return { success: false, error: 'Failed to fetch cashup session' }
  }
}

// Reconcile a cashup session
export const reconcileCashUpSession = async (sessionId: string, notes: string): Promise<{ success: boolean; data?: CashUpSession; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('cashup_sessions')
      .update({
        status: 'reconciled',
        notes: notes
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error reconciling cashup session:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error reconciling cashup session:', error)
    return { success: false, error: 'Failed to reconcile cashup session' }
  }
}
