'use client'

import React, { useState } from 'react'
import { DollarSign, Calendar, Receipt, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LaybyeItem } from './LaybyeTable'
import { formatCurrency } from '@/lib/utils'

interface PaymentRecordingModalProps {
  laybye: LaybyeItem | null
  isOpen: boolean
  onClose: () => void
  onPaymentRecorded: (payment: PaymentRecord) => void
}

export interface PaymentRecord {
  id: string
  laybyeId: string
  amount: number
  paymentDate: string
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other'
  receiptNumber: string
  notes?: string
}

export function PaymentRecordingModal({ 
  laybye, 
  isOpen, 
  onClose, 
  onPaymentRecorded 
}: PaymentRecordingModalProps) {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'other',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!laybye || !isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = 'Valid payment amount is required'
    }
    
    if (parseFloat(paymentData.amount) > laybye.balanceRemaining) {
      newErrors.amount = 'Payment amount cannot exceed remaining balance'
    }
    
    if (!paymentData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const payment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      laybyeId: laybye.id,
      amount: parseFloat(paymentData.amount),
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      receiptNumber: `RCP-${Date.now()}`,
      notes: paymentData.notes || undefined
    }

    onPaymentRecorded(payment)
    onClose()
    
    // Reset form
    setPaymentData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: ''
    })
  }

  const generateReceipt = () => {
    // TODO: Implement receipt generation
    console.log('Generating receipt for payment')
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white border-gray-200 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
              Record Payment - {laybye.id}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Laybye Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-[hsl(var(--primary))]">{laybye.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(laybye.totalValue)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Remaining</p>
                <div className="text-lg font-semibold text-orange-600">
                  {formatCurrency(laybye.balanceRemaining)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
                <p className="text-sm text-[hsl(var(--primary))]">
                  {new Date(laybye.nextPaymentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={laybye.balanceRemaining}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10 border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="pl-10 border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              {errors.paymentDate && (
                <p className="text-sm text-red-600 mt-1">{errors.paymentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  paymentMethod: e.target.value as 'cash' | 'card' | 'bank_transfer' | 'other' 
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Add any notes about this payment..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={generateReceipt}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Generate Receipt
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
} 