'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  User,
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

// Mock data for Sales Payment
const mockSalesPayment = [
  { 
    id: 1, 
    transactionId: 'TXN-2024-001', 
    customer: 'Alice Johnson',
    email: 'alice@email.com',
    paymentMethod: 'Credit Card',
    amount: 599.98,
    status: 'Completed',
    date: '2024-01-15',
    time: '14:30',
    cashier: 'John Doe',
    products: 'Premium T-Shirt (2x)',
    cardType: 'Visa',
    last4Digits: '1234',
    processingFee: 15.00
  },
  { 
    id: 2, 
    transactionId: 'TXN-2024-002', 
    customer: 'Bob Smith',
    email: 'bob@email.com',
    paymentMethod: 'Cash',
    amount: 899.99,
    status: 'Completed',
    date: '2024-01-15',
    time: '16:45',
    cashier: 'Jane Smith',
    products: 'Wireless Headphones (1x)',
    cardType: 'N/A',
    last4Digits: 'N/A',
    processingFee: 0.00
  },
  { 
    id: 3, 
    transactionId: 'TXN-2024-003', 
    customer: 'Carol Davis',
    email: 'carol@email.com',
    paymentMethod: 'Credit Card',
    amount: 599.99,
    status: 'Completed',
    date: '2024-01-14',
    time: '11:20',
    cashier: 'Mike Johnson',
    products: 'Designer Jeans (1x)',
    cardType: 'Mastercard',
    last4Digits: '5678',
    processingFee: 15.00
  },
  { 
    id: 4, 
    transactionId: 'TXN-2024-004', 
    customer: 'David Wilson',
    email: 'david@email.com',
    paymentMethod: 'Credit Card',
    amount: 1299.99,
    status: 'Completed',
    date: '2024-01-14',
    time: '15:15',
    cashier: 'Sarah Wilson',
    products: 'Smart Watch (1x)',
    cardType: 'Visa',
    last4Digits: '9012',
    processingFee: 32.50
  },
  { 
    id: 5, 
    transactionId: 'TXN-2024-005', 
    customer: 'Eva Brown',
    email: 'eva@email.com',
    paymentMethod: 'Cash',
    amount: 799.99,
    status: 'Completed',
    date: '2024-01-13',
    time: '10:30',
    cashier: 'John Doe',
    products: 'Running Shoes (1x)',
    cardType: 'N/A',
    last4Digits: 'N/A',
    processingFee: 0.00
  },
  { 
    id: 6, 
    transactionId: 'TXN-2024-006', 
    customer: 'Frank Miller',
    email: 'frank@email.com',
    paymentMethod: 'Credit Card',
    amount: 449.99,
    status: 'Failed',
    date: '2024-01-13',
    time: '13:45',
    cashier: 'Jane Smith',
    products: 'Leather Bag (1x)',
    cardType: 'Visa',
    last4Digits: '3456',
    processingFee: 11.25
  },
  { 
    id: 7, 
    transactionId: 'TXN-2024-007', 
    customer: 'Grace Lee',
    email: 'grace@email.com',
    paymentMethod: 'Cash',
    amount: 349.99,
    status: 'Completed',
    date: '2024-01-12',
    time: '16:20',
    cashier: 'Mike Johnson',
    products: 'Bluetooth Speaker (1x)',
    cardType: 'N/A',
    last4Digits: 'N/A',
    processingFee: 0.00
  },
  { 
    id: 8, 
    transactionId: 'TXN-2024-008', 
    customer: 'Henry Taylor',
    email: 'henry@email.com',
    paymentMethod: 'Credit Card',
    amount: 199.99,
    status: 'Completed',
    date: '2024-01-12',
    time: '12:10',
    cashier: 'Sarah Wilson',
    products: 'Sunglasses (1x)',
    cardType: 'Mastercard',
    last4Digits: '7890',
    processingFee: 5.00
  },
]

const SalesPaymentReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalTransactions = mockSalesPayment.length
    const totalAmount = mockSalesPayment.reduce((sum, transaction) => sum + transaction.amount, 0)
    const completedTransactions = mockSalesPayment.filter(t => t.status === 'Completed').length
    const totalProcessingFees = mockSalesPayment.reduce((sum, transaction) => sum + transaction.processingFee, 0)
    const creditCardTransactions = mockSalesPayment.filter(t => t.paymentMethod === 'Credit Card').length
    const cashTransactions = mockSalesPayment.filter(t => t.paymentMethod === 'Cash').length

    return {
      totalTransactions,
      totalAmount,
      completedTransactions,
      totalProcessingFees,
      creditCardTransactions,
      cashTransactions
    }
  }, [])

  // Filter data
  const filteredTransactions = useMemo(() => {
    return mockSalesPayment.filter(transaction => {
      const matchesSearch = transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || transaction.date === dateFilter
      const matchesPaymentMethod = !paymentMethodFilter || transaction.paymentMethod === paymentMethodFilter
      const matchesStatus = !statusFilter || transaction.status === statusFilter
      
      return matchesSearch && matchesDate && matchesPaymentMethod && matchesStatus
    })
  }, [searchTerm, dateFilter, paymentMethodFilter, statusFilter])

  // Chart data
  const dailyPaymentChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Daily Payment Volume',
        data: [549.98, 1249.98, 1899.98, 1499.97],
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

  const paymentMethodChartData = {
    labels: ['Credit Card', 'Cash'],
    datasets: [
      {
        data: [stats.creditCardTransactions, stats.cashTransactions],
        backgroundColor: [
          '#3B82F6',
          '#10B981'
        ],
        borderColor: [
          '#2563EB',
          '#059669'
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

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction)
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
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Payment Report</h1>
          <p className="text-muted-foreground">Track payment transactions and processing fees</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Processed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.completedTransactions}</div>
            <p className="text-xs text-muted-foreground">Successful</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing Fees</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalProcessingFees)}</div>
            <p className="text-xs text-muted-foreground">Total fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Card Transactions</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.creditCardTransactions}</div>
            <p className="text-xs text-muted-foreground">Card payments</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Transactions</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.cashTransactions}</div>
            <p className="text-xs text-muted-foreground">Cash payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Payment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={dailyPaymentChartData}
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
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut 
              data={paymentMethodChartData}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer or transaction..."
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
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Payment Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Payment Method</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cashier</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Processing Fee</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{transaction.transactionId}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{transaction.customer}</div>
                        <div className="text-sm text-muted-foreground">{transaction.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {transaction.paymentMethod === 'Credit Card' ? (
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        )}
                        {transaction.paymentMethod}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(transaction.amount)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">{transaction.date}</td>
                    <td className="p-3">{transaction.cashier}</td>
                    <td className="p-3">{formatCurrency(transaction.processingFee)}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
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
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                <p className="text-foreground font-medium">{selectedTransaction.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer</label>
                <p className="text-foreground">{selectedTransaction.customer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{selectedTransaction.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                <p className="text-foreground">{selectedTransaction.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTransaction.status)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-foreground">{selectedTransaction.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <p className="text-foreground">{selectedTransaction.time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cashier</label>
                <p className="text-foreground">{selectedTransaction.cashier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Processing Fee</label>
                <p className="text-foreground">{formatCurrency(selectedTransaction.processingFee)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Card Type</label>
                <p className="text-foreground">{selectedTransaction.cardType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last 4 Digits</label>
                <p className="text-foreground">{selectedTransaction.last4Digits}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Products</label>
                <p className="text-foreground">{selectedTransaction.products}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SalesPaymentReport 