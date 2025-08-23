'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Search, RotateCcw, Receipt, AlertCircle, CheckCircle, XCircle, Calendar, Clock, Filter, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface Sale {
  id: string
  saleNumber: string
  customerName: string
  saleDate: string
  totalAmount: number
  itemCount: number
  paymentMethod: string
  refunded: boolean
  refundAmount?: number
  refundDate?: string
  items: SaleItem[]
}

interface SaleItem {
  id: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  refunded: boolean
}

export default function RefundSalePage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('today')

  // Mock sales data with more realistic dates
  useEffect(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const mockSales: Sale[] = [
      {
        id: '1',
        saleNumber: 'SALE-2024-001',
        customerName: 'John Smith',
        saleDate: today.toISOString(),
        totalAmount: 330.00,
        itemCount: 2,
        paymentMethod: 'Cash',
        refunded: false,
        items: [
          {
            id: '1-1',
            productName: 'Nike Air Max 270',
            sku: 'NIKE-AM270',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00,
            refunded: false
          },
          {
            id: '1-2',
            productName: 'Adidas Ultraboost',
            sku: 'ADIDAS-UB',
            quantity: 1,
            unitPrice: 180.00,
            totalPrice: 180.00,
            refunded: false
          }
        ]
      },
      {
        id: '2',
        saleNumber: 'SALE-2024-002',
        customerName: 'Sarah Johnson',
        saleDate: yesterday.toISOString(),
        totalAmount: 240.00,
        itemCount: 2,
        paymentMethod: 'Card',
        refunded: false,
        items: [
          {
            id: '2-1',
            productName: 'Puma RS-X',
            sku: 'PUMA-RSX',
            quantity: 2,
            unitPrice: 120.00,
            totalPrice: 240.00,
            refunded: false
          }
        ]
      },
      {
        id: '3',
        saleNumber: 'SALE-2024-003',
        customerName: 'Mike Wilson',
        saleDate: twoDaysAgo.toISOString(),
        totalAmount: 200.00,
        itemCount: 1,
        paymentMethod: 'Card',
        refunded: true,
        refundAmount: 200.00,
        refundDate: yesterday.toISOString(),
        items: [
          {
            id: '3-1',
            productName: 'New Balance 990',
            sku: 'NB-990',
            quantity: 1,
            unitPrice: 200.00,
            totalPrice: 200.00,
            refunded: true
          }
        ]
      },
      {
        id: '4',
        saleNumber: 'SALE-2024-004',
        customerName: 'Emma Davis',
        saleDate: today.toISOString(),
        totalAmount: 80.00,
        itemCount: 1,
        paymentMethod: 'Card',
        refunded: true,
        refundAmount: 80.00,
        refundDate: today.toISOString(),
        items: [
          {
            id: '4-1',
            productName: 'Converse Chuck Taylor',
            sku: 'CONVERSE-CT',
            quantity: 1,
            unitPrice: 80.00,
            totalPrice: 80.00,
            refunded: true
          }
        ]
      }
    ]

    setSales(mockSales)
    setIsLoading(false)
  }, [])

  // Filter and categorize sales
  const { todaySales, otherSales } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const filteredSales = sales.filter(sale =>
      sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const todaySales = filteredSales.filter(sale => {
      const saleDate = new Date(sale.saleDate)
      saleDate.setHours(0, 0, 0, 0)
      return saleDate.getTime() === today.getTime()
    })

    const otherSales = filteredSales.filter(sale => {
      const saleDate = new Date(sale.saleDate)
      saleDate.setHours(0, 0, 0, 0)
      return saleDate.getTime() !== today.getTime()
    })

    return { todaySales, otherSales }
  }, [sales, searchQuery])

  const handleRefundSale = (sale: Sale) => {
    setSelectedSale(sale)
    setShowRefundModal(true)
  }

  const handleProcessRefund = async (saleId: string, refundAmount: number, reason: string) => {
    // TODO: Process refund in Supabase
    console.log('Processing sale refund:', { saleId, refundAmount, reason })
    
    // Update local state
    setSales(prev => prev.map(sale =>
      sale.id === saleId
        ? {
            ...sale,
            refunded: true,
            refundAmount,
            refundDate: new Date().toISOString()
          }
        : sale
    ))
    
    setShowRefundModal(false)
    setSelectedSale(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const saleDate = new Date(dateString)
    return today.toDateString() === saleDate.toDateString()
  }

  const getStatusBadge = (sale: Sale) => {
    if (sale.refunded) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      )
    }
    
    if (isToday(sale.saleDate)) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="h-3 w-3 mr-1" />
          Today
        </Badge>
      )
    }
    
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <Calendar className="h-3 w-3 mr-1" />
        Available
      </Badge>
    )
  }

  const renderSaleCard = (sale: Sale) => (
    <div key={sale.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{sale.saleNumber}</h3>
          {getStatusBadge(sale)}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Customer: {sale.customerName}</span>
          <span>•</span>
          <span>{sale.itemCount} items</span>
        </div>
      </div>

      {/* Sale Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Sale Date:</span>
            <span className="font-medium">{formatDate(sale.saleDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">{sale.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</span>
          </div>
          {sale.refunded && (
            <div className="flex justify-between">
              <span className="text-gray-600">Refunded:</span>
              <span className="font-medium text-green-600">{formatCurrency(sale.refundAmount || 0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
        <div className="space-y-1">
          {sale.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-gray-600">
              <span className="truncate">{item.productName}</span>
              <span>{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
          {sale.items.length > 2 && (
            <div className="text-xs text-gray-500 italic">
              +{sale.items.length - 2} more items
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        {sale.refunded ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Refunded on {sale.refundDate ? formatDate(sale.refundDate) : 'N/A'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-gray-500"
              disabled
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Already Refunded
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => handleRefundSale(sale)}
            className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refund Entire Sale
          </Button>
        )}
      </div>
    </div>
  )

  const renderEmptyState = (message: string, description: string) => (
    <div className="text-center py-12">
      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Refund Sale"
        backButtonText="Back to Menu"
        icon={<RotateCcw className="h-4 w-4 text-black" />}
      />

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by sale number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-10 bg-gray-100 p-1 rounded-full border border-gray-200">
              <TabsTrigger 
                value="today" 
                className="flex items-center justify-center space-x-2 h-8 text-sm font-medium rounded-full transition-all duration-200 data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-50"
              >
                <Calendar className="h-4 w-4" />
                <span>Today's Sales</span>
                {todaySales.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-black text-[#E5FF29] font-bold px-1.5 py-0.5 text-xs">
                    {todaySales.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="other" 
                className="flex items-center justify-center space-x-2 h-8 text-sm font-medium rounded-full transition-all duration-200 data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Other Sales</span>
                {otherSales.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-black text-[#E5FF29] font-bold px-1.5 py-0.5 text-xs">
                    {otherSales.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-[#E5FF29]" />
                  Today's Sales
                </h2>
                <p className="text-gray-600">Sales from today that are available for refund</p>
              </div>
              {todaySales.length === 0 ? (
                renderEmptyState(
                  "No today's sales found",
                  searchQuery ? "Try adjusting your search terms" : "No sales from today available for refund"
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {todaySales.map(renderSaleCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="other" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <Filter className="h-6 w-6 mr-3 text-[#E5FF29]" />
                  Other Sales
                </h2>
                <p className="text-gray-600">Sales from previous days that are available for refund</p>
              </div>
              {otherSales.length === 0 ? (
                renderEmptyState(
                  "No other sales found",
                  searchQuery ? "Try adjusting your search terms" : "No other sales available for refund"
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherSales.map(renderSaleCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Refund Modal - You'll need to create this component */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Refund Sale</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to refund the entire sale {selectedSale.saleNumber} for {formatCurrency(selectedSale.totalAmount)}?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  handleProcessRefund(selectedSale.id, selectedSale.totalAmount, 'Customer request')
                  setShowRefundModal(false)
                }}
                className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                Confirm Refund
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefundModal(false)
                  setSelectedSale(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 