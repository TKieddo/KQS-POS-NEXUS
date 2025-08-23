import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Eye, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Download,
  FileSpreadsheet
} from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Product } from '../hooks/useInventory'

interface InventoryTableProps {
  products: Product[]
  onView: (product: Product) => void
  onDelete: (product: Product) => void
}

export function InventoryTable({ products, onView, onDelete }: InventoryTableProps) {
  const { formatCurrency, currencySymbol } = useCurrency()

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0%'
    return `${value.toFixed(1)}%`
  }

  const formatCurrencyForCSV = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return '0.00'
    return amount.toFixed(2)
  }

  const formatPercentageForCSV = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '0.0'
    return value.toFixed(1)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'destructive' as const }
    }
    if (product.stock_quantity <= (product.min_stock_level || 10)) {
      return { status: 'low-stock', label: 'Low Stock', color: 'secondary' as const }
    }
    return { status: 'in-stock', label: 'In Stock', color: 'default' as const }
  }

  const getProfitMargin = (product: Product) => {
    if (product.price === 0) return 0
    return ((product.price - product.cost_price) / product.price) * 100
  }

  const getProfitMarginColor = (margin: number) => {
    if (margin < 0) return 'text-red-600'
    if (margin < 10) return 'text-orange-600'
    if (margin < 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const exportToCSV = () => {
    // Calculate totals
    const totalProducts = products.length
    const totalStockQuantity = products.reduce((sum, p) => sum + p.stock_quantity, 0)
    const totalCostValue = products.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0)
    const totalSellingValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
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
    products.forEach(product => {
      const stockStatus = getStockStatus(product)
      const profitMargin = getProfitMargin(product)
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
        stockStatus.label,
        formatCurrencyForCSV(product.cost_price),
        formatCurrencyForCSV(product.price),
        formatPercentageForCSV(profitMargin),
        formatCurrencyForCSV(totalCost),
        formatCurrencyForCSV(totalValue),
        formatCurrencyForCSV(expectedProfit),
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
      formatPercentageForCSV(averageProfitMargin),
      formatCurrencyForCSV(totalCostValue),
      formatCurrencyForCSV(totalSellingValue),
      formatCurrencyForCSV(totalExpectedProfit),
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
    link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>Inventory Items ({products.length})</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Package className="h-3 w-3" />
              <span>All Products</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="text-xs px-3 py-1 h-7"
            >
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              Export CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="text-left py-2 px-3 font-medium text-xs">Product</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Category</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Stock</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Cost Price</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Selling Price</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Profit Margin</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Total Value</th>
                <th className="text-left py-2 px-3 font-medium text-xs">Expected Profit</th>
                <th className="text-left py-2 px-3 font-medium text-xs">View</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product)
                const profitMargin = getProfitMargin(product)
                const totalValue = product.price * product.stock_quantity
                const totalCost = product.cost_price * product.stock_quantity
                const expectedProfit = totalValue - totalCost

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    {/* Product Info */}
                    <td className="py-2 px-3">
                      <div>
                        <p className="font-medium text-xs">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        )}
                        {product.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="text-xs">
                        {product.category || 'Uncategorized'}
                      </Badge>
                    </td>

                    {/* Stock Status */}
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={stockStatus.color} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                        <span className="text-xs font-medium">
                          {product.stock_quantity} units
                        </span>
                      </div>
                      {product.min_stock_level && (
                        <p className="text-xs text-gray-500">
                          Threshold: {product.min_stock_level}
                        </p>
                      )}
                    </td>

                    {/* Cost Price */}
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        <span className="font-medium text-red-600 text-xs">
                          {formatCurrency(product.cost_price)}
                        </span>
                      </div>
                    </td>

                    {/* Selling Price */}
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="font-medium text-green-600 text-xs">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </td>

                    {/* Profit Margin */}
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        {profitMargin >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={`font-medium text-xs ${getProfitMarginColor(profitMargin)}`}>
                          {formatPercentage(profitMargin)}
                        </span>
                      </div>
                    </td>

                    {/* Total Value */}
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="font-medium text-blue-600 text-xs">
                          {formatCurrency(totalValue)}
                        </span>
                      </div>
                    </td>

                    {/* Expected Profit */}
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        {expectedProfit >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={`font-medium text-xs ${expectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(expectedProfit)}
                        </span>
                      </div>
                    </td>

                    {/* View */}
                    <td className="py-2 px-3">
                      <Button variant="ghost" size="sm" onClick={() => onView(product)} className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
