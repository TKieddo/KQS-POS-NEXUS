'use client'

import React, { useState } from 'react'
import { PiggyBank, DollarSign, TrendingDown, AlertCircle, CheckCircle, Search, Filter, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { useAccountPayments } from '../hooks/useAccountPayments'
import type { CashDrop } from '../types'

export const CashDropPage: React.FC = () => {
  const [showDropForm, setShowDropForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const {
    loading,
    error,
    recentCashDrops,
    processCashDrop,
    loadRecentData
  } = useAccountPayments()

  // Calculate stats
  const stats = {
    totalDrops: recentCashDrops.length,
    totalAmount: recentCashDrops.reduce((sum, drop) => sum + drop.amount, 0),
    averageAmount: recentCashDrops.length > 0 
      ? recentCashDrops.reduce((sum, drop) => sum + drop.amount, 0) / recentCashDrops.length 
      : 0,
    todayDrops: recentCashDrops.filter(drop => 
      new Date(drop.created_at).toDateString() === new Date().toDateString()
    ).length
  }

  const handleProcessDrop = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0 || !reason.trim()) {
      return
    }

    try {
      await processCashDrop({
        amount: parseFloat(amount),
        reason: reason.trim()
      })
      setShowDropForm(false)
      setAmount('')
      setReason('')
      // Show success message
      console.log('Cash drop processed successfully')
    } catch (error) {
      console.error('Failed to process cash drop:', error)
    }
  }

  const handlePrintReceipt = (drop: CashDrop) => {
    // TODO: Implement receipt printing
    console.log('Printing receipt for cash drop:', drop.id)
  }

  const handleDownloadReceipt = (drop: CashDrop) => {
    // TODO: Implement receipt download
    console.log('Downloading receipt for cash drop:', drop.id)
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

  const filteredDrops = recentCashDrops.filter(drop => {
    const matchesSearch = drop.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || 
                       new Date(drop.created_at).toDateString() === new Date(dateFilter).toDateString()
    
    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-6 px-6">
      <PageHeader
        title="Cash Drops"
        icon={<PiggyBank className="h-5 w-5" />}
      >
        <Button onClick={() => setShowDropForm(true)} className="ml-auto">
          <PiggyBank className="h-4 w-4 mr-2" />
          New Cash Drop
        </Button>
      </PageHeader>

      {/* Stats Bar */}
      <StatsBar
        stats={[
          {
            label: 'Total Drops',
            value: stats.totalDrops.toString(),
            icon: PiggyBank,
            trend: '+2',
            trendDirection: 'up'
          },
          {
            label: 'Total Amount',
            value: formatCurrency(stats.totalAmount),
            icon: DollarSign,
            trend: '+15%',
            trendDirection: 'up'
          },
          {
            label: 'Average Drop',
            value: formatCurrency(stats.averageAmount),
            icon: TrendingDown,
            trend: '+8%',
            trendDirection: 'up'
          },
          {
            label: 'Today\'s Drops',
            value: stats.todayDrops.toString(),
            icon: CheckCircle,
            trend: '+1',
            trendDirection: 'up'
          }
        ]}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Drop Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Process Cash Drop
              </CardTitle>
              <CardDescription>
                Remove cash from the till for safe storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showDropForm ? (
                <form onSubmit={handleProcessDrop} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Drop Amount</Label>
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
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for cash drop..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !amount || parseFloat(amount) <= 0 || !reason.trim()}
                      className="flex-1"
                    >
                      Process Drop
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDropForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click "New Cash Drop" to process a cash drop
                  </p>
                  <Button 
                    onClick={() => setShowDropForm(true)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Start Cash Drop
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cash Drop History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Recent Cash Drops
              </CardTitle>
              <CardDescription>
                View and manage recent cash drops
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drops..."
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

              {/* Drops Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Till Before</TableHead>
                    <TableHead>Till After</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrops.map((drop) => (
                    <TableRow key={drop.id}>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(drop.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(drop.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={drop.reason}>
                          {drop.reason}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(drop.till_amount_before)}</TableCell>
                      <TableCell>{formatCurrency(drop.till_amount_after)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintReceipt(drop)}
                            title="Print receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(drop)}
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

              {filteredDrops.length === 0 && (
                <div className="text-center py-8">
                  <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No cash drops found</p>
                  <p className="text-sm text-muted-foreground">
                    Process your first cash drop to see it here
                  </p>
                </div>
              )}

              {/* Summary */}
              {filteredDrops.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <span>Showing {filteredDrops.length} recent drops</span>
                  <div className="flex items-center gap-4">
                    <span>
                      Total: -{formatCurrency(filteredDrops.reduce((sum, d) => sum + d.amount, 0))}
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