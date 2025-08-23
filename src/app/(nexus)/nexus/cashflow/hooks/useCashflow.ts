import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { CashflowService } from '../services/cashflowService'
import { 
  CashflowEntry, 
  CashflowCategory, 
  DailySummary, 
  MonthlySummary, 
  CashflowStats, 
  CashflowFilters,
  NewCashflowEntry 
} from '../types/cashflow'

export function useCashflow() {
  const { selectedBranch } = useBranch()
  const [entries, setEntries] = useState<CashflowEntry[]>([])
  const [categories, setCategories] = useState<CashflowCategory[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [stats, setStats] = useState<CashflowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CashflowFilters>({})

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // If Central Warehouse is selected, pass null to get all branches data
      // If a specific branch is selected, pass the branch ID
      const branchId = selectedBranch && selectedBranch.name !== 'Central Warehouse' ? selectedBranch.id : null
      
      const [entriesData, categoriesData, dailyData, monthlyData, statsData] = await Promise.all([
        CashflowService.getEntries({ ...filters, branchId }),
        CashflowService.getCategories(),
        CashflowService.getDailySummaries(branchId),
        CashflowService.getMonthlySummary(branchId),
        CashflowService.getStats({ ...filters, branchId })
      ])

      setEntries(entriesData)
      setCategories(categoriesData)
      setDailySummaries(dailyData)
      setMonthlySummary(monthlyData)
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching cashflow data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch cashflow data')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch, filters])

  // Create new entry
  const createEntry = useCallback(async (entry: NewCashflowEntry) => {
    try {
      const newEntry = await CashflowService.createEntry(entry)
      setEntries(prev => [newEntry, ...prev])
      await fetchData() // Refresh all data to update summaries
      return newEntry
    } catch (err) {
      console.error('Error creating entry:', err)
      throw err
    }
  }, [fetchData])

  // Update entry
  const updateEntry = useCallback(async (id: string, updates: Partial<NewCashflowEntry>) => {
    try {
      const updatedEntry = await CashflowService.updateEntry(id, updates)
      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry))
      await fetchData() // Refresh all data to update summaries
      return updatedEntry
    } catch (err) {
      console.error('Error updating entry:', err)
      throw err
    }
  }, [fetchData])

  // Delete entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      await CashflowService.deleteEntry(id)
      setEntries(prev => prev.filter(entry => entry.id !== id))
      await fetchData() // Refresh all data to update summaries
    } catch (err) {
      console.error('Error deleting entry:', err)
      throw err
    }
  }, [fetchData])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<CashflowFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Get filtered entries
  const filteredEntries = entries.filter(entry => {
    if (filters.startDate && entry.entry_date < filters.startDate) return false
    if (filters.endDate && entry.entry_date > filters.endDate) return false
    if (filters.entryType && filters.entryType !== 'all' && entry.entry_type !== filters.entryType) return false
    if (filters.category && entry.category !== filters.category) return false
    if (filters.minAmount && entry.amount < filters.minAmount) return false
    if (filters.maxAmount && entry.amount > filters.maxAmount) return false
    return true
  })

  // Get expense categories
  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  
  // Get income categories
  const incomeCategories = categories.filter(cat => cat.type === 'income')

  // Get sales categories (treat as income)
  const salesCategories = categories.filter(cat => cat.type === 'income' && cat.name.toLowerCase().includes('sale'))

  // Calculate daily net amounts
  const dailyNetAmounts = dailySummaries.map(summary => ({
    date: summary.summary_date,
    netAmount: summary.net_amount,
    expenses: summary.total_expenses,
    income: summary.total_income,
    sales: summary.total_sales
  }))

  // Calculate monthly totals
  const monthlyTotals = monthlySummary.reduce((acc, summary) => ({
    totalExpenses: acc.totalExpenses + summary.total_expenses,
    totalIncome: acc.totalIncome + summary.total_income,
    totalSales: acc.totalSales + summary.total_sales,
    netAmount: acc.netAmount + summary.net_amount
  }), { totalExpenses: 0, totalIncome: 0, totalSales: 0, netAmount: 0 })

  // Refresh data
  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    // Data
    entries: filteredEntries,
    categories,
    expenseCategories,
    incomeCategories,
    salesCategories,
    dailySummaries,
    monthlySummary,
    stats,
    dailyNetAmounts,
    monthlyTotals,
    
    // State
    loading,
    error,
    filters,
    
    // Actions
    createEntry,
    updateEntry,
    deleteEntry,
    updateFilters,
    clearFilters,
    refreshData,
    
    // Computed
    totalEntries: filteredEntries.length,
    totalExpenses: filteredEntries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    totalIncome: filteredEntries.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + e.amount, 0),
    totalSales: filteredEntries.filter(e => e.entry_type === 'sale').reduce((sum, e) => sum + e.amount, 0),
    netAmount: filteredEntries.reduce((sum, e) => {
      if (e.entry_type === 'expense') return sum - e.amount
      return sum + e.amount
    }, 0)
  }
}
