'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Calendar, 
  Receipt, 
  Download, 
  Eye,
  Printer,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface ReceiptHistory {
  id: string
  receiptNumber: string
  customerName: string
  total: number
  date: string
  time: string
  items: number
  status: 'completed' | 'refunded' | 'voided'
  paymentMethod: string
}

export const ReprintSlipHistory: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptHistory[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockReceipts: ReceiptHistory[] = [
      {
        id: '1',
        receiptNumber: 'RCP-001',
        customerName: 'John Doe',
        total: 125.50,
        date: '2024-01-15',
        time: '14:30',
        items: 3,
        status: 'completed',
        paymentMethod: 'Card'
      },
      {
        id: '2',
        receiptNumber: 'RCP-002',
        customerName: 'Jane Smith',
        total: 89.99,
        date: '2024-01-15',
        time: '15:45',
        items: 2,
        status: 'refunded',
        paymentMethod: 'Cash'
      },
      {
        id: '3',
        receiptNumber: 'RCP-003',
        customerName: 'Mike Johnson',
        total: 234.75,
        date: '2024-01-14',
        time: '12:15',
        items: 5,
        status: 'completed',
        paymentMethod: 'Card'
      }
    ]
    
    setReceipts(mockReceipts)
    setFilteredReceipts(mockReceipts)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = receipts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      filtered = filtered.filter(receipt => {
        const receiptDate = new Date(receipt.date)
        switch (dateFilter) {
          case 'today':
            return receiptDate.toDateString() === today.toDateString()
          case 'yesterday':
            return receiptDate.toDateString() === yesterday.toDateString()
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return receiptDate >= weekAgo
          default:
            return true
        }
      })
    }

    setFilteredReceipts(filtered)
  }, [receipts, searchTerm, statusFilter, dateFilter])

  const handleReprint = (receipt: ReceiptHistory) => {
    // Implement reprint functionality
    console.log('Reprinting receipt:', receipt.receiptNumber)
  }

  const handleView = (receipt: ReceiptHistory) => {
    // Implement view functionality
    console.log('Viewing receipt:', receipt.receiptNumber)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      case 'voided':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setDateFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Receipts ({filteredReceipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No receipts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {receipt.receiptNumber}
                        </h3>
                        <Badge className={getStatusColor(receipt.status)}>
                          {receipt.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{receipt.customerName}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {receipt.date} at {receipt.time}
                        </span>
                        <span>{receipt.items} items</span>
                        <span>{receipt.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(receipt.total)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(receipt)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReprint(receipt)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 