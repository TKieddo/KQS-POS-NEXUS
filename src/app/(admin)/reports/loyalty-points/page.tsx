'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  Star, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  Gift,
  Award,
  Clock,
  User
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

// Mock data for Loyalty Points
const mockLoyaltyData = [
  { 
    id: 1, 
    customer: 'Alice Johnson', 
    email: 'alice@email.com',
    phone: '+27 82 123 4567',
    pointsEarned: 1250,
    pointsRedeemed: 800,
    currentBalance: 450,
    tier: 'Gold',
    joinDate: '2023-03-15',
    lastActivity: '2024-01-15',
    totalSpent: 12500
  },
  { 
    id: 2, 
    customer: 'Bob Smith', 
    email: 'bob@email.com',
    phone: '+27 83 234 5678',
    pointsEarned: 890,
    pointsRedeemed: 600,
    currentBalance: 290,
    tier: 'Silver',
    joinDate: '2023-06-20',
    lastActivity: '2024-01-14',
    totalSpent: 8900
  },
  { 
    id: 3, 
    customer: 'Carol Davis', 
    email: 'carol@email.com',
    phone: '+27 84 345 6789',
    pointsEarned: 2100,
    pointsRedeemed: 1500,
    currentBalance: 600,
    tier: 'Platinum',
    joinDate: '2022-11-10',
    lastActivity: '2024-01-15',
    totalSpent: 21000
  },
  { 
    id: 4, 
    customer: 'David Wilson', 
    email: 'david@email.com',
    phone: '+27 85 456 7890',
    pointsEarned: 650,
    pointsRedeemed: 400,
    currentBalance: 250,
    tier: 'Bronze',
    joinDate: '2023-09-05',
    lastActivity: '2024-01-13',
    totalSpent: 6500
  },
  { 
    id: 5, 
    customer: 'Eva Brown', 
    email: 'eva@email.com',
    phone: '+27 86 567 8901',
    pointsEarned: 1800,
    pointsRedeemed: 1200,
    currentBalance: 600,
    tier: 'Gold',
    joinDate: '2023-01-25',
    lastActivity: '2024-01-15',
    totalSpent: 18000
  },
  { 
    id: 6, 
    customer: 'Frank Miller', 
    email: 'frank@email.com',
    phone: '+27 87 678 9012',
    pointsEarned: 950,
    pointsRedeemed: 700,
    currentBalance: 250,
    tier: 'Silver',
    joinDate: '2023-07-12',
    lastActivity: '2024-01-12',
    totalSpent: 9500
  },
  { 
    id: 7, 
    customer: 'Grace Lee', 
    email: 'grace@email.com',
    phone: '+27 88 789 0123',
    pointsEarned: 3200,
    pointsRedeemed: 2200,
    currentBalance: 1000,
    tier: 'Platinum',
    joinDate: '2022-08-30',
    lastActivity: '2024-01-15',
    totalSpent: 32000
  },
  { 
    id: 8, 
    customer: 'Henry Taylor', 
    email: 'henry@email.com',
    phone: '+27 89 890 1234',
    pointsEarned: 750,
    pointsRedeemed: 500,
    currentBalance: 250,
    tier: 'Bronze',
    joinDate: '2023-10-18',
    lastActivity: '2024-01-11',
    totalSpent: 7500
  },
]

const LoyaltyPointsReport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalCustomers = mockLoyaltyData.length
    const totalPointsEarned = mockLoyaltyData.reduce((sum, customer) => sum + customer.pointsEarned, 0)
    const totalPointsRedeemed = mockLoyaltyData.reduce((sum, customer) => sum + customer.pointsRedeemed, 0)
    const totalCurrentBalance = mockLoyaltyData.reduce((sum, customer) => sum + customer.currentBalance, 0)
    const avgPointsPerCustomer = totalPointsEarned / totalCustomers

    return {
      totalCustomers,
      totalPointsEarned,
      totalPointsRedeemed,
      totalCurrentBalance,
      avgPointsPerCustomer
    }
  }, [])

  // Filter data
  const filteredCustomers = useMemo(() => {
    return mockLoyaltyData.filter(customer => {
      const matchesSearch = customer.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTier = !tierFilter || customer.tier === tierFilter
      
      return matchesSearch && matchesTier
    })
  }, [searchTerm, tierFilter])

  // Chart data
  const pointsTrendChartData = {
    labels: ['Jan 12', 'Jan 13', 'Jan 14', 'Jan 15'],
    datasets: [
      {
        label: 'Points Earned',
        data: [1200, 1350, 1100, 1400],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Points Redeemed',
        data: [800, 950, 750, 1000],
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

  const tierDistributionChartData = {
    labels: ['Platinum', 'Gold', 'Silver', 'Bronze'],
    datasets: [
      {
        label: 'Customers',
        data: [2, 2, 2, 2],
        backgroundColor: [
          '#8B5CF6',
          '#F59E0B',
          '#6B7280',
          '#F97316'
        ],
        borderColor: [
          '#7C3AED',
          '#D97706',
          '#4B5563',
          '#EA580C'
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800'
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800'
      case 'Silver':
        return 'bg-gray-100 text-gray-800'
      case 'Bronze':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loyalty Points Report</h1>
          <p className="text-muted-foreground">Monitor customer loyalty program performance</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points Earned</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPointsEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points Redeemed</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gift className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPointsRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCurrentBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available points</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Points Trend (Last 4 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={pointsTrendChartData}
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
            <CardTitle>Membership Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={tierDistributionChartData}
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
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Members Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Loyalty Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Tier</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Points Earned</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Points Redeemed</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Current Balance</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total Spent</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last Activity</th>
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
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="p-3">{customer.pointsEarned.toLocaleString()}</td>
                    <td className="p-3">{customer.pointsRedeemed.toLocaleString()}</td>
                    <td className="p-3 font-medium">{customer.currentBalance.toLocaleString()}</td>
                    <td className="p-3">{formatCurrency(customer.totalSpent)}</td>
                    <td className="p-3">{customer.lastActivity}</td>
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
        title="Customer Loyalty Details"
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
                <label className="text-sm font-medium text-muted-foreground">Tier</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(selectedCustomer.tier)}`}>
                  {selectedCustomer.tier}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                <p className="text-foreground">{selectedCustomer.joinDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                <p className="text-foreground">{selectedCustomer.lastActivity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Points Earned</label>
                <p className="text-foreground font-medium">{selectedCustomer.pointsEarned.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Points Redeemed</label>
                <p className="text-foreground">{selectedCustomer.pointsRedeemed.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
                <p className="text-foreground font-medium">{selectedCustomer.currentBalance.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                <p className="text-foreground">{formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LoyaltyPointsReport 