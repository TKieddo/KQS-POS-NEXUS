'use client'

import React from 'react'
import { Receipt, Calendar, Package, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface SalesListProps {
  sales: Sale[]
  onRefundItem: (sale: Sale) => void
  onRefundSale: (sale: Sale) => void
  title: string
}

export const SalesList: React.FC<SalesListProps> = ({ 
  sales, 
  onRefundItem, 
  onRefundSale,
  title
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'refunded':
        return <RefreshCw className="h-4 w-4" />
      case 'partially_refunded':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No sales found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title} ({sales.length})</h3>
      
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-6 w-6 text-gray-600" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">
                  {sale.receiptNumber}
                </h3>
                <Badge className={getStatusColor(sale.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(sale.status)}
                    <span>{sale.status.replace('_', ' ')}</span>
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{sale.customerName}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {sale.date} at {sale.time}
                </span>
                <span>{sale.items} items</span>
                <span>{sale.paymentMethod}</span>
                {sale.refundedAmount && (
                  <span className="text-red-600">
                    Refunded: {formatCurrency(sale.refundedAmount)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(sale.total)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefundItem(sale)}
                disabled={sale.status === 'refunded'}
              >
                <Package className="h-4 w-4 mr-2" />
                Refund Item
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefundSale(sale)}
                disabled={sale.status === 'refunded'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refund All
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 