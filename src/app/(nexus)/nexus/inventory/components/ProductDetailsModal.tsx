import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Package, 
  Tag, 
  BarCode, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Hash,
  Info,
  ChevronDown,
  Building2
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Product } from '../hooks/useInventory'
import { useBranch } from '@/context/BranchContext'
import { supabase } from '@/lib/supabase'

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const { selectedBranch, setSelectedBranch } = useBranch()
  const { formatCurrency } = useCurrency()
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [showBranchDropdown, setShowBranchDropdown] = useState(false)
  const [productBranch, setProductBranch] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
        
        if (error) throw error
        setBranches(data || [])
      } catch (error) {
        console.error('Error fetching branches:', error)
      }
    }

    const fetchProductBranch = async () => {
      if (product?.branch_id) {
        try {
          const { data, error } = await supabase
            .from('branches')
            .select('id, name')
            .eq('id', product.branch_id)
            .single()
          
          if (error) throw error
          setProductBranch(data)
        } catch (error) {
          console.error('Error fetching product branch:', error)
        }
      }
    }

    if (isOpen) {
      fetchBranches()
      fetchProductBranch()
    }
  }, [isOpen, product?.branch_id])

  if (!product) return null



  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'destructive' as const, icon: AlertTriangle }
    }
    if (product.stock_quantity <= (product.min_stock_level || 10)) {
      return { status: 'low-stock', label: 'Low Stock', color: 'secondary' as const, icon: Clock }
    }
    return { status: 'in-stock', label: 'In Stock', color: 'default' as const, icon: CheckCircle }
  }

  const getProfitMargin = () => {
    if (product.price === 0) return 0
    return ((product.price - product.cost_price) / product.price) * 100
  }

  const getProfitMarginColor = (margin: number) => {
    if (margin < 0) return 'text-red-600'
    if (margin < 10) return 'text-orange-600'
    if (margin < 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const stockStatus = getStockStatus()
  const profitMargin = getProfitMargin()
  const totalValue = product.price * product.stock_quantity
  const totalCost = product.cost_price * product.stock_quantity
  const expectedProfit = totalValue - totalCost

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">Product Details</span>
            <p className="text-sm text-gray-500">Comprehensive product information and management</p>
          </div>
        </div>
      }
      maxWidth="7xl"
      className="max-h-[95vh] overflow-y-auto"
    >

        <div className="space-y-6">
          {/* Product Header - Compact */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 rounded-2xl border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <Badge variant={stockStatus.color} className="text-xs px-3 py-1">
                    <stockStatus.icon className="h-3 w-3 mr-1" />
                    {stockStatus.label}
                  </Badge>
                  {product.category && (
                    <Badge variant="outline" className="text-xs px-3 py-1">
                      {product.category}
                    </Badge>
                  )}
                </div>
                
                {product.description && (
                  <p className="text-gray-600 mb-3 text-sm leading-relaxed">{product.description}</p>
                )}
                
                {/* Branch Selection - Compact */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Branch:</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                      className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs"
                    >
                      <span className="font-medium">
                        {productBranch?.name || 'Select Branch'}
                      </span>
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    </button>
                    
                    {showBranchDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {branches.map((branch) => (
                          <button
                            key={branch.id}
                            onClick={() => {
                              setProductBranch(branch)
                              setShowBranchDropdown(false)
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
                          >
                            <div className="font-medium text-gray-900">{branch.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500">Selling Price</p>
              </div>
            </div>
          </div>

          {/* Key Information Grid - Compact Horizontal */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* SKU & Barcode */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Hash className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Product Code</h3>
              </div>
              <div className="space-y-2">
                {product.sku && (
                  <div className="bg-white p-2 rounded-md border">
                    <p className="text-xs text-gray-500 mb-1">SKU</p>
                    <p className="font-mono text-xs font-medium text-gray-900">{product.sku}</p>
                  </div>
                )}
                {product.barcode && (
                  <div className="bg-white p-2 rounded-md border">
                    <p className="text-xs text-gray-500 mb-1">Barcode</p>
                    <p className="font-mono text-xs font-medium text-gray-900">{product.barcode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Stock Info</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                  <p className="text-sm font-semibold text-gray-900">{product.stock_quantity} units</p>
                </div>
                {product.min_stock_level && (
                  <div className="bg-white p-2 rounded-md border">
                    <p className="text-xs text-gray-500 mb-1">Min Level</p>
                    <p className="text-xs font-medium text-gray-900">{product.min_stock_level} units</p>
                  </div>
                )}
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Total Value</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Cost Price</p>
                  <p className="text-xs font-medium text-red-600">{formatCurrency(product.cost_price)}</p>
                </div>
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Selling Price</p>
                  <p className="text-xs font-medium text-green-600">{formatCurrency(product.price)}</p>
                </div>
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Profit Margin</p>
                  <p className={`text-xs font-semibold ${getProfitMarginColor(profitMargin)}`}>
                    {formatPercentage(profitMargin)}
                  </p>
                </div>
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Expected Profit</p>
                  <p className={`text-xs font-semibold ${expectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(expectedProfit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs mt-1">
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {productBranch && (
                  <div className="bg-white p-2 rounded-md border">
                    <p className="text-xs text-gray-500 mb-1">Branch</p>
                    <p className="text-xs font-medium text-gray-900">{productBranch.name}</p>
                  </div>
                )}
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details - Compact Horizontal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Product Metadata */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Product Details</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Product ID</p>
                  <p className="font-mono text-xs font-medium text-gray-900">{product.id}</p>
                </div>
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs mt-1">
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {productBranch && (
                  <div className="bg-white p-2 rounded-md border">
                    <p className="text-xs text-gray-500 mb-1">Branch</p>
                    <p className="text-xs font-medium text-gray-900">{productBranch.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Timestamps</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-white p-2 rounded-md border">
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(product.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Product ID: {product.id}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="px-4 py-1 text-xs">
                Close
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-1 text-xs">
                <Package className="h-3 w-3 mr-1" />
                Restock Product
              </Button>
            </div>
          </div>
        </div>
    </Modal>
  )
}
