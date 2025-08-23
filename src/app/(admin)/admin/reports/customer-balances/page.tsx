'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Filter,
  Search,
  Eye,
  CreditCard,
  Clock,
  User,
  Minus,
  Plus
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

// Mock data for Customer Balances
const mockCustomerBalances = [
  { 
    id: 1, 
    customer: 'Alice Johnson', 
    email: 'alice@email.com',
    phone: '+27 82 123 4567',
    currentBalance: 1250.00,
    creditLimit: 5000.00,
    availableCredit: 3750.00,
    lastPayment: '2024-01-10',
    lastPaymentAmount: 500.00,
    lastPurchase: '2024-01-15',
    lastPurchaseAmount: 750.00,
    status: 'Active',
    overdueAmount: 0.00,
    daysOverdue: 0
  },
  { 
    id: 2, 
    customer: 'Bob Smith', 
    email: 'bob@email.com',
    phone: '+27 83 234 5678',
    currentBalance: 3200.00,
    creditLimit: 3000.00,
    availableCredit: -200.00,
    lastPayment: '2024-01-05',
    lastPaymentAmount: 200.00,
    lastPurchase: '2024-01-12',
    lastPurchaseAmount: 1200.00,
    status: 'Overdue',
    overdueAmount: 200.00,
    daysOverdue: 10
  },
  { 
    id: 3, 
    customer: 'Carol Davis', 
    email: 'carol@email.com',
    phone: '+27 84 345 6789',
    currentBalance: 0.00,
    creditLimit: 10000.00,
    availableCredit: 10000.00,
    lastPayment: '2024-01-14',
    lastPaymentAmount: 2500.00,
    lastPurchase: '2024-01-08',
    lastPurchaseAmount: 1800.00,
    status: 'Active',
    overdueAmount: 0.00,
    daysOverdue: 0
  },
  { 
    id: 4, 
    customer: 'David Wilson', 
    email: 'david@email.com',
    phone: '+27 85 456 7890',
    currentBalance: 850.00,
    creditLimit: 2000.00,
    availableCredit: 1150.00,
    lastPayment: '2024-01-12',
    lastPaymentAmount: 300.00,
    lastPurchase: '2024-01-13',
    lastPurchaseAmount: 450.00,
    status: 'Active',
    overdueAmount: 0.00,
    daysOverdue: 0
  },
  { 
    id: 5, 
    customer: 'Eva Brown', 
    email: 'eva@email.com',
    phone: '+27 86 567 8901',
    currentBalance: 1800.00,
    creditLimit: 2500.00,
    availableCredit: 700.00,
    lastPayment: '2024-01-08',
    lastPaymentAmount: 400.00,
    lastPurchase: '2024-01-15',
    lastPurchaseAmount: 600.00,
    status: 'Active',
    overdueAmount: 0.00,
    daysOverdue: 0
  },
  { 
    id: 6, 
    customer: 'Frank Miller', 
    email: 'frank@email.com',
    phone: '+27 87 678 9012',
    currentBalance: 4200.00,
    creditLimit: 4000.00,
    availableCredit: -200.00,
    lastPayment: '2024-01-03',
    lastPaymentAmount: 150.00,
    lastPurchase: '2024-01-10',
    lastPurchaseAmount: 800.00,
    status: 'Overdue',
    overdueAmount: 200.00,
    daysOverdue: 12
  },
  { 
    id: 7, 
    customer: 'Grace Lee', 
    email: 'grace@email.com',
    phone: '+27 88 789 0123',
    currentBalance: 650.00,
    creditLimit: 3000.00,
    availableCredit: 2350.00,
    lastPayment: '2024-01-15',
    lastPaymentAmount: 250.00,
    lastPurchase: '2024-01-14',
    lastPurchaseAmount: 300.00,
    status: 'Active',
    overdueAmount: 0.00,
    daysOverdue: 0
  },
  { 
    id: 8, 
    customer: 'Henry Taylor', 
    email: 'henry@email.com',
    phone: '+27 89 890 1234',
    currentBalance: 0.00,
    creditLimit: 1500.00,
    availableCredit: 1500.00,
    lastPayment: '2024-01-11',
    lastPaymentAmount: 800.00,
    lastPurchase: '2024-01-09',
    lastPurchaseAmount: 1200.00,
    status: 'Active',
    overdueAmount: 0.00,
    daysOverdue: 0
  },
]

const CustomerBalancesReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalCustomers = mockCustomerBalances.length
    const totalBalances = mockCustomerBalances.reduce((sum, customer) => sum + customer.currentBalance, 0)
    const totalCreditLimit = mockCustomerBalances.reduce((sum, customer) => sum + customer.creditLimit, 0)
    const overdueCustomers = mockCustomerBalances.filter(customer => customer.status === 'Overdue').length
    const totalOverdueAmount = mockCustomerBalances.reduce((sum, customer) => sum + customer.overdueAmount, 0)

    return {
      totalCustomers,
      totalBalances,
      totalCreditLimit,
      overdueCustomers,
      totalOverdueAmount
    }
  }, [])

  // Filter data
  const filteredCustomers = useMemo(() => {
    return mockCustomerBalances.filter(customer => {
      const matchesSearch = customer.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || customer.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  // Chart data
  const balanceTrendChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Total Balances',
        data: [8500, 9200, 8800, 9950],
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const balanceStatusChartData = {
    labels: ['Active', 'Overdue', 'Paid Off'],
    datasets: [
      {
        data: [6, 2, 0],
        backgroundColor: [
          '#10B981',
          '#EF4444',
          '#6B7280'
        ],
        borderColor: [
          '#059669',
          '#DC2626',
          '#4B5563'
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

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer)
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
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Overdue':
        return 'bg-red-100 text-red-800'
      case 'Paid Off':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Balances Report</h1>
          <p className="text-muted-foreground">Monitor customer credit accounts and payment status</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">With credit accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balances</CardTitle>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalBalances)}</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Customers</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.overdueCustomers}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Overdue</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOverdueAmount)}</div>
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Balance Trend (Last 4 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={balanceTrendChartData}
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
            <CardTitle>Account Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut 
              data={balanceStatusChartData}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer or email..."
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
              <option value="Active">Active</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid Off">Paid Off</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Balances Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Customer Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Current Balance</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Credit Limit</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Available Credit</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last Payment</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Overdue Amount</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{customer.customer}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(customer.currentBalance)}</td>
                    <td className="p-3">{formatCurrency(customer.creditLimit)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {customer.availableCredit >= 0 ? (
                          <Plus className="h-4 w-4 text-green-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-red-600" />
                        )}
                        <span className={customer.availableCredit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(Math.abs(customer.availableCredit))}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-3">{customer.lastPayment}</td>
                    <td className="p-3">
                      {customer.overdueAmount > 0 ? (
                        <span className="text-red-600 font-medium">{formatCurrency(customer.overdueAmount)}</span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
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
        title="Customer Balance Details"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                <p className="text-foreground">{selectedCustomer.customer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{selectedCustomer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-foreground">{selectedCustomer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                  {selectedCustomer.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedCustomer.currentBalance)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
                <p className="text-foreground">{formatCurrency(selectedCustomer.creditLimit)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Available Credit</label>
                <div className="flex items-center gap-1">
                  {selectedCustomer.availableCredit >= 0 ? (
                    <Plus className="h-4 w-4 text-green-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-red-600" />
                  )}
                  <span className={selectedCustomer.availableCredit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Math.abs(selectedCustomer.availableCredit))}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Payment</label>
                <p className="text-foreground">{selectedCustomer.lastPayment}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Payment Amount</label>
                <p className="text-foreground">{formatCurrency(selectedCustomer.lastPaymentAmount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Purchase</label>
                <p className="text-foreground">{selectedCustomer.lastPurchase}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Purchase Amount</label>
                <p className="text-foreground">{formatCurrency(selectedCustomer.lastPurchaseAmount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Overdue Amount</label>
                <p className="text-foreground">
                  {selectedCustomer.overdueAmount > 0 ? (
                    <span className="text-red-600 font-medium">{formatCurrency(selectedCustomer.overdueAmount)}</span>
                  ) : (
                    <span className="text-green-600">None</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Days Overdue</label>
                <p className="text-foreground">{selectedCustomer.daysOverdue} days</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CustomerBalancesReport 