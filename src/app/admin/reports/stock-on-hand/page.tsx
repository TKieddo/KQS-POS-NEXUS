'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Zap
} from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Mock data for Stock on Hand
const mockStockOnHand = [
  { 
    id: 1, 
    product: 'Premium T-Shirt', 
    sku: 'TSH-001',
    category: 'Clothing',
    currentStock: 150,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    supplier: 'Fashion Co.',
    lastRestock: '2024-01-15',
    nextRestock: '2024-01-25',
    status: 'In Stock',
    value: 44998.50,
    daysUntilReorder: 5
  },
  { 
    id: 2, 
    product: 'Wireless Headphones', 
    sku: 'WH-002',
    category: 'Electronics',
    currentStock: 50,
    minStock: 30,
    maxStock: 100,
    reorderPoint: 50,
    supplier: 'Tech Solutions',
    lastRestock: '2024-01-12',
    nextRestock: '2024-01-20',
    status: 'Low Stock',
    value: 44999.50,
    daysUntilReorder: 2
  },
  { 
    id: 3, 
    product: 'Designer Jeans', 
    sku: 'DJ-003',
    category: 'Clothing',
    currentStock: 120,
    minStock: 40,
    maxStock: 150,
    reorderPoint: 60,
    supplier: 'Fashion Co.',
    lastRestock: '2024-01-14',
    nextRestock: '2024-01-28',
    status: 'In Stock',
    value: 71998.80,
    daysUntilReorder: 8
  },
  { 
    id: 4, 
    product: 'Smart Watch', 
    sku: 'SW-004',
    category: 'Electronics',
    currentStock: 35,
    minStock: 20,
    maxStock: 80,
    reorderPoint: 40,
    supplier: 'Tech Solutions',
    lastRestock: '2024-01-10',
    nextRestock: '2024-01-18',
    status: 'Low Stock',
    value: 45499.65,
    daysUntilReorder: 1
  },
  { 
    id: 5, 
    product: 'Running Shoes', 
    sku: 'RS-005',
    category: 'Footwear',
    currentStock: 200,
    minStock: 80,
    maxStock: 250,
    reorderPoint: 100,
    supplier: 'Sports Gear',
    lastRestock: '2024-01-13',
    nextRestock: '2024-01-30',
    status: 'In Stock',
    value: 159998.00,
    daysUntilReorder: 12
  },
  { 
    id: 6, 
    product: 'Leather Bag', 
    sku: 'LB-006',
    category: 'Accessories',
    currentStock: 70,
    minStock: 25,
    maxStock: 100,
    reorderPoint: 50,
    supplier: 'Leather Works',
    lastRestock: '2024-01-11',
    nextRestock: '2024-01-22',
    status: 'In Stock',
    value: 31499.30,
    daysUntilReorder: 6
  },
  { 
    id: 7, 
    product: 'Bluetooth Speaker', 
    sku: 'BS-007',
    category: 'Electronics',
    currentStock: 100,
    minStock: 40,
    maxStock: 120,
    reorderPoint: 60,
    supplier: 'Tech Solutions',
    lastRestock: '2024-01-12',
    nextRestock: '2024-01-26',
    status: 'In Stock',
    value: 34999.00,
    daysUntilReorder: 10
  },
  { 
    id: 8, 
    product: 'Sunglasses', 
    sku: 'SG-008',
    category: 'Accessories',
    currentStock: 280,
    minStock: 100,
    maxStock: 350,
    reorderPoint: 150,
    supplier: 'Vision Pro',
    lastRestock: '2024-01-09',
    nextRestock: '2024-01-24',
    status: 'In Stock',
    value: 55991.20,
    daysUntilReorder: 9
  },
]

const StockOnHandReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = mockStockOnHand.length
    const totalStock = mockStockOnHand.reduce((sum, product) => sum + product.currentStock, 0)
    const totalValue = mockStockOnHand.reduce((sum, product) => sum + product.value, 0)
    const lowStockItems = mockStockOnHand.filter(product => product.status === 'Low Stock').length
    const outOfStockItems = mockStockOnHand.filter(product => product.currentStock === 0).length

    return {
      totalProducts,
      totalStock,
      totalValue,
      lowStockItems,
      outOfStockItems
    }
  }, [])

  // Filter data
  const filteredProducts = useMemo(() => {
    return mockStockOnHand.filter(product => {
      const matchesSearch = product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || product.status === statusFilter
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchTerm, statusFilter, categoryFilter])

  // Chart data
  const stockLevelChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Total Stock Levels',
        data: [850, 920, 880, 1005],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const stockStatusChartData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [6, 2, 0],
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ],
        borderColor: [
          '#059669',
          '#D97706',
          '#DC2626'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800'
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'Out of Stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockLevelColor = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100
    if (current <= min) return 'text-red-600'
    if (percentage <= 30) return 'text-yellow-600'
    if (percentage <= 60) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock on Hand Report</h1>
          <p className="text-muted-foreground">Monitor current inventory levels and stock status</p>
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units available</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Stock value</p>
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
            <div className="text-2xl font-bold text-foreground">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Stock Level Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={stockLevelChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut 
              data={stockStatusChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
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
          </div>
        </CardContent>
      </Card>

      {/* Stock on Hand Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Current Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Min Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Max Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Next Restock</th>
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
                    <td className="p-3">
                      <span className={`font-medium ${getStockLevelColor(product.currentStock, product.minStock, product.maxStock)}`}>
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="p-3">{product.minStock}</td>
                    <td className="p-3">{product.maxStock}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(product.value)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {product.nextRestock}
                      </div>
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
        title="Stock Details"
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
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProduct.status)}`}>
                  {selectedProduct.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                <p className="text-foreground font-medium">{selectedProduct.currentStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Min Stock</label>
                <p className="text-foreground">{selectedProduct.minStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Max Stock</label>
                <p className="text-foreground">{selectedProduct.maxStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reorder Point</label>
                <p className="text-foreground">{selectedProduct.reorderPoint}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-foreground">{selectedProduct.supplier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Restock</label>
                <p className="text-foreground">{selectedProduct.lastRestock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Restock</label>
                <p className="text-foreground">{selectedProduct.nextRestock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock Value</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedProduct.value)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Days Until Reorder</label>
                <p className="text-foreground">{selectedProduct.daysUntilReorder} days</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StockOnHandReport 