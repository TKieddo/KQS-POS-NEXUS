import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { CashflowEntry } from '../../cashflow/types/cashflow'

interface TrendsViewProps {
  entries: CashflowEntry[]
}

export function TrendsView({ entries }: TrendsViewProps) {
  const { formatCurrency } = useCurrency()

  // Group entries by month
  const monthlyData = entries.reduce((acc, entry) => {
    const date = new Date(entry.entry_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = { expenses: 0, income: 0, sales: 0 }
    }
    
    if (entry.entry_type === 'expense') acc[monthKey].expenses += entry.amount
    else if (entry.entry_type === 'income') acc[monthKey].income += entry.amount
    else if (entry.entry_type === 'sale') acc[monthKey].sales += entry.amount
    
    return acc
  }, {} as Record<string, { expenses: number; income: number; sales: number }>)

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      monthKey: key,
      ...data,
      netAmount: data.income + data.sales - data.expenses
    }))

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMonths.length > 0 ? (
              sortedMonths.map((monthData) => {
                const [year, month] = monthData.monthKey.split('-')
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })
                
                return (
                  <div key={monthData.monthKey} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">{monthName}</h4>
                      <Badge variant={monthData.netAmount >= 0 ? "default" : "destructive"} className="text-xs">
                        {formatCurrency(monthData.netAmount)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <p className="font-medium text-green-600">{formatCurrency(monthData.income + monthData.sales)}</p>
                        <p className="text-gray-500">Income</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-red-600">{formatCurrency(monthData.expenses)}</p>
                        <p className="text-gray-500">Expenses</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-blue-600">{formatCurrency(monthData.sales)}</p>
                        <p className="text-gray-500">Sales</p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No trend data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
