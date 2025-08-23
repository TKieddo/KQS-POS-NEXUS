'use client'

import React, { useState } from 'react'
import { X, Clock, User, Package, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { HeldOrder } from '../hooks/useHeldOrders'

interface HeldOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  heldOrders: HeldOrder[]
  onRetrieveOrder: (order: HeldOrder) => void
  onRemoveOrder: (orderId: string) => void
}

// Utility function for formatting dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  isOpen,
  onClose,
  heldOrders,
  onRetrieveOrder,
  onRemoveOrder
}) => {
  const [selectedOrder, setSelectedOrder] = useState<HeldOrder | null>(null)

  if (!isOpen) return null

  const handleRetrieveOrder = (order: HeldOrder) => {
    onRetrieveOrder(order)
    onClose()
  }

  const handleRemoveOrder = (orderId: string) => {
    if (confirm('Are you sure you want to remove this held order?')) {
      onRemoveOrder(orderId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Held Orders ({heldOrders.length})
            </h2>
            <button
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Order List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {heldOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No held orders</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {heldOrders.map((order) => (
                  <HeldOrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={() => setSelectedOrder(order)}
                    onRetrieve={() => handleRetrieveOrder(order)}
                    onRemove={() => handleRemoveOrder(order.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Order Details */}
          <div className="w-1/2 p-4">
            {selectedOrder ? (
              <HeldOrderDetails order={selectedOrder} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          {selectedOrder && (
            <Button
              onClick={() => handleRetrieveOrder(selectedOrder)}
              className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Retrieve Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface HeldOrderCardProps {
  order: HeldOrder
  isSelected: boolean
  onSelect: () => void
  onRetrieve: () => void
  onRemove: () => void
}

const HeldOrderCard: React.FC<HeldOrderCardProps> = ({
  order,
  isSelected,
  onSelect,
  onRetrieve,
  onRemove
}) => {
  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-[#E5FF29] bg-[#E5FF29]/10'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{order.id}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRetrieve()
            }}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/20"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/20"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">
            {order.customer ? order.customer.name : 'No customer'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Package className="h-3 w-3 text-gray-500" />
          <span className="text-gray-600">{order.cart.length} items</span>
        </div>
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(order.total)}
        </div>
        <div className="text-xs text-gray-500">
          Held: {formatDate(order.heldAt)}
        </div>
      </div>
    </div>
  )
}

interface HeldOrderDetailsProps {
  order: HeldOrder
}

const HeldOrderDetails: React.FC<HeldOrderDetailsProps> = ({ order }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Held At:</span>
            <span className="font-medium">{formatDate(order.heldAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{order.cart.length}</span>
          </div>
        </div>
      </div>

      {order.customer && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-900">{order.customer.name}</p>
            <p className="text-sm text-gray-600">{order.customer.email}</p>
            <p className="text-sm text-gray-600">{order.customer.phone}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Items</h3>
        <div className="space-y-2">
          {order.cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(item.unitPrice)}</p>
                <p className="text-xs text-gray-600">Total: {formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(order.total)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span>{formatCurrency(order.total - order.discount)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
} 