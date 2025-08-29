'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Filter,
  Search,
  Eye,
  Box,
  Clock,
  Tag,
  BarChart3
} from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Mock data for Inventory Valuation
const mockInventoryValuation = [
  { 
    id: 1, 
    product: 'Premium T-Shirt', 
    sku: 'TSH-001',
    category: 'Clothing',
    quantity: 150,
    unitCost: 89.99,
    totalCost: 13498.50,
    unitPrice: 299.99,
    totalValue: 44998.50,
    profitMargin: 70.00,
    lastUpdated: '2024-01-15',
    supplier: 'Fashion Co.',
    location: 'Warehouse A'
  },
  { 
    id: 2, 
    product: 'Wireless Headphones', 
    sku: 'WH-002',
    category: 'Electronics',
    quantity: 75,
    unitCost: 299.99,
    totalCost: 22499.25,
    unitPrice: 899.99,
    totalValue: 67499.25,
    profitMargin: 66.67,
    lastUpdated: '2024-01-15',
    supplier: 'Tech Solutions',
    location: 'Warehouse B'
  },
  { 
    id: 3, 
    product: 'Designer Jeans', 
    sku: 'DJ-003',
    category: 'Clothing',
    quantity: 120,
    unitCost: 199.99,
    totalCost: 23998.80,
    unitPrice: 599.99,
    totalValue: 71998.80,
    profitMargin: 66.67,
    lastUpdated: '2024-01-14',
    supplier: 'Fashion Co.',
    location: 'Warehouse A'
  },
  { 
    id: 4, 
    product: 'Smart Watch', 
    sku: 'SW-004',
    category: 'Electronics',
    quantity: 50,
    unitCost: 499.99,
    totalCost: 24999.50,
    unitPrice: 1299.99,
    totalValue: 64999.50,
    profitMargin: 61.54,
    lastUpdated: '2024-01-14',
    supplier: 'Tech Solutions',
    location: 'Warehouse B'
  },
  { 
    id: 5, 
    product: 'Running Shoes', 
    sku: 'RS-005',
    category: 'Footwear',
    quantity: 200,
    unitCost: 299.99,
    totalCost: 59998.00,
    unitPrice: 799.99,
    totalValue: 159998.00,
    profitMargin: 62.50,
    lastUpdated: '2024-01-13',
    supplier: 'Sports Gear',
    location: 'Warehouse C'
  },
  { 
    id: 6, 
    product: 'Leather Bag', 
    sku: 'LB-006',
    category: 'Accessories',
    quantity: 80,
    unitCost: 149.99,
    totalCost: 11999.20,
    unitPrice: 449.99,
    totalValue: 35999.20,
    profitMargin: 66.67,
    lastUpdated: '2024-01-13',
    supplier: 'Leather Works',
    location: 'Warehouse A'
  },
  { 
    id: 7, 
    product: 'Bluetooth Speaker', 
    sku: 'BS-007',
    category: 'Electronics',
    quantity: 100,
    unitCost: 119.99,
    totalCost: 11999.00,
    unitPrice: 349.99,
    totalValue: 34999.00,
    profitMargin: 65.71,
    lastUpdated: '2024-01-12',
    supplier: 'Tech Solutions',
    location: 'Warehouse B'
  },
  { 
    id: 8, 
    product: 'Sunglasses', 
    sku: 'SG-008',
    category: 'Accessories',
    quantity: 300,
    unitCost: 49.99,
    totalCost: 14997.00,
    unitPrice: 199.99,
    totalValue: 59997.00,
    profitMargin: 75.00,
    lastUpdated: '2024-01-12',
    supplier: 'Vision Pro',
    location: 'Warehouse A'
  },
]

const InventoryValuationReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = mockInventoryValuation.length
    const totalQuantity = mockInventoryValuation.reduce((sum, product) => sum + product.quantity, 0)
    const totalCost = mockInventoryValuation.reduce((sum, product) => sum + product.totalCost, 0)
    const totalValue = mockInventoryValuation.reduce((sum, product) => sum + product.totalValue, 0)
    const avgProfitMargin = mockInventoryValuation.reduce((sum, product) => sum + product.profitMargin, 0) / totalProducts

    return {
      totalProducts,
      totalQuantity,
      totalCost,
      totalValue,
      avgProfitMargin
    }
  }, [])

  // Filter data
  const filteredProducts = useMemo(() => {
    return mockInventoryValuation.filter(product => {
      const matchesSearch = product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      const matchesSupplier = !supplierFilter || product.supplier === supplierFilter
      
      return matchesSearch && matchesCategory && matchesSupplier
    })
  }, [searchTerm, categoryFilter, supplierFilter])

  // Chart data
  const valuationTrendChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Total Inventory Value',
        data: [485000, 520000, 495000, 530000],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const categoryValueChartData = {
    labels: ['Electronics', 'Clothing', 'Footwear', 'Accessories'],
    datasets: [
      {
        label: 'Value by Category',
        data: [167497.75, 116997.30, 159998.00, 95996.20],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EC4899'
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DB2777'
        ],
        borderWidth: 2
      }
    ]
  }

  const handleExport = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Export logic here
    }, 1000)
  }

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product)
    setShowDetailsModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Valuation Report</h1>
          <p className="text-muted-foreground">Track inventory value and profit margins</p>
        </div>
        <Button onClick={handleExport} disabled={isLoading} className="bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          {isLoading ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quantity</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Box className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalQuantity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">Inventory cost</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Retail value</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Profit Margin</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgProfitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Profit</CardTitle>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Tag className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue - stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">If all sold</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mockInventoryValuation.filter(p => p.quantity < 100).length}
            </div>
            <p className="text-xs text-muted-foreground">Below 100 units</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Inventory Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={valuationTrendChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(Number(value))
                      }
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={categoryValueChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(Number(value))
                      }
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Suppliers</option>
              <option value="Fashion Co.">Fashion Co.</option>
              <option value="Tech Solutions">Tech Solutions</option>
              <option value="Sports Gear">Sports Gear</option>
              <option value="Leather Works">Leather Works</option>
              <option value="Vision Pro">Vision Pro</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Valuation Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Inventory Valuation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Unit Cost</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total Cost</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total Value</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Profit Margin</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{product.product}</td>
                    <td className="p-3 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-3">{product.quantity.toLocaleString()}</td>
                    <td className="p-3">{formatCurrency(product.unitCost)}</td>
                    <td className="p-3">{formatCurrency(product.totalCost)}</td>
                    <td className="p-3 font-medium">{formatCurrency(product.unitPrice)}</td>
                    <td className="p-3 font-medium">{formatCurrency(product.totalValue)}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {product.profitMargin}%
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Product Valuation Details"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                <p className="text-foreground">{selectedProduct.product}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p className="text-foreground">{selectedProduct.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedProduct.category}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-foreground">{selectedProduct.supplier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-foreground">{selectedProduct.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-foreground">{selectedProduct.quantity.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Cost</label>
                <p className="text-foreground">{formatCurrency(selectedProduct.unitCost)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedProduct.totalCost)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                <p className="text-foreground">{formatCurrency(selectedProduct.unitPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedProduct.totalValue)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Profit Margin</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {selectedProduct.profitMargin}%
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-foreground">{selectedProduct.lastUpdated}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InventoryValuationReport 