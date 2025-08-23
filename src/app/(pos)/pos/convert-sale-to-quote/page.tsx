'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, DollarSign, User, Calendar, CheckCircle, AlertCircle, Clock, Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { quoteSaleService, type Sale } from '@/lib/quote-sale-service'
import { useCartContext } from '@/context/CartContext'
import type { CartItem, Customer } from '@/features/pos/types'

export default function ConvertSaleToQuotePage() {
  const router = useRouter()
  const { loadCartFromSale } = useCartContext()
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteData, setQuoteData] = useState({
    validUntil: '',
    notes: ''
  })

  // Load sales from database
  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true)
        const salesData = await quoteSaleService.getSales()
        setSales(salesData)
        setFilteredSales(salesData)
      } catch (error) {
        console.error('Error loading sales:', error)
        setError('Failed to load sales. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  // Filter sales based on search and status
  useEffect(() => {
    let filtered = sales

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sale =>
        sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer.phone?.includes(searchQuery)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    setFilteredSales(filtered)
  }, [searchQuery, statusFilter, sales])

  const handleConvertToQuote = (sale: Sale) => {
    setSelectedSale(sale)
    setQuoteData({
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      notes: `Converted from sale ${sale.sale_number}`
    })
    setShowQuoteModal(true)
  }

  const handleCreateQuote = async () => {
    if (!selectedSale) return

    if (!quoteData.validUntil) {
      setError('Please set a valid until date')
      return
    }

    setIsConverting(true)
    setError(null)
    
    try {
      const quote = await quoteSaleService.convertSaleToQuote(
        selectedSale.id,
        quoteData.validUntil,
        quoteData.notes
      )
      
      console.log('Sale converted to quote successfully:', quote)
      
      // Load the converted quote data into cart context
      loadCartFromSale({
        items: quote.items,
        customer: quote.customer,
        discount: quote.discount,
        discountType: quote.discount_type
      })
      
      setShowQuoteModal(false)
      setSelectedSale(null)
      
      // Navigate to POS with the converted quote data
      router.push('/pos?convertedFromSale=true')
    } catch (error) {
      console.error('Error converting sale to quote:', error)
      setError('Failed to convert sale to quote. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Sale['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPaymentMethodIcon = (method: Sale['payment_method']) => {
    switch (method) {
      case 'cash': return <DollarSign className="h-4 w-4" />
      case 'card': return <DollarSign className="h-4 w-4" />
      case 'credit': return <DollarSign className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const handleBackToMenu = () => {
    router.push('/pos/menu')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading sales...</p>
        </div>
      </div>
    )
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

      {/* Stats */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-gray-200/50 px-6 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Completed: {sales.filter(s => s.status === 'completed').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Pending: {sales.filter(s => s.status === 'pending').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Cancelled: {sales.filter(s => s.status === 'cancelled').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  type="text"
                  placeholder="Search sales..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 transition-all duration-200 text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] h-8"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {filteredSales.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No sales available for conversion'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{sale.sale_number}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                      {getStatusIcon(sale.status)}
                      <span className="ml-1 capitalize">{sale.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(sale.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900 text-sm">{sale.customer.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{sale.customer.phone || 'No phone'}</p>
                </div>

                {/* Items Summary */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Items ({sale.items.length})</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(sale.total)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {sale.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate">{item.product.name} (x{item.quantity})</span>
                        <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                    {sale.items.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{sale.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4">
                  <Button
                    onClick={() => handleConvertToQuote(sale)}
                    disabled={sale.status !== 'completed'}
                    className={`w-full h-8 rounded-lg transition-all duration-200 text-xs ${
                      sale.status !== 'completed'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 shadow-lg hover:scale-105'
                    }`}
                  >
                    {sale.status !== 'completed' ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-2" />
                        {sale.status === 'pending' ? 'Sale Pending' : 'Cannot Convert'}
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3 mr-2" />
                        Convert to Quote
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote Creation Modal */}
      {showQuoteModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Quote from Sale</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Until *
                </label>
                <Input
                  type="date"
                  value={quoteData.validUntil}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes for this quote..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none h-20"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuoteModal(false)
                  setSelectedSale(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuote}
                disabled={isConverting || !quoteData.validUntil}
                className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
              >
                {isConverting ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 