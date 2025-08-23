'use client'

import React, { useState } from 'react'
import { X, MapPin, Clock, Truck, CheckCircle, XCircle, Edit, Phone, Package, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Delivery } from '../../types/deliveries'

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
              <h3 className="font-medium text-gray-900">Order Information</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                {getStatusIcon(delivery.status)}
                <span className="ml-1 capitalize">{delivery.status.replace('-', ' ')}</span>
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{delivery.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(delivery.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{formatDate(delivery.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{delivery.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{delivery.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right max-w-xs">{delivery.customerAddress}</span>
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Delivery Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{delivery.deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{delivery.deliveryTime}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Delivery Items
            </h3>
            <div className="space-y-2">
              {delivery.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">(x{item.quantity})</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(delivery.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {delivery.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Delivery Notes</h3>
              <p className="text-sm text-gray-700">{delivery.notes}</p>
            </div>
          )}

          {/* Status Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {delivery.status === 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('in-transit')}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Mark In Transit
                </Button>
              )}
              
              {delivery.status === 'in-transit' && (
                <Button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Delivered
                </Button>
              )}
              
              {(delivery.status === 'pending' || delivery.status === 'in-transit') && (
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Delivery
                </Button>
              )}
            </div>
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
          <Button
            onClick={() => window.open(`tel:${delivery.customerPhone}`)}
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            <Phone className="h-4 w-4 mr-1" />
            Call Customer
          </Button>
        </div>
      </div>
    </div>
  )
} 