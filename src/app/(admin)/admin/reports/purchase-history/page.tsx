'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  Package,
  Clock,
  User,
  CreditCard
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

// Mock data for Purchase History
const mockPurchaseHistory = [
  { 
    id: 1, 
    customer: 'Alice Johnson', 
    email: 'alice@email.com',
    phone: '+27 82 123 4567',
    product: 'Premium T-Shirt',
    quantity: 2,
    unitPrice: 299.99,
    totalAmount: 599.98,
    paymentMethod: 'Credit Card',
    purchaseDate: '2024-01-15',
    purchaseTime: '14:30',
    status: 'Completed',
    category: 'Clothing'
  },
  { 
    id: 2, 
    customer: 'Bob Smith', 
    email: 'bob@email.com',
    phone: '+27 83 234 5678',
    product: 'Wireless Headphones',
    quantity: 1,
    unitPrice: 899.99,
    totalAmount: 899.99,
    paymentMethod: 'Cash',
    purchaseDate: '2024-01-15',
    purchaseTime: '16:45',
    status: 'Completed',
    category: 'Electronics'
  },
  { 
    id: 3, 
    customer: 'Carol Davis', 
    email: 'carol@email.com',
    phone: '+27 84 345 6789',
    product: 'Designer Jeans',
    quantity: 1,
    unitPrice: 599.99,
    totalAmount: 599.99,
    paymentMethod: 'Credit Card',
    purchaseDate: '2024-01-14',
    purchaseTime: '11:20',
    status: 'Completed',
    category: 'Clothing'
  },
  { 
    id: 4, 
    customer: 'David Wilson', 
    email: 'david@email.com',
    phone: '+27 85 456 7890',
    product: 'Smart Watch',
    quantity: 1,
    unitPrice: 1299.99,
    totalAmount: 1299.99,
    paymentMethod: 'Credit Card',
    purchaseDate: '2024-01-14',
    purchaseTime: '15:15',
    status: 'Completed',
    category: 'Electronics'
  },
  { 
    id: 5, 
    customer: 'Eva Brown', 
    email: 'eva@email.com',
    phone: '+27 86 567 8901',
    product: 'Running Shoes',
    quantity: 1,
    unitPrice: 799.99,
    totalAmount: 799.99,
    paymentMethod: 'Cash',
    purchaseDate: '2024-01-13',
    purchaseTime: '10:30',
    status: 'Completed',
    category: 'Footwear'
  },
  { 
    id: 6, 
    customer: 'Frank Miller', 
    email: 'frank@email.com',
    phone: '+27 87 678 9012',
    product: 'Leather Bag',
    quantity: 1,
    unitPrice: 449.99,
    totalAmount: 449.99,
    paymentMethod: 'Credit Card',
    purchaseDate: '2024-01-13',
    purchaseTime: '13:45',
    status: 'Completed',
    category: 'Accessories'
  },
  { 
    id: 7, 
    customer: 'Grace Lee', 
    email: 'grace@email.com',
    phone: '+27 88 789 0123',
    product: 'Bluetooth Speaker',
    quantity: 1,
    unitPrice: 349.99,
    totalAmount: 349.99,
    paymentMethod: 'Cash',
    purchaseDate: '2024-01-12',
    purchaseTime: '16:20',
    status: 'Completed',
    category: 'Electronics'
  },
  { 
    id: 8, 
    customer: 'Henry Taylor', 
    email: 'henry@email.com',
    phone: '+27 89 890 1234',
    product: 'Sunglasses',
    quantity: 1,
    unitPrice: 199.99,
    totalAmount: 199.99,
    paymentMethod: 'Credit Card',
    purchaseDate: '2024-01-12',
    purchaseTime: '12:10',
    status: 'Completed',
    category: 'Accessories'
  },
]

const PurchaseHistoryReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalPurchases = mockPurchaseHistory.length
    const totalRevenue = mockPurchaseHistory.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const avgOrderValue = totalRevenue / totalPurchases
    const totalItems = mockPurchaseHistory.reduce((sum, purchase) => sum + purchase.quantity, 0)

    return {
      totalPurchases,
      totalRevenue,
      avgOrderValue,
      totalItems
    }
  }, [])

  // Filter data
  const filteredPurchases = useMemo(() => {
    return mockPurchaseHistory.filter(purchase => {
      const matchesSearch = purchase.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           purchase.product.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || purchase.purchaseDate === dateFilter
      const matchesCategory = !categoryFilter || purchase.category === categoryFilter
      const matchesPayment = !paymentMethodFilter || purchase.paymentMethod === paymentMethodFilter
      
      return matchesSearch && matchesDate && matchesCategory && matchesPayment
    })
  }, [searchTerm, dateFilter, categoryFilter, paymentMethodFilter])

  // Chart data
  const dailyRevenueChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Daily Revenue',
        data: [549.98, 1249.98, 1899.98, 1499.97],
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#EC4899',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const categorySalesChartData = {
    labels: ['Electronics', 'Clothing', 'Footwear', 'Accessories'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [2549.97, 1199.97, 799.99, 649.98],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6'
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#7C3AED'
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

  const handleViewDetails = (purchase: any) => {
    setSelectedPurchase(purchase)
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
          <h1 className="text-3xl font-bold text-foreground">Purchase History Report</h1>
          <p className="text-muted-foreground">Track customer purchase patterns and revenue trends</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
            <div className="p-2 bg-pink-100 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per purchase</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items Sold</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Units sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={dailyRevenueChartData}
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
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={categorySalesChartData}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer or product..."
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
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Payment Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total Amount</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Payment Method</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{purchase.customer}</div>
                        <div className="text-sm text-muted-foreground">{purchase.email}</div>
                      </div>
                    </td>
                    <td className="p-3">{purchase.product}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {purchase.category}
                      </span>
                    </td>
                    <td className="p-3">{purchase.quantity}</td>
                    <td className="p-3 font-medium">{formatCurrency(purchase.totalAmount)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {purchase.paymentMethod}
                      </div>
                    </td>
                    <td className="p-3">{purchase.purchaseDate}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(purchase)}
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
        title="Purchase Details"
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                <p className="text-foreground">{selectedPurchase.customer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{selectedPurchase.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-foreground">{selectedPurchase.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product</label>
                <p className="text-foreground">{selectedPurchase.product}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedPurchase.category}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-foreground">{selectedPurchase.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                <p className="text-foreground">{formatCurrency(selectedPurchase.unitPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedPurchase.totalAmount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                <p className="text-foreground">{selectedPurchase.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                <p className="text-foreground">{selectedPurchase.purchaseDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Time</label>
                <p className="text-foreground">{selectedPurchase.purchaseTime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {selectedPurchase.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PurchaseHistoryReport 