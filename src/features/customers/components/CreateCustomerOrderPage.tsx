'use client'

import React, { useState } from 'react'
import { ShoppingCart, Plus, User, Package, Calendar, DollarSign, X } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  category: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface CustomerOrder {
  id: string
  orderNumber: string
  customer: Customer
  items: Array<{
    productId: string
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  expectedDelivery: string
  notes: string
  createdAt: string
}

interface CreateCustomerOrderPageProps {
  customers: Customer[]
  products: Product[]
  onCreateOrder: (orderData: Omit<CustomerOrder, 'id' | 'createdAt'>) => void
  isLoading?: boolean
}

export const CreateCustomerOrderPage: React.FC<CreateCustomerOrderPageProps> = ({
  customers,
  products,
  onCreateOrder,
  isLoading = false
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [orderData, setOrderData] = useState({
    items: [] as Array<{
      productId: string
      name: string
      quantity: number
      price: number
      total: number
    }>,
    tax: 0,
    notes: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', name: '', quantity: 1, price: 0, total: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setOrderData(prev => {
      const newItems = [...prev.items]
      const item = { ...newItems[index] }
      
      if (field === 'productId') {
        const product = products.find(p => p.id === value)
        if (product) {
          item.productId = value as string
          item.name = product.name
          item.price = product.price
          item.total = item.quantity * product.price
        }
      } else if (field === 'quantity') {
        item.quantity = value as number
        item.total = item.quantity * item.price
      }
      
      newItems[index] = item
      return { ...prev, items: newItems }
    })
  }

  const subtotal = orderData.items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = subtotal * (orderData.tax / 100)
  const total = subtotal + taxAmount

  const handleAddCustomer = () => {
    // Validation for new customer
    const customerErrors: Record<string, string> = {}
    if (!newCustomer.name.trim()) customerErrors.name = 'Customer name is required'
    if (!newCustomer.phone.trim()) customerErrors.phone = 'Phone number is required'

    if (Object.keys(customerErrors).length > 0) {
      setErrors(customerErrors)
      return
    }

    // Create new customer object
    const customer: Customer = {
      id: `CUST-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address
    }

    // Add to customers list (in real app, this would be saved to database)
    // For now, we'll just select the new customer
    setSelectedCustomer(customer)
    setShowAddCustomer(false)
    setNewCustomer({ name: '', email: '', phone: '', address: '' })
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!selectedCustomer) newErrors.customer = 'Please select a customer'
    if (orderData.items.length === 0) newErrors.items = 'Please add at least one item'
    if (orderData.items.some(item => !item.productId)) newErrors.items = 'Please select products for all items'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const order: Omit<CustomerOrder, 'id' | 'createdAt'> = {
      orderNumber: `ORD-${Date.now()}`,
      customer: selectedCustomer!,
      items: orderData.items,
      subtotal,
      tax: orderData.tax,
      total,
      status: 'pending',
      orderDate: orderData.orderDate,
      expectedDelivery: orderData.expectedDelivery,
      notes: orderData.notes
    }

    onCreateOrder(order)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Create Customer Order" 
        icon={<ShoppingCart className="h-4 w-4 text-black" />}
      />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Select Customer
              </h3>
              
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedCustomer?.id === customer.id
                        ? 'border-[#E5FF29] bg-[#E5FF29]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{customer.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                ))}
                
                {/* Add New Customer Button */}
                <div
                  onClick={() => setShowAddCustomer(true)}
                  className="p-4 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-200 hover:border-[#E5FF29] hover:bg-[#E5FF29]/5"
                >
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Add New Customer</p>
                  </div>
                </div>
                
                {customers.length === 0 && !showAddCustomer && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No customers available</p>
                  </div>
                )}
              </div>

              {errors.customer && (
                <p className="text-xs text-red-600 mt-2">{errors.customer}</p>
              )}

              {/* Add New Customer Form */}
              {showAddCustomer && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Add New Customer</h4>
                    <button
                      onClick={() => {
                        setShowAddCustomer(false)
                        setNewCustomer({ name: '', email: '', phone: '', address: '' })
                        setErrors({})
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <Input
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter customer name"
                        className={`h-8 text-xs border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address (optional)"
                        className="h-8 text-xs border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input
                        type="tel"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className={`h-8 text-xs border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address (optional)"
                        className="w-full p-2 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none h-16"
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button
                        type="button"
                        onClick={handleAddCustomer}
                        className="flex-1 h-8 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded text-xs"
                      >
                        Add Customer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddCustomer(false)
                          setNewCustomer({ name: '', email: '', phone: '', address: '' })
                          setErrors({})
                        }}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6">
              {selectedCustomer ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Customer:</span>
                          <p className="font-medium">{selectedCustomer.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium">{selectedCustomer.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Order Items</h4>
                        <Button
                          type="button"
                          onClick={addItem}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {orderData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-5">
                              <select
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="w-full h-8 text-xs border border-gray-200 rounded focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                              >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - {formatCurrency(product.price)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                placeholder="Qty"
                                min="1"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <div className="h-8 flex items-center px-3 bg-gray-50 border border-gray-200 rounded text-xs">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="h-8 flex items-center px-3 bg-gray-50 border border-gray-200 rounded text-xs font-medium">
                                {formatCurrency(item.total)}
                              </div>
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                onClick={() => removeItem(index)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {errors.items && (
                        <p className="text-xs text-red-600 mt-2">{errors.items}</p>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Tax (%):</span>
                          <Input
                            type="number"
                            value={orderData.tax}
                            onChange={(e) => setOrderData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-20 h-8 text-xs"
                          />
                          <span className="font-medium">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dates and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order Date
                        </label>
                        <Input
                          type="date"
                          value={orderData.orderDate}
                          onChange={(e) => setOrderData(prev => ({ ...prev, orderDate: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Delivery
                        </label>
                        <Input
                          type="date"
                          value={orderData.expectedDelivery}
                          onChange={(e) => setOrderData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={orderData.notes}
                        onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any special instructions or notes..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none h-20 text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-6 rounded-lg"
                      >
                        Save Draft
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-10 px-6 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Create Order
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Customer</h3>
                  <p className="text-sm text-gray-600">Choose a customer from the list to create an order</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 