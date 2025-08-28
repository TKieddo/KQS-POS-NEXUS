'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, DollarSign, User, Calendar, Clock, CreditCard, Percent, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import type { CartItem, Customer } from '@/features/pos/types'

interface Sale {
  id: string
  saleNumber: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  discount: number
  discountType: 'percentage' | 'fixed'
  total: number
  paymentMethod: 'cash' | 'card' | 'credit'
  status: 'completed' | 'pending' | 'cancelled'
  createdAt: string
}

interface LayByeContract {
  id: string
  contractNumber: string
  saleId: string
  customer: Customer
  items: CartItem[]
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly'
  paymentAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
}

export default function ConvertSaleToLayByePage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showLayByeModal, setShowLayByeModal] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  // Mock data - replace with Supabase query
  useEffect(() => {
    const mockSales: Sale[] = [
      {
        id: 'SALE-001',
        saleNumber: 'SALE-2024-001',
        customer: {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, State 12345',
          credit_limit: 1000,
          current_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        items: [
          {
            id: '1',
            product: {
              id: '1',
              name: 'Nike Air Max 270',
              price: 150.00,
              cost_price: 120.00,
              sku: 'NIKE-AM270',
              category_id: '1',
              category_name: 'Shoes',
              stock_quantity: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00
          }
        ],
        subtotal: 150.00,
        discount: 10,
        discountType: 'percentage',
        total: 135.00,
        paymentMethod: 'card',
        status: 'completed',
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'SALE-002',
        saleNumber: 'SALE-2024-002',
        customer: {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1 (555) 234-5678',
          address: '456 Oak Ave, City, State 12345',
          credit_limit: 500,
          current_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        items: [
          {
            id: '2',
            product: {
              id: '2',
              name: 'Adidas Ultraboost',
              price: 180.00,
              cost_price: 140.00,
              sku: 'ADIDAS-UB',
              category_id: '1',
              category_name: 'Shoes',
              stock_quantity: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            quantity: 1,
            unitPrice: 180.00,
            totalPrice: 180.00
          }
        ],
        subtotal: 180.00,
        discount: 0,
        discountType: 'fixed',
        total: 180.00,
        paymentMethod: 'cash',
        status: 'completed',
        createdAt: '2024-01-19T14:20:00Z'
      }
    ]

    setSales(mockSales)
    setFilteredSales(mockSales)
  }, [])

  // Filter sales based on search and status
  useEffect(() => {
    let filtered = sales

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sale =>
        sale.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.customer.phone && sale.customer.phone.includes(searchQuery))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    setFilteredSales(filtered)
  }, [searchQuery, statusFilter, sales])

  const handleConvertToLayBye = (sale: Sale) => {
    setSelectedSale(sale)
    setShowLayByeModal(true)
  }

  const handleCreateLayByeContract = async (contractData: Partial<LayByeContract>) => {
    if (!selectedSale) return

    setIsConverting(true)
    try {
      // TODO: Create lay-bye contract in Supabase
      console.log('Creating lay-bye contract:', { sale: selectedSale, contractData })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setShowLayByeModal(false)
      setSelectedSale(null)
      
      // Navigate to lay-bye management
      router.push('/laybye')
    } catch (error) {
      console.error('Error creating lay-bye contract:', error)
      alert('Failed to create lay-bye contract. Please try again.')
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

  const getPaymentMethodIcon = (method: Sale['paymentMethod']) => {
    switch (method) {
      case 'cash': return <DollarSign className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'credit': return <Percent className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
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
                onClick={() => router.back()}
                className="text-gray-600 hover:bg-gray-100/80 h-9 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-xs"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 rounded-lg shadow-lg">
                  <CreditCard className="h-4 w-4 text-black" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Convert Sale to Lay-Bye</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3">
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
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3">
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
                : 'No sales available for lay-bye conversion'
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
                    <h3 className="font-semibold text-gray-900 text-sm">{sale.saleNumber}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                      {getStatusIcon(sale.status)}
                      <span className="ml-1 capitalize">{sale.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    {getPaymentMethodIcon(sale.paymentMethod)}
                    <span className="capitalize">{sale.paymentMethod}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900 text-sm">{sale.customer.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{sale.customer.phone}</p>
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
                    onClick={() => handleConvertToLayBye(sale)}
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
                        <CreditCard className="h-3 w-3 mr-2" />
                        Convert to Lay-Bye
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lay-Bye Modal */}
      {showLayByeModal && selectedSale && (
        <LayByeContractModal
          sale={selectedSale}
          isOpen={showLayByeModal}
          onClose={() => {
            setShowLayByeModal(false)
            setSelectedSale(null)
          }}
          onSubmit={handleCreateLayByeContract}
          isProcessing={isConverting}
        />
      )}
    </div>
  )
}

// Lay-Bye Contract Modal Component
interface LayByeContractModalProps {
  sale: Sale
  isOpen: boolean
  onClose: () => void
  onSubmit: (contractData: Partial<LayByeContract>) => void
  isProcessing: boolean
}

const LayByeContractModal: React.FC<LayByeContractModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSubmit,
  isProcessing
}) => {
  const [contractData, setContractData] = useState({
    depositAmount: sale.total * 0.2, // 20% default deposit
    paymentSchedule: 'monthly' as const,
    paymentAmount: (sale.total * 0.8) / 3, // 3 months default
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  if (!isOpen) return null

  const remainingAmount = sale.total - contractData.depositAmount
  const numberOfPayments = Math.ceil(remainingAmount / contractData.paymentAmount)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Create Lay-Bye Contract</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <AlertCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Sale Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Sale Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sale Number:</span>
                <span className="font-medium">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{sale.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900">{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount
              </label>
              <Input
                type="number"
                value={contractData.depositAmount}
                onChange={(e) => setContractData(prev => ({ 
                  ...prev, 
                  depositAmount: parseFloat(e.target.value) || 0 
                }))}
                min="0"
                max={sale.total}
                step="0.01"
                className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Schedule
              </label>
              <select
                value={contractData.paymentSchedule}
                onChange={(e) => setContractData(prev => ({ 
                  ...prev, 
                  paymentSchedule: e.target.value as any 
                }))}
                className="w-full h-10 rounded-lg border border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <Input
                type="number"
                value={contractData.paymentAmount}
                onChange={(e) => setContractData(prev => ({ 
                  ...prev, 
                  paymentAmount: parseFloat(e.target.value) || 0 
                }))}
                min="0"
                step="0.01"
                className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={contractData.startDate}
                  onChange={(e) => setContractData(prev => ({ 
                    ...prev, 
                    startDate: e.target.value 
                  }))}
                  className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={contractData.endDate}
                  onChange={(e) => setContractData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value 
                  }))}
                  className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-black rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-white mb-3">Contract Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Deposit:</span>
                <span className="text-white">{formatCurrency(contractData.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Remaining:</span>
                <span className="text-white">{formatCurrency(remainingAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Payments:</span>
                <span className="text-white">{numberOfPayments} x {formatCurrency(contractData.paymentAmount)}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Total:</span>
                  <span className="text-[#E5FF29] font-bold">{formatCurrency(sale.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(contractData)}
              disabled={isProcessing || contractData.depositAmount >= sale.total}
              className="flex-1 h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Contract'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 