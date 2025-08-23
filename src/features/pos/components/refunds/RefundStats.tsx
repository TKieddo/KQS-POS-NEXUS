'use client'

import React from 'react'
import { Receipt, RefreshCw, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface RefundStatsProps {
  stats: {
    totalSales: number
    totalRefunds: number
    totalRefundedAmount: number
    todayRefunds: number
    pendingRefunds: number
  }
}

export const RefundStats: React.FC<RefundStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {/* Header with summary badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-600">Process returns and manage refunds</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <TrendingDown className="h-3 w-3 mr-1" />
            {stats.totalRefunds} Total Refunds
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-lg font-semibold">{stats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-lg font-semibold">{stats.totalRefunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Refunds</p>
                <p className="text-lg font-semibold">{stats.pendingRefunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Refunded Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.totalRefundedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 