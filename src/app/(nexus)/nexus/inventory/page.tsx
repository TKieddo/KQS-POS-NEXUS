'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  DollarSign, 
  BarChart3,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  Plus
} from 'lucide-react'
import { NexusHeader } from '@/components/layout/NexusHeader'
import { InventoryStats } from './components/InventoryStats'
import { InventoryTable } from './components/InventoryTable'
import { InventoryFilters } from './components/InventoryFilters'
import { ProfitAnalysis } from './components/ProfitAnalysis'
import { LowStockAlert } from './components/LowStockAlert'
import { ProductDetailsModal } from './components/ProductDetailsModal'
import { AllAlertsModal } from './components/AllAlertsModal'
import { useInventory } from './hooks/useInventory'
import { useCurrency } from '@/hooks/useCurrency'
import { Product } from './hooks/useInventory'

export default function InventoryPage() {
  const {
    products,
    loading,
    error,
    stats,
    refreshData
  } = useInventory()

  const { formatCurrency, currencySymbol } = useCurrency()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showAlertsModal, setShowAlertsModal] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'low-stock' && product.stock_quantity > 0 && product.stock_quantity <= (product.min_stock_level || 10)) ||
                         (selectedStatus === 'out-of-stock' && product.stock_quantity === 0) ||
                         (selectedStatus === 'in-stock' && product.stock_quantity > (product.min_stock_level || 10))
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))]

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleViewAllAlerts = () => {
    setShowAlertsModal(true)
  }

  const handleExportInventory = () => {
    // Calculate totals
    const totalProducts = filteredProducts.length
    const totalStockQuantity = filteredProducts.reduce((sum, p) => sum + p.stock_quantity, 0)
    const totalCostValue = filteredProducts.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0)
    const totalSellingValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
    const totalExpectedProfit = totalSellingValue - totalCostValue
    const averageProfitMargin = totalSellingValue > 0 ? ((totalSellingValue - totalCostValue) / totalSellingValue) * 100 : 0

    // Prepare CSV content - Single clean table
    const csvRows = []

    // Add header
    csvRows.push([
      'Product Name',
      'SKU',
      'Barcode',
      'Category',
      'Stock Quantity',
      'Min Stock Level',
      'Stock Status',
      `Cost Price (${currencySymbol})`,
      `Selling Price (${currencySymbol})`,
      'Profit Margin (%)',
      `Total Cost Value (${currencySymbol})`,
      `Total Selling Value (${currencySymbol})`,
      `Expected Profit (${currencySymbol})`,
      'Status',
      'Created Date'
    ])

    // Add product rows
    filteredProducts.forEach(product => {
      const stockStatus = product.stock_quantity === 0 ? 'Out of Stock' : 
                         product.stock_quantity <= (product.min_stock_level || 10) ? 'Low Stock' : 'In Stock'
      const profitMargin = product.price === 0 ? 0 : ((product.price - product.cost_price) / product.price) * 100
      const totalValue = product.price * product.stock_quantity
      const totalCost = product.cost_price * product.stock_quantity
      const expectedProfit = totalValue - totalCost

      csvRows.push([
        product.name || '',
        product.sku || '',
        product.barcode || '',
        product.category || 'Uncategorized',
        product.stock_quantity.toString(),
        (product.min_stock_level || 0).toString(),
        stockStatus,
        (product.cost_price || 0).toFixed(2),
        (product.price || 0).toFixed(2),
        profitMargin.toFixed(1),
        totalCost.toFixed(2),
        totalValue.toFixed(2),
        expectedProfit.toFixed(2),
        product.is_active ? 'Active' : 'Inactive',
        new Date(product.created_at).toLocaleDateString('en-US')
      ])
    })

    // Add totals row
    csvRows.push([
      'TOTALS',
      '',
      '',
      '',
      totalStockQuantity.toString(),
      '',
      '',
      '',
      '',
      averageProfitMargin.toFixed(1),
      totalCostValue.toFixed(2),
      totalSellingValue.toFixed(2),
      totalExpectedProfit.toFixed(2),
      '',
      ''
    ])

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = String(cell).replace(/"/g, '""')
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
          return `"${escaped}"`
        }
        return escaped
      }).join(',')
    ).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <NexusHeader 
        title="Inventory Management"
        subtitle="Track stock levels, costs, and profit analysis"
        backUrl="/nexus"
      />
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 mb-4">
        <Button variant="outline" size="sm" onClick={refreshData} disabled={loading} className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportInventory} className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-lg">Loading inventory data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      {!loading && !error && (
        <InventoryStats stats={stats} />
      )}

      {/* Filters */}
      {!loading && !error && (
        <InventoryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          categories={categories}
        />
      )}

      {/* Inventory Table */}
      {!loading && !error && (
        <InventoryTable 
          products={filteredProducts}
          onView={handleViewProduct}
          onDelete={(product) => console.log('Delete product:', product)}
        />
      )}

      {/* Profit Analysis - Moved below table */}
      {!loading && !error && (
        <ProfitAnalysis products={filteredProducts} />
      )}

      {/* Stock Alerts - Moved to the end */}
      {!loading && !error && (
        <LowStockAlert 
          products={products.filter(p => p.stock_quantity <= (p.min_stock_level || 10))} 
          onViewAllAlerts={handleViewAllAlerts}
        />
      )}

      {/* Modals */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false)
          setSelectedProduct(null)
        }}
      />

      <AllAlertsModal
        products={products}
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
      />

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'No products have been added to inventory yet.'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
