import React from 'react'
import { formatCurrency } from '@/lib/utils'
import { Users, CreditCard, Crown, TrendingUp, AlertTriangle, Gift, DollarSign, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { CustomerStats } from '../types'

interface CustomerStatsCardsProps {
  stats: CustomerStats
}

export const CustomerStatsCards = ({ stats }: CustomerStatsCardsProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Customers */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-blue-900">{formatNumber(stats.totalCustomers)}</p>
            <p className="text-xs text-blue-600 mt-1">
              {stats.newCustomersThisMonth} new this month
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Credit Accounts */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600 mb-1">Credit Accounts</p>
            <p className="text-3xl font-bold text-orange-900">{formatNumber(stats.creditAccounts)}</p>
            <p className="text-xs text-orange-600 mt-1">
              {formatCurrency(stats.totalCreditOutstanding)} outstanding
            </p>
          </div>
          <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Loyalty Members */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600 mb-1">Loyalty Members</p>
            <p className="text-3xl font-bold text-purple-900">{formatNumber(stats.loyaltyAccounts)}</p>
            <p className="text-xs text-purple-600 mt-1">
              Active reward program
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      {/* Overdue Accounts */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">Overdue Accounts</p>
            <p className="text-3xl font-bold text-red-900">{formatNumber(stats.customersWithOverdue)}</p>
            <p className="text-xs text-red-600 mt-1">
              Requires attention
            </p>
          </div>
          <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>
    </div>
  )
} 