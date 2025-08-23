'use client'

import React, { useState } from 'react'
import { X, MapPin, Clock, Truck, CheckCircle, XCircle, Edit, Phone, Package, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Delivery } from '@/features/pos/types/deliveries'

interface DeliveryDetailsModalProps {
  delivery: Delivery
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (deliveryId: string, status: Delivery['status']) => void
}

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  delivery,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen) return null

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-transit': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in-transit': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleStatusUpdate = async (newStatus: Delivery['status']) => {
    setIsUpdating(true)
    try {
      await onUpdateStatus(delivery.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Delivery Details
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{delivery.orderNumber}</h3>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border-2 ${getStatusColor(delivery.status)}`}>
                {getStatusIcon(delivery.status)}
                <span className="ml-2 capitalize">{delivery.status.replace('-', ' ')}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{formatDate(delivery.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2 font-medium">{formatDate(delivery.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-blue-600" />
              Customer Information
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{delivery.customerName}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                <span>{delivery.customerPhone}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                <span className="text-sm">{delivery.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Items ({delivery.items.length})
            </h3>
            
            <div className="space-y-3">
              {delivery.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-gray-600">Total: {formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(delivery.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-green-600" />
              Delivery Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">{delivery.deliveryDate}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="ml-2 font-medium">{formatTime(delivery.deliveryTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {delivery.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{delivery.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {delivery.status === 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('in-transit')}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Mark In Transit
                </Button>
              )}
              
              {delivery.status === 'in-transit' && (
                <Button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Delivered
                </Button>
              )}
              
              {(delivery.status === 'pending' || delivery.status === 'in-transit') && (
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Delivery
                </Button>
              )}
            </div>
            
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 