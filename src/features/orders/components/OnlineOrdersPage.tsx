'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Globe, Search, Filter, Eye, Package, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, User, TrendingUp, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface OnlineOrder {
  id: string
  orderNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    total: number
    notes?: string
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  orderDate: string
  expectedDelivery: string
  shippingMethod: 'standard' | 'express' | 'pickup'
  notes: string
  createdAt: string
}

interface OnlineOrdersPageProps {
  orders: OnlineOrder[]
  isLoading: boolean
  onViewOrder: (order: OnlineOrder) => void
  onUpdateStatus: (orderId: string, status: OnlineOrder['status']) => void
  onUpdatePaymentStatus: (orderId: string, paymentStatus: OnlineOrder['paymentStatus']) => void
}

export const OnlineOrdersPage: React.FC<OnlineOrdersPageProps> = ({
  orders,
  isLoading,
  onViewOrder,
  onUpdateStatus,
  onUpdatePaymentStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | OnlineOrder['status']>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | OnlineOrder['paymentStatus']>('all')

  const getStatusColor = (status: OnlineOrder['status']) => {
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

  const getStatusIcon = (status: OnlineOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Package className="h-4 w-4" />
      case 'shipped': return <Package className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (status: OnlineOrder['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTodayOrders = () => {
    const today = new Date().toISOString().split('T')[0]
    return orders.filter(order => order.orderDate === today)
  }

  const getTotalRevenue = (orderList: OnlineOrder[]) => {
    return orderList.reduce((sum, order) => sum + order.total, 0)
  }

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending')
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = activeTab === 'all' || order.status === activeTab
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
      
      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [orders, searchQuery, activeTab, paymentFilter])

  const stats = useMemo(() => [
    {
      label: 'Total Orders',
      count: orders.length,
      color: 'bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/80'
    },
    {
      label: 'Today',
      count: getTodayOrders().length,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      label: 'Pending',
      count: getPendingOrders().length,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    },
    {
      label: 'Revenue',
      count: getTotalRevenue(orders),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ], [orders])

  const tabOptions = [
    { value: 'all', label: 'All Orders', count: orders.length, icon: <Globe className="h-4 w-4" /> },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length, icon: <Clock className="h-4 w-4" /> },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length, icon: <Package className="h-4 w-4" /> },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, icon: <Package className="h-4 w-4" /> },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, icon: <AlertCircle className="h-4 w-4" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Online Orders" 
        icon={<Globe className="h-4 w-4 text-black" />}
      />
      
      <StatsBar stats={stats} />
      
      {/* Premium Search Bar */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search orders by number, customer, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
                              <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Tabbed Interface */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide bg-black border-b border-gray-700">
            {tabOptions.map((tab) => (
              <button
                key={tab.value}
                                 onClick={() => setActiveTab(tab.value as any)}
                className={`flex items-center space-x-2 px-6 py-2 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-[#E5FF29] text-black border-b-2 border-[#E5FF29]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.value
                    ? 'bg-white/20 text-black'
                    : 'bg-gray-600/20 text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading online orders..." />
            ) : filteredOrders.length === 0 ? (
              <EmptyState 
                icon={<Globe className="h-8 w-8" />}
                title="No online orders found"
                description={searchQuery || activeTab !== 'all' ? 'Try adjusting your search or filters' : 'No online orders have been placed yet.'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group">
                    {/* Header */}
                                          <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-black transition-colors">
                          {order.orderNumber}
                        </h3>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      
                                              <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <User className="h-4 w-4 text-black" />
                            <span className="font-medium text-gray-900">{order.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 text-black" />
                            <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <ShoppingCart className="h-4 w-4 text-black" />
                            <span className="capitalize">{order.shippingMethod}</span>
                          </div>
                        </div>
                    </div>

                    {/* Items Summary */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">Items ({order.items.length})</span>
                        <span className="text-lg font-bold text-black">{formatCurrency(order.total)}</span>
                      </div>
                      
                                              <div className="space-y-2">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex justify-between text-xs text-gray-600">
                              <span className="truncate">{item.name} (x{item.quantity})</span>
                              <span className="text-black font-semibold">{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6">
                      <div className="flex space-x-3 mb-3">
                                                  <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewOrder(order)}
                            className="flex-1 h-10 text-xs bg-black border-black text-white hover:bg-gray-800 hover:border-gray-800 transition-all duration-300 shadow-lg rounded-full"
                          >
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                      </div>
                      
                      {/* Status Action Buttons */}
                      <div className="space-y-3">
                        {order.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'confirmed')}
                            className="w-full h-10 text-xs bg-[#E5FF29] border-[#E5FF29] text-black hover:bg-[#ccff00] hover:border-[#ccff00] transition-all duration-300 shadow-lg rounded-full"
                          >
                            Confirm Order
                          </Button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'processing')}
                            className="w-full h-10 text-xs bg-[#a4133c] border-[#a4133c] text-white hover:bg-[#8f102f] hover:border-[#8f102f] transition-all duration-300 shadow-lg rounded-full"
                          >
                            Start Processing
                          </Button>
                        )}
                        
                        {order.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'shipped')}
                            className="w-full h-10 text-xs bg-[#ffd60a] border-[#ffd60a] text-black hover:bg-[#e6c100] hover:border-[#e6c100] transition-all duration-300 shadow-lg rounded-full"
                          >
                            Mark Shipped
                          </Button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'delivered')}
                            className="w-full h-10 text-xs bg-[#efc3e6] border-[#efc3e6] text-black hover:bg-[#e8b0d9] hover:border-[#e8b0d9] transition-all duration-300 shadow-lg rounded-full"
                          >
                            Mark Delivered
                          </Button>
                        )}
                        
                        {order.paymentStatus === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdatePaymentStatus(order.id, 'paid')}
                            className="w-full h-10 text-xs bg-[#a7c957] border-[#a7c957] text-black hover:bg-[#96b84a] hover:border-[#96b84a] transition-all duration-300 shadow-lg rounded-full"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 