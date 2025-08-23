import { CashflowEntry, DailySummary, MonthlySummary } from '../../cashflow/types/cashflow'

export type TimePeriod = '1month' | '3months' | '6months' | '1year' | 'custom'

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface FilteredStats {
  totalExpenses: number
  totalIncome: number
  totalSales: number
  netAmount: number
  profitMargin: number
  topExpenseCategories: Array<{ category: string; amount: number }>
  topIncomeCategories: Array<{ category: string; amount: number }>
}

export function getDateRangeForPeriod(
  period: TimePeriod, 
  customStartDate?: string, 
  customEndDate?: string
): DateRange {
  const now = new Date()
  const endDate = new Date(now)
  
  if (period === 'custom' && customStartDate && customEndDate) {
    return {
      startDate: new Date(customStartDate),
      endDate: new Date(customEndDate)
    }
  }

  let startDate: Date
  
  switch (period) {
    case '1month':
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
      break
    case '3months':
      startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000))
      break
    case '6months':
      startDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000))
      break
    case '1year':
      startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000))
      break
    default:
      startDate = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)) // Default to 6 months
  }
  
  return { startDate, endDate }
}

export function filterEntriesByDateRange(entries: any[], dateRange: DateRange): any[] {
  return entries.filter(entry => {
    const entryDate = new Date(entry.entry_date)
    return entryDate >= dateRange.startDate && entryDate <= dateRange.endDate
  })
}

export function filterDailySummariesByDateRange(summaries: any[], dateRange: DateRange): any[] {
  return summaries.filter(summary => {
    const summaryDate = new Date(summary.summary_date)
    return summaryDate >= dateRange.startDate && summaryDate <= dateRange.endDate
  })
}

// Note: MonthlySummary doesn't have date fields, so we'll return all for now
// In a real implementation, you'd need to add date fields to the MonthlySummary type
export function filterMonthlySummariesByDateRange(summaries: MonthlySummary[], dateRange: DateRange): MonthlySummary[] {
  // For now, return all summaries since MonthlySummary doesn't have date fields
  // TODO: Add date fields to MonthlySummary type if needed
  return summaries
}

export function calculateFilteredStats(entries: any[]): FilteredStats {
  const expenses = entries
    .filter(entry => entry.entry_type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0)
  
  const income = entries
    .filter(entry => entry.entry_type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0)
  
  const sales = entries
    .filter(entry => entry.entry_type === 'sale')
    .reduce((sum, entry) => sum + entry.amount, 0)

  const netAmount = income + sales - expenses
  const totalRevenue = income + sales
  const profitMargin = totalRevenue > 0 ? (netAmount / totalRevenue) * 100 : 0

  // Calculate top categories
  const expenseByCategory = entries
    .filter(entry => entry.entry_type === 'expense')
    .reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount
      return acc
    }, {} as Record<string, number>)

  const incomeByCategory = entries
    .filter(entry => entry.entry_type === 'income')
    .reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount
      return acc
    }, {} as Record<string, number>)

  const topExpenseCategories = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({ category, amount: amount as number }))
    .sort((a, b) => (b.amount as number) - (a.amount as number))
    .slice(0, 5)

  const topIncomeCategories = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({ category, amount: amount as number }))
    .sort((a, b) => (b.amount as number) - (a.amount as number))
    .slice(0, 5)

  return {
    totalExpenses: expenses,
    totalIncome: income,
    totalSales: sales,
    netAmount,
    profitMargin,
    topExpenseCategories,
    topIncomeCategories
  }
}

export function getComparisonData(entries: CashflowEntry[], currentRange: DateRange, previousRange: DateRange) {
  const currentEntries = filterEntriesByDateRange(entries, currentRange)
  const previousEntries = filterEntriesByDateRange(entries, previousRange)
  
  const currentStats = calculateFilteredStats(currentEntries)
  const previousStats = calculateFilteredStats(previousEntries)
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }
  
  return {
    current: currentStats,
    previous: previousStats,
    changes: {
      expenses: calculateChange(currentStats.totalExpenses, previousStats.totalExpenses),
      income: calculateChange(currentStats.totalIncome, previousStats.totalIncome),
      sales: calculateChange(currentStats.totalSales, previousStats.totalSales),
      netAmount: calculateChange(currentStats.netAmount, previousStats.netAmount),
      profitMargin: currentStats.profitMargin - previousStats.profitMargin
    }
  }
}
