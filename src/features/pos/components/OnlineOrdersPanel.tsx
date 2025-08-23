'use client'

import React, { useState } from 'react'
import { X, Clock, CheckCircle, AlertCircle, Package, Truck, User, Phone, Mail, Calendar, DollarSign, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOnlineOrders } from '../hooks/useOnlineOrders'
import type { OnlineOrder } from '../types'

interface OnlineOrdersPanelProps {
  isOpen: boolean
  onClose: () => void
}

const orderStatusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: Truck },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
}

const paymentMethodConfig = {
  card: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
  paypal: { label: 'PayPal', color: 'bg-blue-100 text-blue-800' },
  cash_on_pickup: { label: 'Cash on Pickup', color: 'bg-green-100 text-green-800' }
}

export const OnlineOrdersPanel: React.FC<OnlineOrdersPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { orders, loading, error, fetchOrders, updateOrderStatus, getPendingOrdersCount } = useOnlineOrders()
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusOrders = () => {
    if (selectedStatus === 'all') return orders
    return orders.filter(order => order.status === selectedStatus)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OnlineOrder['status']) => {
    await updateOrderStatus(orderId, newStatus)
  }

  const getNextStatus = (currentStatus: OnlineOrder['status']): OnlineOrder['status'] | null => {
    const statusFlow = {
      pending: 'confirmed' as OnlineOrder['status'],
      confirmed: 'preparing' as OnlineOrder['status'],
      preparing: 'ready' as OnlineOrder['status'],
      ready: 'completed' as OnlineOrder['status']
    }
    return statusFlow[currentStatus] || null
  }

  const filteredOrders = getStatusOrders()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Online Orders</h2>
                <p className="text-sm text-gray-600">Manage orders from your website</p>
              </div>
              <Badge variant="secondary" className="bg-[#E5FF29] text-black">
                {getPendingOrdersCount()} Pending
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
                className="h-9 px-3"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
              className={selectedStatus === 'all' ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90' : ''}
            >
              All ({orders.length})
            </Button>
            {Object.entries(orderStatusConfig).map(([status, config]) => {
              const count = orders.filter(order => order.status === status).length
              return (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90' : ''}
                >
                  {config.label} ({count})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="text-gray-600">Loading orders...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {filteredOrders.map((order) => {
                const orderStatus = orderStatusConfig[order.status]
                const paymentConfig = paymentMethodConfig[order.payment_method]
                const nextStatus = getNextStatus(order.status)
                const StatusIcon = orderStatus.icon

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{formatDate(order.order_date)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={orderStatus.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {orderStatus.label}
                        </Badge>
                        <Badge className={paymentConfig.color}>
                          {paymentConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">{order.customer_email}</span>
                      </div>
                      {order.customer_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{order.customer_phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Pickup Date */}
                    {order.pickup_date && (
                      <div className="mb-4 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Pickup: {formatDate(order.pickup_date)}
                        </span>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{formatCurrency(item.unit_price)}</p>
                              <p className="text-gray-600">Total: {formatCurrency(item.total_price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{order.notes}</p>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">Total</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {nextStatus && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, nextStatus)}
                          className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
                        >
                          Mark as {orderStatusConfig[nextStatus]?.label}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {selectedStatus === 'all' 
                                      ? 'No online orders available at the moment.'
                  : `No orders with status "${orderStatusConfig[selectedStatus as keyof typeof orderStatusConfig]?.label}" found.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: OnlineOrder
  onClose: () => void
  onStatusUpdate: (orderId: string, status: OnlineOrder['status']) => Promise<void>
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdate
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNextStatus = (currentStatus: OnlineOrder['status']): OnlineOrder['status'] | null => {
    const statusFlow = {
      pending: 'confirmed' as OnlineOrder['status'],
      confirmed: 'preparing' as OnlineOrder['status'],
      preparing: 'ready' as OnlineOrder['status'],
      ready: 'completed' as OnlineOrder['status']
    }
    return statusFlow[currentStatus] || null
  }

  const nextStatus = getNextStatus(order.status)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{order.order_number}</h2>
              <p className="text-sm text-gray-600">{formatDate(order.order_date)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{order.customer_email}</span>
              </div>
              {order.customer_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{order.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(item.unit_price)}</p>
                      <p className="text-sm text-gray-600">Total: {formatCurrency(item.total_price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={orderStatusConfig[order.status].color}>
                  {orderStatusConfig[order.status].label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <Badge className={paymentMethodConfig[order.payment_method].color}>
                  {order.payment_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>{paymentMethodConfig[order.payment_method].label}</span>
              </div>
              {order.pickup_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Date:</span>
                  <span>{formatDate(order.pickup_date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {nextStatus && (
              <Button
                variant="default"
                onClick={async () => {
                  await onStatusUpdate(order.id, nextStatus)
                  onClose()
                }}
                className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                Mark as {orderStatusConfig[nextStatus]?.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 