'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Receipt,
  DollarSign,
  CreditCard,
  Cash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface SaleDetails {
  id: string
  receiptNumber: string
  customerName: string
  date: string
  time: string
  total: number
  tax: number
  discount: number
  paymentMethod: string
  items: Array<{
    id: string
    productName: string
    quantity: number
    price: number
  }>
}

interface RefundSaleModalProps {
  isOpen: boolean
  onClose: () => void
  saleId?: string
  onRefundComplete: (refundData: any) => void
}

const refundReasons = [
  'Customer Request',
  'Duplicate Transaction',
  'System Error',
  'Payment Issue',
  'Service Problem',
  'Other'
]

const refundMethods = [
  'Original Payment Method',
  'Store Credit',
  'Cash',
  'Bank Transfer'
]

export const RefundSaleModal: React.FC<RefundSaleModalProps> = ({
  isOpen,
  onClose,
  saleId,
  onRefundComplete
}) => {
  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundMethod, setRefundMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmRefund, setConfirmRefund] = useState(false)

  // Mock data - replace with actual API call
  useEffect(() => {
    if (isOpen && saleId) {
      const mockSale: SaleDetails = {
        id: saleId,
        receiptNumber: 'RCP-001',
        customerName: 'John Doe',
        date: '2024-01-15',
        time: '14:30',
        total: 125.50,
        tax: 12.55,
        discount: 10.00,
        paymentMethod: 'Credit Card',
        items: [
          {
            id: '1',
            productName: 'Premium T-Shirt',
            quantity: 2,
            price: 25.99
          },
          {
            id: '2',
            productName: 'Denim Jeans',
            quantity: 1,
            price: 79.99
          },
          {
            id: '3',
            productName: 'Running Shoes',
            quantity: 1,
            price: 119.99
          }
        ]
      }
      setSaleDetails(mockSale)
    }
  }, [isOpen, saleId])

  const handleRefund = async () => {
    if (!saleDetails || !refundReason || !refundMethod) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const refundData = {
        saleId: saleDetails.id,
        receiptNumber: saleDetails.receiptNumber,
        refundAmount: saleDetails.total,
        refundReason,
        refundMethod,
        originalPaymentMethod: saleDetails.paymentMethod,
        refundDate: new Date().toISOString()
      }

      onRefundComplete(refundData)
      onClose()
    } catch (error) {
      console.error('Refund failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <Cash className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  if (!isOpen || !saleDetails) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Refund Entire Sale</h2>
              <p className="text-sm text-gray-600">Receipt #{saleDetails.receiptNumber}</p>
            </div>
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

        <div className="flex flex-col h-full">
          {/* Sale Details */}
          <div className="p-6 border-b border-gray-200">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Sale Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{saleDetails.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">{saleDetails.date} at {saleDetails.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <div className="flex items-center space-x-2">
                      {getPaymentIcon(saleDetails.paymentMethod)}
                      <span className="font-medium">{saleDetails.paymentMethod}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">{saleDetails.items.length} items</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Items in Sale</h4>
                  <div className="space-y-2">
                    {saleDetails.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.productName} x{item.quantity}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(saleDetails.total - saleDetails.tax + saleDetails.discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span className="text-green-600">-{formatCurrency(saleDetails.discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(saleDetails.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total Refund</span>
                    <span className="text-red-600">{formatCurrency(saleDetails.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refund Options */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Refund Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason *
              </label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason for the refund" />
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

            {/* Refund Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Method *
              </label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select refund method" />
                </SelectTrigger>
                <SelectContent>
                  {refundMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Warning */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Important Notice</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action will refund the entire sale amount of {formatCurrency(saleDetails.total)}. 
                      This action cannot be undone. Please ensure all items have been returned and the refund is authorized.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="confirm-refund"
                checked={confirmRefund}
                onChange={(e) => setConfirmRefund(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="confirm-refund" className="text-sm text-gray-700">
                I confirm that I want to refund this entire sale and understand this action cannot be undone.
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-red-600">
                Refund Amount: {formatCurrency(saleDetails.total)}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={!refundReason || !refundMethod || !confirmRefund || loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Process Full Refund
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 