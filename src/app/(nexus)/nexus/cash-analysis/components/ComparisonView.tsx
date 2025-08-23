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
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { CashflowEntry } from '../../cashflow/types/cashflow'
import { getComparisonData, DateRange } from '../utils/dataFilters'

interface ComparisonViewProps {
  entries: CashflowEntry[]
  currentRange: DateRange
  previousRange: DateRange
}

export function ComparisonView({ entries, currentRange, previousRange }: ComparisonViewProps) {
  const { formatCurrency } = useCurrency()

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const comparison = getComparisonData(entries, currentRange, previousRange)

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatDateRange = (range: DateRange) => {
    const start = range.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const end = range.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${start} - ${end}`
  }

  return (
    <div className="space-y-6">
      {/* Period Comparison Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Period</CardTitle>
            <p className="text-xs text-gray-500">{formatDateRange(currentRange)}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Income:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(comparison.current.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Expenses:</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(comparison.current.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Sales:</span>
                <span className="text-sm font-medium text-blue-600">
                  {formatCurrency(comparison.current.totalSales)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-xs font-medium">Net:</span>
                <span className={`text-sm font-bold ${comparison.current.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.current.netAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Previous Period</CardTitle>
            <p className="text-xs text-gray-500">{formatDateRange(previousRange)}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Income:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(comparison.previous.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Expenses:</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(comparison.previous.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Sales:</span>
                <span className="text-sm font-medium text-blue-600">
                  {formatCurrency(comparison.previous.totalSales)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-xs font-medium">Net:</span>
                <span className={`text-sm font-bold ${comparison.previous.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.previous.netAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Analysis */}
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Period Comparison Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Income Change */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-green-800">Income</h4>
                {getChangeIcon(comparison.changes.income)}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(comparison.current.totalIncome)}
                </p>
                <p className={`text-xs font-medium ${getChangeColor(comparison.changes.income)}`}>
                  {comparison.changes.income > 0 ? '+' : ''}{formatPercentage(comparison.changes.income)}
                </p>
                <p className="text-xs text-gray-500">
                  vs {formatCurrency(comparison.previous.totalIncome)}
                </p>
              </div>
            </div>

            {/* Expenses Change */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-red-800">Expenses</h4>
                {getChangeIcon(-comparison.changes.expenses)}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(comparison.current.totalExpenses)}
                </p>
                <p className={`text-xs font-medium ${getChangeColor(-comparison.changes.expenses)}`}>
                  {comparison.changes.expenses > 0 ? '+' : ''}{formatPercentage(comparison.changes.expenses)}
                </p>
                <p className="text-xs text-gray-500">
                  vs {formatCurrency(comparison.previous.totalExpenses)}
                </p>
              </div>
            </div>

            {/* Sales Change */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-800">Sales</h4>
                {getChangeIcon(comparison.changes.sales)}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(comparison.current.totalSales)}
                </p>
                <p className={`text-xs font-medium ${getChangeColor(comparison.changes.sales)}`}>
                  {comparison.changes.sales > 0 ? '+' : ''}{formatPercentage(comparison.changes.sales)}
                </p>
                <p className="text-xs text-gray-500">
                  vs {formatCurrency(comparison.previous.totalSales)}
                </p>
              </div>
            </div>

            {/* Net Profit Change */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-purple-800">Net Profit</h4>
                {getChangeIcon(comparison.changes.netAmount)}
              </div>
              <div className="space-y-1">
                <p className={`text-lg font-bold ${comparison.current.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.current.netAmount)}
                </p>
                <p className={`text-xs font-medium ${getChangeColor(comparison.changes.netAmount)}`}>
                  {comparison.changes.netAmount > 0 ? '+' : ''}{formatPercentage(comparison.changes.netAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  vs {formatCurrency(comparison.previous.netAmount)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
