import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, Target, BarChart3, DollarSign, TrendingDown } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Product } from '../hooks/useInventory'

interface ProfitAnalysisProps {
  products: Product[]
}

export function ProfitAnalysis({ products }: ProfitAnalysisProps) {
  const { formatCurrency } = useCurrency()

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const totalCost = products.reduce((sum, product) => {
    const cost = (product.cost_price || 0) * (product.stock_quantity || 0)
    return sum + (isNaN(cost) ? 0 : cost)
  }, 0)

  const totalValue = products.reduce((sum, product) => {
    const value = (product.price || 0) * (product.stock_quantity || 0)
    return sum + (isNaN(value) ? 0 : value)
  }, 0)

  const totalProfit = totalValue - totalCost
  const profitMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0

  const topProfitableProducts = products
    .map(product => {
      const profit = ((product.price || 0) - (product.cost_price || 0)) * (product.stock_quantity || 0)
      const profitMargin = (product.price || 0) > 0 ? (((product.price || 0) - (product.cost_price || 0)) / (product.price || 0)) * 100 : 0
      return {
        ...product,
        profit: isNaN(profit) ? 0 : profit,
        profitMargin: isNaN(profitMargin) ? 0 : profitMargin
      }
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)

  const highMarginProducts = products
    .map(product => {
      const profitMargin = (product.price || 0) > 0 ? (((product.price || 0) - (product.cost_price || 0)) / (product.price || 0)) * 100 : 0
      return {
        ...product,
        profitMargin: isNaN(profitMargin) ? 0 : profitMargin
      }
    })
    .filter(product => product.profitMargin > 0)
    .sort((a, b) => b.profitMargin - a.profitMargin)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Profit Summary Card */}
      <Card className="bg-gradient-to-br from-black to-gray-900 border-0 shadow-2xl rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold text-white">
            <div className="w-8 h-8 bg-[#E5FF29] rounded-2xl flex items-center justify-center mr-3">
              <Calculator className="h-4 w-4 text-black" />
            </div>
            Profit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-1">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-xs font-medium text-gray-300 mb-1">Total Cost</p>
              <p className="text-lg font-bold text-red-400">{formatCurrency(totalCost)}</p>
            </div>
            
            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-8 h-8 bg-[#E5FF29]/20 rounded-xl flex items-center justify-center mx-auto mb-1">
                <DollarSign className="h-4 w-4 text-[#E5FF29]" />
              </div>
              <p className="text-xs font-medium text-gray-300 mb-1">Total Value</p>
              <p className="text-lg font-bold text-[#E5FF29]">{formatCurrency(totalValue)}</p>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-[#E5FF29]/20 to-white/10 rounded-2xl border border-[#E5FF29]/30">
              <div className="w-8 h-8 bg-[#E5FF29] rounded-xl flex items-center justify-center mx-auto mb-1">
                <TrendingUp className="h-4 w-4 text-black" />
              </div>
              <p className="text-xs font-medium text-gray-300 mb-1">Expected Profit</p>
              <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-[#E5FF29]' : 'text-red-400'}`}>
                {formatCurrency(totalProfit)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatPercentage(profitMargin)} profit margin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Profitable Products */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-0 shadow-2xl rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold text-white">
              <div className="w-6 h-6 bg-[#E5FF29] rounded-lg flex items-center justify-center mr-2">
                <TrendingUp className="h-3 w-3 text-black" />
              </div>
              Top Profitable Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProfitableProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E5FF29] rounded-xl flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        {product.stock_quantity || 0} units in stock
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#E5FF29] text-xs">
                      {formatCurrency(product.profit)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatPercentage(product.profitMargin)} margin
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Margin Products */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-0 shadow-2xl rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold text-white">
              <div className="w-6 h-6 bg-[#E5FF29] rounded-lg flex items-center justify-center mr-2">
                <Target className="h-3 w-3 text-black" />
              </div>
              Highest Profit Margins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highMarginProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E5FF29] rounded-xl flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(product.cost_price || 0)} → {formatCurrency(product.price || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#E5FF29] text-black border-0 px-2 py-0.5 font-semibold text-xs">
                      {formatPercentage(product.profitMargin)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-black to-gray-900 border-0 shadow-2xl rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-semibold text-white">
            <div className="w-6 h-6 bg-[#E5FF29] rounded-lg flex items-center justify-center mr-2">
              <BarChart3 className="h-3 w-3 text-black" />
            </div>
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-xs font-medium text-gray-300 mb-1">Over 50% margin</p>
              <Badge className="bg-[#E5FF29] text-black border-0 font-bold px-2 py-0.5 text-xs">
                {products.filter(p => (p.price || 0) > 0 && (((p.price || 0) - (p.cost_price || 0)) / (p.price || 0)) * 100 > 50).length}
              </Badge>
            </div>
            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-xs font-medium text-gray-300 mb-1">Under 10% margin</p>
              <Badge className="bg-orange-500 text-white border-0 font-bold px-2 py-0.5 text-xs">
                {products.filter(p => (p.price || 0) > 0 && (((p.price || 0) - (p.cost_price || 0)) / (p.price || 0)) * 100 < 10).length}
              </Badge>
            </div>
            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-xs font-medium text-gray-300 mb-1">At loss</p>
              <Badge className="bg-red-500 text-white border-0 font-bold px-2 py-0.5 text-xs">
                {products.filter(p => (p.price || 0) < (p.cost_price || 0)).length}
              </Badge>
            </div>
            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-xs font-medium text-gray-300 mb-1">Avg. margin</p>
              <span className="font-bold text-[#E5FF29] text-sm">
                {formatPercentage(profitMargin)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
