'use client'

import React, { useState, useEffect } from 'react'
import { RefundStats } from './RefundStats'
import { RefundFilters } from './RefundFilters'
import { RefundTabs } from './RefundTabs'
import { RefundItemModal } from './RefundItemModal'
import { RefundSaleModal } from './RefundSaleModal'
import { formatCurrency } from '@/lib/utils'

interface Sale {
  id: string
  receiptNumber: string
  customerName: string
  date: string
  time: string
  total: number
  items: number
  status: 'completed' | 'refunded' | 'partially_refunded'
  paymentMethod: string
  refundedAmount?: number
  refundedItems?: number
}

interface RefundManagementProps {
  onRefundComplete?: (refundData: any) => void
}

export const RefundManagement: React.FC<RefundManagementProps> = ({ onRefundComplete }) => {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showRefundItemModal, setShowRefundItemModal] = useState(false)
  const [showRefundSaleModal, setShowRefundSaleModal] = useState(false)
  const [activeTab, setActiveTab] = useState('today')

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSales: Sale[] = [
      {
        id: '1',
        receiptNumber: 'RCP-001',
        customerName: 'John Doe',
        date: '2024-01-15',
        time: '14:30',
        total: 125.50,
        items: 3,
        status: 'completed',
        paymentMethod: 'Credit Card'
      },
      {
        id: '2',
        receiptNumber: 'RCP-002',
        customerName: 'Jane Smith',
        date: '2024-01-15',
        time: '15:45',
        total: 89.99,
        items: 2,
        status: 'partially_refunded',
        paymentMethod: 'Cash',
        refundedAmount: 29.99,
        refundedItems: 1
      },
      {
        id: '3',
        receiptNumber: 'RCP-003',
        customerName: 'Mike Johnson',
        date: '2024-01-15',
        time: '12:15',
        total: 234.75,
        items: 5,
        status: 'refunded',
        paymentMethod: 'Credit Card',
        refundedAmount: 234.75,
        refundedItems: 5
      },
      {
        id: '4',
        receiptNumber: 'RCP-004',
        customerName: 'Sarah Wilson',
        date: '2024-01-14',
        time: '16:20',
        total: 67.25,
        items: 2,
        status: 'completed',
        paymentMethod: 'Debit Card'
      },
      {
        id: '5',
        receiptNumber: 'RCP-005',
        customerName: 'David Brown',
        date: '2024-01-14',
        time: '11:30',
        total: 189.99,
        items: 4,
        status: 'completed',
        paymentMethod: 'Credit Card'
      }
    ]
    
    setSales(mockSales)
    setFilteredSales(mockSales)
  }, [])

  useEffect(() => {
    let filtered = sales

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date)
        switch (dateFilter) {
          case 'today':
            return saleDate.toDateString() === today.toDateString()
          case 'yesterday':
            return saleDate.toDateString() === yesterday.toDateString()
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return saleDate >= weekAgo
          default:
            return true
        }
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSales(filtered)
  }, [sales, searchTerm, statusFilter, dateFilter])

  const refundStats = {
    totalSales: sales.length,
    totalRefunds: sales.filter(s => s.status === 'refunded').length,
    totalRefundedAmount: sales.reduce((sum, s) => sum + (s.refundedAmount || 0), 0),
    todayRefunds: sales.filter(s => s.status === 'refunded' && s.date === new Date().toISOString().split('T')[0]).length,
    pendingRefunds: sales.filter(s => s.status === 'partially_refunded').length
  }

  const handleRefundItem = (sale: Sale) => {
    setSelectedSale(sale)
    setShowRefundItemModal(true)
  }

  const handleRefundSale = (sale: Sale) => {
    setSelectedSale(sale)
    setShowRefundSaleModal(true)
  }

  const handleRefundComplete = (refundData: any) => {
    console.log('Refund completed:', refundData)
    
    // Update the sale status based on refund type
    setSales(prev => prev.map(sale => {
      if (sale.id === refundData.saleId) {
        if (refundData.items && refundData.items.length > 0) {
          // Item refund
          return { 
            ...sale, 
            status: 'partially_refunded', 
            refundedAmount: (sale.refundedAmount || 0) + refundData.totalRefundAmount 
          }
        } else {
          // Full sale refund
          return { 
            ...sale, 
            status: 'refunded', 
            refundedAmount: sale.total, 
            refundedItems: sale.items 
          }
        }
      }
      return sale
    }))

    onRefundComplete?.(refundData)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter('all')
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {refundStats.totalSales}
            </div>
            <div className="text-sm text-gray-600">Total Sales</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {refundStats.totalRefunds}
            </div>
            <div className="text-sm text-gray-600">Total Refunds</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {refundStats.pendingRefunds}
            </div>
            <div className="text-sm text-gray-600">Pending Refunds</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(refundStats.totalRefundedAmount)}
            </div>
            <div className="text-sm text-gray-600">Refunded Amount</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <RefundFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Tabs Section */}
      <RefundTabs
        sales={filteredSales}
        onRefundItem={handleRefundItem}
        onRefundSale={handleRefundSale}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Refund Modals */}
      {selectedSale && (
        <>
          <RefundItemModal
            isOpen={showRefundItemModal}
            onClose={() => {
              setShowRefundItemModal(false)
              setSelectedSale(null)
            }}
            saleId={selectedSale.id}
            onRefundComplete={handleRefundComplete}
          />
          
          <RefundSaleModal
            isOpen={showRefundSaleModal}
            onClose={() => {
              setShowRefundSaleModal(false)
              setSelectedSale(null)
            }}
            saleId={selectedSale.id}
            onRefundComplete={handleRefundComplete}
          />
        </>
      )}
    </div>
  )
} 