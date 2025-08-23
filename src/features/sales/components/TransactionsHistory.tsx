'use client'

import React, { useState, useEffect } from 'react'
import { Search, Download, Eye, DollarSign, Calendar, User, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { getSales } from '@/lib/sales-service'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'

interface Transaction {
  id: string
  transaction_number: string
  created_at: string
  total_amount: number
  payment_method: string
  payment_status: string
  sale_type: string
  customers?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  }
  sale_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    products: {
      id: string
      name: string
      sku: string
      barcode: string
    }
  }>
  branches?: {
    id: string
    name: string
  }
}

export const TransactionsHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const { selectedBranch } = useBranch()

  useEffect(() => {
    loadTransactions()
  }, [selectedBranch])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const result = await getSales({
        branch_id: selectedBranch?.id,
        limit: 100
      })

      if (result.success && result.data) {
        setTransactions(result.data)
      } else {
        console.error('Failed to load transactions:', result.error)
        toast.error('Failed to load transactions')
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('Error loading transactions')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || transaction.payment_status === statusFilter
    const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.payment_method === paymentMethodFilter
    
    return matchesSearch && matchesStatus && matchesPaymentMethod
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800'
      case 'card': return 'bg-blue-100 text-blue-800'
      case 'credit': return 'bg-purple-100 text-purple-800'
      case 'mpesa': return 'bg-orange-100 text-orange-800'
      case 'ecocash': return 'bg-emerald-100 text-emerald-800'
      case 'transfer': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
  return (
      <div className="space-y-4">
          <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
            </div>
          </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
          <div className="flex items-center justify-between">
            <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--primary))]">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
        <Button onClick={() => toast.info('Export functionality coming soon')} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
              placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
            <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            <option value="credit">Credit</option>
              <option value="mpesa">Mpesa</option>
              <option value="ecocash">Ecocash</option>
            <option value="transfer">Transfer</option>
            </select>
          </div>
          </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">No transactions match your current filters.</p>
      </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.transaction_number}
                      </p>
                      <Badge className={getStatusColor(transaction.payment_status)}>
                        {transaction.payment_status}
                      </Badge>
                      <Badge className={getPaymentMethodColor(transaction.payment_method)}>
                        {transaction.payment_method}
                      </Badge>
                      </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.created_at)}</span>
                        </div>
                      {transaction.customers && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <User className="h-3 w-3" />
                          <span>
                            {transaction.customers.first_name} {transaction.customers.last_name}
                        </span>
                      </div>
                      )}
                      {transaction.branches && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Package className="h-3 w-3" />
                          <span>{transaction.branches.name}</span>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.total_amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.sale_items.length} items
                    </p>
              </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          ))
      )}
      </div>
    </div>
  )
} 