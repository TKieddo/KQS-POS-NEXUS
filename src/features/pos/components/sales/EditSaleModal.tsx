'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Edit, 
  Plus, 
  Minus, 
  Trash2, 
  Save,
  RefreshCw,
  Receipt,
  DollarSign,
  CreditCard,
  Banknote
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
import { formatCurrency } from '@/lib/utils'

interface SaleItem {
  id: string
  productName: string
  sku: string
  quantity: number
  originalPrice: number
  currentPrice: number
  discount: number
}

interface PaymentMethod {
  id: string
  type: string
  amount: number
  reference?: string
}

interface SaleDetails {
  id: string
  receiptNumber: string
  customerName: string
  date: string
  time: string
  items: SaleItem[]
  payments: PaymentMethod[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'completed' | 'pending' | 'cancelled'
}

interface EditSaleModalProps {
  isOpen: boolean
  onClose: () => void
  saleId?: string
  onSave: (updatedSale: any) => void
}

const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Store Credit',
  'Bank Transfer',
  'Check'
]

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  isOpen,
  onClose,
  saleId,
  onSave
}) => {
  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null)
  const [editingItems, setEditingItems] = useState<SaleItem[]>([])
  const [editingPayments, setEditingPayments] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'items' | 'payments'>('items')

  // Mock data - replace with actual API call
  useEffect(() => {
    if (isOpen && saleId) {
      const mockSale: SaleDetails = {
        id: saleId,
        receiptNumber: 'RCP-001',
        customerName: 'John Doe',
        date: '2024-01-15',
        time: '14:30',
        items: [
          {
            id: '1',
            productName: 'Premium T-Shirt',
            sku: 'TSH-001',
            quantity: 2,
            originalPrice: 29.99,
            currentPrice: 25.99,
            discount: 4.00
          },
          {
            id: '2',
            productName: 'Denim Jeans',
            sku: 'JNS-002',
            quantity: 1,
            originalPrice: 89.99,
            currentPrice: 79.99,
            discount: 10.00
          }
        ],
        payments: [
          {
            id: '1',
            type: 'Credit Card',
            amount: 105.98,
            reference: '****1234'
          }
        ],
        subtotal: 131.97,
        tax: 13.20,
        discount: 14.00,
        total: 131.17,
        status: 'completed'
      }
      
      setSaleDetails(mockSale)
      setEditingItems([...mockSale.items])
      setEditingPayments([...mockSale.payments])
    }
  }, [isOpen, saleId])

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setEditingItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return
    
    setEditingItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            currentPrice: newPrice,
            discount: item.originalPrice - newPrice
          }
        : item
    ))
  }

  const removeItem = (itemId: string) => {
    setEditingItems(prev => prev.filter(item => item.id !== itemId))
  }

  const addPayment = () => {
    const newPayment: PaymentMethod = {
      id: Date.now().toString(),
      type: 'Cash',
      amount: 0
    }
    setEditingPayments(prev => [...prev, newPayment])
  }

  const updatePayment = (paymentId: string, field: keyof PaymentMethod, value: any) => {
    setEditingPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, [field]: value }
        : payment
    ))
  }

  const removePayment = (paymentId: string) => {
    setEditingPayments(prev => prev.filter(payment => payment.id !== paymentId))
  }

  const calculateTotals = () => {
    const subtotal = editingItems.reduce((sum, item) => 
      sum + (item.currentPrice * item.quantity), 0
    )
    const tax = subtotal * 0.1 // 10% tax
    const totalDiscount = editingItems.reduce((sum, item) => 
      sum + (item.discount * item.quantity), 0
    )
    const total = subtotal + tax - totalDiscount
    
    return { subtotal, tax, totalDiscount, total }
  }

  const getPaymentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <Banknote className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const handleSave = async () => {
    setLoading(true)
    
    try {
      const totals = calculateTotals()
      const updatedSale = {
        ...saleDetails,
        items: editingItems,
        payments: editingPayments,
        ...totals
      }
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave(updatedSale)
      onClose()
    } catch (error) {
      console.error('Failed to save sale:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !saleDetails) return null

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Sale</h2>
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

        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Items ({editingItems.length})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payments ({editingPayments.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'items' ? (
                <div className="space-y-4">
                  {editingItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No items in this sale</p>
                    </div>
                  ) : (
                    editingItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{item.productName}</h3>
                              <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                <span>Original: {formatCurrency(item.originalPrice)}</span>
                                <span>Discount: {formatCurrency(item.discount)}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              {/* Quantity */}
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Price */}
                              <div className="w-24">
                                <Input
                                  type="number"
                                  value={item.currentPrice}
                                  onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                  className="text-right"
                                  step="0.01"
                                />
                              </div>

                              {/* Total */}
                              <div className="w-20 text-right">
                                <p className="font-medium">
                                  {formatCurrency(item.currentPrice * item.quantity)}
                                </p>
                              </div>

                              {/* Remove */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {editingPayments.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getPaymentIcon(payment.type)}
                            <div>
                              <Select
                                value={payment.type}
                                onValueChange={(value) => updatePayment(payment.id, 'type', value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {paymentMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="w-32">
                              <Input
                                type="number"
                                value={payment.amount}
                                onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="text-right"
                                step="0.01"
                                placeholder="Amount"
                              />
                            </div>
                            <div className="w-32">
                              <Input
                                value={payment.reference || ''}
                                onChange={(e) => updatePayment(payment.id, 'reference', e.target.value)}
                                placeholder="Reference"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removePayment(payment.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addPayment}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Totals */}
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sale Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="text-green-600">-{formatCurrency(totals.totalDiscount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-gray-900">Payments</h4>
                {editingPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span>{payment.type}</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total Paid</span>
                    <span>{formatCurrency(editingPayments.reduce((sum, p) => sum + p.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Balance</span>
                    <span className={totals.total - editingPayments.reduce((sum, p) => sum + p.amount, 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(totals.total - editingPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 