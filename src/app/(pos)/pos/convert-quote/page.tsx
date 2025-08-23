'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Save, Download, Mail, Calendar, User, DollarSign, Percent, Building2, MapPin, Phone, Mail as MailIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { QuotePreview } from '@/features/pos/components/quotes/QuotePreview'
import { CustomerSelectionModal } from '@/features/pos/components/CustomerSelectionModal'
import { formatCurrency } from '@/lib/utils'
import { useCartContext } from '@/context/CartContext'
import { quoteSaleService } from '@/lib/quote-sale-service'
import type { CartItem, Customer } from '@/features/pos/types'

interface QuoteData {
  id: string
  quoteNumber: string
  customer: Customer | null
  items: CartItem[]
  subtotal: number
  discount: number
  discountType: 'percentage' | 'fixed'
  total: number
  validUntil: string
  notes: string
  createdAt: string
}

export default function ConvertQuotePage() {
  const router = useRouter()
  const { cart, customer, discount, discountType, total, clearCart } = useCartContext()
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    id: '',
    quoteNumber: `QT-${Date.now()}`,
    customer: null,
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    total: 0,
    validUntil: '',
    notes: '',
    createdAt: new Date().toISOString()
  })
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load current cart data from context
  useEffect(() => {
    if (cart.length > 0) {
      const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
      const discountAmount = discountType === 'percentage' 
        ? (subtotal * discount) / 100 
        : discount
      
      setQuoteData(prev => ({
        ...prev,
        items: cart,
        customer: customer,
        subtotal,
        discount,
        discountType,
        total: subtotal - discountAmount
      }))
    }
  }, [cart, customer, discount, discountType, total])

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setQuoteData(prev => ({ ...prev, customer: selectedCustomer }))
  }

  const handleDiscountChange = (newDiscount: number, type: 'percentage' | 'fixed') => {
    const discountAmount = type === 'percentage' 
      ? (quoteData.subtotal * newDiscount) / 100 
      : newDiscount
    
    setQuoteData(prev => ({
      ...prev,
      discount: newDiscount,
      discountType: type,
      total: prev.subtotal - discountAmount
    }))
  }

  const handleCreateQuote = async () => {
    if (!quoteData.customer) {
      setError('Please select a customer')
      return
    }

    if (!quoteData.validUntil) {
      setError('Please set a valid until date')
      return
    }

    if (quoteData.items.length === 0) {
      setError('No items in cart to convert to quote')
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      const quote = await quoteSaleService.createQuote({
        customer: quoteData.customer,
        items: quoteData.items,
        subtotal: quoteData.subtotal,
        discount: quoteData.discount,
        discountType: quoteData.discountType,
        total: quoteData.total,
        validUntil: quoteData.validUntil,
        notes: quoteData.notes
      })
      
      console.log('Quote created successfully:', quote)
      
      // Clear cart after successful quote creation
      clearCart()
      
      setShowPreview(true)
    } catch (error) {
      console.error('Error creating quote:', error)
      setError('Failed to create quote. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveQuote = async () => {
    // This would save as draft - for now just show success
    console.log('Saving quote as draft:', quoteData)
    alert('Quote saved as draft successfully!')
  }

  const handleDownloadQuote = () => {
    // TODO: Generate and download PDF
    console.log('Downloading quote:', quoteData)
    alert('Quote download started!')
  }

  const handleEmailQuote = () => {
    if (!quoteData.customer?.email) {
      setError('Customer email not available')
      return
    }
    // TODO: Send email
    console.log('Emailing quote to:', quoteData.customer.email)
    alert('Quote sent via email!')
  }

  const handleBackToMenu = () => {
    router.push('/pos/menu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
                          <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="text-gray-600 hover:bg-gray-100/80 h-9 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-xs"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back to Menu
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 rounded-lg shadow-lg">
                  <FileText className="h-4 w-4 text-black" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Convert Sale to Quote</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Quote Form - Full Width */}
          <div className="xl:col-span-3 space-y-4">
            {/* Quote Details */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <div className="p-1.5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg mr-2 shadow-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Quote Details
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quote Number
                  </label>
                  <Input
                    type="text"
                    value={quoteData.quoteNumber}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                    placeholder="QT-2024-001"
                    className="h-8 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 transition-all duration-200 text-xs"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Valid Until *
                  </label>
                  <Input
                    type="date"
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-8 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 transition-all duration-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-2 shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Customer
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerModal(true)}
                  className="h-8 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 transition-all duration-200 hover:scale-105 text-xs"
                >
                  {quoteData.customer ? 'Change' : 'Select'}
                </Button>
              </div>
              
              {quoteData.customer ? (
                <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-200/50 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-xs mb-1">{quoteData.customer.name}</h3>
                      <div className="space-y-0.5">
                        {quoteData.customer.email && (
                          <p className="text-xs text-gray-600 flex items-center">
                            <MailIcon className="h-3 w-3 mr-1" />
                            {quoteData.customer.email}
                          </p>
                        )}
                        {quoteData.customer.phone && (
                          <p className="text-xs text-gray-600 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {quoteData.customer.phone}
                          </p>
                        )}
                        {quoteData.customer.address && (
                          <p className="text-xs text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {quoteData.customer.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No customer selected</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerModal(true)}
                    className="mt-2 h-7 px-3 rounded-lg text-xs"
                  >
                    Select Customer
                  </Button>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Items ({quoteData.items.length})</h2>
              
              {quoteData.items.length > 0 ? (
                <div className="space-y-2">
                  {quoteData.items.map((item) => (
                    <div key={item.id} className="bg-gray-50/80 rounded-lg p-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-xs mb-0.5">{item.product.name}</h3>
                          <p className="text-xs text-gray-600 font-medium">SKU: {item.product.sku}</p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-xs text-gray-600 font-medium">Qty: {item.quantity}</p>
                          <p className="font-bold text-gray-900 text-xs">{formatCurrency(item.unitPrice * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No items in cart</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToMenu}
                    className="mt-2 h-7 px-3 rounded-lg text-xs"
                  >
                    Add Items to Cart
                  </Button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Notes</h2>
              <textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special terms, conditions, or notes for this quote..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none transition-all duration-200 h-20 text-xs"
              />
            </div>
          </div>

          {/* Summary & Actions */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-black rounded-xl border border-gray-800 shadow-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-4">Quote Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-medium">Subtotal:</span>
                  <span className="font-bold text-white">{formatCurrency(quoteData.subtotal)}</span>
                </div>
                
                {quoteData.discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">
                      Discount ({quoteData.discountType === 'percentage' ? `${quoteData.discount}%` : 'Fixed'}):
                    </span>
                    <span className="font-bold text-green-400">
                      -{formatCurrency(quoteData.discountType === 'percentage' 
                        ? (quoteData.subtotal * quoteData.discount) / 100 
                        : quoteData.discount
                      )}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-[#E5FF29] bg-gray-900 px-2 py-1 rounded-lg text-xs">{formatCurrency(quoteData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Discount</h2>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button
                    variant={quoteData.discountType === 'percentage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDiscountChange(quoteData.discount, 'percentage')}
                    className={`flex-1 h-8 rounded-lg text-xs ${
                      quoteData.discountType === 'percentage'
                        ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Percent className="h-3 w-3 mr-1" />
                    Percentage
                  </Button>
                  <Button
                    variant={quoteData.discountType === 'fixed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDiscountChange(quoteData.discount, 'fixed')}
                    className={`flex-1 h-8 rounded-lg text-xs ${
                      quoteData.discountType === 'fixed'
                        ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Fixed
                  </Button>
                </div>
                
                <Input
                  type="number"
                  value={quoteData.discount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value), quoteData.discountType)}
                  placeholder={quoteData.discountType === 'percentage' ? '10' : '15.00'}
                  className="h-8 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 transition-all duration-200 text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-2">
                <Button
                  onClick={handleCreateQuote}
                  disabled={isProcessing || !quoteData.customer || !quoteData.validUntil || quoteData.items.length === 0}
                  className="w-full h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 font-semibold text-xs"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3 mr-2" />
                      Create Quote
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSaveQuote}
                  className="w-full h-8 rounded-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 text-xs"
                >
                  <Save className="h-3 w-3 mr-2" />
                  Save Draft
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleDownloadQuote}
                  className="w-full h-8 rounded-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 text-xs"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Download PDF
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleEmailQuote}
                  disabled={!quoteData.customer?.email}
                  className="w-full h-8 rounded-lg border-gray-200 hover:bg-gray-50 transition-all duration-200 text-xs"
                >
                  <Mail className="h-3 w-3 mr-2" />
                  Email Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerSelectionModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={quoteData.customer}
      />

      {showPreview && (
        <QuotePreview
          quote={quoteData}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false)
            router.push('/pos/menu')
          }}
        />
      )}
    </div>
  )
}