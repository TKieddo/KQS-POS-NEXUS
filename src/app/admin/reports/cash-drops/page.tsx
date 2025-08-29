'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  Clock,
  User,
  AlertCircle
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

// Mock data for Cash Drops
const mockCashDrops = [
  { id: 1, date: '2024-01-15', amount: 5000, cashier: 'John Doe', time: '14:30', reason: 'End of shift', status: 'Completed' },
  { id: 2, date: '2024-01-15', amount: 3000, cashier: 'Jane Smith', time: '16:45', reason: 'Cash limit reached', status: 'Completed' },
  { id: 3, date: '2024-01-14', amount: 4500, cashier: 'Mike Johnson', time: '15:20', reason: 'End of shift', status: 'Completed' },
  { id: 4, date: '2024-01-14', amount: 2800, cashier: 'Sarah Wilson', time: '17:30', reason: 'Cash limit reached', status: 'Completed' },
  { id: 5, date: '2024-01-13', amount: 5200, cashier: 'John Doe', time: '14:15', reason: 'End of shift', status: 'Completed' },
  { id: 6, date: '2024-01-13', amount: 3200, cashier: 'Jane Smith', time: '16:30', reason: 'Cash limit reached', status: 'Completed' },
  { id: 7, date: '2024-01-12', amount: 4800, cashier: 'Mike Johnson', time: '15:45', reason: 'End of shift', status: 'Completed' },
  { id: 8, date: '2024-01-12', amount: 2900, cashier: 'Sarah Wilson', time: '17:15', reason: 'Cash limit reached', status: 'Completed' },
]

const CashDropsReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [cashierFilter, setCashierFilter] = useState('')
  const [selectedDrop, setSelectedDrop] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalDrops = mockCashDrops.length
    const totalAmount = mockCashDrops.reduce((sum, drop) => sum + drop.amount, 0)
    const avgAmount = totalAmount / totalDrops
    const todayDrops = mockCashDrops.filter(drop => drop.date === '2024-01-15').length

    return {
      totalDrops,
      totalAmount,
      avgAmount,
      todayDrops
    }
  }, [])

  // Filter data
  const filteredDrops = useMemo(() => {
    return mockCashDrops.filter(drop => {
      const matchesSearch = drop.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           drop.reason.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || drop.date === dateFilter
      const matchesCashier = !cashierFilter || drop.cashier === cashierFilter
      
      return matchesSearch && matchesDate && matchesCashier
    })
  }, [searchTerm, dateFilter, cashierFilter])

  // Chart data
  const dailyChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Total Amount',
        data: [7700, 8400, 7300, 8000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  }

  const cashierChartData = {
    labels: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
    datasets: [
      {
        label: 'Cash Drops',
        data: [3, 2, 2, 1],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ],
        borderColor: [
          '#2563EB',
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

  const handleViewDetails = (drop: any) => {
    setSelectedDrop(drop)
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
          <h1 className="text-3xl font-bold text-foreground">Cash Drops Report</h1>
          <p className="text-muted-foreground">Monitor cash drop activities and trends</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cash Drops</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalDrops}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Total dropped</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Amount</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgAmount)}</div>
            <p className="text-xs text-muted-foreground">Per drop</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Drops</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.todayDrops}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Cash Drops Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={dailyChartData}
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
            <CardTitle>Cash Drops by Cashier</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={cashierChartData}
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
                placeholder="Search cashier or reason..."
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

      {/* Cash Drops Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Cash Drops History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cashier</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrops.map((drop) => (
                  <tr key={drop.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">{drop.date}</td>
                    <td className="p-3">{drop.time}</td>
                    <td className="p-3">{drop.cashier}</td>
                    <td className="p-3 font-medium">{formatCurrency(drop.amount)}</td>
                    <td className="p-3">{drop.reason}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {drop.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(drop)}
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
        title="Cash Drop Details"
      >
        {selectedDrop && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-foreground">{selectedDrop.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <p className="text-foreground">{selectedDrop.time}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cashier</label>
                <p className="text-foreground">{selectedDrop.cashier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-foreground font-medium">{formatCurrency(selectedDrop.amount)}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Reason</label>
                <p className="text-foreground">{selectedDrop.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {selectedDrop.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CashDropsReport 