'use client'

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LaybyeAnalyticsProps {
  analytics: {
    totalLaybyes: number
    activeLaybyes: number
    completedThisMonth: number
    overdueLaybyes: number
    totalValue: number
    outstandingBalance: number
    averagePaymentTime: number
    collectionRate: number
    monthlyTrends: Array<{
      month: string
      newLaybyes: number
      completed: number
      revenue: number
    }>
    topCustomers: Array<{
      name: string
      totalLaybyes: number
      totalValue: number
      averagePaymentTime: number
    }>
    paymentPatterns: {
      onTime: number
      late: number
      veryLate: number
    }
  }
}

export function LaybyeAnalytics({ analytics }: LaybyeAnalyticsProps) {
  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (value < threshold) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <TrendingUp className="h-4 w-4 text-gray-400" />
  }

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lay-byes</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {analytics.totalLaybyes}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.activeLaybyes} active
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                ${analytics.totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${analytics.outstandingBalance.toLocaleString()} outstanding
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className={`text-2xl font-bold ${getCollectionRateColor(analytics.collectionRate)}`}>
                {analytics.collectionRate}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.collectionRate, 80)}
                <p className="text-xs text-gray-500">vs target</p>
              </div>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Payment Time</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {analytics.averagePaymentTime} days
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.averagePaymentTime, 30)}
                <p className="text-xs text-gray-500">payment cycle</p>
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Patterns */}
        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-4">
            Payment Patterns
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">On Time</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {analytics.paymentPatterns.onTime}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Late (1-7 days)</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {analytics.paymentPatterns.late}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Very Late (8+ days)</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {analytics.paymentPatterns.veryLate}%
              </span>
            </div>
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-4">
            Top Lay-bye Customers
          </h3>
          <div className="space-y-3">
            {analytics.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--primary))]">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.totalLaybyes} lay-byes • {customer.averagePaymentTime} days avg.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[hsl(var(--primary))]">
                    ${customer.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">total value</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-4">
          Monthly Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {analytics.monthlyTrends.slice(-4).map((trend, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{trend.month}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">New:</span>
                  <span className="font-medium text-blue-600">{trend.newLaybyes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed:</span>
                  <span className="font-medium text-green-600">{trend.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue:</span>
                  <span className="font-medium text-[hsl(var(--primary))]">
                    ${trend.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 