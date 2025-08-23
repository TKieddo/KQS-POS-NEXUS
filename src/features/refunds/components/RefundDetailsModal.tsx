import React from 'react'
import { X, User, Calendar, DollarSign, Package, FileText, Phone, Mail, MapPin } from 'lucide-react'
import { RefundTransaction, ExchangeTransaction } from '../types'

export interface RefundDetailsItem extends RefundTransaction {
  type: 'refund'
}

export interface ExchangeDetailsItem extends ExchangeTransaction {
  type: 'exchange'
}

export type DetailsItem = RefundDetailsItem | ExchangeDetailsItem

interface RefundDetailsModalProps {
  item: DetailsItem | null
  isOpen: boolean
  onClose: () => void
  onApprove: (item: DetailsItem) => void
  onReject: (item: DetailsItem) => void
  onProcessRefund: (item: DetailsItem) => void
  onCallCustomer: (item: DetailsItem) => void
  onSendEmail: (item: DetailsItem) => void
}

export const RefundDetailsModal: React.FC<RefundDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onProcessRefund,
  onCallCustomer,
  onSendEmail
}) => {
  if (!item || !isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-200' },
      completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {item.type === 'refund' ? 'Refund Details' : 'Exchange Details'}
            </h2>
            <p className="text-gray-600 mt-1">
              {item.type === 'refund' ? item.transactionId : item.originalTransactionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {getStatusBadge(item.status)}
              <span className="text-sm text-gray-500">
                Processed by {item.processedBy}
              </span>
            </div>
            
            {item.status === 'pending' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onReject(item)}
                  className="px-4 py-2 bg-black text-[#E5FF29] border border-black rounded-xl font-medium hover:bg-black/80 transition-all duration-200"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(item)}
                  className="px-4 py-2 bg-[#E5FF29] text-black border border-[#E5FF29] rounded-xl font-medium hover:bg-[#E5FF29]/80 transition-all duration-200"
                >
                  Approve
                </button>
              </div>
            )}

            {item.status === 'approved' && (
              <button
                onClick={() => onProcessRefund(item)}
                className="px-6 py-2 bg-[#E5FF29] text-black rounded-xl font-medium hover:bg-[#E5FF29]/80 transition-all duration-200"
              >
                Process {item.type === 'refund' ? 'Refund' : 'Exchange'}
              </button>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-black rounded-lg">
                <User className="w-5 h-5 text-[#E5FF29]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-900">{item.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-gray-900">{item.customer.phone}</p>
                  <button
                    onClick={() => onCallCustomer(item)}
                    className="p-1 text-[#E5FF29] hover:bg-[#E5FF29]/10 rounded transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-gray-900">{item.customer.email}</p>
                  <button
                    onClick={() => onSendEmail(item)}
                    className="p-1 text-[#E5FF29] hover:bg-[#E5FF29]/10 rounded transition-all duration-200"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {item.customer.accountBalance !== undefined && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Balance</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.customer.accountBalance)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-black rounded-lg">
                <FileText className="w-5 h-5 text-[#E5FF29]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                <p className="text-lg font-semibold text-gray-900">
                  {item.type === 'refund' ? item.transactionId : item.originalTransactionId}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date Processed</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(item.processedAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {item.type === 'refund' ? 'Refund Method' : 'Exchange Type'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {item.type === 'refund' 
                    ? item.refundMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : 'Product Exchange'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {item.type === 'refund' ? 'Total Refund' : 'Price Difference'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {item.type === 'refund' 
                    ? formatCurrency(item.totalRefundAmount)
                    : formatCurrency(item.totalPriceDifference)
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-black rounded-lg">
                <Package className="w-5 h-5 text-[#E5FF29]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.type === 'refund' ? 'Refunded Items' : 'Exchanged Items'}
              </h3>
            </div>
            
            <div className="space-y-4">
              {item.items.map((itemDetail, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.type === 'refund' 
                              ? (itemDetail as any).product.name
                              : (itemDetail as any).originalProduct.name
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {item.type === 'refund' 
                              ? (itemDetail as any).product.sku
                              : (itemDetail as any).originalProduct.sku
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        Qty: {itemDetail.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.type === 'refund' 
                          ? formatCurrency((itemDetail as any).refundAmount)
                          : formatCurrency((itemDetail as any).priceDifference)
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-gray-900">{itemDetail.reason}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium text-gray-900 capitalize">{itemDetail.condition}</span>
                    </div>
                    {itemDetail.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {itemDetail.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-700">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 