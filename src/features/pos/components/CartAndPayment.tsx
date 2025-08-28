'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  CreditCard, 
  User,
  Receipt,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  X,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { CartItem, Customer } from '../types'


import { PaymentMethodModal } from './PaymentMethodModal'
import { CustomerSelectionModal } from './CustomerSelectionModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'

interface CartAndPaymentProps {
  cart: CartItem[]
  customer: Customer | null
  total: number
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onPaymentComplete: (paymentMethod: string, paymentAmount: number, splitPayments?: Array<{method: string, amount: number}>) => void
}

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'transfer', name: 'Transfer', icon: CreditCard, color: 'bg-indigo-500' },
  { id: 'mpesa', name: 'Mpesa', icon: CreditCard, color: 'bg-green-600' },
  { id: 'ecocash', name: 'Ecocash', icon: CreditCard, color: 'bg-emerald-600' },
  { id: 'account', name: 'Account', icon: User, color: 'bg-black' },
  { id: 'laybye', name: 'Lay-bye', icon: Receipt, color: 'bg-orange-500' }
]



// Cash Amount Modal Component
interface CashAmountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
  total: number
  isSplitPayment?: boolean
}

const CashAmountModal: React.FC<CashAmountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  total,
  isSplitPayment = false
}) => {
  const [amountPaid, setAmountPaid] = useState('')
  const change = parseFloat(amountPaid) - total

  const handleConfirm = () => {
    if (parseFloat(amountPaid) >= total) {
      onConfirm(parseFloat(amountPaid))
      setAmountPaid('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-xl">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cash Payment</h2>
                <p className="text-gray-600 text-sm">Enter amount received</p>
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
        <div className="p-6 space-y-6">
          {/* Total Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Amount Received
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="text-2xl font-semibold text-center h-16"
              autoFocus
            />
          </div>

          {/* Change Display */}
          {amountPaid && change >= 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <p className="text-sm text-green-600 mb-1">Change to Give</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(change)}</p>
              </div>
            </div>
          )}

          {amountPaid && change < 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-1">Insufficient Amount</p>
                <p className="text-lg font-semibold text-red-700">Need {formatCurrency(Math.abs(change))} more</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 text-base font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!amountPaid || parseFloat(amountPaid) < total}
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-12 text-base font-semibold disabled:bg-gray-300 disabled:text-gray-500"
          >
            Confirm Payment
          </Button>
        </div>
      </div>
    </div>
  )
}

// Account Amount Modal Component
interface AccountAmountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
  total: number
  customer: Customer | null
}

// Enhanced Account Amount Modal Component
const AccountAmountModal: React.FC<AccountAmountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  total,
  customer
}) => {
  const [amountToDeduct, setAmountToDeduct] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    availableCredit: number
    errorMessage: string
    paymentType?: string
    amountFromBalance?: number
    amountFromCredit?: number
    newBalanceAfterPayment?: number
    maxPossiblePayment?: number
    remainingNeedsOtherPayment?: number
  } | null>(null)

  // Calculate maximum possible payment (balance + credit limit)
  const maxPossiblePayment = customer 
    ? Math.max(0, (customer.account_balance || 0) + (customer.credit_limit || 0))
    : 0

  const maxDeductible = Math.min(total, maxPossiblePayment)
  
  // For backward compatibility with validation result
  const availableCredit = maxPossiblePayment

  React.useEffect(() => {
    if (isOpen && customer) {
      // Auto-fill with maximum available amount
      setAmountToDeduct(maxDeductible.toString())
      validateAmount(maxDeductible)
    }
  }, [isOpen, customer, maxDeductible])

  const validateAmount = async (amount: number) => {
    console.log('🔍 validateAmount called with:', { amount, customer: customer?.id })
    
    if (!customer || amount <= 0) {
      console.log('🔍 validateAmount - Invalid input')
      setValidationResult({
        isValid: false,
        availableCredit,
        errorMessage: 'Please enter a valid amount'
      })
      return
    }

    setIsValidating(true)
    try {
      console.log('🔍 validateAmount - Calling RPC with:', {
        p_customer_id: customer.id,
        p_amount: amount
      })
      
      const { data, error } = await supabase
        .rpc('validate_account_payment', {
          p_customer_id: customer.id,
          p_amount: amount
        })

      console.log('🔍 validateAmount - RPC response:', { data, error })

      if (error) throw error

      setValidationResult(data[0])
    } catch (error) {
      console.error('Error validating amount:', error)
      setValidationResult({
        isValid: false,
        availableCredit,
        errorMessage: 'Error validating payment amount'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    
    // Prevent entering amounts that exceed maximum possible payment
    if (amount > maxDeductible) {
      setAmountToDeduct(maxDeductible.toString())
      validateAmount(maxDeductible)
    } else {
      setAmountToDeduct(value)
      validateAmount(amount)
    }
  }

  const handleConfirm = () => {
    const amount = parseFloat(amountToDeduct)
    if (amount > 0 && amount <= maxDeductible && validationResult?.isValid) {
      onConfirm(amount)
      setAmountToDeduct('')
      setValidationResult(null)
    }
  }

  const handleClose = () => {
    setAmountToDeduct('')
    setValidationResult(null)
    onClose()
  }

  console.log('🔍 AccountAmountModal - Modal state:', { isOpen, hasCustomer: !!customer })
  
  if (!isOpen || !customer) return null

  console.log('🔍 AccountAmountModal - Customer data:', customer)
  
  const currentBalance = customer.account_balance || 0
  const creditLimit = customer.credit_limit || 0
  const isAccountActive = customer.status === 'active'
  
  console.log('🔍 AccountAmountModal - Calculated values:', {
    currentBalance,
    creditLimit,
    isAccountActive,
    maxPossiblePayment
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-black p-2 rounded-xl">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Account Payment</h2>
                <p className="text-gray-600 text-sm">Enter amount to deduct from customer balance</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Debug Info */}
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              🔍 DEBUG: Modal is rendering. Customer: {customer ? 'Present' : 'Missing'}, 
              Balance: {customer?.account_balance || 'undefined'}, 
              Credit: {customer?.credit_limit || 'undefined'}
            </p>
          </div>
          
          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Details
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Name:</span> {customer.first_name} {customer.last_name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {customer.email || 'Not provided'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Account:</span> #{customer.customer_number}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Debug - Balance:</span> {customer.account_balance || 'undefined'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Debug - Credit Limit:</span> {customer.credit_limit || 'undefined'}
              </p>
            </div>
          </div>

          {/* Account Balance Status */}
          <div className="bg-blue-50 p-4 rounded-xl space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Account Balance Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Balance:</span>
                <span className={`font-semibold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Limit:</span>
                <span className="font-semibold">{formatCurrency(creditLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Possible Payment:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(maxPossiblePayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${isAccountActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isAccountActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Deduct
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">
                  R
                </span>
                <Input
                  type="number"
                  value={amountToDeduct}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 h-12 text-lg font-medium border-2 border-gray-200 focus:border-black focus:ring-0"
                  step="0.01"
                  min="0"
                  max={maxDeductible}
                  disabled={!isAccountActive}
                  onBlur={(e) => {
                    const amount = parseFloat(e.target.value) || 0
                    if (amount > maxDeductible) {
                      setAmountToDeduct(maxDeductible.toString())
                      validateAmount(maxDeductible)
                    }
                  }}
                />
              </div>
            </div>

            {/* Amount Info */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-semibold text-green-600">{formatCurrency(currentBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Credit Limit:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(creditLimit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max Possible Payment:</span>
                <span className="font-semibold text-purple-600">{formatCurrency(maxPossiblePayment)}</span>
              </div>
              {amountToDeduct && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(Math.max(0, total - (parseFloat(amountToDeduct) || 0)))}
                  </span>
                </div>
              )}
            </div>

            {/* Validation Status */}
            {validationResult && (
              <div className={`p-3 rounded-lg border ${
                validationResult.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div className="text-sm">
                    <p className={`${
                      validationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.errorMessage}
                    </p>
                    {validationResult.isValid && validationResult.paymentType === 'partial_credit' && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p>• {formatCurrency(validationResult.amountFromBalance)} from balance</p>
                        <p>• {formatCurrency(validationResult.amountFromCredit)} from credit</p>
                        <p>• New balance after payment: {formatCurrency(validationResult.newBalanceAfterPayment)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning if insufficient balance */}
            {currentBalance < total && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    {currentBalance > 0 ? (
                      <>
                        Insufficient balance. Customer can pay {formatCurrency(currentBalance)} from balance.
                        {creditLimit > 0 ? (
                          <> Can use up to {formatCurrency(creditLimit)} credit. Total possible: {formatCurrency(maxPossiblePayment)}</>
                        ) : (
                          <> No credit available. Remaining {formatCurrency(total - currentBalance)} needs another payment method.</>
                        )}
                      </>
                    ) : (
                      <>
                        No balance. Customer has {formatCurrency(currentBalance)} in account.
                        {creditLimit > 0 ? (
                          <> Can use up to {formatCurrency(creditLimit)} credit. Total possible: {formatCurrency(maxPossiblePayment)}</>
                        ) : (
                          <> No credit available. Full amount {formatCurrency(total)} needs another payment method.</>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Account inactive warning */}
            {!isAccountActive && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    This customer's account is inactive. Please contact an administrator to activate it.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-12 text-base font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !amountToDeduct || 
              parseFloat(amountToDeduct) <= 0 || 
              parseFloat(amountToDeduct) > maxDeductible ||
              !isAccountActive ||
              isValidating
            }
            className="flex-1 bg-black text-white hover:bg-gray-800 h-12 text-base font-semibold disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Validating...
              </>
            ) : (
              'Pay from Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const CartAndPayment: React.FC<CartAndPaymentProps> = ({
  cart,
  customer,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onPaymentComplete
}) => {
  const { user } = useAuth()
  const { selectedBranch } = useBranch()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash')
  const [isProcessing, setIsProcessing] = useState(false)

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [showAccountAmountModal, setShowAccountAmountModal] = useState(false)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [accountCustomer, setAccountCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState('')
  const [splitPayments, setSplitPayments] = useState<Array<{method: string, amount: number, customer_id?: string}>>([])

  const taxRate = 0.15 // 15% tax rate
  const taxAmount = total * taxRate
  const finalTotal = total + taxAmount
  
  // Calculate remaining amount for split payments
  const totalPaid = splitPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingToPay = Math.max(0, finalTotal - totalPaid)

  // Debug useEffect to monitor modal state changes


  const handlePaymentMethodChange = (method: string, amount: number) => {
    console.log('🎯 Payment method changed to:', method, 'with amount:', amount)
    console.log('🎯 Current showCustomerSelect state:', showCustomerSelect)
    
    setSelectedPaymentMethod(method)
    setError('')
    
    if (method === 'account') {
      console.log('🎯 Opening customer selection modal for account payment')
      setShowPaymentMethodModal(false) // Close payment method modal first
      setTimeout(() => {
        setShowCustomerSelect(true)
        console.log('🎯 Set showCustomerSelect to true')
      }, 100)
      // Don't add to split payments yet - wait for customer selection and amount input
    } else {
      setAccountCustomer(null)
      // For non-account payments, add to split payments
      addSplitPayment(method, amount)
    }
  }

  const handlePaymentMethodSelect = useCallback((method: string, amount: number) => {
    console.log('🎯 CartAndPayment: handlePaymentMethodSelect called with method:', method, 'amount:', amount)
    console.log('🎯 Payment method selected from modal:', method, 'with amount:', amount)
    
    if (method === 'account') {
      // For account payments, show customer selection modal first
      console.log('🎯 Account payment selected, opening customer selection modal')
      setSelectedPaymentMethod('account')
      setShowPaymentMethodModal(false) // Close payment method modal first
      setTimeout(() => {
        setShowCustomerSelect(true)
      }, 100)
    } else {
      // For other payment methods, we'll handle this differently
      console.log('🎯 Non-account payment selected, will handle separately')
    }
  }, [])

  // Debug: Log the function reference
  console.log('🎯 CartAndPayment: handlePaymentMethodSelect function created:', typeof handlePaymentMethodSelect)

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setAccountCustomer(selectedCustomer)
    setShowCustomerSelect(false)
    
    // For account payments, prompt for amount input after customer selection
    if (selectedPaymentMethod === 'account') {
      console.log('🎯 Customer selected for account payment, prompting for amount')
      // Show amount input modal for account payment
      setShowAccountAmountModal(true)
    }
  }

  const handleAccountAmountConfirm = async (amount: number) => {
    console.log('🎯 Account amount confirmed:', amount)
    
    if (!accountCustomer) {
      setError('No customer selected for account payment')
      return
    }

    // Validate the payment amount with the server
    try {
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_account_payment', {
          p_customer_id: accountCustomer.id,
          p_amount: amount
        })

      if (validationError) throw validationError

      const validation = validationResult?.[0]
      console.log('🎯 Validation result:', validation)

      if (!validation?.isValid) {
        // Handle insufficient funds with different scenarios
        if (validation?.paymentType === 'exceeds_credit_limit') {
          // Customer would exceed credit limit
          const maxPossiblePayment = validation.maxPossiblePayment || 0
          const remainingNeedsOtherPayment = validation.remainingNeedsOtherPayment || 0
          
          setError(`Payment would exceed credit limit. Customer can pay ${formatCurrency(maxPossiblePayment)} (${formatCurrency(validation.amountFromBalance)} from balance + ${formatCurrency(validation.amountFromCredit)} from credit). Remaining ${formatCurrency(remainingNeedsOtherPayment)} needs another payment method.`)
          
          // Add the maximum possible amount from account
          addSplitPayment('account', maxPossiblePayment)
          
          // Show payment method modal for remaining amount
          setShowAccountAmountModal(false)
          setTimeout(() => {
            setShowPaymentMethodModal(true)
          }, 100)
          return
        } else {
          setError(validation?.errorMessage || 'Payment validation failed')
          return
        }
      }

      // Payment is valid
      setShowAccountAmountModal(false)
      setError('')
      
      // Add the account payment to split payments
      addSplitPayment('account', amount)
      
      // If this completes the payment, process the transaction
      if (totalPaid + amount >= finalTotal) {
        setTimeout(() => {
          processSplitPaymentTransaction()
        }, 100)
      } else {
        // Payment is partial, show payment method modal for remaining amount
        setTimeout(() => {
          setShowPaymentMethodModal(true)
        }, 100)
      }
    } catch (error) {
      console.error('Error validating account payment:', error)
      setError('Failed to validate account payment. Please try again.')
    }
  }

  const handlePayment = async (cashAmount?: number) => {
    if (cart.length === 0) return
    
    // Validate account payment
    if (selectedPaymentMethod === 'account' && !accountCustomer) {
      setError('Please select a customer for account payment')
      return
    }

    if (selectedPaymentMethod === 'account' && accountCustomer) {
      // For account payments, check if customer has sufficient credit
      const availableCredit = Math.max(0, accountCustomer.credit_limit + accountCustomer.account_balance)
      
      if (availableCredit < finalTotal) {
        setError(`Insufficient credit. Customer has ${formatCurrency(availableCredit)} credit available, but needs ${formatCurrency(finalTotal)}.`)
        return
      }
    }

    // For cash payments, validate amount
    if (selectedPaymentMethod === 'cash' && (!cashAmount || cashAmount < finalTotal)) {
      setError('Cash amount must be equal to or greater than the total')
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
       // Create sale record using the database function
       const { data: saleId, error: saleError } = await supabase
         .rpc('create_sale_with_split_payments', {
           p_customer_id: selectedPaymentMethod === 'account' ? accountCustomer?.id : customer?.id,
           p_total_amount: finalTotal,
           p_payment_methods: [{
             method: selectedPaymentMethod,
             amount: finalTotal
           }],
           p_processed_by: user?.id,
           p_branch_id: selectedBranch?.id,
           p_sale_items: cart.map(item => ({
             product_id: item.product.id,
             variant_id: null,
             quantity: item.quantity,
             unit_price: item.unitPrice,
             total_price: item.totalPrice
           }))
         })

             if (saleError) throw saleError

             // Note: Product quantities are automatically updated by the database trigger
      // when sale items are inserted. The trigger update_stock_on_sale_item will
      // handle the stock reduction automatically.
      console.log('Product quantities will be updated automatically by database trigger')

             // Handle account payment credit deduction
      if (selectedPaymentMethod === 'account' && accountCustomer) {
        console.log('Processing credit purchase for customer:', accountCustomer.id, 'amount:', finalTotal)
        
        // Use the new process_credit_purchase function
        const { data: paymentResult, error: creditError } = await supabase
          .rpc('process_credit_purchase', {
            p_customer_id: accountCustomer.id,
            p_amount: finalTotal,
            p_sale_id: saleId
          })

        if (creditError) {
          console.error('Error processing account payment:', creditError)
        } else {
          console.log('Account payment processed successfully:', paymentResult)
        }
      }
      
             // Clear cart and complete payment
       cart.forEach(item => onRemoveItem(item.id))
       onPaymentComplete(selectedPaymentMethod, finalTotal, [{
         method: selectedPaymentMethod,
         amount: finalTotal
       }])
      
    } catch (error) {
      console.error('Payment processing failed:', error)
      setError('Payment processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const addSplitPayment = (method: string, amount: number) => {
    if (amount <= 0) return
    
    const newPayment = { 
      method, 
      amount,
      customer_id: method === 'account' && accountCustomer ? accountCustomer.id : undefined
    }
    setSplitPayments(prev => [...prev, newPayment])
    
    // If this completes the payment, process the transaction
    if (totalPaid + amount >= finalTotal) {
      setTimeout(() => {
        processSplitPaymentTransaction()
      }, 100) // Small delay to ensure state is updated
    }
  }

  const removeSplitPayment = (index: number) => {
    setSplitPayments(prev => prev.filter((_, i) => i !== index))
  }

  const processSplitPaymentTransaction = async () => {
    if (splitPayments.length === 0) return
    
    setIsProcessing(true)
    setError('')
    
    try {
      console.log('Processing split payment transaction:', {
        items: cart,
        customer,
        total: finalTotal,
        splitPayments
      })
      
      // Validate account payments first
      const accountPayments = splitPayments.filter(payment => payment.method === 'account')
      for (const payment of accountPayments) {
        if (!payment.customer_id) {
          throw new Error('Customer ID missing for account payment')
        }

        // Validate each account payment
        const { data: validationResult, error: validationError } = await supabase
          .rpc('validate_account_payment', {
            p_customer_id: payment.customer_id,
            p_amount: payment.amount
          })

        if (validationError) throw validationError

        if (!validationResult?.[0]?.isValid) {
          throw new Error(validationResult?.[0]?.errorMessage || 'Account payment validation failed')
        }
      }
      
      // Use the database function to create sale with split payments
      const { data: saleId, error: saleError } = await supabase
        .rpc('create_sale_with_split_payments', {
          p_customer_id: accountCustomer?.id || customer?.id,
          p_total_amount: finalTotal,
          p_payment_methods: splitPayments,
          p_processed_by: user?.id,
          p_branch_id: selectedBranch?.id,
          p_sale_items: cart.map(item => ({
            product_id: item.product.id,
            variant_id: null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice
          }))
        })

      if (saleError) throw saleError

      // Process account payments after successful sale creation
      for (const payment of accountPayments) {
        if (payment.customer_id) {
          console.log('Processing account payment:', payment)
          
          // Process the account payment (deduct from customer balance)
          const { data: paymentResult, error: paymentError } = await supabase
            .rpc('process_account_payment', {
              p_customer_id: payment.customer_id,
              p_amount: payment.amount,
              p_sale_id: saleId
            })

          if (paymentError) {
            console.error('Error processing account payment:', paymentError)
            throw new Error('Failed to process account payment')
          }

          console.log('Account payment processed successfully:', paymentResult)
        }
      }

      // Note: Product quantities are automatically updated by the database trigger
      // when sale items are inserted. The trigger update_stock_on_sale_item will
      // handle the stock reduction automatically.
      console.log('Product quantities will be updated automatically by database trigger')

       // Handle account payment credit deductions
       for (const payment of accountPayments) {
         console.log('Processing split credit purchase for customer:', payment.customer_id, 'amount:', payment.amount)
         
         const { data: paymentResult, error: creditError } = await supabase
           .rpc('process_credit_purchase', {
             p_customer_id: payment.customer_id,
             p_amount: payment.amount,
             p_sale_id: saleId
           })

         if (creditError) {
           throw new Error(`Failed to process account payment: ${creditError.message}`)
         } else {
           console.log('Split account payment processed:', paymentResult)
         }
       }

      // Clear cart and complete payment
      cart.forEach(item => onRemoveItem(item.id))
      console.log('🎯 Sending split payments to receipt:', splitPayments)
      onPaymentComplete(splitPayments[0].method, finalTotal, splitPayments)
      
      // Reset split payments and customer selection
      setSplitPayments([])
      setAccountCustomer(null)
      
    } catch (error) {
      console.error('Split payment processing failed:', error)
      setError(error instanceof Error ? error.message : 'Split payment processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentButtonClick = () => {
    setShowPaymentMethodModal(true)
  }

  const canProcessPayment = cart.length > 0 && 
    (splitPayments.length > 0 || selectedPaymentMethod === 'account' ? accountCustomer !== null : true)

  const getBalanceStatus = (customer: Customer) => {
    const balance = customer.account_balance || 0
    const limit = customer.credit_limit || 0
    const available = limit + balance // How much they can spend (balance + credit limit)
    
    if (balance >= 0) {
      return { 
        status: 'positive', 
        text: `Balance: ${formatCurrency(balance)}`, 
        color: 'bg-green-100 text-green-800',
        available
      }
    } else {
      return { 
        status: 'negative', 
        text: `Owed: ${formatCurrency(Math.abs(balance))}`, 
        color: 'bg-red-100 text-red-800',
        available
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--primary))] flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart ({cart.length} items)
          </h2>
          {cart.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Clear cart
                cart.forEach(item => onRemoveItem(item.id))
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Cart is empty</p>
            <p className="text-sm text-gray-400">Add products to get started</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={onRemoveItem}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (15%):</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>
      </div>

                     {/* Split Payments Display */}
        {splitPayments.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Methods Used</h3>
           <div className="space-y-2">
             {splitPayments.map((payment, index) => (
               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                 <div className="flex items-center space-x-2">
                   <span className="text-sm font-medium">{payment.method}</span>
                   {payment.method === 'account' && payment.customer_id && accountCustomer && (
                     <span className="text-xs text-gray-500">
                       ({accountCustomer.first_name} {accountCustomer.last_name})
                     </span>
                   )}
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                   <Button
                     size="sm"
                     variant="ghost"
                     onClick={() => removeSplitPayment(index)}
                     className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                   >
                     <X className="h-3 w-3" />
                   </Button>
                 </div>
               </div>
             ))}
             <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
               <span className="text-sm font-medium text-blue-700">Total Paid:</span>
               <span className="text-sm font-semibold text-blue-700">{formatCurrency(totalPaid)}</span>
             </div>
             {remainingToPay > 0 && (
               <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                 <span className="text-sm font-medium text-yellow-700">Remaining:</span>
                 <span className="text-sm font-semibold text-yellow-700">{formatCurrency(remainingToPay)}</span>
               </div>
             )}
           </div>
         </div>
       )}

      {/* Payment Method Selection */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <Button
                key={method.id}
                variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePaymentMethodChange(method.id, finalTotal)}
                className={`
                  ${selectedPaymentMethod === method.id
                    ? method.id === 'account' 
                      ? 'bg-black text-white border-black hover:bg-gray-800'
                      : 'bg-[#E5FF29] text-black border-[#E5FF29] hover:bg-[#E5FF29]/90'
                    : 'border-gray-200 hover:bg-gray-50'
                  }
                  ${method.id === 'account' && !customer && !accountCustomer ? 'opacity-50' : ''}
                  relative
                `}
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
                  {method.name}
                  {method.id === 'account' && !customer && !accountCustomer && (
                    <span className="ml-1 text-xs opacity-75">(Select Customer)</span>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Account Customer Selection */}
      {selectedPaymentMethod === 'account' && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Account Customer</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerSelect(true)}
              className="text-xs"
            >
              {accountCustomer ? 'Change' : 'Select Customer'}
            </Button>
          </div>
          
          {accountCustomer ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {accountCustomer.first_name} {accountCustomer.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{accountCustomer.email}</p>
                  <p className="text-xs text-gray-500">#{accountCustomer.customer_number}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {(accountCustomer.account_balance || 0) >= 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant="secondary" className={getBalanceStatus(accountCustomer).color}>
                      {formatCurrency(Math.abs(accountCustomer.account_balance || 0))}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {formatCurrency(Math.max(0, (accountCustomer.credit_limit || 0) + (accountCustomer.account_balance || 0)))}
                  </p>
                </div>
              </div>
              
              {(accountCustomer.account_balance || 0) < 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-600">
                  Customer owes {formatCurrency(Math.abs(accountCustomer.account_balance))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No customer selected</p>
            </div>
          )}
        </div>
      )}

      {/* Customer Info */}
      {customer && selectedPaymentMethod !== 'account' && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
          <div className="text-sm">
            <p className="font-medium">{customer.first_name} {customer.last_name}</p>
            {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
            {customer.account_balance !== undefined && (
              <p className="text-gray-600">
                Balance: {formatCurrency(customer.account_balance)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border-t border-gray-200">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handlePaymentButtonClick}
          disabled={!canProcessPayment || isProcessing}
          className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 font-semibold h-12 text-lg"
        >
          {isProcessing ? (
            'Processing...'
           ) : splitPayments.length > 0 ? (
             <>
               <DollarSign className="h-5 w-5 mr-2" />
               {remainingToPay > 0 ? `Add Payment (${formatCurrency(remainingToPay)} remaining)` : 'Complete Payment'}
             </>
          ) : (
            <>
              <DollarSign className="h-5 w-5 mr-2" />
               Choose Payment Method
            </>
          )}
        </Button>
      </div>



       {/* Payment Method Modal */}
       <PaymentMethodModal
         isOpen={showPaymentMethodModal}
         onClose={() => setShowPaymentMethodModal(false)}
         onPaymentMethodSelect={handlePaymentMethodSelect}
         totalAmount={remainingToPay}
         isSplitPayment={splitPayments.length > 0}
         hasSelectedCustomer={!!customer || !!accountCustomer}
       />

       {/* Account Amount Modal */}
       <AccountAmountModal
         isOpen={showAccountAmountModal}
         onClose={() => setShowAccountAmountModal(false)}
         onConfirm={handleAccountAmountConfirm}
         total={finalTotal}
         customer={accountCustomer}
       />

       {/* Customer Selection Modal */}
       <CustomerSelectionModal
         isOpen={showCustomerSelect}
         onClose={() => setShowCustomerSelect(false)}
         onCustomerSelect={handleCustomerSelect}
         selectedCustomer={accountCustomer}
       />

    </div>
  )
}

interface CartItemCardProps {
  item: CartItem
  onRemove: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* Product Image */}
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-sm text-gray-500">
          {formatCurrency(item.unitPrice)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="text-sm font-medium w-8 text-center">
          {item.quantity}
        </span>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <p className="text-sm font-semibold text-[hsl(var(--primary))]">
          {formatCurrency(item.totalPrice)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(item.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
} 