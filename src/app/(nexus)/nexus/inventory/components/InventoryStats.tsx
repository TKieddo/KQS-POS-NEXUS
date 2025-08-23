import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Calculator,
  Target,
  Zap
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { InventoryStats as InventoryStatsType } from '../hooks/useInventory'

interface InventoryStatsProps {
  stats: InventoryStatsType
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  const { formatCurrency } = useCurrency()

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value) || value === undefined || value === null) {
      return '0.0%'
    }
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Products */}
      <Card className="border-l-4 border-l-blue-500 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Products</CardTitle>
          <Package className="h-3 w-3 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-blue-600">
            {stats.totalProducts.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Active inventory items
          </p>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card className="border-l-4 border-l-green-500 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Total Value</CardTitle>
          <DollarSign className="h-3 w-3 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            At selling prices
          </p>
        </CardContent>
      </Card>

      {/* Expected Profit */}
      <Card className="border-l-4 border-l-purple-500 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Expected Profit</CardTitle>
          <TrendingUp className="h-3 w-3 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-lg font-bold ${stats.expectedProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            {formatCurrency(stats.expectedProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(stats.averageProfitMargin)} avg margin
          </p>
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      <Card className="border-l-4 border-l-orange-500 rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium">Stock Alerts</CardTitle>
          <AlertTriangle className="h-3 w-3 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs">Low Stock:</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                {stats.lowStockItems}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Out of Stock:</span>
              <Badge variant="destructive" className="text-xs">
                {stats.outOfStockItems}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
