'use client'

import { useState, useEffect } from 'react'
import { RefundStatsCards } from '@/features/refunds/components/RefundStatsCards'
import { RefundAnalytics } from '@/features/refunds/components/RefundAnalytics'
import { RefundFilters } from '@/features/refunds/components/RefundFilters'
import { RefundsTable, TableItem } from '@/features/refunds/components/RefundsTable'
import { RefundDetailsModal, DetailsItem } from '@/features/refunds/components/RefundDetailsModal'
import { RefundProcessModal, ProcessItem } from '@/features/refunds/components/RefundProcessModal'
import { RefundAdminService, AdminRefundStats, AdminRefundAnalytics, AdminRefundItem } from '@/lib/refund-admin-service'
import { RefundFilters as RefundFiltersType, RefundAnalytics as RefundAnalyticsType, RefundStats as RefundStatsType } from '@/features/refunds/types'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function RefundsPage() {
  const { selectedBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [refunds, setRefunds] = useState<AdminRefundItem[]>([])
  const [stats, setStats] = useState<AdminRefundStats | null>(null)
  const [analytics, setAnalytics] = useState<AdminRefundAnalytics | null>(null)
  const [selectedItem, setSelectedItem] = useState<DetailsItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [processItem, setProcessItem] = useState<ProcessItem | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [filters, setFilters] = useState<RefundFiltersType>({
    search: '',
    status: 'all',
    refundMethod: 'all',
    dateRange: 'all'
  })

  useEffect(() => {
    loadRefundData()
  }, [selectedBranch])

  const loadRefundData = async () => {
    try {
      setLoading(true)
      
      // Load refund statistics
      const statsResult = await RefundAdminService.getRefundStats(selectedBranch?.id)
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      } else {
        console.error('Failed to load refund stats:', statsResult.error)
        toast.error('Failed to load refund statistics')
      }

      // Load refund analytics
      const analyticsResult = await RefundAdminService.getRefundAnalytics(selectedBranch?.id, 'week')
      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data)
      } else {
        console.error('Failed to load refund analytics:', analyticsResult.error)
        toast.error('Failed to load refund analytics')
      }

      // Load refund history
      const historyResult = await RefundAdminService.getRefundHistory(selectedBranch?.id, 50)
      if (historyResult.success && historyResult.data) {
        setRefunds(historyResult.data)
      } else {
        console.error('Failed to load refund history:', historyResult.error)
        toast.error('Failed to load refund history')
      }
    } catch (error) {
      console.error('Error loading refund data:', error)
      toast.error('Error loading refund data')
    } finally {
      setLoading(false)
    }
  }

  // Transform real data to match component interfaces
  const transformStatsForComponents = () => {
    if (!stats) return null
    
    return {
      totalRefunds: stats.totalRefunds,
      totalRefundAmount: stats.totalAmount,
      refundsThisMonth: stats.thisMonthRefunds,
      refundsThisWeek: stats.thisWeekRefunds,
      averageRefundAmount: stats.totalRefunds > 0 ? stats.totalAmount / stats.totalRefunds : 0,
      topRefundReasons: Object.entries(stats.byStatus || {}).map(([status, count]) => ({
        reason: status,
        count,
        percentage: stats.totalRefunds > 0 ? (count / stats.totalRefunds) * 100 : 0
      })),
      refundMethods: Object.entries(stats.byMethod || {}).map(([method, count]) => ({
        method,
        count,
        amount: 0 // We don't have amount breakdown in current stats
      }))
    }
  }

  const transformAnalyticsForComponents = () => {
    if (!analytics) return null
    
    return {
      totalRefunds: 0, // Will be calculated from data
      totalRefundAmount: 0, // Will be calculated from data
      refundsThisMonth: 0,
      refundsThisWeek: 0,
      averageRefundAmount: 0,
      refundRate: 0,
      monthlyTrends: analytics.dailyRefunds?.map(item => ({
        month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        refunds: item.count,
        amount: item.amount,
        percentage: 0 // Will be calculated
      })) || [],
      topRefundReasons: analytics.topReasons?.map(item => ({
        reason: item.reason,
        count: item.count,
        percentage: 0, // Will be calculated
        totalAmount: item.amount
      })) || [],
      refundMethods: analytics.methodBreakdown?.map(item => ({
        method: item.method,
        count: item.count,
        amount: item.amount,
        percentage: 0 // Will be calculated
      })) || [],
      topProducts: [], // Not available in current analytics
      customerRefunds: [] // Not available in current analytics
    }
  }

  const transformRefundsForTable = (): TableItem[] => {
    return refunds.map(refund => ({
      id: refund.id,
      type: 'refund' as const,
      transactionId: refund.refund_number,
      customer: {
        id: '', // We don't have customer ID in the current data
        name: refund.customer_name || 'Unknown Customer',
        email: refund.customer_email || '',
        phone: refund.customer_phone || ''
      },
      items: [], // We'll load this when viewing details
      totalRefundAmount: refund.refund_amount,
      refundMethod: refund.refund_method as 'cash' | 'account_credit' | 'loyalty_points' | 'exchange_only',
      refundReason: refund.reason,
      processedBy: refund.processed_by_name || 'Unknown',
      processedAt: refund.processed_at,
      status: refund.status as 'pending' | 'approved' | 'completed' | 'rejected',
      notes: '',
      receiptNumber: refund.refund_number
    }))
  }

  const filteredItems = transformRefundsForTable().filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.refundMethod !== 'all' && item.type === 'refund' && item.refundMethod !== filters.refundMethod) return false
    if (filters.search && !item.customer.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !(item.type === 'refund' ? item.transactionId : item.originalTransactionId).toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const handleFilterChange = (newFilters: RefundFiltersType) => {
    setFilters(newFilters)
  }

  const handleNewRefund = () => {
    // Navigate to POS refunds page
    window.open('/pos/refunds', '_blank')
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon')
  }

  const handleBulkApprove = () => {
    // TODO: Implement bulk approve functionality
    toast.info('Bulk approve functionality coming soon')
  }

  const handleViewDetails = async (item: TableItem) => {
    try {
      const detailsResult = await RefundAdminService.getRefundDetails(item.id)
      if (detailsResult.success && detailsResult.data) {
        const details: DetailsItem = {
          id: detailsResult.data.id,
          type: 'refund' as const,
          transactionId: detailsResult.data.refund_number,
          customer: {
            id: detailsResult.data.customer.id,
            name: detailsResult.data.customer.name,
            email: detailsResult.data.customer.email,
            phone: detailsResult.data.customer.phone,
            accountBalance: detailsResult.data.customer.account_balance
          },
          items: detailsResult.data.items.map(item => ({
            id: item.id,
            product: {
              id: item.id,
              name: item.product_name,
              sku: item.sku,
              price: item.unit_price,
              cost: 0,
              stockQuantity: 0,
              category: ''
            },
            quantity: item.quantity,
            originalPrice: item.unit_price,
            refundAmount: item.refund_amount,
            reason: item.reason,
            condition: 'new' as const,
            notes: ''
          })),
          totalRefundAmount: detailsResult.data.refund_amount,
          refundMethod: detailsResult.data.refund_method as 'cash' | 'account_credit' | 'loyalty_points' | 'exchange_only',
          refundReason: detailsResult.data.reason,
          processedBy: detailsResult.data.processed_by,
          processedAt: detailsResult.data.processed_at,
          status: detailsResult.data.status as 'pending' | 'approved' | 'completed' | 'rejected',
          notes: detailsResult.data.notes || '',
          receiptNumber: detailsResult.data.refund_number
        }
        setSelectedItem(details)
    setShowDetailsModal(true)
      } else {
        toast.error('Failed to load refund details')
      }
    } catch (error) {
      console.error('Error loading refund details:', error)
      toast.error('Error loading refund details')
    }
  }

  const handleApprove = async (item: DetailsItem) => {
    try {
      const result = await RefundAdminService.updateRefundStatus(item.id, 'approved')
      if (result.success) {
        toast.success('Refund approved successfully')
    setShowDetailsModal(false)
    setSelectedItem(null)
        loadRefundData() // Reload data
      } else {
        toast.error(result.error || 'Failed to approve refund')
      }
    } catch (error) {
      console.error('Error approving refund:', error)
      toast.error('Error approving refund')
    }
  }

  const handleReject = async (item: DetailsItem) => {
    try {
      const result = await RefundAdminService.updateRefundStatus(item.id, 'cancelled')
      if (result.success) {
        toast.success('Refund rejected successfully')
    setShowDetailsModal(false)
    setSelectedItem(null)
        loadRefundData() // Reload data
      } else {
        toast.error(result.error || 'Failed to reject refund')
      }
    } catch (error) {
      console.error('Error rejecting refund:', error)
      toast.error('Error rejecting refund')
    }
  }

  const handleProcessRefund = (item: TableItem) => {
    setProcessItem(item as ProcessItem)
    setShowProcessModal(true)
  }

  const handleProcess = async (item: ProcessItem, method: string, notes: string) => {
    // TODO: Implement refund processing
    console.log('Process refund:', { item, method, notes })
    toast.info('Refund processing functionality coming soon')
    setShowProcessModal(false)
    setProcessItem(null)
  }

  const handleCallCustomer = (item: TableItem) => {
    if (item.customer.phone) {
      window.open(`tel:${item.customer.phone}`, '_blank')
    } else {
      toast.error('No phone number available')
    }
  }

  const handleSendEmail = (item: TableItem) => {
    if (item.customer.email) {
      window.open(`mailto:${item.customer.email}`, '_blank')
    } else {
      toast.error('No email address available')
    }
  }

  const handlePrintReceipt = (item: TableItem) => {
    // TODO: Implement receipt printing
    toast.info('Receipt printing functionality coming soon')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading refund data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Refunds & Exchanges</h1>
              <p className="text-gray-600 mt-2">Manage customer refunds, exchanges, and return policies</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Stats Cards */}
          {stats && <RefundStatsCards stats={transformStatsForComponents()!} />}

          {/* Analytics */}
          {analytics && <RefundAnalytics analytics={transformAnalyticsForComponents()!} />}

          {/* Filters and Actions */}
          <RefundFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onNewRefund={handleNewRefund}
            onExport={handleExport}
            onBulkApprove={handleBulkApprove}
          />

          {/* Refunds Table */}
          <RefundsTable
            items={filteredItems}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            onProcessRefund={handleProcessRefund}
            onCallCustomer={handleCallCustomer}
            onSendEmail={handleSendEmail}
            onPrintReceipt={handlePrintReceipt}
          />
        </div>

        {/* Modals */}
        <RefundDetailsModal
          item={selectedItem}
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedItem(null) }}
          onApprove={handleApprove}
          onReject={handleReject}
          onProcessRefund={handleProcessRefund}
          onCallCustomer={handleCallCustomer}
          onSendEmail={handleSendEmail}
        />

        <RefundProcessModal
          item={processItem}
          isOpen={showProcessModal}
          onClose={() => { setShowProcessModal(false); setProcessItem(null) }}
          onProcess={handleProcess}
        />
      </div>
    </div>
  )
} 