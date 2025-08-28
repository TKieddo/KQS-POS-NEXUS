import { supabase } from './supabase'

export interface AdminRefundItem {
  id: string
  refund_number: string
  original_sale_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  refund_amount: number
  refund_method: string
  reason: string
  status: string
  processed_by_name: string
  processed_at: string
  items_count: number
  branch_name: string
}

export interface AdminRefundStats {
  totalRefunds: number
  totalAmount: number
  pendingRefunds: number
  completedRefunds: number
  byMethod: Record<string, number>
  byStatus: Record<string, number>
  todayRefunds: number
  todayAmount: number
  thisWeekRefunds: number
  thisWeekAmount: number
  thisMonthRefunds: number
  thisMonthAmount: number
}

export interface AdminRefundAnalytics {
  dailyRefunds: Array<{
    date: string
    count: number
    amount: number
  }>
  methodBreakdown: Array<{
    method: string
    count: number
    amount: number
  }>
  statusBreakdown: Array<{
    status: string
    count: number
    amount: number
  }>
  topReasons: Array<{
    reason: string
    count: number
    amount: number
  }>
}

export interface AdminRefundDetails {
  id: string
  refund_number: string
  original_sale_id: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    account_balance: number
  }
  items: Array<{
    id: string
    product_name: string
    sku: string
    quantity: number
    unit_price: number
    refund_amount: number
    reason: string
  }>
  refund_amount: number
  refund_method: string
  reason: string
  status: string
  processed_by: string
  processed_at: string
  branch_name: string
  notes?: string
}

export class RefundAdminService {
  /**
   * Get refund statistics for admin dashboard
   */
  static async getRefundStats(branchId?: string): Promise<{ success: boolean; data?: AdminRefundStats; error?: string }> {
    try {
      // Get overall stats
      const { data: overallStats, error: overallError } = await supabase
        .rpc('get_refund_stats', {
          p_branch_id: branchId || null,
          p_period: 'all'
        })

      if (overallError) throw overallError

      // Get today's stats
      const { data: todayStats, error: todayError } = await supabase
        .rpc('get_refund_stats', {
          p_branch_id: branchId || null,
          p_period: 'today'
        })

      if (todayError) throw todayError

      // Get this week's stats
      const { data: weekStats, error: weekError } = await supabase
        .rpc('get_refund_stats', {
          p_branch_id: branchId || null,
          p_period: 'week'
        })

      if (weekError) throw weekError

      // Get this month's stats
      const { data: monthStats, error: monthError } = await supabase
        .rpc('get_refund_stats', {
          p_branch_id: branchId || null,
          p_period: 'month'
        })

      if (monthError) throw monthError

      // Get pending refunds count
      let pendingQuery = supabase
        .from('refunds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (branchId) {
        pendingQuery = pendingQuery.eq('branch_id', branchId)
      }

      const { count: pendingCount, error: pendingError } = await pendingQuery

      if (pendingError) throw pendingError

      const stats: AdminRefundStats = {
        totalRefunds: overallStats?.totalRefunds || 0,
        totalAmount: overallStats?.totalAmount || 0,
        pendingRefunds: pendingCount || 0,
        completedRefunds: overallStats?.byStatus?.completed || 0,
        byMethod: overallStats?.byMethod || {},
        byStatus: overallStats?.byStatus || {},
        todayRefunds: todayStats?.totalRefunds || 0,
        todayAmount: todayStats?.totalAmount || 0,
        thisWeekRefunds: weekStats?.totalRefunds || 0,
        thisWeekAmount: weekStats?.totalAmount || 0,
        thisMonthRefunds: monthStats?.totalRefunds || 0,
        thisMonthAmount: monthStats?.totalAmount || 0
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error('Error fetching refund stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch refund statistics'
      }
    }
  }

  /**
   * Get refund analytics for charts and graphs
   */
  static async getRefundAnalytics(branchId?: string, period: 'week' | 'month' = 'week'): Promise<{ success: boolean; data?: AdminRefundAnalytics; error?: string }> {
    try {
      const days = period === 'week' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get daily refunds
      let query = supabase
        .from('refunds')
        .select(`
          processed_at,
          refund_amount,
          refund_method,
          status,
          reason
        `)
        .gte('processed_at', startDate.toISOString())
        .order('processed_at')

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data: dailyData, error: dailyError } = await query

      if (dailyError) throw dailyError

      // Process daily data
      const dailyRefunds: Record<string, { count: number; amount: number }> = {}
      const methodBreakdown: Record<string, { count: number; amount: number }> = {}
      const statusBreakdown: Record<string, { count: number; amount: number }> = {}
      const reasonBreakdown: Record<string, { count: number; amount: number }> = {}

      dailyData?.forEach(refund => {
        const date = new Date(refund.processed_at).toISOString().split('T')[0]
        
        // Daily breakdown
        if (!dailyRefunds[date]) {
          dailyRefunds[date] = { count: 0, amount: 0 }
        }
        dailyRefunds[date].count++
        dailyRefunds[date].amount += refund.refund_amount || 0

        // Method breakdown
        const method = refund.refund_method || 'unknown'
        if (!methodBreakdown[method]) {
          methodBreakdown[method] = { count: 0, amount: 0 }
        }
        methodBreakdown[method].count++
        methodBreakdown[method].amount += refund.refund_amount || 0

        // Status breakdown
        const status = refund.status || 'unknown'
        if (!statusBreakdown[status]) {
          statusBreakdown[status] = { count: 0, amount: 0 }
        }
        statusBreakdown[status].count++
        statusBreakdown[status].amount += refund.refund_amount || 0

        // Reason breakdown
        const reason = refund.reason || 'unknown'
        if (!reasonBreakdown[reason]) {
          reasonBreakdown[reason] = { count: 0, amount: 0 }
        }
        reasonBreakdown[reason].count++
        reasonBreakdown[reason].amount += refund.refund_amount || 0
      })

      const analytics: AdminRefundAnalytics = {
        dailyRefunds: Object.entries(dailyRefunds).map(([date, data]) => ({
          date,
          count: data.count,
          amount: data.amount
        })),
        methodBreakdown: Object.entries(methodBreakdown).map(([method, data]) => ({
          method,
          count: data.count,
          amount: data.amount
        })),
        statusBreakdown: Object.entries(statusBreakdown).map(([status, data]) => ({
          status,
          count: data.count,
          amount: data.amount
        })),
        topReasons: Object.entries(reasonBreakdown)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 5)
          .map(([reason, data]) => ({
            reason,
            count: data.count,
            amount: data.amount
          }))
      }

      return { success: true, data: analytics }
    } catch (error) {
      console.error('Error fetching refund analytics:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch refund analytics'
      }
    }
  }

  /**
   * Get refund history for admin table
   */
  static async getRefundHistory(branchId?: string, limit: number = 50, offset: number = 0): Promise<{ success: boolean; data?: AdminRefundItem[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_refund_history', {
          p_branch_id: branchId || null,
          p_limit: limit
        })

      if (error) throw error

      // Transform data to match admin interface
      const refunds: AdminRefundItem[] = (data || []).map((refund: any) => ({
        id: refund.refund_id,
        refund_number: refund.refund_number,
        original_sale_id: refund.original_sale_id,
        customer_name: refund.customer_name || 'Unknown Customer',
        customer_email: refund.customer_email || '',
        customer_phone: '', // Not available in current function
        refund_amount: refund.refund_amount,
        refund_method: refund.refund_method,
        reason: refund.reason,
        status: refund.status,
        processed_by_name: refund.processed_by_name || 'Unknown User',
        processed_at: refund.processed_at,
        items_count: refund.items_count,
        branch_name: '' // Not available in current function
      }))

      return { success: true, data: refunds }
    } catch (error) {
      console.error('Error fetching refund history:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch refund history'
      }
    }
  }

  /**
   * Get detailed refund information
   */
  static async getRefundDetails(refundId: string): Promise<{ success: boolean; data?: AdminRefundDetails; error?: string }> {
    try {
      // Get refund details
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .select(`
          *,
          customers!inner(
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          users!inner(
            full_name
          ),
          branches!inner(
            name
          ),
          credit_accounts!inner(
            current_balance
          )
        `)
        .eq('id', refundId)
        .single()

      if (refundError) throw refundError

      // Get refund items
      const { data: items, error: itemsError } = await supabase
        .from('refund_items')
        .select(`
          *,
          products!inner(
            name,
            sku
          )
        `)
        .eq('refund_id', refundId)

      if (itemsError) throw itemsError

      const details: AdminRefundDetails = {
        id: refund.id,
        refund_number: refund.refund_number,
        original_sale_id: refund.original_sale_id,
        customer: {
          id: refund.customers.id,
          name: `${refund.customers.first_name} ${refund.customers.last_name}`,
          email: refund.customers.email,
          phone: refund.customers.phone,
          account_balance: refund.credit_accounts?.[0]?.current_balance || 0
        },
        items: (items || []).map((item: any) => ({
          id: item.id,
          product_name: item.products.name,
          sku: item.products.sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          refund_amount: item.refund_amount,
          reason: item.reason
        })),
        refund_amount: refund.refund_amount,
        refund_method: refund.refund_method,
        reason: refund.reason,
        status: refund.status,
        processed_by: refund.users.full_name,
        processed_at: refund.processed_at,
        branch_name: refund.branches.name,
        notes: refund.notes
      }

      return { success: true, data: details }
    } catch (error) {
      console.error('Error fetching refund details:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch refund details'
      }
    }
  }

  /**
   * Update refund status
   */
  static async updateRefundStatus(refundId: string, status: 'pending' | 'approved' | 'completed' | 'cancelled'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({ status })
        .eq('id', refundId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error updating refund status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update refund status'
      }
    }
  }

  /**
   * Get pending refunds count for dashboard
   */
  static async getPendingRefundsCount(branchId?: string): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      let query = supabase
        .from('refunds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { count, error } = await query

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      console.error('Error fetching pending refunds count:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending refunds count'
      }
    }
  }
}
