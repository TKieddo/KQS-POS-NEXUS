'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Download,
  Filter,
  Search,
  Eye,
  ArrowUp,
  ArrowDown,
  Clock,
  User,
  Truck
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

// Mock data for Stock Movement
const mockStockMovement = [
  { 
    id: 1, 
    product: 'Premium T-Shirt', 
    sku: 'TSH-001',
    category: 'Clothing',
    movementType: 'Inbound',
    quantity: 50,
    previousStock: 100,
    newStock: 150,
    date: '2024-01-15',
    time: '09:30',
    reference: 'PO-2024-001',
    supplier: 'Fashion Co.',
    user: 'John Doe',
    notes: 'Regular stock replenishment'
  },
  { 
    id: 2, 
    product: 'Wireless Headphones', 
    sku: 'WH-002',
    category: 'Electronics',
    movementType: 'Outbound',
    quantity: 25,
    previousStock: 75,
    newStock: 50,
    date: '2024-01-15',
    time: '14:15',
    reference: 'SO-2024-015',
    supplier: 'N/A',
    user: 'Jane Smith',
    notes: 'Customer order fulfillment'
  },
  { 
    id: 3, 
    product: 'Designer Jeans', 
    sku: 'DJ-003',
    category: 'Clothing',
    movementType: 'Inbound',
    quantity: 30,
    previousStock: 90,
    newStock: 120,
    date: '2024-01-14',
    time: '11:45',
    reference: 'PO-2024-002',
    supplier: 'Fashion Co.',
    user: 'Mike Johnson',
    notes: 'New collection arrival'
  },
  { 
    id: 4, 
    product: 'Smart Watch', 
    sku: 'SW-004',
    category: 'Electronics',
    movementType: 'Outbound',
    quantity: 15,
    previousStock: 50,
    newStock: 35,
    date: '2024-01-14',
    time: '16:30',
    reference: 'SO-2024-014',
    supplier: 'N/A',
    user: 'Sarah Wilson',
    notes: 'Online order shipment'
  },
  { 
    id: 5, 
    product: 'Running Shoes', 
    sku: 'RS-005',
    category: 'Footwear',
    movementType: 'Inbound',
    quantity: 100,
    previousStock: 100,
    newStock: 200,
    date: '2024-01-13',
    time: '08:20',
    reference: 'PO-2024-003',
    supplier: 'Sports Gear',
    user: 'John Doe',
    notes: 'Bulk order received'
  },
  { 
    id: 6, 
    product: 'Leather Bag', 
    sku: 'LB-006',
    category: 'Accessories',
    movementType: 'Outbound',
    quantity: 10,
    previousStock: 80,
    newStock: 70,
    date: '2024-01-13',
    time: '13:45',
    reference: 'SO-2024-013',
    supplier: 'N/A',
    user: 'Jane Smith',
    notes: 'Retail store transfer'
  },
  { 
    id: 7, 
    product: 'Bluetooth Speaker', 
    sku: 'BS-007',
    category: 'Electronics',
    movementType: 'Inbound',
    quantity: 40,
    previousStock: 60,
    newStock: 100,
    date: '2024-01-12',
    time: '10:15',
    reference: 'PO-2024-004',
    supplier: 'Tech Solutions',
    user: 'Mike Johnson',
    notes: 'Restocking popular item'
  },
  { 
    id: 8, 
    product: 'Sunglasses', 
    sku: 'SG-008',
    category: 'Accessories',
    movementType: 'Outbound',
    quantity: 20,
    previousStock: 300,
    newStock: 280,
    date: '2024-01-12',
    time: '15:30',
    reference: 'SO-2024-012',
    supplier: 'N/A',
    user: 'Sarah Wilson',
    notes: 'Seasonal demand'
  },
]

const StockMovementReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [movementTypeFilter, setMovementTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedMovement, setSelectedMovement] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalMovements = mockStockMovement.length
    const inboundMovements = mockStockMovement.filter(m => m.movementType === 'Inbound').length
    const outboundMovements = mockStockMovement.filter(m => m.movementType === 'Outbound').length
    const totalInboundQuantity = mockStockMovement
      .filter(m => m.movementType === 'Inbound')
      .reduce((sum, m) => sum + m.quantity, 0)
    const totalOutboundQuantity = mockStockMovement
      .filter(m => m.movementType === 'Outbound')
      .reduce((sum, m) => sum + m.quantity, 0)

    return {
      totalMovements,
      inboundMovements,
      outboundMovements,
      totalInboundQuantity,
      totalOutboundQuantity
    }
  }, [])

  // Filter data
  const filteredMovements = useMemo(() => {
    return mockStockMovement.filter(movement => {
      const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || movement.date === dateFilter
      const matchesType = !movementTypeFilter || movement.movementType === movementTypeFilter
      const matchesCategory = !categoryFilter || movement.category === categoryFilter
      
      return matchesSearch && matchesDate && matchesType && matchesCategory
    })
  }, [searchTerm, dateFilter, movementTypeFilter, categoryFilter])

  // Chart data
  const dailyMovementChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Inbound',
        data: [40, 100, 30, 50],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Outbound',
        data: [20, 10, 15, 25],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const categoryMovementChartData = {
    labels: ['Electronics', 'Clothing', 'Footwear', 'Accessories'],
    datasets: [
      {
        label: 'Inbound',
        data: [40, 80, 100, 0],
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 2
      },
      {
        label: 'Outbound',
        data: [40, 0, 0, 30],
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
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

  const handleViewDetails = (movement: any) => {
    setSelectedMovement(movement)
    setShowDetailsModal(true)
  }

  const getMovementIcon = (type: string) => {
    return type === 'Inbound' ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    )
  }

  const getMovementColor = (type: string) => {
    return type === 'Inbound' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Movement Report</h1>
          <p className="text-muted-foreground">Track inventory movements and stock changes</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Movements</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ArrowUpDown className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMovements}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inbound Movements</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.inboundMovements}</div>
            <p className="text-xs text-muted-foreground">Stock received</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outbound Movements</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.outboundMovements}</div>
            <p className="text-xs text-muted-foreground">Stock shipped</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Movement</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalInboundQuantity - stats.totalOutboundQuantity > 0 ? '+' : ''}
              {stats.totalInboundQuantity - stats.totalOutboundQuantity}
            </div>
            <p className="text-xs text-muted-foreground">Net quantity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Movement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={dailyMovementChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top'
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
            <CardTitle>Movement by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={categoryMovementChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Types</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
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

      {/* Stock Movement Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Previous Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">New Stock</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Reference</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{movement.product}</td>
                    <td className="p-3 text-sm text-muted-foreground">{movement.sku}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movementType)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movementType)}`}>
                          {movement.movementType}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{movement.quantity}</td>
                    <td className="p-3">{movement.previousStock}</td>
                    <td className="p-3 font-medium">{movement.newStock}</td>
                    <td className="p-3">{movement.date}</td>
                    <td className="p-3 text-sm text-muted-foreground">{movement.reference}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(movement)}
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
        title="Stock Movement Details"
      >
        {selectedMovement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                <p className="text-foreground">{selectedMovement.product}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">SKU</label>
                <p className="text-foreground">{selectedMovement.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedMovement.category}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Movement Type</label>
                <div className="flex items-center gap-2">
                  {getMovementIcon(selectedMovement.movementType)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(selectedMovement.movementType)}`}>
                    {selectedMovement.movementType}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-foreground font-medium">{selectedMovement.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Previous Stock</label>
                <p className="text-foreground">{selectedMovement.previousStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">New Stock</label>
                <p className="text-foreground font-medium">{selectedMovement.newStock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-foreground">{selectedMovement.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <p className="text-foreground">{selectedMovement.time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reference</label>
                <p className="text-foreground">{selectedMovement.reference}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                <p className="text-foreground">{selectedMovement.supplier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User</label>
                <p className="text-foreground">{selectedMovement.user}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-foreground">{selectedMovement.notes}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StockMovementReport 