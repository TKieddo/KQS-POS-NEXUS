'use client'

import React from 'react'
import { MapPin, Clock, Truck, CheckCircle, XCircle, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Delivery } from '../../types/deliveries'

interface DeliveryCardProps {
  delivery: Delivery
  onViewDetails: () => void
  onUpdateStatus: (deliveryId: string, status: Delivery['status']) => void
  onDelete: (deliveryId: string) => void
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  onViewDetails,
  onUpdateStatus,
  onDelete
}) => {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{delivery.orderNumber}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
            {getStatusIcon(delivery.status)}
            <span className="ml-1 capitalize">{delivery.status.replace('-', ' ')}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{delivery.customerAddress}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-medium text-gray-900 mb-1">{delivery.customerName}</h4>
        <p className="text-sm text-gray-600">{delivery.customerPhone}</p>
      </div>

      {/* Items Summary */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Items ({delivery.items.length})</span>
          <span className="text-sm font-bold text-gray-900">{formatCurrency(delivery.totalAmount)}</span>
        </div>
        
        <div className="space-y-1">
          {delivery.items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex justify-between text-xs text-gray-600">
              <span className="truncate">{item.name} (x{item.quantity})</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          {delivery.items.length > 2 && (
            <div className="text-xs text-gray-500">
              +{delivery.items.length - 2} more items
            </div>
          )}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{delivery.deliveryDate}</span>
          </div>
          <span className="text-gray-900 font-medium">{delivery.deliveryTime}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 text-xs bg-[#E5FF29]/10 hover:bg-[#E5FF29]/20 text-black border-[#E5FF29]/30"
          >
            View Details
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            {/* Quick Actions Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-1">
                {delivery.status === 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(delivery.id, 'in-transit')}
                    className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark In Transit
                  </button>
                )}
                
                {delivery.status === 'in-transit' && (
                  <button
                    onClick={() => onUpdateStatus(delivery.id, 'delivered')}
                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </button>
                )}
                
                {(delivery.status === 'pending' || delivery.status === 'in-transit') && (
                  <button
                    onClick={() => onUpdateStatus(delivery.id, 'cancelled')}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Delivery
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(delivery.id)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 