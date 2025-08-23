'use client'

import React from 'react'
import { 
  CheckCircle, 
  DollarSign, 
  Receipt, 
  Printer, 
  X,
  CreditCard,
  Smartphone,
  Building2,
  ArrowLeftRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { CartItem, Customer } from '../types'

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  paymentMethod: string
  totalAmount: number
  amountPaid: number
  change: number
  cart: CartItem[]
  customer: Customer | null
  transactionNumber?: string
  onPrintReceipt?: () => void
}

const paymentMethodIcons = {
  cash: <DollarSign className="h-6 w-6" />,
  card: <CreditCard className="h-6 w-6" />,
  transfer: <Building2 className="h-6 w-6" />,
  mpesa: <Smartphone className="h-6 w-6" />,
  ecocash: <ArrowLeftRight className="h-6 w-6" />
}

const paymentMethodColors = {
  cash: 'text-green-600 bg-green-100',
  card: 'text-blue-600 bg-blue-100',
  transfer: 'text-purple-600 bg-purple-100',
  mpesa: 'text-red-600 bg-red-100',
  ecocash: 'text-orange-600 bg-orange-100'
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  totalAmount,
  amountPaid,
  change,
  cart,
  customer,
  transactionNumber,
  onPrintReceipt
}) => {
  if (!isOpen) return null

  const paymentMethodName = paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
  const isCashPayment = paymentMethod === 'cash'
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Payment Successful!</h2>
                <p className="text-green-100 text-lg">Transaction completed successfully</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 border-white/30 hover:bg-white/20 text-white border-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Payment Method & Transaction Info */}
            <div className="space-y-6">
              {/* Payment Method Badge */}
              <div className="text-center">
                <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-2xl ${paymentMethodColors[paymentMethod as keyof typeof paymentMethodColors] || 'text-gray-600 bg-gray-100'} shadow-lg`}>
                  <div className="p-1">
                    {paymentMethodIcons[paymentMethod as keyof typeof paymentMethodIcons] || <DollarSign className="h-6 w-6" />}
                  </div>
                  <span className="font-bold text-lg">{paymentMethodName} Payment</span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Transaction Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Amount:</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(totalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Amount Paid:</span>
                    <span className="font-semibold text-lg text-gray-700">{formatCurrency(amountPaid)}</span>
                  </div>

                  {transactionNumber && (
                    <>
                      <div className="border-t border-gray-200 pt-3 mt-3"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Transaction #:</span>
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{transactionNumber}</span>
                      </div>
                    </>
                  )}

                  {customer && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Customer:</span>
                      <span className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Change Display or Completion Message */}
            <div className="space-y-6">
              {isCashPayment && change > 0 ? (
                <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-10 text-center text-white shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-yellow-100 font-bold text-2xl mb-3">💰 CHANGE TO GIVE</div>
                  <div className="text-7xl font-black mb-4 drop-shadow-lg">{formatCurrency(change)}</div>
                  <div className="text-yellow-100 text-lg font-medium mb-4">Please give this amount to the customer</div>
                  <div className="bg-white/20 rounded-full px-6 py-3 inline-block">
                    <div className="text-base font-semibold">Cash Transaction Complete</div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-10 text-center shadow-sm">
                  <div className="bg-green-100 rounded-full p-6 inline-block mb-6">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-2xl mb-3">Transaction Complete!</h3>
                  <p className="text-gray-700 font-medium text-lg mb-2">Payment processed successfully</p>
                  <p className="text-gray-600">No change required - exact amount</p>
                  
                  <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
            {onPrintReceipt && (
              <Button
                onClick={onPrintReceipt}
                variant="outline"
                size="lg"
                className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 font-semibold"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Receipt
              </Button>
            )}
            <Button
              onClick={onClose}
              size="lg"
              className="px-12 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg"
            >
              Start New Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}