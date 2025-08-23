import { supabase } from '@/lib/supabase'
import { 
  CashflowEntry, 
  CashflowCategory, 
  DailySummary, 
  MonthlySummary, 
  CashflowStats, 
  CashflowFilters,
  NewCashflowEntry 
} from '../types/cashflow'

export class CashflowService {
  // Fetch all cashflow entries with optional filters
  static async getEntries(filters: CashflowFilters = {}): Promise<CashflowEntry[]> {
    try {
      let query = supabase
        .from('cashflow_entries')
        .select(`
          *,
          branches:branch_id (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('entry_date', { ascending: false })

      // Apply filters
      if (filters.startDate) {
        query = query.gte('entry_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('entry_date', filters.endDate)
      }
      if (filters.entryType && filters.entryType !== 'all') {
        query = query.eq('entry_type', filters.entryType)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId)
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount)
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data to include branch names
      return data?.map(entry => ({
        ...entry,
        branch_name: entry.branches?.name
      })) || []
    } catch (error) {
      console.error('Error fetching cashflow entries:', error)
      throw error
    }
  }

  // Create a new cashflow entry
  static async createEntry(entry: NewCashflowEntry): Promise<CashflowEntry> {
    try {
      const { data, error } = await supabase
        .from('cashflow_entries')
        .insert([entry])
        .select(`
          *,
          branches:branch_id (
            id,
            name
          )
        `)
        .single()

      if (error) throw error

      return {
        ...data,
        branch_name: data.branches?.name
      }
    } catch (error) {
      console.error('Error creating cashflow entry:', error)
      throw error
    }
  }

  // Update a cashflow entry
  static async updateEntry(id: string, updates: Partial<NewCashflowEntry>): Promise<CashflowEntry> {
    try {
      const { data, error } = await supabase
        .from('cashflow_entries')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          branches:branch_id (
            id,
            name
          )
        `)
        .single()

      if (error) throw error

      return {
        ...data,
        branch_name: data.branches?.name
      }
    } catch (error) {
      console.error('Error updating cashflow entry:', error)
      throw error
    }
  }

  // Delete a cashflow entry (soft delete)
  static async deleteEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cashflow_entries')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting cashflow entry:', error)
      throw error
    }
  }

  // Fetch all categories
  static async getCategories(): Promise<CashflowCategory[]> {
    try {
      const { data, error } = await supabase
        .from('cashflow_categories')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  // Fetch daily summaries
  static async getDailySummaries(branchId?: string, startDate?: string, endDate?: string): Promise<DailySummary[]> {
    try {
      let query = supabase
        .from('daily_summaries')
        .select(`
          *,
          branches:branch_id (
            id,
            name
          )
        `)
        .order('summary_date', { ascending: false })

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }
      if (startDate) {
        query = query.gte('summary_date', startDate)
      }
      if (endDate) {
        query = query.lte('summary_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(summary => ({
        ...summary,
        branch_name: summary.branches?.name
      })) || []
    } catch (error) {
      console.error('Error fetching daily summaries:', error)
      throw error
    }
  }

  // Fetch monthly summary
  static async getMonthlySummary(branchId?: string, year?: number, month?: number): Promise<MonthlySummary[]> {
    try {
      const currentYear = year || new Date().getFullYear()
      const currentMonth = month || new Date().getMonth() + 1

      console.log('Fetching monthly summary:', { branchId, currentYear, currentMonth })

      const { data, error } = await supabase
        .rpc('get_monthly_summary', {
          p_branch_id: branchId || null,
          p_year: currentYear,
          p_month: currentMonth
        })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Monthly summary data:', data)
      return data || []
    } catch (error) {
      console.error('Error fetching monthly summary:', error)
      // Return empty array instead of throwing for empty results
      if (error && typeof error === 'object' && Object.keys(error).length === 0) {
        console.log('Empty error object, returning empty array')
        return []
      }
      throw error
    }
  }

  // Calculate cashflow statistics
  static async getStats(filters: CashflowFilters = {}): Promise<CashflowStats> {
    try {
      const entries = await this.getEntries(filters)
      
      const totalEntries = entries.length
      const totalExpenses = entries
        .filter(e => e.entry_type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0)
      const totalIncome = entries
        .filter(e => e.entry_type === 'income')
        .reduce((sum, e) => sum + e.amount, 0)
      const totalSales = entries
        .filter(e => e.entry_type === 'sale')
        .reduce((sum, e) => sum + e.amount, 0)
      const netAmount = totalIncome + totalSales - totalExpenses

      // Calculate average daily net
      const uniqueDates = new Set(entries.map(e => e.entry_date))
      const averageDailyNet = uniqueDates.size > 0 ? netAmount / uniqueDates.size : 0

      // Get top expense categories
      const expenseCategories = entries
        .filter(e => e.entry_type === 'expense')
        .reduce((acc, e) => {
          acc[e.category] = acc[e.category] || { category: e.category, amount: 0, count: 0 }
          acc[e.category].amount += e.amount
          acc[e.category].count += 1
          return acc
        }, {} as Record<string, { category: string; amount: number; count: number }>)

      const topExpenseCategories = Object.values(expenseCategories)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      // Get top income categories
      const incomeCategories = entries
        .filter(e => e.entry_type === 'income')
        .reduce((acc, e) => {
          acc[e.category] = acc[e.category] || { category: e.category, amount: 0, count: 0 }
          acc[e.category].amount += e.amount
          acc[e.category].count += 1
          return acc
        }, {} as Record<string, { category: string; amount: number; count: number }>)

      const topIncomeCategories = Object.values(incomeCategories)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      return {
        totalEntries,
        totalExpenses,
        totalIncome,
        totalSales,
        netAmount,
        averageDailyNet,
        topExpenseCategories,
        topIncomeCategories
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
      throw error
    }
  }

  // Upload receipt image
  static async uploadReceipt(file: File, entryId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${entryId}-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading receipt:', error)
      throw error
    }
  }
}
