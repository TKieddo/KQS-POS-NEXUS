import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  FileText,
  Clock,
  Target
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { CashflowEntry, DailySummary } from '../../cashflow/types/cashflow'

interface DetailedViewProps {
  entries: CashflowEntry[]
  dailySummaries: DailySummary[]
  stats: {
    totalExpenses: number
    totalIncome: number
    totalSales: number
    netAmount: number
    profitMargin: number
    topExpenseCategories: Array<{ category: string; amount: number }>
    topIncomeCategories: Array<{ category: string; amount: number }>
  }
}

export function DetailedView({ entries, dailySummaries, stats }: DetailedViewProps) {
  const { formatCurrency } = useCurrency()

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const totalRevenue = stats.totalIncome + stats.totalSales

  // Group entries by type
  const expenses = entries.filter(entry => entry.entry_type === 'expense')
  const income = entries.filter(entry => entry.entry_type === 'income')
  const sales = entries.filter(entry => entry.entry_type === 'sale')

  // Calculate averages
  const avgExpense = expenses.length > 0 ? stats.totalExpenses / expenses.length : 0
  const avgIncome = income.length > 0 ? stats.totalIncome / income.length : 0
  const avgSale = sales.length > 0 ? stats.totalSales / sales.length : 0

  // Group by month for trends
  const monthlyData = entries.reduce((acc, entry) => {
    const date = new Date(entry.entry_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = { expenses: 0, income: 0, sales: 0, count: 0 }
    }
    
    acc[monthKey].count++
    if (entry.entry_type === 'expense') acc[monthKey].expenses += entry.amount
    else if (entry.entry_type === 'income') acc[monthKey].income += entry.amount
    else if (entry.entry_type === 'sale') acc[monthKey].sales += entry.amount
    
    return acc
  }, {} as Record<string, { expenses: number; income: number; sales: number; count: number }>)

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months

  return (
    <div className="space-y-6">
      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {income.length} entries • Avg: {formatCurrency(avgIncome)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} entries • Avg: {formatCurrency(avgExpense)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(stats.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {sales.length} entries • Avg: {formatCurrency(avgSale)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Net Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(stats.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.profitMargin)} profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Expense Categories */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Expense Categories
                </h4>
                {stats.topExpenseCategories && stats.topExpenseCategories.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topExpenseCategories.map((expense) => {
                      const percentage = (expense.amount / stats.totalExpenses) * 100
                      return (
                        <div key={expense.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{expense.category}</span>
                            <span className="text-sm font-bold text-red-600">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatPercentage(percentage)}</span>
                            <span>{expenses.filter(e => e.category === expense.category).length} entries</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No expense data available</p>
                )}
              </div>
              
              {/* Income Categories */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Income Categories
                </h4>
                {stats.topIncomeCategories && stats.topIncomeCategories.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topIncomeCategories.map((income) => {
                      const percentage = (income.amount / totalRevenue) * 100
                      return (
                        <div key={income.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{income.category}</span>
                            <span className="text-sm font-bold text-green-600">
                              {formatCurrency(income.amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatPercentage(percentage)}</span>
                            <span>
                              {entries.filter(e => e.category === income.category).length} entries
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No income data available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedMonths.length > 0 ? (
                sortedMonths.map(([month, data]) => {
                  const [year, monthNum] = month.split('-')
                  const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })
                  const netAmount = data.income + data.sales - data.expenses
                  
                  return (
                    <div key={month} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">{monthName}</h4>
                        <Badge variant={netAmount >= 0 ? "default" : "destructive"} className="text-xs">
                          {formatCurrency(netAmount)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center">
                          <p className="font-medium text-green-600">{formatCurrency(data.income + data.sales)}</p>
                          <p className="text-gray-500">Income</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-red-600">{formatCurrency(data.expenses)}</p>
                          <p className="text-gray-500">Expenses</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-blue-600">{data.count}</p>
                          <p className="text-gray-500">Entries</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No monthly data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-black text-white">
                  <th className="text-left py-2 px-3 font-medium text-xs">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-xs">Type</th>
                  <th className="text-left py-2 px-3 font-medium text-xs">Category</th>
                  <th className="text-left py-2 px-3 font-medium text-xs">Description</th>
                  <th className="text-left py-2 px-3 font-medium text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 20).map(transaction => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-xs">
                      {new Date(transaction.entry_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-2 px-3">
                      <Badge 
                        variant={transaction.entry_type === 'income' || transaction.entry_type === 'sale' ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {transaction.entry_type}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs">{transaction.category}</td>
                    <td className="py-2 px-3 text-xs max-w-xs truncate" title={transaction.description}>
                      {transaction.description || '-'}
                    </td>
                    <td className={`py-2 px-3 text-xs font-medium ${transaction.entry_type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
