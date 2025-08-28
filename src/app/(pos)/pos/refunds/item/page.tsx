'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Search, RotateCcw, Receipt, AlertCircle, CheckCircle, XCircle, Calendar, Clock, Filter, User, CreditCard, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { useRouter } from 'next/navigation'
import { RefundItemModal } from '@/features/pos/components/refunds/RefundItemModal'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import { RefundService } from '@/features/pos/services/refund-service'

interface SaleItem {
  id: string
  saleId: string
  saleNumber: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  saleDate: string
  customerName: string
  customerId: string
  paymentMethod: string
  refunded: boolean
  refundAmount?: number
  refundDate?: string
  productId: string
  variantId?: string
}

interface SaleItemData {
  id: string
  sale_id: string
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  total_price: number
  products?: {
    id: string
    name: string
    sku: string
  }
  product_variants?: {
    id: string
    name: string
  }
}

interface SaleData {
  id: string
  transaction_number: string
  customer_id: string
  total_amount: number
  payment_method: string
  created_at: string
  customers?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_balance: number
  credit_limit: number
}

export default function RefundItemPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { selectedBranch } = useBranch()
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('today')
  const [searchType, setSearchType] = useState<'receipt' | 'style'>('receipt')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateFilter, setDateFilter] = useState<'today' | 'custom'>('today')

  // Load sale items from database
  useEffect(() => {
    loadSaleItems()
    loadCustomers()
  }, [selectedBranch, dateFilter, selectedDate])

  const loadSaleItems = async () => {
    if (!selectedBranch) return

    try {
      setIsLoading(true)
      
      // Build sales query with branch filtering (same as sales service)
      let salesQuery = supabase
        .from('sales')
        .select('id, transaction_number, customer_id, total_amount, payment_method, created_at')
        .eq('branch_id', selectedBranch.id)
        .order('created_at', { ascending: false })

      // Apply date filtering to sales
      if (dateFilter === 'today' && selectedDate) {
        const today = new Date(selectedDate)
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
        
        salesQuery = salesQuery
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
      } else if (dateFilter === 'custom' && selectedDate) {
        const customDate = new Date(selectedDate)
        const startOfDay = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate())
        const endOfDay = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate(), 23, 59, 59, 999)
        
        salesQuery = salesQuery
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
      }

      const { data: sales, error: salesError } = await salesQuery

      if (salesError) throw salesError

      console.log('Refund page - Found sales:', sales?.length || 0, 'sales for branch:', selectedBranch.id)

      if (!sales || sales.length === 0) {
        setSaleItems([])
        setIsLoading(false)
        return
      }

      // Get sale items for these sales (same as sales service)
      const saleIds = sales.map(sale => sale.id)
      
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          id,
          sale_id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          discount_amount,
          created_at,
          products (
            id,
            name,
            sku
          ),
          product_variants (
            id,
            sku,
            barcode,
            price
          )
        `)
        .in('sale_id', saleIds)
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      console.log('Refund page - Loaded sale items:', items?.length || 0, 'items')

      // Get customer IDs from sales
      const customerIds = sales?.map(sale => sale.customer_id).filter(Boolean) || []
      console.log('Refund page - Customer IDs found:', customerIds.length)
      
      // Get customer data separately (same as sales service)
      let customersData: any[] = []
      if (customerIds.length > 0) {
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('id, first_name, last_name, email, phone')
          .in('id', customerIds)
        
        if (customersError) {
          console.warn('Error loading customers:', customersError)
        } else {
          customersData = customers || []
          console.log('Refund page - Loaded customers:', customersData.length)
        }
      }

      // Create a map of customers for quick lookup
      const customersMap = new Map()
      customersData.forEach(customer => {
        customersMap.set(customer.id, customer)
      })

      // Create a map of sales for quick lookup
      const salesMap = new Map()
      sales.forEach(sale => {
        salesMap.set(sale.id, sale)
      })

      // Get refunded items to mark them - check both refund_items and sale_items.refunded
      const { data: refundedItems, error: refundError } = await supabase
        .from('refund_items')
        .select(`
          original_sale_item_id,
          refund_amount,
          created_at
        `)

      if (refundError) throw refundError

      // Create a map of refunded items
      const refundedMap = new Map()
      refundedItems?.forEach(refund => {
        refundedMap.set(refund.original_sale_item_id, {
          refundAmount: refund.refund_amount,
          refundDate: refund.created_at
        })
      })

      // Also check sale_items.refunded column for any items marked as refunded
      const { data: saleItemsRefunded, error: saleItemsRefundedError } = await supabase
        .from('sale_items')
        .select(`
          id,
          refund_amount,
          refund_date
        `)
        .eq('refunded', true)

      if (saleItemsRefundedError) {
        console.warn('Error loading refunded sale items:', saleItemsRefundedError)
      } else {
        // Update refunded map with items from sale_items.refunded
        saleItemsRefunded?.forEach(item => {
          if (!refundedMap.has(item.id)) {
            refundedMap.set(item.id, {
              refundAmount: item.refund_amount,
              refundDate: item.refund_date
            })
          }
        })
      }

      // Process items with the new query structure
      const combinedItems: SaleItem[] = items?.map((item: any) => {
        const sale = salesMap.get(item.sale_id)
        const customer = sale?.customer_id ? customersMap.get(sale.customer_id) : null
        const refunded = refundedMap.get(item.id)
        
        // Build product name with variant info if available
        let productName = item.products?.name || ''
        if (item.product_variants && item.product_variants.sku) {
          productName += ` (${item.product_variants.sku})`
        }
        
        // Use variant SKU if available, otherwise use product SKU
        const sku = item.product_variants?.sku || item.products?.sku || ''
        
        return {
          id: item.id,
          saleId: item.sale_id,
          saleNumber: sale?.transaction_number || '',
          productName: productName,
          sku: sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          saleDate: sale?.created_at || item.created_at,
          customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Walk-in Customer',
          customerId: sale?.customer_id || '',
          paymentMethod: sale?.payment_method || '',
          refunded: !!refunded,
          refundAmount: refunded?.refundAmount,
          refundDate: refunded?.refundDate,
          productId: item.product_id,
          variantId: item.variant_id
        }
      }) || []

      console.log('Refund page - Combined items:', combinedItems.length, 'items')
      setSaleItems(combinedItems)
    } catch (error) {
      console.error('Error loading sale items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCustomers = async () => {
    if (!selectedBranch) return

    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          current_balance,
          credit_limit,
          branch_id
        `)
        .eq('status', 'active')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  // Filter and categorize items
  const { todayItems, otherItems, filteredItems } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let filtered = saleItems

    // Apply search filter
    if (searchQuery) {
      if (searchType === 'receipt') {
        filtered = saleItems.filter(item =>
          item.saleNumber.toLowerCase().includes(searchQuery.toLowerCase())
        )
      } else {
        filtered = saleItems.filter(item =>
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
    }

    // Apply date filter
    if (dateFilter === 'today' && selectedDate) {
      const filterDate = new Date(selectedDate)
      filterDate.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.saleDate)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate.getTime() === filterDate.getTime()
      })
    } else if (dateFilter === 'custom' && selectedDate) {
      const filterDate = new Date(selectedDate)
      filterDate.setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.saleDate)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate.getTime() === filterDate.getTime()
      })
    }

    // Categorize items for display
    const todayItems = filtered.filter(item => {
      const itemDate = new Date(item.saleDate)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === today.getTime()
    })

    const otherItems = filtered.filter(item => {
      const itemDate = new Date(item.saleDate)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() !== today.getTime()
    })

    return { todayItems, otherItems, filteredItems: filtered }
  }, [saleItems, searchQuery, searchType, dateFilter, selectedDate])

  const handleRefundItem = (item: SaleItem) => {
    setSelectedItem(item)
    setShowRefundModal(true)
  }

  const handleProcessRefund = async (itemId: string, refundAmount: number, reason: string, refundMethod: string, customerId?: string) => {
    try {
      const item = saleItems.find(i => i.id === itemId)
      if (!item) throw new Error('Item not found')

      // Use the RefundService to process the refund
      const refundData = {
        itemId: itemId,
        refundAmount: refundAmount,
        reason: reason,
        refundMethod: refundMethod,
        customerId: customerId,
        processedBy: user?.id,
        branchId: selectedBranch?.id
      }

      const result = await RefundService.processRefund(refundData)

      if (result.success) {
        // Update local state to reflect the refund
        setSaleItems(prev => prev.map(i =>
          i.id === itemId
            ? {
                ...i,
                refunded: true,
                refundAmount: refundAmount,
                refundDate: new Date().toISOString()
              }
            : i
        ))
        
        setShowRefundModal(false)
        setSelectedItem(null)
      } else {
        throw new Error(result.error || 'Failed to process refund')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (dateString: string) => {
    const today = new Date()
    const itemDate = new Date(dateString)
    return today.toDateString() === itemDate.toDateString()
  }

  const getStatusBadge = (item: SaleItem) => {
    if (item.refunded) {
  return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      )
    }
    
    if (isToday(item.saleDate)) {
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

  const renderItemCard = (item: SaleItem) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
          {getStatusBadge(item)}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>SKU: {item.sku}</span>
                    <span>•</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>

                {/* Sale Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Number:</span>
                      <span className="font-medium">{item.saleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
            <span className="font-medium truncate">{item.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Date:</span>
                      <span className="font-medium">{formatDate(item.saleDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium">{item.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Price Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Price:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
                    </div>
                    {item.refunded && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refunded:</span>
                        <span className="font-medium text-green-600">{formatCurrency(item.refundAmount || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4">
                  {item.refunded ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Refunded on {item.refundDate ? formatDate(item.refundDate) : 'N/A'}
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
                      onClick={() => handleRefundItem(item)}
                      className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Process Refund
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
        title="Refund Item"
        backButtonText="Back to Menu"
        icon={<RotateCcw className="h-4 w-4 text-black" />}
      />

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Search Type Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={searchType === 'receipt' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('receipt')}
                className={searchType === 'receipt' ? 'bg-[#E5FF29] text-black' : ''}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Receipt Number
              </Button>
              <Button
                variant={searchType === 'style' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('style')}
                className={searchType === 'style' ? 'bg-[#E5FF29] text-black' : ''}
              >
                <Search className="h-4 w-4 mr-2" />
                Style/Code
              </Button>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Button
                variant={dateFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setDateFilter('today')
                  setSelectedDate(new Date())
                }}
                className={dateFilter === 'today' ? 'bg-[#E5FF29] text-black' : ''}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={dateFilter === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    className={dateFilter === 'custom' ? 'bg-[#E5FF29] text-black' : ''}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Select Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setDateFilter('custom')
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
                  placeholder={searchType === 'receipt' 
                    ? "Search by receipt number..." 
                    : "Search by product name or SKU..."
                  }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {filteredItems.length} items found
            </div>
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
                <span>
                  {dateFilter === 'custom' && selectedDate 
                    ? selectedDate.toLocaleDateString() 
                    : "Today's Sales"
                  }
                </span>
                {todayItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-black text-[#E5FF29] font-bold px-1.5 py-0.5 text-xs">
                    {todayItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="other" 
                className="flex items-center justify-center space-x-2 h-8 text-sm font-medium rounded-full transition-all duration-200 data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Other Sales</span>
                {otherItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-black text-[#E5FF29] font-bold px-1.5 py-0.5 text-xs">
                    {otherItems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-[#E5FF29]" />
                  {dateFilter === 'custom' && selectedDate 
                    ? `Sales from ${selectedDate.toLocaleDateString()}`
                    : "Today's Sales"
                  }
                </h2>
                <p className="text-gray-600">
                  {dateFilter === 'custom' && selectedDate 
                    ? `Sales from ${selectedDate.toLocaleDateString()} that are available for refund`
                    : "Sales from today that are available for refund"
                  }
                </p>
              </div>
              {todayItems.length === 0 ? (
                renderEmptyState(
                  dateFilter === 'custom' && selectedDate 
                    ? `No sales found for ${selectedDate.toLocaleDateString()}`
                    : "No today's sales found",
                  searchQuery ? "Try adjusting your search terms" : "No sales available for refund"
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {todayItems.map(renderItemCard)}
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
              {otherItems.length === 0 ? (
                renderEmptyState(
                  "No other sales found",
                  searchQuery ? "Try adjusting your search terms" : "No other sales available for refund"
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherItems.map(renderItemCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Refund Modal */}
      {selectedItem && (
        <RefundItemModal
          item={selectedItem}
          isOpen={showRefundModal}
          onClose={() => {
            setShowRefundModal(false)
            setSelectedItem(null)
          }}
          onProcessRefund={handleProcessRefund}
          customers={customers}
        />
      )}
    </div>
  )
} 