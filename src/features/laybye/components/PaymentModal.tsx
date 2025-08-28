'use client'

import React, { useMemo, useState } from 'react'
import { X, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { CashTenderModal } from './CashTenderModal'
import { addLaybyePayment } from '@/lib/laybye-service'

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
  paymentAmount?: number
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

interface PaymentModalProps {
  contract: LayByeContract
  isOpen: boolean
  onClose: () => void
  onSubmit: (paymentData: { amount: number; method: 'cash' | 'card' | 'transfer'; notes?: string; amountReceived?: number; isCompleted?: boolean }) => void
  isProcessing: boolean
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [paymentData, setPaymentData] = useState({
    amount: Number.isFinite(contract.paymentAmount as number)
      ? (contract.paymentAmount as number)
      : (Number.isFinite(contract.remainingAmount) ? contract.remainingAmount : 0),
    method: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  })
  const [showCashTender, setShowCashTender] = useState(false)

  const amountDue = useMemo(() => {
    const amt = Number(paymentData.amount || 0)
    if (!Number.isFinite(amt) || amt < 0) return 0
    return Math.min(amt, contract.remainingAmount)
  }, [paymentData.amount, contract.remainingAmount])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentData.method === 'cash') {
      setShowCashTender(true)
      return
    }
    await processPayment(paymentData.amount, paymentData.method, paymentData.notes)
  }

  const processPayment = async (amount: number, method: 'cash' | 'card' | 'transfer', notes?: string, amountReceived?: number) => {
    const result = await addLaybyePayment({
      laybye_id: contract.id,
      amount,
      payment_method: method,
      payment_date: new Date().toISOString(),
      notes
    })
    
    // Check if the laybye order was completed by this payment
    const isCompleted = result.success && result.data?.new_status === 'completed'
    
    onSubmit({ 
      amount, 
      method, 
      notes, 
      amountReceived,
      isCompleted: isCompleted || false
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Add Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contract Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Contract Summary</h3>
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

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <Input
                type="number"
                value={Number.isFinite(paymentData.amount) ? paymentData.amount : 0}
                onChange={(e) => {
                  const value = e.target.value
                  // Keep controlled: allow empty string to show blank field, but treat as 0 internally
                  const next = value === '' ? 0 : Number.parseFloat(value)
                  setPaymentData(prev => ({ ...prev, amount: Number.isFinite(next) ? next : 0 }))
                }}
                min="0"
                max={contract.remainingAmount}
                step="0.01"
                className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentData.method}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  method: e.target.value as 'cash' | 'card' | 'transfer'
                }))}
                className="w-full h-10 rounded-lg border border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Add any notes about this payment..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none h-20 text-sm"
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || paymentData.amount <= 0 || paymentData.amount > contract.remainingAmount}
                className="flex-1 h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Processing...
                  </>
                ) : (
                  (paymentData.method === 'cash' ? 'Proceed' : 'Pay')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Cash Tender Modal */}
      <CashTenderModal
        isOpen={showCashTender}
        amountDue={amountDue}
        onClose={() => setShowCashTender(false)}
        onConfirm={async (amountReceived) => {
          setShowCashTender(false)
          await processPayment(amountDue, 'cash', paymentData.notes, amountReceived)
        }}
      />
    </div>
  )
} 