'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Calendar, 
  RefreshCw, 
  BarChart3,
  DollarSign,
  Users,
  Package,
  Clock,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TransactionsHistory } from '@/features/sales/components/TransactionsHistory'
import { CashupManagement } from '@/features/sales/components/CashupManagement'
import { LaybyeManagement } from '@/features/sales/components/LaybyeManagement'
import { RefundsManagement } from '@/features/sales/components/RefundsManagement'
import { CreditSalesManagement } from '@/features/sales/components/CreditSalesManagement'
import { formatCurrency } from '@/lib/utils'
import { getSalesStats, getSales } from '@/lib/sales-service'
import { getLaybyeStats } from '@/lib/laybye-service'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'cashup', label: 'Cashup', icon: DollarSign },
  { id: 'laybyes', label: 'Lay-byes', icon: Calendar },
  { id: 'refunds', label: 'Refunds', icon: RefreshCw },
  { id: 'credit', label: 'Credit Sales', icon: CreditCard }
]

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [salesData, setSalesData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { selectedBranch } = useBranch()

  useEffect(() => {
    loadSalesData()
  }, [selectedBranch])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      
      // Get sales statistics
      const statsResult = await getSalesStats('today', selectedBranch?.id)
      
      // Get laybye statistics for selected branch
      const laybyeStatsResult = await getLaybyeStats(selectedBranch?.id)
      
      if (statsResult.success && statsResult.data) {
        setSalesData({
          todaySales: {
            total: statsResult.data.revenueToday,
            transactions: statsResult.data.salesToday,
            average: statsResult.data.salesToday > 0 ? statsResult.data.revenueToday / statsResult.data.salesToday : 0,
            cash: statsResult.data.paymentMethodBreakdown.cash,
            card: statsResult.data.paymentMethodBreakdown.card,
            credit: statsResult.data.paymentMethodBreakdown.credit,
            mpesa: statsResult.data.paymentMethodBreakdown.mpesa,
            ecocash: statsResult.data.paymentMethodBreakdown.ecocash
          },
          thisWeek: {
            total: statsResult.data.revenueThisWeek,
            transactions: statsResult.data.salesThisWeek,
            average: statsResult.data.salesThisWeek > 0 ? statsResult.data.revenueThisWeek / statsResult.data.salesThisWeek : 0,
            growth: 0 // TODO: Calculate growth
          },
          thisMonth: {
            total: statsResult.data.revenueThisMonth,
            transactions: statsResult.data.salesThisMonth,
            average: statsResult.data.salesThisMonth > 0 ? statsResult.data.revenueThisMonth / statsResult.data.salesThisMonth : 0,
            growth: 0 // TODO: Calculate growth
          },
          pendingLaybyes: laybyeStatsResult.success ? laybyeStatsResult.data?.activeLaybyeOrders || 0 : 0,
          overdueCredit: 0, // TODO: Get from credit service
          pendingRefunds: 0 // TODO: Get from refunds service
        })
      } else {
        console.error('Failed to load sales data:', statsResult.error)
        toast.error('Failed to load sales data')
      }
    } catch (error) {
      console.error('Error loading sales data:', error)
      toast.error('Error loading sales data')
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SalesOverview data={salesData} loading={loading} />
      case 'transactions':
        return <TransactionsHistory />
      case 'cashup':
        return <CashupManagement />
      case 'laybyes':
        return <LaybyeManagement />
      case 'refunds':
        return <RefundsManagement />
      case 'credit':
        return <CreditSalesManagement />
      default:
        return null
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Sales</h1>
          <p className="text-base text-muted-foreground mt-1">
            Track sales performance, manage cashup, and handle transactions
            {selectedBranch && selectedBranch.id !== '00000000-0000-0000-0000-000000000001' && (
              <span className="ml-2 text-sm text-muted-foreground">
                • {selectedBranch.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="border-gray-200 hover:bg-gray-50"
            onClick={loadSalesData}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-full font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-[#E5FF29] shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  )
}

// Sales Overview Component
function SalesOverview({ data, loading }: { data: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No sales data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(data.todaySales.total)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {data.todaySales.transactions} transactions
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(data.thisWeek.total)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {data.thisWeek.transactions} transactions
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(data.thisMonth.total)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {data.thisMonth.transactions} transactions
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Order</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(data.todaySales.average)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Per transaction
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-4">
          Payment Methods (Today)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.todaySales.cash)}
            </div>
            <div className="text-sm text-gray-600">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.todaySales.card)}
            </div>
            <div className="text-sm text-gray-600">Card</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.todaySales.credit)}
            </div>
            <div className="text-sm text-gray-600">Credit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.todaySales.mpesa)}
            </div>
            <div className="text-sm text-gray-600">Mpesa</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(data.todaySales.ecocash)}
            </div>
            <div className="text-sm text-gray-600">Ecocash</div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <span>Start Cashup</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6" />
            <span>Process Refund</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span>View Lay-byes</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <span>Generate Report</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
