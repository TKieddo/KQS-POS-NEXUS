'use client'

import React, { useState } from 'react'
import { DollarSign, Wallet, TrendingDown, AlertCircle, CheckCircle, Search, Filter, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { useAccountPayments } from '../hooks/useAccountPayments'
import type { CashWithdrawal } from '../types'

export const CashWithdrawalPage: React.FC = () => {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [category, setCategory] = useState<'petty_cash' | 'expense' | 'other'>('petty_cash')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const {
    loading,
    error,
    recentWithdrawals,
    processCashWithdrawal,
    loadRecentData
  } = useAccountPayments()

  // Calculate stats
  const stats = {
    totalWithdrawals: recentWithdrawals.length,
    totalAmount: recentWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0),
    averageAmount: recentWithdrawals.length > 0 
      ? recentWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) / recentWithdrawals.length 
      : 0,
    todayWithdrawals: recentWithdrawals.filter(withdrawal => 
      new Date(withdrawal.created_at).toDateString() === new Date().toDateString()
    ).length
  }

  const handleProcessWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0 || !reason.trim()) {
      return
    }

    try {
      await processCashWithdrawal({
        amount: parseFloat(amount),
        reason: reason.trim(),
        category,
        receipt_number: receiptNumber.trim() || undefined
      })
      setShowWithdrawalForm(false)
      setAmount('')
      setReason('')
      setCategory('petty_cash')
      setReceiptNumber('')
      // Show success message
      console.log('Cash withdrawal processed successfully')
    } catch (error) {
      console.error('Failed to process cash withdrawal:', error)
    }
  }

  const handlePrintReceipt = (withdrawal: CashWithdrawal) => {
    // TODO: Implement receipt printing
    console.log('Printing receipt for withdrawal:', withdrawal.id)
  }

  const handleDownloadReceipt = (withdrawal: CashWithdrawal) => {
    // TODO: Implement receipt download
    console.log('Downloading receipt for withdrawal:', withdrawal.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'petty_cash':
        return 'bg-blue-100 text-blue-800'
      case 'expense':
        return 'bg-red-100 text-red-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredWithdrawals = recentWithdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || 
                       new Date(withdrawal.created_at).toDateString() === new Date(dateFilter).toDateString()
    
    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-6 px-6">
      <PageHeader
        title="Cash Withdrawals"
        icon={<DollarSign className="h-5 w-5" />}
      >
        <Button onClick={() => setShowWithdrawalForm(true)} className="ml-auto">
          <DollarSign className="h-4 w-4 mr-2" />
          New Withdrawal
        </Button>
      </PageHeader>

      {/* Stats Bar */}
      <StatsBar
        stats={[
          {
            label: 'Total Withdrawals',
            value: stats.totalWithdrawals.toString(),
            icon: Wallet,
            trend: '+1',
            trendDirection: 'up'
          },
          {
            label: 'Total Amount',
            value: formatCurrency(stats.totalAmount),
            icon: DollarSign,
            trend: '+12%',
            trendDirection: 'up'
          },
          {
            label: 'Average Amount',
            value: formatCurrency(stats.averageAmount),
            icon: TrendingDown,
            trend: '+5%',
            trendDirection: 'up'
          },
          {
            label: 'Today\'s Withdrawals',
            value: stats.todayWithdrawals.toString(),
            icon: CheckCircle,
            trend: '+1',
            trendDirection: 'up'
          }
        ]}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Process Withdrawal
              </CardTitle>
              <CardDescription>
                Withdraw cash for petty cash or expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showWithdrawalForm ? (
                <form onSubmit={handleProcessWithdrawal} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petty_cash">Petty Cash</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for withdrawal..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="receipt-number">Receipt Number (Optional)</Label>
                    <Input
                      id="receipt-number"
                      placeholder="Enter receipt number..."
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !amount || parseFloat(amount) <= 0 || !reason.trim()}
                      className="flex-1"
                    >
                      Process Withdrawal
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWithdrawalForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click "New Withdrawal" to process a cash withdrawal
                  </p>
                  <Button 
                    onClick={() => setShowWithdrawalForm(true)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Start Withdrawal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Recent Withdrawals
              </CardTitle>
              <CardDescription>
                View and manage recent cash withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search withdrawals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full sm:w-auto"
                />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Withdrawals Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(withdrawal.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(withdrawal.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(withdrawal.category)}>
                          {withdrawal.category.replace('_', ' ').charAt(0).toUpperCase() + 
                           withdrawal.category.replace('_', ' ').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={withdrawal.reason}>
                          {withdrawal.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        {withdrawal.receipt_number ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {withdrawal.receipt_number}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintReceipt(withdrawal)}
                            title="Print receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(withdrawal)}
                            title="Download receipt"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredWithdrawals.length === 0 && (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No withdrawals found</p>
                  <p className="text-sm text-muted-foreground">
                    Process your first withdrawal to see it here
                  </p>
                </div>
              )}

              {/* Summary */}
              {filteredWithdrawals.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <span>Showing {filteredWithdrawals.length} recent withdrawals</span>
                  <div className="flex items-center gap-4">
                    <span>
                      Total: -{formatCurrency(filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 