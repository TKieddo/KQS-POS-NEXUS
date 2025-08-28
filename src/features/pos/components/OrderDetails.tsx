'use client'

import React, { useState, useEffect } from 'react'
import { 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  ShoppingCart,
  User,
  ArrowRight,
  Percent,
  CreditCard,
  CheckCircle,
  Receipt,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { usePOSSettingsHook } from '@/hooks/usePOSSettings'
import { getPaymentOption } from '@/lib/payment-options-service'
import { DiscountModal } from './DiscountModal'
import { LaybyeModal } from './LaybyeModal'
import { PaymentMethodModal } from './PaymentMethodModal'
import { CustomerSelectionModal } from './CustomerSelectionModal'
import type { CartItem, Customer } from '../types'

interface OrderDetailsProps {
  cart: CartItem[]
  customer: Customer | null
  total: number
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onPaymentComplete: (paymentMethod: string, paymentAmount: number, splitPayments?: Array<{method: string, amount: number}>) => void
  onCustomerSelect: (customer: Customer) => void
  onCustomerClear: () => void
  onDiscountApplied?: (discountAmount: number, discountType: 'percentage' | 'fixed') => void
  onLaybyeCreated?: (laybyeData: any) => void
  onHoldOrder?: () => void
  processingPayment?: boolean
  processingLaybye?: boolean
  showLaybyePaymentSuccess?: boolean
  laybyePaymentDetails?: {
    paymentMethod: string
    depositAmount: number
    amountPaid: number
    change: number
    transactionNumber?: string
  } | null
  onLaybyePaymentComplete?: () => void
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  cart,
  customer,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onPaymentComplete,
  onCustomerSelect,
  onCustomerClear,
  onDiscountApplied,
  onLaybyeCreated,
  onHoldOrder,
  processingPayment = false,
  processingLaybye = false,
  showLaybyePaymentSuccess = false,
  laybyePaymentDetails = null,
  onLaybyePaymentComplete
}) => {
  const { settings: posSettings } = usePOSSettingsHook()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showLaybyeModal, setShowLaybyeModal] = useState(false)
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [paymentJustCompleted, setPaymentJustCompleted] = useState(false)
  const [splitPayments, setSplitPayments] = useState<Array<{method: string, amount: number}>>([])
  const [remainingAmount, setRemainingAmount] = useState(0)
  const [lastPaymentDetails, setLastPaymentDetails] = useState<{
    paymentMethod: string
    totalAmount: number
    amountPaid: number
    change: number
    transactionNumber?: string
    splitPayments?: Array<{method: string, amount: number}>
  } | null>(null)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [laybyeEnabled, setLaybyeEnabled] = useState(false)

  // VAT is already included in product prices, so no additional tax calculation
  const taxAmount = 0
  const finalTotal = total - discount
  
  // Calculate remaining amount for split payments
  const totalPaid = splitPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingToPay = Math.max(0, finalTotal - totalPaid)

  // Hide payment success state when items are added to cart
  useEffect(() => {
    if (cart.length > 0 && showPaymentSuccess && !paymentJustCompleted) {
      setShowPaymentSuccess(false)
      setLastPaymentDetails(null)
    }
    // Reset the payment completed flag when cart becomes empty (after payment clears cart)
    if (cart.length === 0 && paymentJustCompleted) {
      setPaymentJustCompleted(false)
    }
  }, [cart.length, showPaymentSuccess, paymentJustCompleted])

  useEffect(() => {
    const load = async () => {
      const enabled = await getPaymentOption<boolean>('laybye_enabled', false)
      setLaybyeEnabled(Boolean(enabled))
    }
    load()
  }, [])

  const handlePayment = async (paymentMethod: string = 'cash', cashAmount?: number) => {
    if (cart.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // For cash payments, use the provided cash amount
      // For non-cash payments, always use the exact total amount
      const paymentAmount = paymentMethod === 'cash' 
        ? (cashAmount || finalTotal) 
        : finalTotal
      const changeAmount = paymentAmount - finalTotal
      
      console.log('Processing payment:', {
        items: cart,
        customer,
        total: finalTotal,
        amountPaid: paymentAmount,
        change: changeAmount,
        discount,
        paymentMethod
      })
      
      // Generate a proper transaction number
      const now = new Date()
      const transactionNumber = `TXN${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
      
      // Store payment details for success modal
      setLastPaymentDetails({
        paymentMethod,
        totalAmount: finalTotal,
        amountPaid: paymentAmount,
        change: changeAmount,
        transactionNumber,
        splitPayments: [{
          method: paymentMethod,
          amount: paymentAmount
        }]
      })
      
      // Call the parent payment handler
      onPaymentComplete(paymentMethod, paymentAmount)
      
      // Show payment success state in sidebar and set flag to prevent hiding
      setPaymentJustCompleted(true)
      setShowPaymentSuccess(true)
      
      // Reset form
      setDiscount(0)
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const addSplitPayment = (method: string, amount: number) => {
    if (amount <= 0) return
    
    const newPayment = { method, amount }
    
    // If this completes the payment, process the transaction with the updated payments
    if (totalPaid + amount >= finalTotal) {
      const updatedSplitPayments = [...splitPayments, newPayment]
      processSplitPaymentTransaction(updatedSplitPayments)
    } else {
      setSplitPayments(prev => [...prev, newPayment])
    }
  }

  const removeSplitPayment = (index: number) => {
    setSplitPayments(prev => prev.filter((_, i) => i !== index))
  }

  const processSplitPaymentTransaction = async (paymentsToProcess?: Array<{method: string, amount: number}>) => {
    const payments = paymentsToProcess || splitPayments
    if (payments.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // Use the first payment method as the primary method for the transaction
      const primaryMethod = payments[0].method
      
      console.log('Processing split payment transaction:', {
        items: cart,
        customer,
        total: finalTotal,
        splitPayments: payments,
        primaryMethod
      })
      
      // Generate a proper transaction number
      const now = new Date()
      const transactionNumber = `TXN${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
      
      // Calculate total amount paid and change
      const totalAmountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const changeAmount = totalAmountPaid - finalTotal
      
      // Store payment details for success modal
      setLastPaymentDetails({
        paymentMethod: primaryMethod,
        totalAmount: finalTotal,
        amountPaid: totalAmountPaid,
        change: changeAmount,
        transactionNumber,
        splitPayments: payments
      })
      
      // Call the parent payment handler with the primary method and split payments
      console.log('🎯 OrderDetails sending split payments to parent:', payments)
      onPaymentComplete(primaryMethod, finalTotal, payments)
      
      // Show payment success state
      setPaymentJustCompleted(true)
      setShowPaymentSuccess(true)
      
      // Reset split payments
      setSplitPayments([])
      setDiscount(0)
    } catch (error) {
      console.error('Split payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentMethodSelect = (paymentMethod: string, amount: number) => {
    addSplitPayment(paymentMethod, amount)
  }

  const handleDiscountApplied = (discountAmount: number, type: 'percentage' | 'fixed') => {
    setDiscount(discountAmount)
    setDiscountType(type)
    onDiscountApplied?.(discountAmount, type)
    setShowDiscountModal(false)
  }

  const handleLaybyeCreated = (laybyeData: any) => {
    onLaybyeCreated?.(laybyeData)
    setShowLaybyeModal(false)
  }

  const handleHoldOrder = () => {
    onHoldOrder?.()
  }

  const handlePrintReceipt = () => {
    // TODO: Implement actual receipt printing
    console.log('Printing receipt for transaction:', lastPaymentDetails)
    alert('Receipt printed successfully!')
  }

  const handleNewSale = () => {
    setShowPaymentSuccess(false)
    setLastPaymentDetails(null)
    setPaymentJustCompleted(false)
    // The cart will be cleared by the parent component after payment
  }

  const canProcessPayment = cart.length > 0

  // Payment success icons based on method
  const paymentMethodIcons = {
    cash: <DollarSign className="h-8 w-8" />,
    card: <CreditCard className="h-8 w-8" />,
    transfer: <CreditCard className="h-8 w-8" />,
    mpesa: <CreditCard className="h-8 w-8" />,
    ecocash: <CreditCard className="h-8 w-8" />
  }

  if (showPaymentSuccess && lastPaymentDetails) {
    // Payment Success State - Completely Black Background
    return (
      <>
        <div className="h-full flex flex-col bg-black relative overflow-hidden rounded-2xl shadow-2xl mr-1.5 mb-1.5" style={{ border: '0.5px solid #E5FF29' }}>
          {/* Subtle animated accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E5FF29]/50 to-transparent rounded-t-2xl"></div>
          
          {/* Success Header - Compact */}
          <div className="p-3 relative z-10 text-center border-b border-[#E5FF29]/20">
            <div className="bg-green-500 rounded-full p-2 inline-block mb-2">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Payment Successful!</h2>
            <p className="text-gray-300 text-xs">Transaction completed</p>
          </div>

          {/* Payment Method - Compact and Minimal */}
          <div className="p-3 relative z-10">
            <div className="text-center">
              <div className="text-[#E5FF29] mb-1 flex justify-center">
                {paymentMethodIcons[lastPaymentDetails.paymentMethod as keyof typeof paymentMethodIcons] || <DollarSign className="h-6 w-6" />}
              </div>
              <div className="text-white font-semibold text-sm capitalize">
                {lastPaymentDetails.paymentMethod} Payment
              </div>
            </div>
          </div>

          {/* Transaction Details - Compact */}
          <div className="flex-1 p-3 relative z-10 space-y-3 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wide">Transaction Details</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(lastPaymentDetails.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount Paid:</span>
                  <span className="text-white">{formatCurrency(lastPaymentDetails.amountPaid)}</span>
                </div>
                {lastPaymentDetails.transactionNumber && (
                  <div className="flex justify-between pt-1 border-t border-gray-600">
                    <span className="text-gray-300">Transaction #:</span>
                    <span className="text-[#E5FF29] font-mono text-xs">{lastPaymentDetails.transactionNumber}</span>
                  </div>
                )}
                
                {/* Split Payments Display */}
                {lastPaymentDetails.splitPayments && lastPaymentDetails.splitPayments.length > 1 && (
                  <div className="pt-2 border-t border-gray-600">
                    <div className="text-gray-300 text-xs mb-2">Payment Methods Used:</div>
                    <div className="space-y-1">
                      {lastPaymentDetails.splitPayments.map((payment, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-300 capitalize">{payment.method}:</span>
                          <span className="text-white font-semibold">{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Change Display for All Payment Methods - Brand Yellow Background */}
            {lastPaymentDetails.change > 0 && (
              <div className="bg-[#E5FF29] rounded-lg p-4 text-center">
                <div className="text-black font-bold text-sm mb-1">💰 CHANGE TO GIVE</div>
                <div className="text-3xl font-black text-black mb-1">{formatCurrency(lastPaymentDetails.change)}</div>
                <div className="text-black text-xs">Give to customer</div>
              </div>
            )}

            {/* Perfect payment when no change */}
            {lastPaymentDetails.change === 0 && (
              <div className="bg-[#E5FF29]/20 rounded-lg p-3 text-center">
                <div className="text-[#E5FF29] text-sm font-semibold">Perfect Payment ✓</div>
                <div className="text-gray-300 text-xs mt-1">Exact amount processed</div>
              </div>
            )}
          </div>

          {/* Action Buttons - Compact */}
          <div className="p-3 relative z-10 space-y-2">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              size="sm"
              className="w-full bg-gray-900/50 border-gray-600 text-white hover:bg-gray-800/50 h-9"
            >
              <Receipt className="h-3 w-3 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={handleNewSale}
              size="sm"
              className="w-full bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90 h-9"
            >
              Start New Sale
            </Button>
          </div>
        </div>
        
        {/* Remove PaymentSuccessModal since we're not using it anymore */}
      </>
    )
  }

  if (showLaybyePaymentSuccess && laybyePaymentDetails && cart.length === 0) {
    // Laybye Payment Success State - Completely Black Background
    return (
      <>
        <div className="h-full flex flex-col bg-black relative overflow-hidden rounded-2xl shadow-2xl mr-1.5 mb-1.5" style={{ border: '0.5px solid #E5FF29' }}>
          {/* Subtle animated accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E5FF29]/50 to-transparent rounded-t-2xl"></div>
          
          {/* Success Header - Compact */}
          <div className="p-3 relative z-10 text-center border-b border-[#E5FF29]/20">
            <div className="bg-green-500 rounded-full p-2 inline-block mb-2">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Lay-bye Payment Successful!</h2>
            <p className="text-gray-300 text-xs">Deposit payment completed</p>
          </div>

          {/* Payment Method - Compact and Minimal */}
          <div className="p-3 relative z-10">
            <div className="text-center">
              <div className="text-[#E5FF29] mb-1 flex justify-center">
                {paymentMethodIcons[laybyePaymentDetails.paymentMethod as keyof typeof paymentMethodIcons] || <DollarSign className="h-6 w-6" />}
              </div>
              <div className="text-white font-semibold text-sm capitalize">
                {laybyePaymentDetails.paymentMethod} Payment
              </div>
            </div>
          </div>

          {/* Transaction Details - Compact */}
          <div className="flex-1 p-3 relative z-10 space-y-3 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wide">Transaction Details</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Deposit Amount:</span>
                  <span className="text-white font-semibold">{formatCurrency(laybyePaymentDetails.depositAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Amount Paid:</span>
                  <span className="text-white">{formatCurrency(laybyePaymentDetails.amountPaid)}</span>
                </div>
                {laybyePaymentDetails.transactionNumber && (
                  <div className="flex justify-between pt-1 border-t border-gray-600">
                    <span className="text-gray-300">Transaction #:</span>
                    <span className="text-[#E5FF29] font-mono text-xs">{laybyePaymentDetails.transactionNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Change Display for Cash - Brand Yellow Background */}
            {laybyePaymentDetails.paymentMethod === 'cash' && laybyePaymentDetails.change > 0 && (
              <div className="bg-[#E5FF29] rounded-lg p-4 text-center">
                <div className="text-black font-bold text-sm mb-1">💰 CHANGE TO GIVE</div>
                <div className="text-3xl font-black text-black mb-1">{formatCurrency(laybyePaymentDetails.change)}</div>
                <div className="text-black text-xs">Give to customer</div>
              </div>
            )}

            {/* Perfect payment for non-cash */}
            {laybyePaymentDetails.paymentMethod !== 'cash' && (
              <div className="bg-[#E5FF29]/20 rounded-lg p-3 text-center">
                <div className="text-[#E5FF29] text-sm font-semibold">Perfect Payment ✓</div>
                <div className="text-gray-300 text-xs mt-1">Exact amount processed</div>
              </div>
            )}
          </div>

          {/* Action Buttons - Compact */}
          <div className="p-3 relative z-10 space-y-2">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              size="sm"
              className="w-full bg-gray-900/50 border-gray-600 text-white hover:bg-gray-800/50 h-9"
            >
              <Receipt className="h-3 w-3 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={onLaybyePaymentComplete}
              size="sm"
              className="w-full bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90 h-9"
            >
              Start New Sale
            </Button>
          </div>
        </div>
      </>
    )
  }

  // Normal Order Details State
  return (
    <>
      <div className="h-full flex flex-col bg-gradient-to-b from-[#E5FF29] via-[#E5FF29]/95 to-[#E5FF29]/90 relative overflow-hidden rounded-2xl shadow-2xl mr-1.5 mb-1.5" style={{ border: '0.5px solid #000000' }}>
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50 rounded-2xl"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-2xl"></div>
        
        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10">
          {/* Title at the top */}
          <div className="pb-2 mb-2" style={{ borderBottom: '0.5px solid #000000' }}>
            <h2 className="text-sm font-semibold text-black">Order Details</h2>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="h-6 w-6 text-black/60" />
              </div>
              <p className="text-black/70 text-xs">Select product</p>
            </div>
          ) : (
            cart.map((item) => (
              <OrderItemCard
                key={item.id}
                item={item}
                onRemove={onRemoveItem}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="p-3 border-t border-black/20 space-y-2 relative z-10">
          <div className="bg-black/10 rounded-lg p-3 shadow-sm space-y-1" style={{ border: '0.5px solid #000000' }}>
            <div className="flex justify-between text-xs">
              <span className="text-black/70">Sub Total</span>
              <span className="font-medium text-black">{cart.length > 0 ? formatCurrency(total) : '-'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-black/70">Discount</span>
              <span className="font-medium text-green-700">{discount > 0 ? `-${formatCurrency(discount)}` : '-'}</span>
            </div>

            <div className="flex justify-between text-sm font-bold pt-1" style={{ borderTop: '0.5px solid #000000' }}>
              <span className="text-black">Total Payment</span>
              <span className="text-black font-bold">{cart.length > 0 ? formatCurrency(finalTotal) : '-'}</span>
            </div>
          </div>

          {/* Add Discount Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-black/10 hover:bg-black/20 text-black hover:text-black h-7 text-xs"
            style={{ border: '0.5px solid #000000' }}
            onClick={() => setShowDiscountModal(true)}
          >
            <Percent className="h-3 w-3 mr-1" />
            Add Discount
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>

          {/* Customer Selection */}
          <div className="p-2 bg-black/10 rounded-lg" style={{ border: '0.5px solid #000000' }}>
            {customer ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-black">Customer</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-5 px-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200" 
                    onClick={() => onCustomerClear()}
                    title="Remove customer"
                  >
                    ×
                  </Button>
                </div>
                <div className="bg-white rounded p-2 border border-gray-200">
                  <div className="text-sm font-semibold text-black">{customer.first_name} {customer.last_name}</div>
                  {customer.phone && (
                    <div className="text-xs text-gray-600">{customer.phone}</div>
                  )}
                  {customer.credit_limit && customer.credit_limit > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Credit: {formatCurrency(customer.credit_limit - (customer.current_balance || 0))} available
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-black">Select Customer</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs bg-black/10 hover:bg-black/20 text-black hover:text-black" 
                  style={{ border: '0.5px solid #000000' }}
                  onClick={() => setShowCustomerSelect(true)}
                >
                  Select
                </Button>
              </div>
            )}
          </div>

          {/* Split Payment Display */}
          {splitPayments.length > 0 && (
            <div className="p-3 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 space-y-3">
                <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-900">Payment Methods Used</h3>
                <span className="text-xs text-blue-600">
                  {totalPaid >= finalTotal ? 'Complete' : `${formatCurrency(remainingToPay)} remaining`}
                </span>
              </div>
              
              <div className="space-y-2">
                {splitPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/80 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-blue-900 capitalize">{payment.method}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-blue-900">{formatCurrency(payment.amount)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSplitPayment(index)}
                        className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPaid >= finalTotal && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-green-800">Payment Complete!</p>
                    <p className="text-xs text-green-600">Ready to process transaction</p>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Payment Buttons */}
          <div className="space-y-1">
            <Button
              onClick={() => setShowPaymentMethodModal(true)}
              disabled={!canProcessPayment || isProcessing}
              className="w-full bg-black text-white hover:bg-black/90 font-semibold h-10 text-sm"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-1" />
                  {splitPayments.length > 0 ? 'Add Payment Method' : 'Choose Payment Method'}
                </>
              )}
            </Button>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                className="flex-1 bg-black/10 hover:bg-black/20 text-black hover:text-black h-8 text-xs"
                style={{ border: '0.5px solid #000000' }}
                onClick={handleHoldOrder}
              >
                Hold Order
              </Button>
              {laybyeEnabled && (
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50 text-black hover:text-black h-8 text-xs"
                  style={{ border: '0.5px solid #000000' }}
                  onClick={() => setShowLaybyeModal(true)}
                >
                  <CreditCard className="h-3 w-3 mr-1" />
                  Laybye
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onDiscountApplied={handleDiscountApplied}
        currentTotal={total}
      />



      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        totalAmount={remainingToPay}
        isSplitPayment={splitPayments.length > 0}
        hasSelectedCustomer={!!customer}
      />

      <LaybyeModal
        isOpen={showLaybyeModal}
        onClose={() => setShowLaybyeModal(false)}
        onLaybyeCreated={handleLaybyeCreated}
        cart={cart}
        customer={customer}
        total={finalTotal}
      />

      <CustomerSelectionModal
        isOpen={showCustomerSelect}
        onClose={() => setShowCustomerSelect(false)}
        onCustomerSelect={onCustomerSelect}
        selectedCustomer={customer}
      />

    </>
  )
}



interface OrderItemCardProps {
  item: CartItem
  onRemove: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" style={{ border: '0.5px solid #000000' }}>
      {/* Product Image */}
      <div className="w-8 h-8 bg-black/20 rounded-lg flex-shrink-0">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-black/60" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium text-black truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-black/70">
          {item.product.category_name}
        </p>
        <p className="text-xs font-semibold text-black">
          {formatCurrency(item.unitPrice)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="h-6 w-6 p-0 bg-black/10 hover:bg-black/20 text-black hover:text-black"
          style={{ border: '0.5px solid #000000' }}
        >
          <Minus className="h-2 w-2" />
        </Button>
        
        <span className="text-xs font-medium w-6 text-center text-black">
          {item.quantity}
        </span>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="h-6 w-6 p-0 bg-black/10 hover:bg-black/20 text-black hover:text-black"
          style={{ border: '0.5px solid #000000' }}
        >
          <Plus className="h-2 w-2" />
        </Button>
      </div>

      {/* Remove Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(item.id)}
        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/20"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}