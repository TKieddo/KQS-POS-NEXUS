'use client'

import React, { useState } from 'react'
import { X, User, MapPin, Package, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Delivery } from '@/features/pos/types/deliveries'

interface CreateDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateDelivery: (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
  isOpen,
  onClose,
  onCreateDelivery
}) => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    totalAmount: 0,
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.orderNumber) newErrors.orderNumber = 'Order number is required'
    if (!formData.customerName) newErrors.customerName = 'Customer name is required'
    if (!formData.customerPhone) newErrors.customerPhone = 'Customer phone is required'
    if (!formData.customerAddress) newErrors.customerAddress = 'Customer address is required'
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required'
    if (!formData.deliveryTime) newErrors.deliveryTime = 'Delivery time is required'
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required'
    } else {
      formData.items.forEach((item, index) => {
        if (!item.name) newErrors[`item${index}Name`] = 'Item name is required'
        if (item.quantity <= 0) newErrors[`item${index}Quantity`] = 'Quantity must be greater than 0'
        if (item.price <= 0) newErrors[`item${index}Price`] = 'Price must be greater than 0'
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const totalAmount = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    onCreateDelivery({
      ...formData,
      totalAmount,
      status: 'pending'
    })

    // Reset form
    setFormData({
      orderNumber: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      items: [{ name: '', quantity: 1, price: 0 }],
      totalAmount: 0,
      deliveryDate: '',
      deliveryTime: '',
      notes: ''
    })
    setErrors({})
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItem = (index: number, field: 'name' | 'quantity' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Create New Delivery
            </h2>
            <button
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Order Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <Input
                  value={formData.orderNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                  className={errors.orderNumber ? 'border-red-500' : ''}
                />
                {errors.orderNumber && (
                  <p className="text-xs text-red-500 mt-1">{errors.orderNumber}</p>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className={errors.customerPhone ? 'border-red-500' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <Input
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  className={errors.customerAddress ? 'border-red-500' : ''}
                />
                {errors.customerAddress && (
                  <p className="text-xs text-red-500 mt-1">{errors.customerAddress}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Items
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="text-xs"
                >
                  Add Item
                </Button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className={errors[`item${index}Name`] ? 'border-red-500' : ''}
                      />
                      {errors[`item${index}Name`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`item${index}Name`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className={errors[`item${index}Quantity`] ? 'border-red-500' : ''}
                      />
                      {errors[`item${index}Quantity`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`item${index}Quantity`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className={errors[`item${index}Price`] ? 'border-red-500' : ''}
                      />
                      {errors[`item${index}Price`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`item${index}Price`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Delivery Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className={errors.deliveryDate ? 'border-red-500' : ''}
                  />
                  {errors.deliveryDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time
                  </label>
                  <Input
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    placeholder="e.g., 14:00-16:00"
                    className={errors.deliveryTime ? 'border-red-500' : ''}
                  />
                  {errors.deliveryTime && (
                    <p className="text-xs text-red-500 mt-1">{errors.deliveryTime}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional delivery notes..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="h-9 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
            >
              Create Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 