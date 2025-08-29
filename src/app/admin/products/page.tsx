'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Download, Upload, Eye, EyeOff, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductTable, Product, transformProduct } from '@/features/products/components/ProductTable'
import { ProductGallery } from '@/features/products/components/ProductGallery'
import { ViewToggle } from '@/features/products/components/ViewToggle'
import { ProductStatsCards } from '@/features/products/components/ProductStatsCards'
import { ProductActionBar } from '@/features/products/components/ProductActionBar'
import { BulkActionsBar } from '@/features/products/components/BulkActionsBar'
import { AddProductModal } from '@/features/products/modals/AddProductModal'
import { EditProductModal } from '@/features/products/modals/EditProductModal'
import { PromotionsModal } from '@/features/products/modals/PromotionsModal'
import { BarcodeModal } from '@/features/products/modals/BarcodeModal'
import { ImportModal } from '@/features/products/modals/ImportModal'
import { BulkPriceModal } from '@/features/products/modals/BulkPriceModal'
import { BulkDeleteModal } from '@/features/products/modals/BulkDeleteModal'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import type { Product as SupabaseProduct } from '@/lib/supabase'

export default function ProductsPage() {
  const { user, session, loading: authLoading } = useAuth()
  const { selectedBranch, viewMode: branchViewMode } = useBranch()
  const { 
    products: supabaseProducts, 
    categories,
    loading, 
    error, 
    fetchProducts,
    fetchCategories,
    removeProduct, 
    bulkRemoveProducts,
    clearError 
  } = useProducts()

  // Fetch products and categories on component mount (only when authenticated)
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Fetching products and categories... (user authenticated)')
      fetchCategories()
    } else if (!user && !authLoading) {
      console.log('User not authenticated, skipping data fetch')
    }
  }, [fetchCategories, user, authLoading])

  // Fetch products when branch changes
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Branch/ViewMode changed, fetching products...')
      console.log('Selected branch:', selectedBranch?.name)
      console.log('Branch view mode:', branchViewMode)
      
      // Fetch products based on selected branch
      // If Central Warehouse is selected, pass undefined to get all products
      // If specific branch is selected, pass the branch ID
      const branchId = selectedBranch?.id === '00000000-0000-0000-0000-000000000001' ? undefined : selectedBranch?.id
      fetchProducts(branchId)
    }
  }, [fetchProducts, user, authLoading, selectedBranch])

  // Debug logging
  useEffect(() => {
    console.log('Products state updated:', {
      count: supabaseProducts.length,
      products: supabaseProducts,
      categoriesCount: categories.length,
      categories: categories,
      loading,
      error,
      auth: {
        user: user?.id,
        session: !!session,
        authLoading
      },
      branch: {
        selectedBranch: selectedBranch?.name,
        selectedBranchId: selectedBranch?.id,
        isCentralWarehouse: selectedBranch?.id === '00000000-0000-0000-0000-000000000001'
      }
    })
  }, [supabaseProducts, categories, loading, error, user, session, authLoading, selectedBranch])

  // State management
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'laybye-only' | 'out-of-stock' | 'low-stock'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null)
  const [showPromotionsModal, setShowPromotionsModal] = useState(false)
  const [showBarcodeModal, setShowBarcodeModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Transform Supabase products to UI products
  const products: Product[] = supabaseProducts.map(transformProduct)

  // Filter products based on stock status, search term, and category
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    // Category filter
    if (selectedCategory !== 'all') {
      const selectedCat = categories.find(cat => cat.id === selectedCategory)
      if (selectedCat && product.category !== selectedCat.name) {
        return false
      }
    }

    // Stock filter
    const hasAvailableStock = product.availableStock > 0
    const hasLaybyeStock = product.laybyeStock > 0
    const isLowStock = product.availableStock > 0 && product.availableStock <= 5
    const isOutOfStock = product.totalStock === 0

    switch (stockFilter) {
      case 'available':
        return hasAvailableStock
      case 'laybye-only':
        return !hasAvailableStock && hasLaybyeStock
      case 'out-of-stock':
        return isOutOfStock
      case 'low-stock':
        return isLowStock
      default:
        return true
    }
  })

  // Calculate real stats from database data
  const totalProducts = products.length
  const availableProducts = products.filter(p => p.availableStock > 0).length
  const lowStockProducts = products.filter(p => p.availableStock > 0 && p.availableStock <= 5).length
  const laybyeOnlyProducts = products.filter(p => p.availableStock === 0 && p.laybyeStock > 0).length
  const outOfStockProducts = products.filter(p => p.totalStock === 0).length
  
  // Get categories count from database
  const categoriesCount = categories.length
  
  // Debug logging
  console.log('Categories from database:', categories)
  console.log('Selected category:', selectedCategory)
  console.log('Filtered products count:', filteredProducts.length)

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id))
    } else {
      setSelectedProducts([...selectedProducts, id])
    }
  }

  const handleClearSelection = () => {
    setSelectedProducts([])
  }

  // Action handlers
  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product)
    // Find the original Supabase product data
    const originalProduct = supabaseProducts.find(p => p.id === product.id)
    if (originalProduct) {
      setEditingProduct(originalProduct)
      setShowEditProductModal(true)
    } else {
      console.error('Original product data not found for editing')
      alert('Unable to edit product. Please try refreshing the page.')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const success = await removeProduct(id)
        if (success) {
          setSelectedProducts(prev => prev.filter(productId => productId !== id))
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  const handleBulkDelete = async () => {
    try {
      const success = await bulkRemoveProducts(selectedProducts)
      if (success) {
        setSelectedProducts([])
        setShowBulkDeleteModal(false)
      }
    } catch (error) {
      console.error('Error bulk deleting products:', error)
    }
  }

  const handleBarcodeProduct = (id: string) => {
    console.log('Print barcode for:', id)
    setSelectedProducts([id])
    setShowBarcodeModal(true)
  }

  const handleExportProducts = async () => {
    try {
      const { exportProducts, productsToCSV } = await import('@/lib/import-export')
      const products = await exportProducts()
      const csvContent = productsToCSV(products)
      
      // Download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting products:', error)
      alert('Failed to export products. Please try again.')
    }
  }

  const handleImportComplete = () => {
    // Refresh the product list after successful import
    fetchProducts()
  }

  const handlePrintLabels = () => {
    console.log('Print labels')
    // TODO: Implement print functionality
  }

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  if (authLoading || loading) {
    return (
      <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {authLoading ? 'Loading authentication...' : 'Loading products...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please log in to view products</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Products</h1>
          <p className="text-base text-muted-foreground mt-1">
            {branchViewMode === 'central' 
              ? 'Central Warehouse - All Products (Total Quantities)' 
              : `${selectedBranch?.name} - Branch Products (Allocated Quantities)`
            }
          </p>
        </div>
        <Button 
          onClick={() => setShowAddProductModal(true)}
          className="bg-[#E5FF29] text-black font-semibold hover:bg-[#e5ff29]/90"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <ProductStatsCards 
        totalProducts={totalProducts}
        lowStock={lowStockProducts}
        activePromotions={0} // TODO: Implement promotions system
        categories={categoriesCount}
      />

      {/* Stock Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{availableProducts}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Laybye Only</p>
              <p className="text-2xl font-bold text-purple-600">{laybyeOnlyProducts}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Stock Status:</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { value: 'all', label: 'All Products', color: 'bg-gray-100 text-gray-700' },
            { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
            { value: 'laybye-only', label: 'Laybye Only', color: 'bg-purple-100 text-purple-700' },
            { value: 'low-stock', label: 'Low Stock', color: 'bg-orange-100 text-orange-700' },
            { value: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-100 text-red-700' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStockFilter(filter.value as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                stockFilter === filter.value 
                  ? filter.color 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <ProductActionBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onGenerateBarcodes={() => setShowBarcodeModal(true)}
          onImportProducts={() => setShowImportModal(true)}
          onManagePromotions={() => setShowPromotionsModal(true)}
          onBulkPriceUpdate={() => setShowBulkPriceModal(true)}
          onExportProducts={handleExportProducts}
          onPrintLabels={handlePrintLabels}
        />
        
        {/* View Toggle */}
        <ViewToggle 
          currentView={viewMode}
          onViewChange={setViewMode}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <BulkActionsBar 
          selectedCount={selectedProducts.length}
          onBulkPrice={() => setShowBulkPriceModal(true)}
          onApplyPromotion={() => setShowPromotionsModal(true)}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          onClear={handleClearSelection}
        />
      )}

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No products match your search for "${searchTerm}"`
              : 'Get started by adding your first product to the catalog'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setShowAddProductModal(true)}
              className="bg-[#E5FF29] text-black font-semibold hover:bg-[#e5ff29]/90"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Product
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <ProductTable 
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectAll={handleSelectAll}
          onSelectProduct={handleSelectProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onBarcodeProduct={handleBarcodeProduct}
          stockFilter={stockFilter}
          onVariantUpdated={fetchProducts}
          isCentralWarehouse={selectedBranch?.id === '00000000-0000-0000-0000-000000000001'}
          currentBranchId={selectedBranch?.id}
        />
      ) : (
        <ProductGallery 
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectAll={handleSelectAll}
          onSelectProduct={handleSelectProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onBarcodeProduct={handleBarcodeProduct}
          stockFilter={stockFilter}
          categories={categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: products.filter(p => p.category === cat.name).length
          })).filter(cat => cat.count > 0)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Modals */}
      <AddProductModal 
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
      />

      <EditProductModal 
        isOpen={showEditProductModal}
        onClose={() => setShowEditProductModal(false)}
        product={editingProduct}
        onProductUpdated={fetchProducts}
      />

      <PromotionsModal 
        isOpen={showPromotionsModal}
        onClose={() => setShowPromotionsModal(false)}
        onPromotionApplied={fetchProducts}
      />

      <BarcodeModal 
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        selectedCount={selectedProducts.length}
        selectedProductIds={selectedProducts}
      />

      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      <BulkPriceModal 
        isOpen={showBulkPriceModal}
        onClose={() => setShowBulkPriceModal(false)}
        selectedCount={selectedProducts.length}
        selectedProductIds={selectedProducts}
        onPricesUpdated={fetchProducts}
      />

      <BulkDeleteModal 
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        selectedCount={selectedProducts.length}
      />
    </div>
  )
} 