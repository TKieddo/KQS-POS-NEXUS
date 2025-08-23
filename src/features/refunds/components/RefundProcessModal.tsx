import React, { useState } from 'react'
import { X, DollarSign, CreditCard, Gift, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { RefundTransaction, ExchangeTransaction } from '../types'

export interface RefundProcessItem extends RefundTransaction {
  type: 'refund'
}

export interface ExchangeProcessItem extends ExchangeTransaction {
  type: 'exchange'
}

export type ProcessItem = RefundProcessItem | ExchangeProcessItem

interface RefundProcessModalProps {
  item: ProcessItem | null
  isOpen: boolean
  onClose: () => void
  onProcess: (item: ProcessItem, method: string, notes: string) => void
}

export const RefundProcessModal: React.FC<RefundProcessModalProps> = ({
  item,
  isOpen,
  onClose,
  onProcess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!item || !isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleProcess = async () => {
    if (!selectedMethod) return
    
    setIsProcessing(true)
    try {
      await onProcess(item, selectedMethod, notes)
      onClose()
    } catch (error) {
      console.error('Error processing refund:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const refundMethods = [
    {
      id: 'cash',
      name: 'Cash Refund',
      description: 'Refund in cash to customer',
      icon: DollarSign,
      color: 'bg-[#E5FF29]/10 border-[#E5FF29]/30 text-black',
      iconColor: 'text-[#E5FF29]',
      disabled: false
    },
    {
      id: 'account_credit',
      name: 'Account Credit',
      description: 'Credit customer account for future purchases',
      icon: CreditCard,
      color: 'bg-black/5 border-black/20 text-black',
      iconColor: 'text-black',
      disabled: false
    },
    {
      id: 'loyalty_points',
      name: 'Loyalty Points',
      description: 'Convert refund to loyalty points',
      icon: Gift,
      color: 'bg-[#E5FF29]/10 border-[#E5FF29]/30 text-black',
      iconColor: 'text-[#E5FF29]',
      disabled: !item.customer.loyaltyPoints
    },
    {
      id: 'exchange_only',
      name: 'Exchange Only',
      description: 'Exchange for different product',
      icon: Package,
      color: 'bg-black/5 border-black/20 text-black',
      iconColor: 'text-black',
      disabled: false
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Process {item.type === 'refund' ? 'Refund' : 'Exchange'}
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
          {/* Transaction Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{item.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {item.type === 'refund' ? 'Refund Amount' : 'Price Difference'}
                </p>
                <p className="font-semibold text-gray-900">
                  {item.type === 'refund' 
                    ? formatCurrency(item.totalRefundAmount)
                    : formatCurrency(item.totalPriceDifference)
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Items</p>
                <p className="font-semibold text-gray-900">{item.items.length} items</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Account Balance</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.customer.accountBalance || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Refund Method Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Refund Method</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {refundMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => !method.disabled && setSelectedMethod(method.id)}
                    disabled={method.disabled}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedMethod === method.id
                        ? `${method.color} border-black`
                        : method.disabled
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-[#E5FF29]" />
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-black ${method.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        {method.disabled && (
                          <p className="text-xs text-black mt-1 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not available
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add any additional notes about this refund..."
            />
          </div>

          {/* Confirmation */}
          {selectedMethod && (
            <div className="bg-[#E5FF29]/10 border border-[#E5FF29]/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-[#E5FF29] rounded">
                  <CheckCircle className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h4 className="font-semibold text-black">Confirm Processing</h4>
                  <p className="text-sm text-black mt-1">
                    You are about to process this {item.type === 'refund' ? 'refund' : 'exchange'} using{' '}
                    <span className="font-semibold">
                      {refundMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                    . This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={!selectedMethod || isProcessing}
              className="px-6 py-2.5 bg-[#E5FF29] text-black rounded-xl font-medium hover:bg-[#E5FF29]/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Process {item.type === 'refund' ? 'Refund' : 'Exchange'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 