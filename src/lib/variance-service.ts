import { supabase } from './supabase'

export interface CashVariance {
  id: string
  cashup_session_id: string
  variance_type: 'shortage' | 'overage'
  amount: number
  category: 'counting_error' | 'unrecorded_sale' | 'wrong_change_given' | 'cash_theft' | 
           'register_malfunction' | 'unaccounted_expense' | 'foreign_currency' | 
           'damaged_bills' | 'customer_dispute' | 'unknown' | 'other'
  description?: string
  reported_by: string
  investigated_by?: string
  investigation_notes?: string
  resolution_status: 'pending' | 'investigating' | 'resolved' | 'unresolved' | 'manager_approved'
  manager_approval: boolean
  manager_id?: string
  manager_notes?: string
  branch_id: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface VarianceAction {
  id: string
  variance_id: string
  action_type: 'created' | 'investigated' | 'category_updated' | 'manager_reviewed' | 
              'approved' | 'rejected' | 'resolved' | 'escalated' | 'comment_added'
  action_by: string
  action_notes?: string
  old_value?: any
  new_value?: any
  created_at: string
}

export interface CreateVarianceData {
  cashup_session_id: string
  variance_type: 'shortage' | 'overage'
  amount: number
  category: string
  description?: string
  reported_by: string
  branch_id: string
}

export interface VarianceStats {
  totalVariances: number
  totalShortage: number
  totalOverage: number
  netVariance: number
  unresolvedCount: number
  byCategory: Record<string, { count: number; amount: number }>
  byStatus: Record<string, number>
}

// Create a new cash variance
export const createVariance = async (data: CreateVarianceData): Promise<{ success: boolean; data?: CashVariance; error?: string }> => {
  try {
    const { data: variance, error } = await supabase
      .from('cash_variances')
      .insert({
        cashup_session_id: data.cashup_session_id,
        variance_type: data.variance_type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        reported_by: data.reported_by,
        branch_id: data.branch_id,
        resolution_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating variance:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: variance }
  } catch (error) {
    console.error('Error creating variance:', error)
    return { success: false, error: 'Failed to create variance' }
  }
}

// Get variances for a cashup session
export const getSessionVariances = async (sessionId: string): Promise<{ success: boolean; data?: CashVariance[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('cash_variances')
      .select('*')
      .eq('cashup_session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching session variances:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching session variances:', error)
    return { success: false, error: 'Failed to fetch session variances' }
  }
}

// Get all variances for a branch with filters
export const getVariances = async (branchId: string, filters?: {
  startDate?: string
  endDate?: string
  status?: string
  type?: string
  category?: string
  limit?: number
}): Promise<{ success: boolean; data?: CashVariance[]; error?: string }> => {
  try {
    let query = supabase
      .from('cash_variances')
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
      query = query.eq('resolution_status', filters.status)
    }
    if (filters?.type) {
      query = query.eq('variance_type', filters.type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching variances:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching variances:', error)
    return { success: false, error: 'Failed to fetch variances' }
  }
}

// Update variance status and investigation
export const updateVariance = async (
  varianceId: string, 
  updates: {
    resolution_status?: string
    investigated_by?: string
    investigation_notes?: string
    manager_approval?: boolean
    manager_id?: string
    manager_notes?: string
    resolved_at?: string
  }
): Promise<{ success: boolean; data?: CashVariance; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('cash_variances')
      .update(updates)
      .eq('id', varianceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating variance:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating variance:', error)
    return { success: false, error: 'Failed to update variance' }
  }
}

// Get variance statistics for a branch and period
export const getVarianceStats = async (
  branchId: string, 
  startDate?: string, 
  endDate?: string
): Promise<{ success: boolean; data?: VarianceStats; error?: string }> => {
  try {
    let query = supabase
      .from('cash_variances')
      .select('*')
      .eq('branch_id', branchId)

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data: variances, error } = await query

    if (error) {
      console.error('Error fetching variance stats:', error)
      return { success: false, error: error.message }
    }

    // Calculate statistics
    const stats: VarianceStats = {
      totalVariances: variances?.length || 0,
      totalShortage: 0,
      totalOverage: 0,
      netVariance: 0,
      unresolvedCount: 0,
      byCategory: {},
      byStatus: {}
    }

    variances?.forEach(variance => {
      // Total amounts by type
      if (variance.variance_type === 'shortage') {
        stats.totalShortage += variance.amount
      } else {
        stats.totalOverage += variance.amount
      }

      // Unresolved count
      if (['pending', 'investigating', 'unresolved'].includes(variance.resolution_status)) {
        stats.unresolvedCount++
      }

      // By category
      if (!stats.byCategory[variance.category]) {
        stats.byCategory[variance.category] = { count: 0, amount: 0 }
      }
      stats.byCategory[variance.category].count++
      stats.byCategory[variance.category].amount += variance.amount

      // By status
      if (!stats.byStatus[variance.resolution_status]) {
        stats.byStatus[variance.resolution_status] = 0
      }
      stats.byStatus[variance.resolution_status]++
    })

    // Calculate net variance (overage - shortage)
    stats.netVariance = stats.totalOverage - stats.totalShortage

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error calculating variance stats:', error)
    return { success: false, error: 'Failed to calculate variance stats' }
  }
}

// Get variance actions (audit trail)
export const getVarianceActions = async (varianceId: string): Promise<{ success: boolean; data?: VarianceAction[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('variance_actions')
      .select('*')
      .eq('variance_id', varianceId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching variance actions:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching variance actions:', error)
    return { success: false, error: 'Failed to fetch variance actions' }
  }
}

// Add comment/action to variance
export const addVarianceAction = async (
  varianceId: string,
  actionType: string,
  actionBy: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('variance_actions')
      .insert({
        variance_id: varianceId,
        action_type: actionType,
        action_by: actionBy,
        action_notes: notes
      })

    if (error) {
      console.error('Error adding variance action:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding variance action:', error)
    return { success: false, error: 'Failed to add variance action' }
  }
}

// Manager approval workflow
export const approveVariance = async (
  varianceId: string,
  managerId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('cash_variances')
      .update({
        manager_approval: true,
        manager_id: managerId,
        manager_notes: notes,
        resolution_status: 'manager_approved'
      })
      .eq('id', varianceId)

    if (error) {
      console.error('Error approving variance:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error approving variance:', error)
    return { success: false, error: 'Failed to approve variance' }
  }
}

// Get variance categories for dropdown
export const getVarianceCategories = () => [
  { value: 'counting_error', label: 'Counting Error', description: 'Mistake in counting cash' },
  { value: 'unrecorded_sale', label: 'Unrecorded Sale', description: 'Sale not entered in system' },
  { value: 'wrong_change_given', label: 'Wrong Change Given', description: 'Incorrect change provided to customer' },
  { value: 'cash_theft', label: 'Cash Theft', description: 'Suspected theft of cash' },
  { value: 'register_malfunction', label: 'Register Malfunction', description: 'Technical issue with register' },
  { value: 'unaccounted_expense', label: 'Unaccounted Expense', description: 'Cash spent without recording' },
  { value: 'foreign_currency', label: 'Foreign Currency', description: 'Foreign money accepted' },
  { value: 'damaged_bills', label: 'Damaged Bills', description: 'Damaged or unusable currency' },
  { value: 'customer_dispute', label: 'Customer Dispute', description: 'Payment dispute with customer' },
  { value: 'unknown', label: 'Unknown', description: 'Cause unknown' },
  { value: 'other', label: 'Other', description: 'Other unlisted reason' }
]
