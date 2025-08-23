'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  User, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

// Mock credit sales data
const mockCreditSales = [
  {
    id: 'CREDIT-001',
    customer: 'John Smith',
    customerId: 'CUST-001',
    customerPhone: '+1 (555) 123-4567',
    customerEmail: 'john.smith@email.com',
    creditLimit: 5000.00,
    currentBalance: 1250.50,
    availableCredit: 3749.50,
    paymentTerms: 30,
    overdueAmount: 0.00,
    creditScore: 'good',
    totalPurchases: 45,
    totalSpent: 12500.50,
    lastPaymentDate: '2024-01-15',
    nextPaymentDue: '2024-02-15',
    daysOverdue: 0,
    status: 'active',
    recentTransactions: [
      { date: '2024-01-25', amount: 245.50, type: 'purchase' },
      { date: '2024-01-20', amount: 150.00, type: 'payment' },
      { date: '2024-01-18', amount: 89.99, type: 'purchase' }
    ]
  },
  {
    id: 'CREDIT-002',
    customer: 'Sarah Johnson',
    customerId: 'CUST-002',
    customerPhone: '+1 (555) 234-5678',
    customerEmail: 'sarah.johnson@email.com',
    creditLimit: 3000.00,
    currentBalance: 2800.00,
    availableCredit: 200.00,
    paymentTerms: 30,
    overdueAmount: 150.00,
    creditScore: 'fair',
    totalPurchases: 28,
    totalSpent: 4200.75,
    lastPaymentDate: '2024-01-10',
    nextPaymentDue: '2024-01-25',
    daysOverdue: 10,
    status: 'overdue',
    recentTransactions: [
      { date: '2024-01-25', amount: 450.75, type: 'purchase' },
      { date: '2024-01-15', amount: 100.00, type: 'payment' },
      { date: '2024-01-12', amount: 200.00, type: 'purchase' }
    ]
  },
  {
    id: 'CREDIT-003',
    customer: 'Mike Wilson',
    customerId: 'CUST-003',
    customerPhone: '+1 (555) 345-6789',
    customerEmail: 'mike.wilson@email.com',
    creditLimit: 10000.00,
    currentBalance: 0.00,
    availableCredit: 10000.00,
    paymentTerms: 30,
    overdueAmount: 0.00,
    creditScore: 'excellent',
    totalPurchases: 15,
    totalSpent: 8500.00,
    lastPaymentDate: '2024-01-20',
    nextPaymentDue: '2024-02-20',
    daysOverdue: 0,
    status: 'active',
    recentTransactions: [
      { date: '2024-01-22', amount: 500.00, type: 'payment' },
      { date: '2024-01-20', amount: 299.99, type: 'purchase' },
      { date: '2024-01-18', amount: 200.00, type: 'payment' }
    ]
  }
]

const creditScoreColors = {
  excellent: 'text-green-600 bg-green-100',
  good: 'text-blue-600 bg-blue-100',
  fair: 'text-orange-600 bg-orange-100',
  poor: 'text-red-600 bg-red-100'
}

const statusColors = {
  active: 'text-green-600 bg-green-100',
  overdue: 'text-red-600 bg-red-100',
  suspended: 'text-gray-600 bg-gray-100'
}

export function CreditSalesManagement() {
  const [selectedCredit, setSelectedCredit] = useState<any>(null)
  const [showNewCredit, setShowNewCredit] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCredits = mockCreditSales.filter(credit => {
    const matchesSearch = credit.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || credit.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const totalAccounts = filteredCredits.length
  const activeAccounts = filteredCredits.filter(c => c.status === 'active').length
  const overdueAccounts = filteredCredits.filter(c => c.status === 'overdue').length
  const totalOutstanding = filteredCredits.reduce((sum, c) => sum + c.currentBalance, 0)
  const totalOverdue = filteredCredits.reduce((sum, c) => sum + c.overdueAmount, 0)

  return (
    <div className="space-y-6 px-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {totalAccounts}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {activeAccounts}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers or account numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              <Mail className="mr-2 h-4 w-4" />
              Send Statements
            </Button>
            <Button 
              className="bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
              onClick={() => setShowNewCredit(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Credit Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Credit Accounts Table */}
      <Card className="border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black rounded-t-lg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Credit Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Available Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Credit Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Next Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCredits.map((credit) => (
                <tr key={credit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--primary))]">
                        {credit.customer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {credit.customerId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {credit.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[hsl(var(--primary))]">
                      {formatCurrency(credit.creditLimit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(credit.currentBalance)}
                    </div>
                    {credit.overdueAmount > 0 && (
                      <div className="text-sm text-red-600">
                        {formatCurrency(credit.overdueAmount)} overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(credit.availableCredit)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((credit.availableCredit / credit.creditLimit) * 100).toFixed(1)}% available
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditScoreColors[credit.creditScore as keyof typeof creditScoreColors]}`}>
                      {credit.creditScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--primary))]">
                      {new Date(credit.nextPaymentDue).toLocaleDateString()}
                    </div>
                    {credit.daysOverdue > 0 && (
                      <div className="text-xs text-red-600">
                        {credit.daysOverdue} days overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[credit.status as keyof typeof statusColors]}`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCredit(credit)}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Credit Account Details Modal */}
      {selectedCredit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl bg-white border-gray-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Credit Account Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCredit(null)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[hsl(var(--primary))]">Customer Information</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedCredit.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedCredit.customerPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedCredit.customerEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Credit Summary */}
                  <div>
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Credit Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Credit Limit</p>
                        <p className="text-lg font-bold text-[hsl(var(--primary))]">
                          {formatCurrency(selectedCredit.creditLimit)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Available Credit</p>
                        <p className="text-lg font-bold text-[hsl(var(--primary))]">
                          {formatCurrency(selectedCredit.availableCredit)}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Current Balance</p>
                        <p className="text-lg font-bold text-[hsl(var(--primary))]">
                          {formatCurrency(selectedCredit.currentBalance)}
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                        <p className="text-lg font-bold text-[hsl(var(--primary))]">
                          {formatCurrency(selectedCredit.overdueAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[hsl(var(--primary))]">Account Details</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Credit Score</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditScoreColors[selectedCredit.creditScore as keyof typeof creditScoreColors]}`}>
                          {selectedCredit.creditScore}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payment Terms</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedCredit.paymentTerms} days</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedCredit.totalPurchases}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-sm text-[hsl(var(--primary))]">${selectedCredit.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div>
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Recent Transactions</h4>
                    <div className="space-y-2">
                      {selectedCredit.recentTransactions.map((transaction: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--primary))]">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                          </div>
                          <div className={`text-sm font-bold ${
                            transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
                <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
                <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Statement
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* New Credit Account Modal */}
      {showNewCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Create New Credit Account
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCredit(false)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                    <option>Select customer...</option>
                    <option>John Smith</option>
                    <option>Sarah Johnson</option>
                    <option>Mike Wilson</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Limit
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms (days)
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Score Assessment
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about this credit account..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90">
                  Create Account
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={() => setShowNewCredit(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 