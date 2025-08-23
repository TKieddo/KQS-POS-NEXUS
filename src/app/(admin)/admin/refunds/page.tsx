'use client'

import { useState } from 'react'
import { RefundStatsCards } from '@/features/refunds/components/RefundStatsCards'
import { RefundAnalytics } from '@/features/refunds/components/RefundAnalytics'
import { RefundFilters, RefundFilters as RefundFiltersType } from '@/features/refunds/components/RefundFilters'
import { RefundsTable, TableItem } from '@/features/refunds/components/RefundsTable'
import { RefundDetailsModal, DetailsItem } from '@/features/refunds/components/RefundDetailsModal'
import { RefundProcessModal, ProcessItem } from '@/features/refunds/components/RefundProcessModal'
import { 
  RefundTransaction, 
  ExchangeTransaction, 
  RefundStats, 
  RefundAnalytics as RefundAnalyticsType 
} from '@/features/refunds/types'

// Mock data for demonstration
const mockRefunds: RefundTransaction[] = [
  {
    id: 'REF-001',
    transactionId: 'TXN-2024-001',
    customer: {
      id: 'CUST-001',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@email.com',
      accountBalance: 150.00,
      loyaltyPoints: 250
    },
    items: [
      {
        id: 'ITEM-001',
        product: {
          id: 'PROD-001',
          name: 'Premium Wireless Headphones',
          sku: 'WH-001',
          price: 199.99,
          cost: 120.00,
          stockQuantity: 15,
          category: 'Electronics'
        },
        quantity: 1,
        originalPrice: 199.99,
        refundAmount: 199.99,
        reason: 'Defective product',
        condition: 'damaged',
        notes: 'Customer reported audio issues'
      }
    ],
    totalRefundAmount: 199.99,
    refundMethod: 'account_credit',
    refundReason: 'Product defect',
    processedBy: 'Admin User',
    processedAt: '2024-03-15T10:30:00Z',
    status: 'approved',
    notes: 'Customer prefers account credit for future purchases'
  },
  {
    id: 'REF-002',
    transactionId: 'TXN-2024-002',
    customer: {
      id: 'CUST-002',
      name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@email.com',
      accountBalance: 75.50,
      loyaltyPoints: 120
    },
    items: [
      {
        id: 'ITEM-002',
        product: {
          id: 'PROD-002',
          name: 'Designer Handbag',
          sku: 'BAG-001',
          price: 299.99,
          cost: 180.00,
          stockQuantity: 8,
          category: 'Fashion'
        },
        quantity: 1,
        originalPrice: 299.99,
        refundAmount: 299.99,
        reason: 'Changed mind',
        condition: 'new',
        notes: 'Customer decided on different style'
      }
    ],
    totalRefundAmount: 299.99,
    refundMethod: 'cash',
    refundReason: 'Customer preference',
    processedBy: 'Admin User',
    processedAt: '2024-03-14T14:20:00Z',
    status: 'completed',
    notes: 'Cash refund processed successfully'
  },
  {
    id: 'REF-003',
    transactionId: 'TXN-2024-003',
    customer: {
      id: 'CUST-003',
      name: 'Mike Wilson',
      phone: '+1 (555) 345-6789',
      email: 'mike.wilson@email.com',
      accountBalance: 0,
      loyaltyPoints: 500
    },
    items: [
      {
        id: 'ITEM-003',
        product: {
          id: 'PROD-003',
          name: 'Gaming Console',
          sku: 'GC-001',
          price: 399.99,
          cost: 280.00,
          stockQuantity: 5,
          category: 'Electronics'
        },
        quantity: 1,
        originalPrice: 399.99,
        refundAmount: 399.99,
        reason: 'Wrong size/model',
        condition: 'new',
        notes: 'Customer ordered wrong model'
      }
    ],
    totalRefundAmount: 399.99,
    refundMethod: 'loyalty_points',
    refundReason: 'Wrong product ordered',
    processedBy: 'Admin User',
    processedAt: '2024-03-13T09:15:00Z',
    status: 'pending',
    notes: 'Awaiting manager approval for loyalty points refund'
  }
]

const mockExchanges: ExchangeTransaction[] = [
  {
    id: 'EXC-001',
    originalTransactionId: 'TXN-2024-004',
    customer: {
      id: 'CUST-004',
      name: 'Emily Davis',
      phone: '+1 (555) 456-7890',
      email: 'emily.davis@email.com',
      accountBalance: 200.00,
      loyaltyPoints: 300
    },
    items: [
      {
        id: 'ITEM-004',
        originalProduct: {
          id: 'PROD-004',
          name: 'Smartphone Case (Small)',
          sku: 'CASE-SM-001',
          price: 29.99,
          cost: 15.00,
          stockQuantity: 25,
          category: 'Accessories'
        },
        newProduct: {
          id: 'PROD-005',
          name: 'Smartphone Case (Large)',
          sku: 'CASE-LG-001',
          price: 34.99,
          cost: 18.00,
          stockQuantity: 20,
          category: 'Accessories'
        },
        quantity: 1,
        priceDifference: 5.00,
        reason: 'Wrong size',
        condition: 'new',
        notes: 'Customer needed larger size'
      }
    ],
    totalPriceDifference: 5.00,
    exchangeReason: 'Size exchange',
    processedBy: 'Admin User',
    processedAt: '2024-03-12T16:45:00Z',
    status: 'completed',
    notes: 'Exchange completed successfully'
  }
]

const mockStats: RefundStats = {
  totalRefunds: 3,
  totalRefundAmount: 899.97,
  refundsThisMonth: 2,
  refundsThisWeek: 1,
  averageRefundAmount: 299.99,
  topRefundReasons: [
    { reason: 'Defective product', count: 1, percentage: 33.3 },
    { reason: 'Changed mind', count: 1, percentage: 33.3 },
    { reason: 'Wrong size/model', count: 1, percentage: 33.3 }
  ],
  refundMethods: [
    { method: 'account_credit', count: 1, amount: 199.99 },
    { method: 'cash', count: 1, amount: 299.99 },
    { method: 'loyalty_points', count: 1, amount: 399.99 }
  ]
}

const mockAnalytics: RefundAnalyticsType = {
  totalRefunds: 3,
  totalRefundAmount: 899.97,
  refundsThisMonth: 2,
  refundsThisWeek: 1,
  averageRefundAmount: 299.99,
  refundRate: 2.5,
  monthlyTrends: [
    { month: 'Jan', refunds: 1, amount: 150.00, percentage: 1.2 },
    { month: 'Feb', refunds: 2, amount: 450.00, percentage: 2.1 },
    { month: 'Mar', refunds: 3, amount: 899.97, percentage: 2.5 },
    { month: 'Apr', refunds: 0, amount: 0, percentage: 0 }
  ],
  topRefundReasons: [
    { reason: 'Defective product', count: 1, percentage: 33.3, totalAmount: 199.99 },
    { reason: 'Changed mind', count: 1, percentage: 33.3, totalAmount: 299.99 },
    { reason: 'Wrong size/model', count: 1, percentage: 33.3, totalAmount: 399.99 }
  ],
  refundMethods: [
    { method: 'account_credit', count: 1, amount: 199.99, percentage: 33.3 },
    { method: 'cash', count: 1, amount: 299.99, percentage: 33.3 },
    { method: 'loyalty_points', count: 1, amount: 399.99, percentage: 33.3 }
  ],
  topProducts: [
    {
      product: {
        id: 'PROD-001',
        name: 'Premium Wireless Headphones',
        sku: 'WH-001',
        price: 199.99,
        cost: 120.00,
        stockQuantity: 15,
        category: 'Electronics'
      },
      refundCount: 1,
      refundAmount: 199.99,
      refundRate: 6.7
    }
  ],
  customerRefunds: [
    {
      customer: {
        id: 'CUST-001',
        name: 'John Smith',
        phone: '+1 (555) 123-4567',
        email: 'john.smith@email.com'
      },
      refundCount: 1,
      refundAmount: 199.99,
      averageRefund: 199.99
    }
  ]
}

export default function RefundsPage() {
  const [allItems, setAllItems] = useState<TableItem[]>([
    ...mockRefunds.map(refund => ({ ...refund, type: 'refund' as const })),
    ...mockExchanges.map(exchange => ({ ...exchange, type: 'exchange' as const }))
  ])
  const [filteredItems, setFilteredItems] = useState<TableItem[]>(allItems)
  const [filters, setFilters] = useState<RefundFiltersType>({
    search: '',
    status: 'all',
    refundMethod: 'all',
    dateRange: 'all'
  })
  const [selectedItem, setSelectedItem] = useState<DetailsItem | null>(null)
  const [processItem, setProcessItem] = useState<ProcessItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)

  const handleFilterChange = (newFilters: RefundFiltersType) => {
    setFilters(newFilters)
    
    let filtered = allItems

    // Apply search filter
    if (newFilters.search) {
      filtered = filtered.filter(item =>
        (item.type === 'refund' ? item.transactionId : item.originalTransactionId)
          .toLowerCase().includes(newFilters.search.toLowerCase()) ||
        item.customer.name.toLowerCase().includes(newFilters.search.toLowerCase()) ||
        item.customer.phone.includes(newFilters.search)
      )
    }

    // Apply status filter
    if (newFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status === newFilters.status)
    }

    // Apply refund method filter
    if (newFilters.refundMethod !== 'all') {
      filtered = filtered.filter(item => 
        item.type === 'refund' ? item.refundMethod === newFilters.refundMethod : false
      )
    }

    // Apply date range filter
    if (newFilters.dateRange !== 'all') {
      const now = new Date()
      const startDate = new Date()
      
      switch (newFilters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter(item => 
        new Date(item.processedAt) >= startDate
      )
    }

    setFilteredItems(filtered)
  }

  const handleNewRefund = () => {
    // TODO: Navigate to new refund form or open modal
    console.log('Create new refund')
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export refund data')
  }

  const handleBulkApprove = () => {
    // TODO: Implement bulk approve functionality
    console.log('Bulk approve refunds')
  }

  const handleViewDetails = (item: TableItem) => {
    setSelectedItem(item as DetailsItem)
    setShowDetailsModal(true)
  }

  const handleApprove = (item: DetailsItem) => {
    // TODO: Update status in Supabase
    console.log('Approve refund:', item.id)
    setShowDetailsModal(false)
    setSelectedItem(null)
  }

  const handleReject = (item: DetailsItem) => {
    // TODO: Update status in Supabase
    console.log('Reject refund:', item.id)
    setShowDetailsModal(false)
    setSelectedItem(null)
  }

  const handleProcessRefund = (item: TableItem) => {
    setProcessItem(item as ProcessItem)
    setShowProcessModal(true)
  }

  const handleProcess = async (item: ProcessItem, method: string, notes: string) => {
    // TODO: Process refund in Supabase
    console.log('Process refund:', { item, method, notes })
    setShowProcessModal(false)
    setProcessItem(null)
  }

  const handleCallCustomer = (item: TableItem) => {
    // TODO: Implement call functionality
    console.log('Call customer:', item.customer.phone)
  }

  const handleSendEmail = (item: TableItem) => {
    // TODO: Implement email functionality
    console.log('Send email to:', item.customer.email)
  }

  const handlePrintReceipt = (item: TableItem) => {
    // TODO: Generate and print receipt
    console.log('Print receipt for:', item.id)
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
          <RefundStatsCards stats={mockStats} />

          {/* Analytics */}
          <RefundAnalytics analytics={mockAnalytics} />

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