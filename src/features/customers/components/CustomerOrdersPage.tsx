'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Search, Filter, Eye, Edit, Package, Calendar, DollarSign, User } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { SearchFilters } from '@/components/ui/search-filters'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface CustomerOrder {
  id: string
  orderNumber: string
  customer: Customer
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  expectedDelivery: string
  notes: string
  createdAt: string
}

interface CustomerOrdersPageProps {
  orders: CustomerOrder[]
  isLoading: boolean
  onViewOrder: (order: CustomerOrder) => void
  onEditOrder: (order: CustomerOrder) => void
  onUpdateStatus: (orderId: string, status: CustomerOrder['status']) => void
}

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({
  orders,
  isLoading,
  onViewOrder,
  onEditOrder,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerOrder['status']>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'customer' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const getStatusColor = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending': return <Package className="h-4 w-4" />
      case 'confirmed': return <Eye className="h-4 w-4" />
      case 'processing': return <Edit className="h-4 w-4" />
      case 'shipped': return <Package className="h-4 w-4" />
      case 'delivered': return <Calendar className="h-4 w-4" />
      case 'cancelled': return <DollarSign className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getTodayOrders = () => {
    const today = new Date().toISOString().split('T')[0]
    return orders.filter(order => order.orderDate === today)
  }

  const getWeekOrders = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return orders.filter(order => new Date(order.orderDate) >= weekAgo)
  }

  const getMonthOrders = () => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return orders.filter(order => new Date(order.orderDate) >= monthAgo)
  }

  const getTotalRevenue = (orderList: CustomerOrder[]) => {
    return orderList.reduce((sum, order) => sum + order.total, 0)
  }

  const filteredOrders = useSearchAndFilter({
    data: orders,
    searchFields: ['orderNumber', 'customer.name', 'customer.email'],
    searchQuery,
    filters: {
      status: {
        value: statusFilter,
        field: 'status',
        transform: (value) => value === 'all' ? undefined : value
      },
      date: {
        value: dateFilter,
        field: 'orderDate',
        transform: (value) => {
          if (value === 'all') return undefined
          if (value === 'today') return new Date().toISOString().split('T')[0]
          if (value === 'week') return getWeekOrders().map(o => o.orderDate)
          if (value === 'month') return getMonthOrders().map(o => o.orderDate)
          return undefined
        }
      }
    }
  })

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.orderDate)
          bValue = new Date(b.orderDate)
          break
        case 'total':
          aValue = a.total
          bValue = b.total
          break
        case 'customer':
          aValue = a.customer.name
          bValue = b.customer.name
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = new Date(a.orderDate)
          bValue = new Date(b.orderDate)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredOrders, sortBy, sortOrder])

  const stats = useMemo(() => [
    {
      label: 'Total Orders',
      count: orders.length,
      color: 'bg-blue-500'
    },
    {
      label: 'Today',
      count: getTodayOrders().length,
      color: 'bg-green-500'
    },
    {
      label: 'This Week',
      count: getWeekOrders().length,
      color: 'bg-purple-500'
    },
    {
      label: 'Total Revenue',
      count: formatCurrency(getTotalRevenue(orders)),
      color: 'bg-yellow-500'
    }
  ], [orders])

  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Order Date' },
    { value: 'total', label: 'Total Amount' },
    { value: 'customer', label: 'Customer Name' },
    { value: 'status', label: 'Status' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Customer Orders" 
        icon={<ShoppingCart className="h-4 w-4 text-black" />}
      />
      
      <StatsBar stats={stats} />
      
      <SearchFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search orders..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusFilterOptions,
            placeholder: 'All Status'
          },
          {
            value: dateFilter,
            onChange: setDateFilter,
            options: dateFilterOptions,
            placeholder: 'All Time'
          },
          {
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
            placeholder: 'Sort By'
          }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <LoadingSpinner text="Loading customer orders..." />
        ) : sortedOrders.length === 0 ? (
          <EmptyState 
            icon={<ShoppingCart className="h-8 w-8" />}
            title="No customer orders found"
            description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No customer orders have been created yet.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOrders.map((order) => (
              <div key={order.id} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{order.orderNumber}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{order.customer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Items ({order.items.length})</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate">{item.name} (x{item.quantity})</span>
                        <span>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewOrder(order)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditOrder(order)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  {order.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, 'confirmed')}
                      className="w-full mt-2 h-8 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      Confirm Order
                    </Button>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, 'processing')}
                      className="w-full mt-2 h-8 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    >
                      Start Processing
                    </Button>
                  )}
                  
                  {order.status === 'processing' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, 'shipped')}
                      className="w-full mt-2 h-8 text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    >
                      Mark Shipped
                    </Button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, 'delivered')}
                      className="w-full mt-2 h-8 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 