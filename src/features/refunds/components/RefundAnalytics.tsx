import React from 'react'
import { BarChart3, PieChart, TrendingUp, DollarSign, AlertCircle, Users } from 'lucide-react'
import { RefundAnalytics as RefundAnalyticsType } from '../types'

interface RefundAnalyticsProps {
  analytics: RefundAnalyticsType
}

export const RefundAnalytics: React.FC<RefundAnalyticsProps> = ({ analytics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Refund Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into refund patterns and trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-gray-100">
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-3 h-3 rounded-full bg-[#E5FF29]"></div>
              <span>Refunds</span>
              <div className="w-3 h-3 rounded-full bg-black"></div>
              <span>Amount</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.monthlyTrends?.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{trend.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-8 bg-[#E5FF29] rounded-lg transition-all duration-300 hover:bg-[#E5FF29]/80"
                      style={{ width: `${(trend.refunds / Math.max(...analytics.monthlyTrends.map(t => t.refunds))) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 min-w-[40px]">{trend.refunds}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div 
                      className="h-4 bg-black rounded transition-all duration-300 hover:bg-black/80"
                      style={{ width: `${(trend.amount / Math.max(...analytics.monthlyTrends.map(t => t.amount))) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 min-w-[40px]">{formatCurrency(trend.amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Methods Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Refund Methods</h3>
            <div className="p-2 rounded-lg bg-gray-100">
              <PieChart className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.refundMethods?.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-[#E5FF29]' :
                    index === 1 ? 'bg-black' :
                    index === 2 ? 'bg-[#E5FF29]/60' :
                    'bg-black/60'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {method.method.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{method.count}</div>
                  <div className="text-xs text-gray-500">{formatCurrency(method.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Refund Reasons */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Refund Reasons</h3>
            <div className="p-2 rounded-lg bg-gray-100">
              <AlertCircle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.topRefundReasons?.slice(0, 5).map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{reason.reason}</span>
                    <span className="text-xs text-gray-500">{formatPercentage(reason.percentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#E5FF29] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${reason.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products with Refunds */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Refunded Products</h3>
            <div className="p-2 rounded-lg bg-gray-100">
              <DollarSign className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {analytics.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.product.name}</p>
                  <p className="text-xs text-gray-500">{product.product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{product.refundCount}</div>
                  <div className="text-xs text-gray-500">{formatCurrency(product.refundAmount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20 rounded-xl p-4 border border-[#E5FF29]/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#E5FF29] text-black">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">Refund Rate</p>
              <p className="text-xl font-bold text-black">{formatPercentage(analytics.refundRate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-xl p-4 border border-black/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-black text-[#E5FF29]">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">Avg Refund</p>
              <p className="text-xl font-bold text-black">{formatCurrency(analytics.averageRefundAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20 rounded-xl p-4 border border-[#E5FF29]/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#E5FF29] text-black">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">This Month</p>
              <p className="text-xl font-bold text-black">{analytics.refundsThisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black/5 to-black/10 rounded-xl p-4 border border-black/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-black text-[#E5FF29]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-black">This Week</p>
              <p className="text-xl font-bold text-black">{analytics.refundsThisWeek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 