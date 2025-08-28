'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  Building2, 
  Smartphone, 
  ArrowLeftRight,
  User,
  Wallet,
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { getEnabledPaymentMethods } from '@/lib/payment-options-service'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentMethodSelect: (method: string, amount: number) => void
  totalAmount: number
  isSplitPayment?: boolean
  hasSelectedCustomer?: boolean
}

type UiMethod = {
  id: string
  name: string
  description: string
  color: string
  hoverColor: string
  icon: React.ReactNode
}

const UI_METHOD_CONFIG: Record<string, Omit<UiMethod, 'id' | 'name' | 'description'>> = {
  cash: {
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    icon: <DollarSign className="h-6 w-6" />
  },
  card: {
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    icon: <CreditCard className="h-6 w-6" />
  },
  transfer: {
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    icon: <Building2 className="h-6 w-6" />
  },
  mpesa: {
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    icon: <Smartphone className="h-6 w-6" />
  },
  ecocash: {
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    icon: <ArrowLeftRight className="h-6 w-6" />
  },
  airtel_money: {
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    icon: <Smartphone className="h-6 w-6" />
  },
  orange_money: {
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    icon: <Smartphone className="h-6 w-6" />
  },
  account: {
    color: 'bg-gray-800',
    hoverColor: 'hover:bg-gray-900',
    icon: <User className="h-6 w-6" />
  }
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  totalAmount,
  isSplitPayment = false,
  hasSelectedCustomer = false
}) => {
  console.log('🎯 PaymentMethodModal: Component rendered, onPaymentMethodSelect:', typeof onPaymentMethodSelect)
  
  const [methods, setMethods] = useState<UiMethod[]>([])
  const [showAmountModal, setShowAmountModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<UiMethod | null>(null)
  const [amountPaid, setAmountPaid] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setError('') // Clear error when modal closes
      return
    }
    
    // Clear error when modal opens and customer is selected
    if (hasSelectedCustomer) {
      setError('')
    }
    const load = async () => {
      console.log('🔍 PaymentMethodModal: Loading payment methods...')
      const enabled = await getEnabledPaymentMethods()
      console.log('📋 PaymentMethodModal: Enabled methods:', enabled)
      
      // Map admin keys to POS ids
      const uiIds: string[] = []
      if (enabled.includes('cash')) uiIds.push('cash')
      if (enabled.includes('card')) uiIds.push('card')
      if (enabled.includes('eft')) uiIds.push('transfer')
      if (enabled.includes('mpesa')) uiIds.push('mpesa')
      if (enabled.includes('ecocash')) uiIds.push('ecocash')
      if (enabled.includes('airtel_money')) uiIds.push('airtel_money')
      if (enabled.includes('orange_money')) uiIds.push('orange_money')
      if (enabled.includes('credit')) uiIds.push('account')

      console.log('🎯 PaymentMethodModal: Mapped UI IDs:', uiIds)

      const ui: UiMethod[] = uiIds.map((id) => {
        const base = UI_METHOD_CONFIG[id]
        const nameMap: Record<string, string> = {
          cash: 'Cash',
          card: 'Card',
          transfer: 'Bank Transfer',
          mpesa: 'M-Pesa',
          ecocash: 'EcoCash',
          airtel_money: 'Airtel Money',
          orange_money: 'Orange Money',
          account: 'Account Payment'
        }
        const descMap: Record<string, string> = {
          cash: 'Physical cash payment',
          card: 'Credit/Debit card payment',
          transfer: 'Direct bank transfer',
          mpesa: 'M-Pesa mobile money payment',
          ecocash: 'EcoCash mobile payment',
          airtel_money: 'Airtel Money mobile payment',
          orange_money: 'Orange Money mobile payment',
          account: 'Pay using customer account balance'
        }
        return {
          id,
          name: nameMap[id] || id,
          description: descMap[id] || '',
          color: base.color,
          hoverColor: base.hoverColor,
          icon: base.icon
        }
      })
      
      console.log('✅ PaymentMethodModal: Final methods:', ui)
      setMethods(ui)
    }
    load()
  }, [isOpen])

  if (!isOpen) return null

  const handleMethodSelect = (method: UiMethod) => {
    if (method.id === 'account') {
      // For account payments, check if customer is selected
      if (!hasSelectedCustomer) {
        // Show error message that customer selection is required
        setError('Please select a customer first for account payment')
        return
      }
      
      // Show amount modal for account payment (like cash)
      setSelectedMethod(method)
      setShowAmountModal(true)
      setError('') // Clear any existing error
    } else {
      // For other payment methods, show amount modal
      setSelectedMethod(method)
      setShowAmountModal(true)
      setError('') // Clear any existing error
    }
  }

  const handleAmountConfirm = () => {
    const amount = parseFloat(amountPaid)
    if (amount > 0 && selectedMethod) {
      onPaymentMethodSelect(selectedMethod.id, amount)
      setAmountPaid('')
      setShowAmountModal(false)
      setSelectedMethod(null)
      onClose()
    }
  }

  const handleAmountCancel = () => {
    setAmountPaid('')
    setShowAmountModal(false)
    setSelectedMethod(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-4xl w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex-shrink-0 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#E5FF29] p-2 rounded-xl">
                <Wallet className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
                <p className="text-gray-600 text-sm">Choose how you'd like to pay</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total Amount Display */}
          <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-2xl mb-6 border border-gray-200/50">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {isSplitPayment ? 'Remaining Amount' : 'Total Amount'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-gray-200 hover:border-gray-300 rounded-2xl overflow-hidden hover:scale-[1.02] backdrop-blur-sm"
                onClick={() => handleMethodSelect(method)}
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method.color} ${method.hoverColor} transition-colors duration-200 shadow-sm`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base">{method.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-2 bg-[#E5FF29] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {methods.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100/80 backdrop-blur-sm p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-200/50">
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods Available</h3>
              <p className="text-gray-600">Please configure payment methods in the admin settings</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-200/50 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {methods.length} payment method{methods.length !== 1 ? 's' : ''} available
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-6 text-base font-medium"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Amount Input Modal */}
      {showAmountModal && selectedMethod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full shadow-2xl border border-white/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex-shrink-0 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${selectedMethod.color}`}>
                    {selectedMethod.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedMethod.name} Payment</h2>
                    <p className="text-gray-600 text-sm">
                      {selectedMethod.id === 'account' ? 'Enter amount to deduct from customer balance' : 'Enter amount received'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAmountCancel}
                  className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Total Amount */}
              <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {selectedMethod.id === 'account' ? 'Amount to Deduct' : 'Amount Received'}
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full text-2xl font-semibold text-center h-16 px-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Change/Balance Display */}
              {selectedMethod.id === 'account' ? (
                // Account payment display
                amountPaid && parseFloat(amountPaid) >= totalAmount && (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-1">Payment Complete</p>
                      <p className="text-2xl font-bold text-green-700">Full amount deducted</p>
                    </div>
                  </div>
                )
              ) : (
                // Regular payment display
                <>
                  {amountPaid && parseFloat(amountPaid) >= totalAmount && (
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                      <div className="text-center">
                        <p className="text-sm text-green-600 mb-1">Change to Give</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(parseFloat(amountPaid) - totalAmount)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {amountPaid && parseFloat(amountPaid) < totalAmount && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 mb-1">Remaining to Pay</p>
                    <p className="text-lg font-semibold text-blue-700">{formatCurrency(totalAmount - parseFloat(amountPaid))}</p>
                    <p className="text-xs text-blue-600 mt-1">You can add another payment method</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-200/50 rounded-b-3xl flex gap-3">
              <Button
                variant="outline"
                onClick={handleAmountCancel}
                className="flex-1 h-12 text-base font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAmountConfirm}
                disabled={!amountPaid || parseFloat(amountPaid) <= 0}
                className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-12 text-base font-semibold disabled:bg-gray-300 disabled:text-gray-500"
              >
                {selectedMethod.id === 'account' ? 'Deduct from Account' : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
