'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, DollarSign, User, Calendar, CheckCircle, AlertCircle, Clock, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { quoteSaleService, type Quote } from '@/lib/quote-sale-service'
import { useCartContext } from '@/context/CartContext'
import type { CartItem, Customer } from '@/features/pos/types'

export default function ConvertQuoteToSalePage() {
  const router = useRouter()
  const { loadCartFromQuote } = useCartContext()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load quotes from database
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true)
        const quotesData = await quoteSaleService.getQuotes()
        setQuotes(quotesData)
        setFilteredQuotes(quotesData)
      } catch (error) {
        console.error('Error loading quotes:', error)
        setError('Failed to load quotes. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadQuotes()
  }, [])

  // Filter quotes based on search and status
  useEffect(() => {
    let filtered = quotes

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(quote =>
        quote.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.quote_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customer.phone?.includes(searchQuery)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter)
    }

    setFilteredQuotes(filtered)
  }, [searchQuery, statusFilter, quotes])

  const handleConvertToSale = async (quote: Quote) => {
    setIsConverting(true)
    setError(null)
    
    try {
      // Convert quote to sale using the service
      const sale = await quoteSaleService.convertQuoteToSale(quote.id)
      
      console.log('Quote converted to sale successfully:', sale)
      
      // Load the converted sale data into cart context
      loadCartFromQuote({
        items: sale.items,
        customer: sale.customer,
        discount: sale.discount,
        discountType: sale.discount_type
      })
      
      // Navigate to POS with the converted sale data
      router.push('/pos?convertedFromQuote=true')
    } catch (error) {
      console.error('Error converting quote:', error)
      setError('Failed to convert quote. Please try again.')
    } finally {
      setIsConverting(false)
    }
  }

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'expired': return 'bg-red-100 text-red-800 border-red-200'
      case 'converted': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'expired': return <AlertCircle className="h-4 w-4" />
      case 'converted': return <DollarSign className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const isQuoteExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const handleBackToMenu = () => {
    router.push('/pos/menu')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading quotes...</p>
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
                  <DollarSign className="h-4 w-4 text-black" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Convert Quote to Sale</h1>
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
              <span className="text-xs text-gray-600">Active: {quotes.filter(q => q.status === 'active').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Expired: {quotes.filter(q => q.status === 'expired').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Converted: {quotes.filter(q => q.status === 'converted').length}</span>
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
                  placeholder="Search quotes..."
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
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No quotes found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No quotes available for conversion'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{quote.quote_number}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                      {getStatusIcon(quote.status)}
                      <span className="ml-1 capitalize">{quote.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Valid until: {new Date(quote.valid_until).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900 text-sm">{quote.customer.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{quote.customer.phone || 'No phone'}</p>
                </div>

                {/* Items Summary */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Items ({quote.items.length})</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(quote.total)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {quote.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate">{item.product.name} (x{item.quantity})</span>
                        <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                    {quote.items.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{quote.items.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4">
                  <Button
                    onClick={() => handleConvertToSale(quote)}
                    disabled={isConverting || quote.status === 'converted' || isQuoteExpired(quote.valid_until)}
                    className={`w-full h-8 rounded-lg transition-all duration-200 text-xs ${
                      quote.status === 'converted' || isQuoteExpired(quote.valid_until)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 shadow-lg hover:scale-105'
                    }`}
                  >
                    {isConverting && selectedQuote?.id === quote.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black mr-2"></div>
                        Converting...
                      </>
                    ) : quote.status === 'converted' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Already Converted
                      </>
                    ) : isQuoteExpired(quote.valid_until) ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-2" />
                        Quote Expired
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-3 w-3 mr-2" />
                        Convert to Sale
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 