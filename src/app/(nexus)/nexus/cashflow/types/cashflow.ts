export interface CashflowEntry {
  id: string
  branch_id: string
  branch_name?: string
  entry_type: 'expense' | 'income' | 'sale'
  category: string
  description?: string
  amount: number
  receipt_url?: string
  entry_date: string
  created_by?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface CashflowCategory {
  id: string
  name: string
  type: 'expense' | 'income'
  description?: string
  color: string
  is_active: boolean
  created_at: string
}

export interface DailySummary {
  id: string
  branch_id: string
  branch_name?: string
  summary_date: string
  total_expenses: number
  total_income: number
  total_sales: number
  net_amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface MonthlySummary {
  branch_id: string
  branch_name: string
  total_expenses: number
  total_income: number
  total_sales: number
  net_amount: number
  days_with_entries: number
}

export interface CashflowStats {
  totalEntries: number
  totalExpenses: number
  totalIncome: number
  totalSales: number
  netAmount: number
  averageDailyNet: number
  topExpenseCategories: Array<{ category: string; amount: number; count: number }>
  topIncomeCategories: Array<{ category: string; amount: number; count: number }>
}

export interface CashflowFilters {
  startDate?: string
  endDate?: string
  entryType?: 'expense' | 'income' | 'sale' | 'all'
  category?: string
  branchId?: string
  minAmount?: number
  maxAmount?: number
}

export interface NewCashflowEntry {
  branch_id: string
  entry_type: 'expense' | 'income' | 'sale'
  category: string
  description?: string
  amount: number
  receipt_url?: string
  entry_date: string
}
