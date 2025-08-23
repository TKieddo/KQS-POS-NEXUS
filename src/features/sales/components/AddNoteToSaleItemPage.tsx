'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FileText, Search, Filter, Edit, Calendar, DollarSign, User, Package } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface SaleItem {
  id: string
  saleId: string
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  notes?: string
  createdAt: string
}

interface Sale {
  id: string
  saleNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  status: 'completed' | 'refunded' | 'cancelled'
  saleDate: string
  cashier: string
  createdAt: string
}

interface AddNoteToSaleItemPageProps {
  sales: Sale[]
  isLoading: boolean
  onAddNote: (saleId: string, itemId: string, note: string) => void
  onUpdateNote: (saleId: string, itemId: string, note: string) => void
}

export const AddNoteToSaleItemPage: React.FC<AddNoteToSaleItemPageProps> = ({
  sales,
  isLoading,
  onAddNote,
  onUpdateNote
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Sale['status']>('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'refunded': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getItemsWithNotes = () => {
    return sales.flatMap(sale => 
      sale.items.filter(item => item.notes && item.notes.trim() !== '')
    )
  }

  const getItemsWithoutNotes = () => {
    return sales.flatMap(sale => 
      sale.items.filter(item => !item.notes || item.notes.trim() === '')
    )
  }

  const getTotalSales = () => {
    return sales.length
  }

  const getTotalItems = () => {
    return sales.reduce((sum, sale) => sum + sale.items.length, 0)
  }

  const getTotalRevenue = () => {
    return sales.reduce((sum, sale) => sum + sale.total, 0)
  }

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sale.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [sales, searchQuery, statusFilter])

  const stats = useMemo(() => [
    {
      label: 'Total Sales',
      value: getTotalSales().toString(),
      icon: FileText,
      trend: '+5',
      trendDirection: 'up' as const
    },
    {
      label: 'Total Items',
      value: getTotalItems().toString(),
      icon: Package,
      trend: '+12',
      trendDirection: 'up' as const
    },
    {
      label: 'Items with Notes',
      value: getItemsWithNotes().length.toString(),
      icon: Edit,
      trend: '+3',
      trendDirection: 'up' as const
    },
    {
      label: 'Revenue',
      value: formatCurrency(getTotalRevenue()),
      icon: DollarSign,
      trend: '+8%',
      trendDirection: 'up' as const
    }
  ], [sales])

  const handleAddNote = (sale: Sale, item: SaleItem) => {
    setSelectedSale(sale)
    setSelectedItem(item)
    setNoteText(item.notes || '')
    setShowNoteModal(true)
  }

  const handleSaveNote = () => {
    if (!selectedSale || !selectedItem) return

    if (selectedItem.notes && selectedItem.notes.trim() !== '') {
      onUpdateNote(selectedSale.id, selectedItem.id, noteText)
    } else {
      onAddNote(selectedSale.id, selectedItem.id, noteText)
    }

    setShowNoteModal(false)
    setSelectedSale(null)
    setSelectedItem(null)
    setNoteText('')
  }

  const handleCancelNote = () => {
    setShowNoteModal(false)
    setSelectedSale(null)
    setSelectedItem(null)
    setNoteText('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Add Note to Sale Item" 
        icon={<FileText className="h-4 w-4 text-black" />}
      />
      
      <div className="pt-6">
        <StatsBar stats={stats} />
        
        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search sales by number, customer, or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
                >
                  <option value="all">All Sales</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-4">
          {isLoading ? (
            <LoadingSpinner text="Loading sales..." />
          ) : filteredSales.length === 0 ? (
            <EmptyState 
              icon={<FileText className="h-8 w-8" />}
              title="No sales found"
              description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No sales have been recorded yet.'}
            />
          ) : (
            <div className="space-y-6">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden">
                  {/* Sale Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{sale.saleNumber}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{sale.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(sale.saleDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(sale.total)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>

                  {/* Sale Items */}
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
                    <div className="space-y-4">
                      {sale.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{item.productName}</h5>
                              <span className="text-sm font-bold text-gray-900">{formatCurrency(item.total)}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Qty: {item.quantity}</span>
                              <span>Price: {formatCurrency(item.price)}</span>
                              {item.notes && (
                                <span className="text-blue-600 font-medium">Has Note</span>
                              )}
                            </div>
                            {item.notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-sm text-blue-800">{item.notes}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddNote(sale, item)}
                            className="ml-4 h-8 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {item.notes ? 'Edit Note' : 'Add Note'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && selectedSale && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Add Note to Item</h3>
              <button
                onClick={handleCancelNote}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {selectedItem.productName}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter note for this item..."
                  className="w-full border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveNote}
                  className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
                >
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelNote}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 