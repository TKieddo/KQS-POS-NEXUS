'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Package, Filter, Eye, Edit, Copy, Barcode, Tag, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  description: string
  category: string
  price: number
  cost: number
  stockQuantity: number
  minStockLevel: number
  maxStockLevel: number
  supplier: string
  location: string
  status: 'active' | 'inactive' | 'discontinued'
  tags: string[]
  images: string[]
  createdAt: string
  updatedAt: string
}

interface ProductLookupPageProps {
  products: Product[]
  isLoading: boolean
  onViewProduct: (product: Product) => void
  onEditProduct: (product: Product) => void
  onCopyProduct: (product: Product) => void
}

export const ProductLookupPage: React.FC<ProductLookupPageProps> = ({
  products,
  isLoading,
  onViewProduct,
  onEditProduct,
  onCopyProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Product['status']>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'discontinued': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return 'out_of_stock'
    if (product.stockQuantity <= product.minStockLevel) return 'low_stock'
    return 'in_stock'
  }

  const getStockColor = (product: Product) => {
    const status = getStockStatus(product)
    switch (status) {
      case 'out_of_stock': return 'text-red-600'
      case 'low_stock': return 'text-yellow-600'
      case 'in_stock': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStockIcon = (product: Product) => {
    const status = getStockStatus(product)
    switch (status) {
      case 'out_of_stock': return <AlertCircle className="h-4 w-4" />
      case 'low_stock': return <AlertCircle className="h-4 w-4" />
      case 'in_stock': return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getCategories = () => {
    const categories = products.map(p => p.category)
    return ['all', ...Array.from(new Set(categories))]
  }

  const getTotalProducts = () => {
    return products.length
  }

  const getActiveProducts = () => {
    return products.filter(p => p.status === 'active')
  }

  const getLowStockProducts = () => {
    return products.filter(p => getStockStatus(p) === 'low_stock')
  }

  const getOutOfStockProducts = () => {
    return products.filter(p => getStockStatus(p) === 'out_of_stock')
  }

  const getTotalValue = () => {
    return products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      const matchesStock = stockFilter === 'all' || getStockStatus(product) === stockFilter
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock
    })
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'stock':
          aValue = a.stockQuantity
          bValue = b.stockQuantity
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredProducts, sortBy, sortOrder])

  const stats = useMemo(() => [
    {
      label: 'Total Products',
      count: getTotalProducts(),
      color: 'bg-blue-500'
    },
    {
      label: 'Active',
      count: getActiveProducts().length,
      color: 'bg-green-500'
    },
    {
      label: 'Low Stock',
      count: getLowStockProducts().length,
      color: 'bg-yellow-500'
    },
    {
      label: 'Total Value',
      count: getTotalValue(),
      color: 'bg-purple-500'
    }
  ], [products])

  const categories = getCategories()

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowViewModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedProduct(null)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedProduct(null)
  }

  const handleSaveProduct = (updatedProduct: Product) => {
    // TODO: Implement actual save logic with API call
    console.log('Saving product:', updatedProduct)
    setShowEditModal(false)
    setSelectedProduct(null)
    // For now, just call the parent handler
    onEditProduct(updatedProduct)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Product Lookup" 
        icon={<Search className="h-4 w-4 text-black" />}
      />
      
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
                  placeholder="Search products by name, SKU, barcode, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
              
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as any)
                  setSortOrder(order as any)
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="stock-asc">Stock Low-High</option>
                <option value="stock-desc">Stock High-Low</option>
                <option value="category-asc">Category A-Z</option>
                <option value="category-desc">Category Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <LoadingSpinner text="Loading products..." />
        ) : sortedProducts.length === 0 ? (
          <EmptyState 
            icon={<Search className="h-8 w-8" />}
            title="No products found"
            description={searchQuery || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'No products have been added yet.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <div key={product.id} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{product.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>{product.category}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Barcode className="h-4 w-4" />
                      <span>{product.sku}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Stock Level</span>
                    <span className={`text-sm font-bold ${getStockColor(product)}`}>
                      {product.stockQuantity}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getStockIcon(product)}
                      <span className={getStockColor(product)}>
                        {getStockStatus(product).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Min: {product.minStockLevel} | Max: {product.maxStockLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-6 border-b border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProduct(product)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopyProduct(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl max-w-5xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Product Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseViewModal}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Image */}
                <div className="lg:col-span-1">
                  {selectedProduct.images.length > 0 && (
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedProduct.status)}`}>
                        {selectedProduct.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600">Stock:</span>
                      <span className={`text-xs font-bold ${getStockColor(selectedProduct)}`}>
                        {selectedProduct.stockQuantity} ({getStockStatus(selectedProduct).replace('_', ' ')})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600">Price:</span>
                      <span className="text-xs font-bold text-green-600">{formatCurrency(selectedProduct.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">SKU</span>
                      <p className="text-xs font-semibold">{selectedProduct.sku}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Barcode</span>
                      <p className="text-xs font-semibold">{selectedProduct.barcode}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Category</span>
                      <p className="text-xs font-semibold">{selectedProduct.category}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Cost</span>
                      <p className="text-xs font-semibold">{formatCurrency(selectedProduct.cost)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Supplier</span>
                      <p className="text-xs font-semibold">{selectedProduct.supplier}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Location</span>
                      <p className="text-xs font-semibold">{selectedProduct.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Stock Range</span>
                      <p className="text-xs font-semibold">Min: {selectedProduct.minStockLevel} | Max: {selectedProduct.maxStockLevel}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600 block mb-1">Created</span>
                      <p className="text-xs font-semibold">{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {selectedProduct.tags.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-600 block mb-2">Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.tags.map((tag, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-[#E5FF29] text-black text-xs rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseViewModal}
                  size="sm"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleCloseViewModal()
                    handleEditProduct(selectedProduct)
                  }}
                  className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
                  size="sm"
                >
                  Edit Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseEditModal}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <Input
                      type="text"
                      defaultValue={selectedProduct.name}
                      className="w-full h-10 text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      defaultValue={selectedProduct.description}
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={selectedProduct.price}
                        className="w-full h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={selectedProduct.cost}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                      <Input
                        type="number"
                        defaultValue={selectedProduct.stockQuantity}
                        className="w-full h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                      <Input
                        type="number"
                        defaultValue={selectedProduct.minStockLevel}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        defaultValue={selectedProduct.category}
                        className="w-full p-2 border border-gray-200 rounded-lg h-10 text-sm"
                      >
                        <option value="Clothing">Clothing</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        defaultValue={selectedProduct.status}
                        className="w-full p-2 border border-gray-200 rounded-lg h-10 text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <Input
                      type="text"
                      defaultValue={selectedProduct.supplier}
                      className="w-full h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Input
                      type="text"
                      defaultValue={selectedProduct.location}
                      className="w-full h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseEditModal}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveProduct(selectedProduct)}
                  className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
                  size="sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 