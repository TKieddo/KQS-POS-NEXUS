import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { CashflowEntry, DailySummary } from '../../cashflow/types/cashflow'

interface OverviewViewProps {
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

export function OverviewView({ entries, dailySummaries, stats }: OverviewViewProps) {
  const { formatCurrency } = useCurrency()

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const totalRevenue = stats.totalIncome + stats.totalSales

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
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
              Service fees & other income
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
              All expense categories
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
              Product sales revenue
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

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Top Expenses</h4>
                {stats.topExpenseCategories && stats.topExpenseCategories.length > 0 ? (
                  stats.topExpenseCategories.map((expense) => (
                    <div key={expense.category} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{expense.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(expense.amount)}</p>
                        <p className="text-xs text-gray-500">
                          {formatPercentage((expense.amount / stats.totalExpenses) * 100)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No expense data available</p>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Top Income Sources</h4>
                {stats.topIncomeCategories && stats.topIncomeCategories.length > 0 ? (
                  stats.topIncomeCategories.map((income) => (
                    <div key={income.category} className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{income.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(income.amount)}</p>
                        <p className="text-xs text-gray-500">
                          {formatPercentage((income.amount / totalRevenue) * 100)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No income data available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Summaries */}
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailySummaries.length > 0 ? (
                dailySummaries.slice(0, 7).map((summary) => (
                  <div key={summary.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {new Date(summary.summary_date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(summary.summary_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expenses: {formatCurrency(summary.total_expenses)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${summary.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Net: {formatCurrency(summary.net_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sales: {formatCurrency(summary.total_sales)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No daily data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
