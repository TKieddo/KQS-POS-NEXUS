import { supabase } from './supabase'

// Types for till operations
export interface CashDrop {
  id: string
  branch_id: string
  amount: number
  reason: string
  performed_by: string
  till_amount_before: number
  till_amount_after: number
  created_at: string
  updated_at: string
}

export interface TillCount {
  id: string
  branch_id: string
  expected_amount: number
  actual_amount: number
  variance: number
  denomination_counts: Record<string, number>
  notes?: string
  counted_by: string
  created_at: string
  updated_at: string
}

export interface TillReconciliation {
  id: string
  branch_id: string
  opening_amount: number
  sales_total: number
  refunds_total: number
  cash_payments: number
  expected_amount: number
  actual_amount: number
  variance: number
  notes?: string
  reconciled_by: string
  created_at: string
  updated_at: string
}

export interface TillSession {
  id: string
  branch_id: string
  opened_by: string
  closed_by?: string
  opening_amount: number
  closing_amount?: number
  opening_time: string
  closing_time?: string
  status: 'open' | 'closed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface TillSummary {
  current_amount: number
  opening_amount: number
  sales_total: number
  refunds_total: number
  cash_payments: number
  cash_drops_total: number
}

class TillOperationsService {
  private static instance: TillOperationsService
  private cache: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): TillOperationsService {
    if (!TillOperationsService.instance) {
      TillOperationsService.instance = new TillOperationsService()
    }
    return TillOperationsService.instance
  }

  /**
   * Get current till summary for a branch
   */
  async getTillSummary(branchId: string): Promise<TillSummary> {
    const cacheKey = `till_summary_${branchId}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      // Validate branchId
      if (!branchId || branchId === 'global') {
        console.warn('Invalid branchId provided to getTillSummary:', branchId)
        return {
          current_amount: 0,
          opening_amount: 0,
          sales_total: 0,
          refunds_total: 0,
          cash_payments: 0,
          cash_drops_total: 0
        }
      }

      // Try to use the database function first
      try {
      const { data, error } = await supabase
        .rpc('get_till_summary', { p_branch_id: branchId })

        if (error) {
          console.error('Supabase RPC error:', error)
          throw error
        }

        // Handle case where no data is returned
        if (!data || data.length === 0) {
          console.warn('No data returned from get_till_summary for branchId:', branchId)
          return {
            current_amount: 0,
            opening_amount: 0,
            sales_total: 0,
            refunds_total: 0,
            cash_payments: 0,
            cash_drops_total: 0
          }
        }

      const summary: TillSummary = {
          current_amount: data[0]?.current_amount || 0,
          opening_amount: data[0]?.opening_amount || 0,
          sales_total: data[0]?.sales_total || 0,
          refunds_total: data[0]?.refunds_total || 0,
          cash_payments: data[0]?.cash_payments || 0,
          cash_drops_total: data[0]?.cash_drops_total || 0
      }

      this.cache.set(cacheKey, summary)
      return summary
      } catch (rpcError) {
        console.warn('Database function failed, using fallback calculation:', rpcError)
        
        // Fallback: Calculate manually
        return await this.calculateTillSummaryManually(branchId)
      }
    } catch (error) {
      console.error('Error getting till summary:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        branchId
      })
      // Return default summary if error
      return {
        current_amount: 0,
        opening_amount: 0,
        sales_total: 0,
        refunds_total: 0,
        cash_payments: 0,
        cash_drops_total: 0
      }
    }
  }

  /**
   * Get current till amount for a branch
   */
  async getCurrentTillAmount(branchId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_current_till_amount', { p_branch_id: branchId })

      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error getting current till amount:', error)
      return 0
    }
  }

  /**
   * Perform a cash drop
   */
  async performCashDrop(branchId: string, amount: number, reason: string): Promise<CashDrop | null> {
    try {
      // Get current till amount
      const currentAmount = await this.getCurrentTillAmount(branchId)
      
      // Validate amount
      if (amount <= 0 || amount > currentAmount) {
        throw new Error('Invalid cash drop amount')
      }

      // Get current user (in real app, this would come from auth context)
      const { data: { user } } = await supabase.auth.getUser()
      const performedBy = user?.id || 'system'

      const cashDropData = {
        branch_id: branchId,
        amount: amount,
        reason: reason,
        performed_by: performedBy,
        till_amount_before: currentAmount,
        till_amount_after: currentAmount - amount
      }

      const { data, error } = await supabase
        .from('cash_drops')
        .insert(cashDropData)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.clearCacheForBranch(branchId)

      return data
    } catch (error) {
      console.error('Error performing cash drop:', error)
      throw error
    }
  }

  /**
   * Record a till count
   */
  async recordTillCount(branchId: string, expectedAmount: number, denominationCounts: Record<string, number>, notes?: string): Promise<TillCount | null> {
    try {
      // Calculate actual amount from denomination counts
      const denominations = {
        'R200': 200, 'R100': 100, 'R50': 50, 'R20': 20, 'R10': 10, 'R5': 5,
        'R2': 2, 'R1': 1, '50c': 0.5, '20c': 0.2, '10c': 0.1, '5c': 0.05
      }
      
      const actualAmount = Object.entries(denominationCounts).reduce((total, [denom, count]) => {
        return total + (count * denominations[denom as keyof typeof denominations])
      }, 0)

      const variance = actualAmount - expectedAmount

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      const countedBy = user?.id || 'system'

      const tillCountData = {
        branch_id: branchId,
        expected_amount: expectedAmount,
        actual_amount: actualAmount,
        variance: variance,
        denomination_counts: denominationCounts,
        notes: notes,
        counted_by: countedBy
      }

      const { data, error } = await supabase
        .from('till_counts')
        .insert(tillCountData)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.clearCacheForBranch(branchId)

      return data
    } catch (error) {
      console.error('Error recording till count:', error)
      throw error
    }
  }

  /**
   * Record a till reconciliation
   */
  async recordTillReconciliation(branchId: string, reconciliation: {
    opening_amount: number
    sales_total: number
    refunds_total: number
    cash_payments: number
    actual_amount: number
    notes?: string
  }): Promise<TillReconciliation | null> {
    try {
      const expectedAmount = reconciliation.opening_amount + reconciliation.sales_total - reconciliation.refunds_total - reconciliation.cash_payments
      const variance = reconciliation.actual_amount - expectedAmount

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      const reconciledBy = user?.id || 'system'

      const reconciliationData = {
        branch_id: branchId,
        opening_amount: reconciliation.opening_amount,
        sales_total: reconciliation.sales_total,
        refunds_total: reconciliation.refunds_total,
        cash_payments: reconciliation.cash_payments,
        expected_amount: expectedAmount,
        actual_amount: reconciliation.actual_amount,
        variance: variance,
        notes: reconciliation.notes,
        reconciled_by: reconciledBy
      }

      const { data, error } = await supabase
        .from('till_reconciliations')
        .insert(reconciliationData)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.clearCacheForBranch(branchId)

      return data
    } catch (error) {
      console.error('Error recording till reconciliation:', error)
      throw error
    }
  }

  /**
   * Open a new till session
   */
  async openTillSession(branchId: string, openingAmount: number, notes?: string): Promise<TillSession | null> {
    try {
      // Check if there's already an open session
      const { data: existingSessions, error: checkError } = await supabase
        .from('till_sessions')
        .select('id')
        .eq('branch_id', branchId)
        .eq('status', 'open')
        .limit(1)

      if (checkError) {
        console.error('Error checking for existing sessions:', checkError)
        throw new Error('Failed to check for existing till sessions')
      }

      if (existingSessions && existingSessions.length > 0) {
        throw new Error('There is already an open till session for this branch')
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      const openedBy = user?.id || 'system'

      const sessionData = {
        branch_id: branchId,
        opened_by: openedBy,
        opening_amount: openingAmount,
        notes: notes
      }

      const { data, error } = await supabase
        .from('till_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.clearCacheForBranch(branchId)

      return data
    } catch (error) {
      console.error('Error opening till session:', error)
      throw error
    }
  }

  /**
   * Close the current till session
   */
  async closeTillSession(branchId: string, closingAmount: number, notes?: string): Promise<TillSession | null> {
    try {
      // Get current open session
      const { data: openSessions, error: fetchError } = await supabase
        .from('till_sessions')
        .select('id')
        .eq('branch_id', branchId)
        .eq('status', 'open')
        .limit(1)

      if (fetchError) {
        console.error('Error fetching open session:', fetchError)
        throw new Error('Failed to fetch open till session')
      }

      if (!openSessions || openSessions.length === 0) {
        throw new Error('No open till session found for this branch')
      }

      const openSession = openSessions[0]

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      const closedBy = user?.id || 'system'

      const { data, error } = await supabase
        .from('till_sessions')
        .update({
          closed_by: closedBy,
          closing_amount: closingAmount,
          closing_time: new Date().toISOString(),
          status: 'closed',
          notes: notes
        })
        .eq('id', openSession.id)
        .select()
        .single()

      if (error) throw error

      // Clear cache
      this.clearCacheForBranch(branchId)

      return data
    } catch (error) {
      console.error('Error closing till session:', error)
      throw error
    }
  }

  /**
   * Get recent cash drops for a branch
   */
  async getRecentCashDrops(branchId: string, limit: number = 10): Promise<CashDrop[]> {
    try {
      const { data, error } = await supabase
        .from('cash_drops')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting recent cash drops:', error)
      return []
    }
  }

  /**
   * Get recent till counts for a branch
   */
  async getRecentTillCounts(branchId: string, limit: number = 10): Promise<TillCount[]> {
    try {
      const { data, error } = await supabase
        .from('till_counts')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting recent till counts:', error)
      return []
    }
  }

  /**
   * Get recent till reconciliations for a branch
   */
  async getRecentTillReconciliations(branchId: string, limit: number = 10): Promise<TillReconciliation[]> {
    try {
      const { data, error } = await supabase
        .from('till_reconciliations')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting recent till reconciliations:', error)
      return []
    }
  }

  /**
   * Get current open till session for a branch
   */
  async getCurrentTillSession(branchId: string): Promise<TillSession | null> {
    try {
      const { data, error } = await supabase
        .from('till_sessions')
        .select('*')
        .eq('branch_id', branchId)
        .eq('status', 'open')
        .order('opening_time', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error getting current till session:', error)
        return null
      }

      // Return the first session if any exist, otherwise null
      return data?.[0] || null
    } catch (error) {
      console.error('Error getting current till session:', error)
      return null
    }
  }

  /**
   * Clear cache for a specific branch
   */
  private clearCacheForBranch(branchId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(branchId))
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Calculate till summary manually (fallback when database function fails)
   */
  private async calculateTillSummaryManually(branchId: string): Promise<TillSummary> {
    try {
      // Get current open session - handle case where no session exists
      const { data: sessions, error: sessionError } = await supabase
        .from('till_sessions')
        .select('opening_amount, opening_time')
        .eq('branch_id', branchId)
        .eq('status', 'open')
        .order('opening_time', { ascending: false })
        .limit(1)

      if (sessionError) {
        console.error('Error fetching till sessions:', sessionError)
        return this.getDefaultSummary()
      }

      const session = sessions?.[0]
      const openingAmount = session?.opening_amount || 0
      const openingTime = session?.opening_time

      // Get cash drops since session opened
      let cashDropsTotal = 0
      if (openingTime) {
        const { data: cashDrops, error: cashDropsError } = await supabase
          .from('cash_drops')
          .select('amount')
          .eq('branch_id', branchId)
          .gte('created_at', openingTime)

        if (!cashDropsError && cashDrops) {
          cashDropsTotal = cashDrops.reduce((sum, drop) => sum + (drop.amount || 0), 0)
        }
      }

      const summary: TillSummary = {
        current_amount: openingAmount - cashDropsTotal,
        opening_amount: openingAmount,
        sales_total: 0, // Placeholder for sales total
        refunds_total: 0, // Placeholder for refunds total
        cash_payments: 0, // Placeholder for cash payments
        cash_drops_total: cashDropsTotal
      }

      return summary
    } catch (error) {
      console.error('Error calculating till summary manually:', error)
      return this.getDefaultSummary()
    }
  }

  /**
   * Get default summary when no data is available
   */
  private getDefaultSummary(): TillSummary {
    return {
      current_amount: 0,
      opening_amount: 0,
      sales_total: 0,
      refunds_total: 0,
      cash_payments: 0,
      cash_drops_total: 0
    }
  }
}

// Create singleton instance
const tillOperationsService = TillOperationsService.getInstance()

// Export functions for easy use
export const getTillSummary = (branchId: string) => 
  tillOperationsService.getTillSummary(branchId)

export const getCurrentTillAmount = (branchId: string) => 
  tillOperationsService.getCurrentTillAmount(branchId)

export const performCashDrop = (branchId: string, amount: number, reason: string) => 
  tillOperationsService.performCashDrop(branchId, amount, reason)

export const recordTillCount = (branchId: string, expectedAmount: number, denominationCounts: Record<string, number>, notes?: string) => 
  tillOperationsService.recordTillCount(branchId, expectedAmount, denominationCounts, notes)

export const recordTillReconciliation = (branchId: string, reconciliation: any) => 
  tillOperationsService.recordTillReconciliation(branchId, reconciliation)

export const openTillSession = (branchId: string, openingAmount: number, notes?: string) => 
  tillOperationsService.openTillSession(branchId, openingAmount, notes)

export const closeTillSession = (branchId: string, closingAmount: number, notes?: string) => 
  tillOperationsService.closeTillSession(branchId, closingAmount, notes)

export const getRecentCashDrops = (branchId: string, limit?: number) => 
  tillOperationsService.getRecentCashDrops(branchId, limit)

export const getRecentTillCounts = (branchId: string, limit?: number) => 
  tillOperationsService.getRecentTillCounts(branchId, limit)

export const getRecentTillReconciliations = (branchId: string, limit?: number) => 
  tillOperationsService.getRecentTillReconciliations(branchId, limit)

export const getCurrentTillSession = (branchId: string) => 
  tillOperationsService.getCurrentTillSession(branchId)

export const clearTillOperationsCache = () => 
  tillOperationsService.clearCache()

 