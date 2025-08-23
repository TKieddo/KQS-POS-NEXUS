import React from 'react'
import { formatCurrency } from '@/lib/utils'
import { Eye, CheckCircle, XCircle, DollarSign, CreditCard, Clock, AlertTriangle, MoreHorizontal, Phone, Mail, FileText } from 'lucide-react'
import { RefundTransaction, ExchangeTransaction } from '../types'

export interface RefundTableItem extends RefundTransaction {
  type: 'refund'
}

export interface ExchangeTableItem extends ExchangeTransaction {
  type: 'exchange'
}

export type TableItem = RefundTableItem | ExchangeTableItem

interface RefundsTableProps {
  items: TableItem[]
  onViewDetails: (item: TableItem) => void
  onApprove: (item: TableItem) => void
  onReject: (item: TableItem) => void
  onProcessRefund: (item: TableItem) => void
  onCallCustomer: (item: TableItem) => void
  onSendEmail: (item: TableItem) => void
  onPrintReceipt: (item: TableItem) => void
}

export const RefundsTable: React.FC<RefundsTableProps> = ({
  items,
  onViewDetails,
  onApprove,
  onReject,
  onProcessRefund,
  onCallCustomer,
  onSendEmail,
  onPrintReceipt
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-[#E5FF29] text-black border-[#E5FF29]', icon: Clock },
      approved: { color: 'bg-black text-[#E5FF29] border-black', icon: CheckCircle },
      completed: { color: 'bg-[#E5FF29] text-black border-[#E5FF29]', icon: CheckCircle },
      rejected: { color: 'bg-black text-[#E5FF29] border-black', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    )
  }

  const getRefundMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-4 h-4 text-green-600" />
      case 'account_credit':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'loyalty_points':
        return <AlertTriangle className="w-4 h-4 text-purple-600" />
      case 'exchange_only':
        return <FileText className="w-4 h-4 text-orange-600" />
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }

  const getRefundMethodLabel = (method: string) => {
    return method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                {/* Transaction ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {item.type === 'refund' ? item.transactionId : item.originalTransactionId}
                    </div>
                    <div className="ml-2 text-xs text-gray-500">
                      {item.type === 'refund' ? 'REF' : 'EXC'}
                    </div>
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.customer.name}</div>
                    <div className="text-sm text-gray-500">{item.customer.phone}</div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.type === 'refund' 
                      ? 'bg-[#E5FF29] text-black' 
                      : 'bg-black text-[#E5FF29]'
                  }`}>
                    {item.type === 'refund' ? 'Refund' : 'Exchange'}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.type === 'refund' 
                      ? formatCurrency(item.totalRefundAmount)
                      : formatCurrency(item.totalPriceDifference)
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.type === 'refund' 
                      ? `${item.items.length} items`
                      : `${item.items.length} items`
                    }
                  </div>
                </td>

                {/* Method */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRefundMethodIcon(item.type === 'refund' ? item.refundMethod : 'exchange_only')}
                    <span className="text-sm text-gray-900">
                      {item.type === 'refund' 
                        ? getRefundMethodLabel(item.refundMethod)
                        : 'Exchange'
                      }
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.processedAt)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(item)}
                          className="p-2 text-[#E5FF29] hover:text-[#E5FF29]/80 hover:bg-[#E5FF29]/10 rounded-lg transition-all duration-200"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(item)}
                          className="p-2 text-black hover:text-black/80 hover:bg-black/10 rounded-lg transition-all duration-200"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {item.status === 'approved' && (
                                              <button
                          onClick={() => onProcessRefund(item)}
                          className="p-2 text-[#E5FF29] hover:text-[#E5FF29]/80 hover:bg-[#E5FF29]/10 rounded-lg transition-all duration-200"
                          title="Process Refund"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                    )}

                    <div className="relative group">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => onCallCustomer(item)}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Customer</span>
                          </button>
                          <button
                            onClick={() => onSendEmail(item)}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Send Email</span>
                          </button>
                          <button
                            onClick={() => onPrintReceipt(item)}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Print Receipt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No refunds found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new refund request.</p>
        </div>
      )}
    </div>
  )
} 