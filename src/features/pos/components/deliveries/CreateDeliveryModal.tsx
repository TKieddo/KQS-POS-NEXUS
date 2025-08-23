'use client'

import React, { useState } from 'react'
import { X, Plus, Trash2, MapPin, Clock, User, Phone, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import type { CreateDeliveryData, DeliveryItem } from '../../types/deliveries'

interface CreateDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateDelivery: (deliveryData: CreateDeliveryData) => void
}

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
  isOpen,
  onClose,
  onCreateDelivery
}) => {
  const [formData, setFormData] = useState<CreateDeliveryData>({
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
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const calculateTotal = (items: DeliveryItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleInputChange = (field: keyof CreateDeliveryData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleItemChange = (index: number, field: keyof DeliveryItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      totalAmount: calculateTotal(newItems)
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        items: newItems,
        totalAmount: calculateTotal(newItems)
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = 'Order number is required'
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required'
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required'
    }
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Customer address is required'
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required'
    }
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'Delivery time is required'
    }

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item${index}Name`] = 'Item name is required'
      }
      if (item.quantity <= 0) {
        newErrors[`item${index}Quantity`] = 'Quantity must be greater than 0'
      }
      if (item.price < 0) {
        newErrors[`item${index}Price`] = 'Price cannot be negative'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      await onCreateDelivery(formData)
      handleClose()
    } catch (error) {
      console.error('Error creating delivery:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
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
    onClose()
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Create New Delivery
            </h2>
            <button
              onClick={handleClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number *
              </label>
              <Input
                type="text"
                placeholder="ORD-2024-001"
                value={formData.orderNumber}
                onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                className={errors.orderNumber ? 'border-red-500' : ''}
              />
              {errors.orderNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.orderNumber}</p>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <Input
                  type="text"
                  placeholder="John Smith"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className={errors.customerPhone ? 'border-red-500' : ''}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <Input
                  type="text"
                  placeholder="123 Main St, City, State 12345"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                  className={errors.customerAddress ? 'border-red-500' : ''}
                />
                {errors.customerAddress && (
                  <p className="text-sm text-red-600 mt-1">{errors.customerAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Delivery Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date *
                </label>
                <Input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                  min={getMinDate()}
                  className={errors.deliveryDate ? 'border-red-500' : ''}
                />
                {errors.deliveryDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.deliveryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time *
                </label>
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] ${errors.deliveryTime ? 'border-red-500' : ''}`}
                >
                  <option value="">Select time slot</option>
                  <option value="09:00-11:00">09:00 - 11:00</option>
                  <option value="11:00-13:00">11:00 - 13:00</option>
                  <option value="13:00-15:00">13:00 - 15:00</option>
                  <option value="15:00-17:00">15:00 - 17:00</option>
                  <option value="17:00-19:00">17:00 - 19:00</option>
                </select>
                {errors.deliveryTime && (
                  <p className="text-sm text-red-600 mt-1">{errors.deliveryTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Delivery Items
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Product name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className={errors[`item${index}Name`] ? 'border-red-500' : ''}
                    />
                    {errors[`item${index}Name`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`item${index}Name`]}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Qty
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className={errors[`item${index}Quantity`] ? 'border-red-500' : ''}
                    />
                    {errors[`item${index}Quantity`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`item${index}Quantity`]}</p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className={errors[`item${index}Price`] ? 'border-red-500' : ''}
                    />
                    {errors[`item${index}Price`] && (
                      <p className="text-xs text-red-600 mt-1">{errors[`item${index}Price`]}</p>
                    )}
                  </div>
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(formData.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any special instructions or notes for delivery..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-1" />
                Create Delivery
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 