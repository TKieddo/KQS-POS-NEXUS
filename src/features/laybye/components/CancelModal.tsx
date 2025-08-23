'use client'

import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface LayByeContract {
  id: string
  contractNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly'
  paymentAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
  payments: Array<{
    id: string
    amount: number
    date: string
    method: 'cash' | 'card' | 'transfer'
    notes?: string
  }>
  createdAt: string
  updatedAt: string
}

interface CancelModalProps {
  contract: LayByeContract
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  isProcessing: boolean
}

export const CancelModal: React.FC<CancelModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(reason)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Cancel Contract</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Warning</h3>
            </div>
            <p className="text-sm text-red-700 mt-2">
              This action cannot be undone. The contract will be permanently cancelled.
            </p>
          </div>

          {/* Contract Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Contract Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Contract:</span>
                <span className="font-medium">{contract.contractNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{contract.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-bold text-gray-900">{formatCurrency(contract.remainingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Reason Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this contract..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 resize-none h-20 text-sm"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg"
              >
                Keep Contract
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !reason.trim()}
                className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Contract'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 