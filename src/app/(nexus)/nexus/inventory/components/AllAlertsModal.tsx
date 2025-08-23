import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, 
  AlertTriangle, 
  Package, 
  Plus, 
  Search, 
  Filter,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Eye,
  Download
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Product } from '../hooks/useInventory'

interface AllAlertsModalProps {
  products: Product[]
  isOpen: boolean
  onClose: () => void
}

export function AllAlertsModal({ products, isOpen, onClose }: AllAlertsModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'out-of-stock' | 'low-stock'>('all')

  const { formatCurrency, currencySymbol } = useCurrency()

  const outOfStockProducts = products.filter(p => p.stock_quantity === 0)
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.min_stock_level || 10))

  const allAlertProducts = [...outOfStockProducts, ...lowStockProducts]

  const filteredProducts = allAlertProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'out-of-stock' && product.stock_quantity === 0) ||
                         (filterType === 'low-stock' && product.stock_quantity > 0 && product.stock_quantity <= (product.min_stock_level || 10))
    
    return matchesSearch && matchesFilter
  })

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'destructive' as const, bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    }
    return { status: 'low-stock', label: 'Low Stock', color: 'secondary' as const, bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
  }

  const exportAlerts = () => {
    // Calculate summary statistics
    const totalAlerts = filteredProducts.length
    const totalValueAtRisk = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
    const outOfStockValue = outOfStockProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
    const lowStockValue = lowStockProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)

    // Prepare CSV content - Single clean table
    const csvRows = []

    // Add header
    csvRows.push([
      'Product Name',
      'SKU',
      'Barcode',
      'Category',
      'Current Stock',
      'Min Stock Level',
      'Stock Status',
      `Price (${currencySymbol})`,
      `Total Value (${currencySymbol})`,
      `Value at Risk (${currencySymbol})`,
      'Status',
      'Created Date'
    ])

    // Add product rows
    filteredProducts.forEach(product => {
      const stockStatus = getStockStatus(product)
      const totalValue = product.price * product.stock_quantity
      const valueAtRisk = stockStatus.status === 'out-of-stock' ? totalValue : 
                         (product.min_stock_level || 10) - product.stock_quantity > 0 ? 
                         (product.min_stock_level || 10) - product.stock_quantity : 0

      csvRows.push([
        product.name || '',
        product.sku || '',
        product.barcode || '',
        product.category || 'Uncategorized',
        product.stock_quantity.toString(),
        (product.min_stock_level || 10).toString(),
        stockStatus.label,
        product.price.toFixed(2),
        totalValue.toFixed(2),
        valueAtRisk.toFixed(2),
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
      filteredProducts.reduce((sum, p) => sum + p.stock_quantity, 0).toString(),
      '',
      '',
      '',
      totalValueAtRisk.toFixed(2),
      totalValueAtRisk.toFixed(2),
      '',
      ''
    ])

    // Convert to CSV string with proper escaping
    const csvContent = csvRows.map(row => 
      row.map(cell => {
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
    link.setAttribute('download', `stock-alerts-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold">Stock Alerts</span>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} items requiring attention
            </p>
          </div>
        </div>
      }
      maxWidth="6xl"
      className="max-h-[90vh] overflow-y-auto"
    >

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Value at Risk</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(allAlertProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0))}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'out-of-stock' | 'low-stock')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Alerts</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock</option>
              </select>
              <Button variant="outline" onClick={exportAlerts}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              return (
                <div key={product.id} className={`flex items-center justify-between p-4 rounded-xl border ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {product.sku && (
                          <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                        )}
                        {product.category && (
                          <span className="text-sm text-gray-500">• {product.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant={stockStatus.color} className="text-sm">
                          {stockStatus.label}
                        </Badge>
                        <span className="font-semibold text-lg">
                          {product.stock_quantity} units
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Threshold: {product.min_stock_level || 10} units
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                      <p className="text-sm text-gray-500">per unit</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(product.price * product.stock_quantity)}
                      </p>
                      <p className="text-sm text-gray-500">total value</p>
                    </div>
                    
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Restock
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">No alerts found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {allAlertProducts.length} alerts
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Bulk Restock
              </Button>
            </div>
          </div>
        </div>
    </Modal>
  )
}
