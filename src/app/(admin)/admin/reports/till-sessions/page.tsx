'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
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

// Mock data for Till Sessions
const mockTillSessions = [
  { 
    id: 1, 
    cashier: 'John Doe', 
    startTime: '2024-01-15 08:00', 
    endTime: '2024-01-15 16:00', 
    duration: '8h 0m',
    totalSales: 12500,
    transactions: 45,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 13500
  },
  { 
    id: 2, 
    cashier: 'Jane Smith', 
    startTime: '2024-01-15 16:00', 
    endTime: '2024-01-15 22:00', 
    duration: '6h 0m',
    totalSales: 9800,
    transactions: 38,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 10800
  },
  { 
    id: 3, 
    cashier: 'Mike Johnson', 
    startTime: '2024-01-14 08:00', 
    endTime: '2024-01-14 16:00', 
    duration: '8h 0m',
    totalSales: 11200,
    transactions: 42,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 12200
  },
  { 
    id: 4, 
    cashier: 'Sarah Wilson', 
    startTime: '2024-01-14 16:00', 
    endTime: '2024-01-14 22:00', 
    duration: '6h 0m',
    totalSales: 8900,
    transactions: 35,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 9900
  },
  { 
    id: 5, 
    cashier: 'John Doe', 
    startTime: '2024-01-13 08:00', 
    endTime: '2024-01-13 16:00', 
    duration: '8h 0m',
    totalSales: 11800,
    transactions: 44,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 12800
  },
  { 
    id: 6, 
    cashier: 'Jane Smith', 
    startTime: '2024-01-13 16:00', 
    endTime: '2024-01-13 22:00', 
    duration: '6h 0m',
    totalSales: 9200,
    transactions: 36,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 10200
  },
  { 
    id: 7, 
    cashier: 'Mike Johnson', 
    startTime: '2024-01-12 08:00', 
    endTime: '2024-01-12 16:00', 
    duration: '8h 0m',
    totalSales: 10500,
    transactions: 40,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 11500
  },
  { 
    id: 8, 
    cashier: 'Sarah Wilson', 
    startTime: '2024-01-12 16:00', 
    endTime: '2024-01-12 22:00', 
    duration: '6h 0m',
    totalSales: 8500,
    transactions: 33,
    status: 'Completed',
    openingBalance: 1000,
    closingBalance: 9500
  },
]

const TillSessionsReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [cashierFilter, setCashierFilter] = useState('')
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalSessions = mockTillSessions.length
    const totalSales = mockTillSessions.reduce((sum, session) => sum + session.totalSales, 0)
    const totalTransactions = mockTillSessions.reduce((sum, session) => sum + session.transactions, 0)
    const avgSessionDuration = mockTillSessions.reduce((sum, session) => {
      const hours = parseInt(session.duration.split('h')[0])
      return sum + hours
    }, 0) / totalSessions

    return {
      totalSessions,
      totalSales,
      totalTransactions,
      avgSessionDuration
    }
  }, [])

  // Filter data
  const filteredSessions = useMemo(() => {
    return mockTillSessions.filter(session => {
      const matchesSearch = session.cashier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || session.startTime.startsWith(dateFilter)
      const matchesCashier = !cashierFilter || session.cashier === cashierFilter
      
      return matchesSearch && matchesDate && matchesCashier
    })
  }, [searchTerm, dateFilter, cashierFilter])

  // Chart data
  const dailySalesChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Total Sales',
        data: [19000, 21000, 20100, 22300],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const sessionStatusChartData = {
    labels: ['Completed', 'Active', 'Discrepancy'],
    datasets: [
      {
        data: [8, 1, 0],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#EF4444'
        ],
        borderColor: [
          '#059669',
          '#2563EB',
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

  const handleViewDetails = (session: any) => {
    setSelectedSession(session)
    setShowDetailsModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Active':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'Discrepancy':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Till Sessions Report</h1>
          <p className="text-muted-foreground">Monitor till session activities and performance</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">Across all sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Processed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Session Duration</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <User className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgSessionDuration}h</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Sales by Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={dailySalesChartData}
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
            <CardTitle>Session Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut 
              data={sessionStatusChartData}
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
                placeholder="Search cashier..."
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
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Cashiers</option>
              <option value="John Doe">John Doe</option>
              <option value="Jane Smith">Jane Smith</option>
              <option value="Mike Johnson">Mike Johnson</option>
              <option value="Sarah Wilson">Sarah Wilson</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Till Sessions Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Till Sessions History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Cashier</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Start Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">End Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Sales</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Transactions</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">{session.cashier}</td>
                    <td className="p-3">{session.startTime}</td>
                    <td className="p-3">{session.endTime}</td>
                    <td className="p-3">{session.duration}</td>
                    <td className="p-3 font-medium">{formatCurrency(session.totalSales)}</td>
                    <td className="p-3">{session.transactions}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <span className="text-sm">{session.status}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(session)}
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
        title="Till Session Details"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cashier</label>
                <p className="text-foreground">{selectedSession.cashier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-foreground">{selectedSession.duration}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Time</label>
                <p className="text-foreground">{selectedSession.startTime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Time</label>
                <p className="text-foreground">{selectedSession.endTime}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Sales</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedSession.totalSales)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Transactions</label>
                <p className="text-foreground">{selectedSession.transactions}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Opening Balance</label>
                <p className="text-foreground">{formatCurrency(selectedSession.openingBalance)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Closing Balance</label>
                <p className="text-foreground">{formatCurrency(selectedSession.closingBalance)}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedSession.status)}
                  <span className="text-foreground">{selectedSession.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TillSessionsReport 