'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  User,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

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

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_balance: number
  credit_limit: number
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

const refundMethods = [
  { id: 'cash', name: 'Cash Refund', icon: DollarSign, description: 'Refund in cash to customer' },
  { id: 'card', name: 'Card Refund', icon: CreditCard, description: 'Refund to original payment method' },
  { id: 'account', name: 'Account Credit', icon: User, description: 'Credit customer account for future purchases' }
]

export const RefundItemModal: React.FC<RefundItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onProcessRefund,
  customers
}) => {
  const [refundAmount, setRefundAmount] = useState(item.totalPrice.toString())
  const [refundReason, setRefundReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('cash')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRefundAmount(item.totalPrice.toString())
      setRefundReason('')
      setRefundMethod('cash')
      setSelectedCustomer(null)
      setShowCustomerSelect(false)
      setCustomerSearch('')
      setError('')
    }
  }, [isOpen, item])

  const handleProcessRefund = async () => {
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

    setIsProcessing(true)
    setError('')

    try {
      await onProcessRefund(
        item.id, 
        amount, 
        refundReason, 
        refundMethod, 
        selectedCustomer?.id
      )
    } catch (error) {
      setError('Failed to process refund. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  )

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerSelect(false)
    setCustomerSearch('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Process Refund</h2>
            <p className="text-sm text-gray-600">Refund item from sale #{item.saleNumber}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-full overflow-y-auto">
          {/* Item Details */}
          <div className="p-6 border-b border-gray-200">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <p className="text-sm text-gray-900">{item.productName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <p className="text-sm text-gray-900">{item.sku}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <p className="text-sm text-gray-900">{item.quantity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                    <p className="text-sm text-gray-900">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refund Configuration */}
          <div className="p-6 space-y-6">
            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount *
              </label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                className="w-full"
                step="0.01"
                min="0"
                max={item.totalPrice}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum refund amount: {formatCurrency(item.totalPrice)}
              </p>
            </div>

            {/* Refund Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Method *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {refundMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      refundMethod === method.id
                        ? 'border-[#E5FF29] bg-[#E5FF29]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setRefundMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <method.icon className={`h-5 w-5 ${
                        refundMethod === method.id ? 'text-black' : 'text-gray-600'
                      }`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          refundMethod === method.id ? 'text-black' : 'text-gray-900'
                        }`}>
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {refundMethod === method.id && (
                        <CheckCircle className="h-5 w-5 text-[#E5FF29]" />
                      )}
            </div>
          </div>
                ))}
              </div>
            </div>

            {/* Customer Selection for Account Credit */}
            {refundMethod === 'account' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer for Account Credit *
                </label>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                  >
                    <span>
                      {selectedCustomer 
                        ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                        : 'Select a customer'
                      }
                    </span>
                    {showCustomerSelect ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showCustomerSelect && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200">
                        <Input
                          type="text"
                          placeholder="Search customers..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="p-2">
                        {filteredCustomers.length === 0 ? (
                          <p className="text-sm text-gray-500 p-2">No customers found</p>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
                              onClick={() => handleCustomerSelect(customer)}
                            >
                        <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {customer.first_name} {customer.last_name}
                                  </p>
                                  <p className="text-sm text-gray-600">{customer.email}</p>
                              </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    Balance: {formatCurrency(customer.current_balance)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Limit: {formatCurrency(customer.credit_limit)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                          </div>

                {selectedCustomer && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                            </div>
                            <div className="text-right">
                        <p className="text-sm">
                          <span className="text-gray-600">Current Balance:</span>
                          <span className={`ml-1 font-medium ${
                            selectedCustomer.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(selectedCustomer.current_balance)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Credit Limit: {formatCurrency(selectedCustomer.credit_limit)}
                              </p>
                            </div>
                          </div>
                        </div>
                )}
              </div>
            )}

            {/* Refund Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason *
              </label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                              <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                              </SelectTrigger>
                              <SelectContent>
                                {refundReasons.map((reason) => (
                                  <SelectItem key={reason} value={reason}>
                                    {reason}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Refund Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium">{item.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(parseFloat(refundAmount) || 0)}</span>
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
                    <span className="font-medium">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
            Cancel
          </Button>
          <Button
                onClick={handleProcessRefund}
                disabled={isProcessing || !refundAmount || !refundReason || !refundMethod || (refundMethod === 'account' && !selectedCustomer)}
                className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                  ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Refund
                  </>
                  )}
          </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 