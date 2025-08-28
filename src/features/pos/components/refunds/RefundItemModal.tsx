'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  User,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Building2,
  Smartphone,
  ArrowLeftRight,
  Wallet,
  RotateCcw,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { getEnabledPaymentMethods } from '@/lib/payment-options-service'

import { RefundService, RefundData } from '../../services/refund-service'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import type { Customer } from '../../types'
import { CustomerSelectionModal } from '../CustomerSelectionModal'

interface SaleItem {
  id: string
  saleId: string
  saleNumber: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  saleDate: string
  customerName: string
  customerId: string
  paymentMethod: string
  refunded: boolean
  refundAmount?: number
  refundDate?: string
  productId: string
  variantId?: string
}



interface RefundItemModalProps {
  item: SaleItem
  isOpen: boolean
  onClose: () => void
  onProcessRefund: (itemId: string, refundAmount: number, reason: string, refundMethod: string, customerId?: string) => Promise<void>
  customers: Customer[]
}

const refundReasons = [
  'Damaged Product',
  'Wrong Size/Color',
  'Customer Changed Mind',
  'Defective Item',
  'Not as Described',
  'Quality Issue',
  'Wrong Item Received',
  'Other'
]

type RefundMethod = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  hoverColor: string
}

const UI_METHOD_CONFIG: Record<string, Omit<RefundMethod, 'id' | 'name' | 'description'>> = {
  cash: {
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    icon: <DollarSign className="h-5 w-5" />
  },
  card: {
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    icon: <CreditCard className="h-5 w-5" />
  },
  transfer: {
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    icon: <Building2 className="h-5 w-5" />
  },
  mpesa: {
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    icon: <Smartphone className="h-5 w-5" />
  },
  ecocash: {
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    icon: <ArrowLeftRight className="h-5 w-5" />
  },
  airtel_money: {
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    icon: <Smartphone className="h-5 w-5" />
  },
  orange_money: {
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    icon: <Smartphone className="h-5 w-5" />
  },
  account: {
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
    icon: <User className="h-5 w-5" />
  }
}

export const RefundItemModal: React.FC<RefundItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onProcessRefund,
  customers
}) => {
  const { appUser } = useAuth()
  const { selectedBranch } = useBranch()
  
  const [refundAmount, setRefundAmount] = useState(item.totalPrice.toString())
  const [refundReason, setRefundReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('cash')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showCustomerSelectionModal, setShowCustomerSelectionModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refundMethods, setRefundMethods] = useState<RefundMethod[]>([])

  useEffect(() => {
    if (isOpen) {
      setRefundAmount(item.totalPrice.toString())
      setRefundReason('')
      setRefundMethod('cash')
      setSelectedCustomer(null)
      setShowCustomerSelect(false)
      setCustomerSearch('')
      setError('')
      setSuccess('')
      loadRefundMethods()
    }
  }, [isOpen, item])

  const loadRefundMethods = async () => {
    try {
      console.log('🔍 Loading refund methods...')
      const enabled = await getEnabledPaymentMethods()
      console.log('📋 Enabled payment methods from database:', enabled)
      
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

      console.log('🎯 Mapped UI IDs:', uiIds)

      const nameMap: Record<string, string> = {
        cash: 'Cash Refund',
        card: 'Card Refund',
        transfer: 'Bank Transfer Refund',
        mpesa: 'M-Pesa Refund',
        ecocash: 'EcoCash Refund',
        airtel_money: 'Airtel Money Refund',
        orange_money: 'Orange Money Refund',
        account: 'Account Credit'
      }

      const descMap: Record<string, string> = {
        cash: 'Refund in cash to customer',
        card: 'Refund to original payment method',
        transfer: 'Refund via bank transfer',
        mpesa: 'Refund via M-Pesa mobile money',
        ecocash: 'Refund via EcoCash mobile money',
        airtel_money: 'Refund via Airtel Money',
        orange_money: 'Refund via Orange Money',
        account: 'Credit customer account for future purchases'
      }

      const methods: RefundMethod[] = uiIds.map((id) => {
        const base = UI_METHOD_CONFIG[id]
        return {
          id,
          name: nameMap[id] || id,
          description: descMap[id] || '',
          icon: base.icon,
          color: base.color,
          hoverColor: base.hoverColor
        }
      })

      console.log('✅ Final refund methods:', methods)
      setRefundMethods(methods)
      
      // Set default refund method to first available method
      if (methods.length > 0 && refundMethod === 'cash' && !methods.find(m => m.id === 'cash')) {
        setRefundMethod(methods[0].id)
      }
    } catch (error) {
      console.error('❌ Failed to load refund methods:', error)
      // Fallback to basic methods if loading fails
      setRefundMethods([
        { id: 'cash', name: 'Cash Refund', description: 'Refund in cash to customer', icon: <DollarSign className="h-5 w-5" />, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
        { id: 'card', name: 'Card Refund', description: 'Refund to original payment method', icon: <CreditCard className="h-5 w-5" />, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
        { id: 'account', name: 'Account Credit', description: 'Credit customer account for future purchases', icon: <User className="h-5 w-5" />, color: 'bg-black', hoverColor: 'hover:bg-gray-800' }
      ])
    }
  }

  const handleProcessRefund = async () => {
    // Check if item is already refunded
    if (item.refunded) {
      setError('This item has already been refunded')
      return
    }

    if (!refundAmount || !refundReason || !refundMethod) {
      setError('Please fill in all required fields')
      return
    }

    if (refundMethod === 'account' && !selectedCustomer) {
      setError('Please select a customer for account credit')
      return
    }

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid refund amount')
      return
    }

    if (amount > item.totalPrice) {
      setError('Refund amount cannot exceed original sale amount')
      return
    }

    // Debug logging
    console.log('AppUser object:', appUser)
    console.log('Selected branch object:', selectedBranch)
    console.log('AppUser ID:', appUser?.id)
    console.log('Branch ID:', selectedBranch?.id)

    if (!appUser?.id || !selectedBranch?.id) {
      setError('User or branch information is missing')
      return
    }

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      // Prepare refund data
      const refundData: RefundData = {
        itemId: item.id,
        refundAmount: amount,
        reason: refundReason,
        refundMethod: refundMethod,
        customerId: selectedCustomer?.id,
        processedBy: appUser.id,
        branchId: selectedBranch.id
      }

      // Process the refund using the service
      const result = await RefundService.processRefund(refundData)

      if (result.success) {
        setSuccess('Refund processed successfully!')
        
        // Call the parent callback
        await onProcessRefund(
          item.id, 
          amount, 
          refundReason, 
          refundMethod, 
          selectedCustomer?.id
        )

        // Close modal after a short delay
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to process refund')
      }
    } catch (error) {
      console.error('Failed to process refund:', error)
      setError('Failed to process refund. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerSelectionModal(false)
  }

  const handleClose = () => {
    setRefundAmount(item.totalPrice.toString())
    setRefundReason('')
    setRefundMethod('cash')
    setSelectedCustomer(null)
    setShowCustomerSelect(false)
    setCustomerSearch('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full shadow-2xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <RotateCcw className="h-6 w-6 mr-3 text-[#E5FF29]" />
                Process Refund
              </h2>
              <button
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Refund item from sale #{item.saleNumber}</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Warning for already refunded items */}
            {item.refunded && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-900">Item Already Refunded</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This item has already been refunded on {item.refundDate ? new Date(item.refundDate).toLocaleDateString() : 'unknown date'} for {formatCurrency(item.refundAmount || 0)}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Item details */}
              <div className="space-y-6">
                {/* Item Details */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center text-base">
                    <Package className="h-5 w-5 mr-3 text-gray-600" />
                    Item Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium text-gray-900 truncate ml-3">{item.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium text-gray-900">{item.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="font-bold text-[hsl(var(--primary))] text-lg">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Refund Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Refund Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      className="pl-12 text-xl font-semibold h-12"
                      step="0.01"
                      min="0"
                      max={item.totalPrice}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum refund amount: {formatCurrency(item.totalPrice)}
                  </p>
                </div>

                {/* Refund Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Refund Reason *
                  </label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger className="w-full h-12 text-base bg-white border border-gray-300 focus:border-[#E5FF29] focus:ring-2 focus:ring-[#E5FF29]/20">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason} value={reason} className="hover:bg-gray-50">
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle column: Payment methods */}
              <div className="space-y-6">
                {/* Refund Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Refund Method *
                  </label>
                  {refundMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No payment methods available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {refundMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setRefundMethod(method.id)}
                          className={`p-4 border rounded-lg flex items-center justify-center space-x-3 transition-colors ${
                            refundMethod === method.id ? 'border-[#E5FF29] bg-[#E5FF29]/10 text-black' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`${method.color} text-white rounded-lg p-2`}>
                            {method.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-base">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                          {refundMethod === method.id && (
                            <CheckCircle className="h-5 w-5 text-[#E5FF29]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Selection for Account Credit */}
                {refundMethod === 'account' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Customer for Account Credit *
                    </label>
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCustomerSelectionModal(true)}
                        className="w-full h-12 text-base"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {selectedCustomer 
                          ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                          : 'Select or Add Customer'
                        }
                      </Button>

                      {selectedCustomer && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedCustomer.first_name} {selectedCustomer.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                              <p className="text-xs text-gray-500">#{selectedCustomer.customer_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">
                                <span className="text-gray-600">Current Balance:</span>
                                <span className={`ml-1 font-medium ${
                                  selectedCustomer.account_balance !== undefined && selectedCustomer.account_balance > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {formatCurrency(selectedCustomer.account_balance || 0)}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Credit Limit: {formatCurrency(selectedCustomer.credit_limit || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Summary */}
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center text-base">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                    Refund Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span className="font-medium truncate ml-3">{item.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refund Amount:</span>
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(parseFloat(refundAmount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">
                        {refundMethods.find(m => m.id === refundMethod)?.name}
                      </span>
                    </div>
                    {refundMethod === 'account' && selectedCustomer && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium truncate ml-3">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inventory Impact:</span>
                        <span className="font-medium text-green-600">+{item.quantity} units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleProcessRefund}
                    disabled={isProcessing || item.refunded || !refundAmount || !refundReason || !refundMethod || (refundMethod === 'account' && !selectedCustomer)}
                    className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-12 text-base font-semibold disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5 mr-3" />
                        Process Refund
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="w-full h-12 text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        isOpen={showCustomerSelectionModal}
        onClose={() => setShowCustomerSelectionModal(false)}
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={selectedCustomer}
      />
    </>
  )
} 