'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, User, Calendar, Clock, DollarSign, TrendingUp, Filter, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { useAccountPayments } from '../hooks/useAccountPayments'
import type { TillSessionReport } from '../types'

export const TillSessionReportPage: React.FC = () => {
  const [sessions, setSessions] = useState<TillSessionReport[]>([])
  const [selectedSession, setSelectedSession] = useState<TillSessionReport | null>(null)
  const [showSessionDetails, setShowSessionDetails] = useState(false)
  const [filters, setFilters] = useState({
    cashier: 'all',
    startDate: '',
    endDate: '',
    status: 'all'
  })

  const { loading, error, getTillSessionReports } = useAccountPayments()

  // Mock sessions data
  const mockSessions: TillSessionReport[] = [
    {
      id: '1',
      session_number: 'TS-2024-001',
      cashier_name: 'John Smith',
      branch_id: 'branch-1',
      opening_time: '2024-01-15T08:00:00Z',
      closing_time: '2024-01-15T17:00:00Z',
      opening_amount: 1000.00,
      closing_amount: 1850.00,
      total_sales: 2847.50,
      total_refunds: 125.00,
      cash_sales: 1450.00,
      card_sales: 1397.50,
      transfer_sales: 0,
      mpesa_sales: 0,
      ecocash_sales: 0,
      credit_sales: 0,
      laybye_payments: 0,
      cash_drops: 500.00,
      cash_withdrawals: 0,
      expected_cash: 1850.00,
      actual_cash: 1850.00,
      variance: 0,
      status: 'closed',
      notes: 'Perfect cash count',
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T17:00:00Z'
    },
    {
      id: '2',
      session_number: 'TS-2024-002',
      cashier_name: 'Jane Doe',
      branch_id: 'branch-1',
      opening_time: '2024-01-16T08:00:00Z',
      closing_time: '2024-01-16T17:00:00Z',
      opening_amount: 1000.00,
      closing_amount: 1650.00,
      total_sales: 2150.00,
      total_refunds: 0,
      cash_sales: 1150.00,
      card_sales: 1000.00,
      transfer_sales: 0,
      mpesa_sales: 0,
      ecocash_sales: 0,
      credit_sales: 0,
      laybye_payments: 0,
      cash_drops: 0,
      cash_withdrawals: 0,
      expected_cash: 1650.00,
      actual_cash: 1650.00,
      variance: 0,
      status: 'closed',
      notes: 'All transactions balanced',
      created_at: '2024-01-16T08:00:00Z',
      updated_at: '2024-01-16T17:00:00Z'
    }
  ]

  useEffect(() => {
    setSessions(mockSessions)
  }, [])

  const handleLoadSessions = async () => {
    try {
      const reports = await getTillSessionReports({
        cashier_id: filters.cashier === 'all' ? '' : filters.cashier,
        start_date: filters.startDate,
        end_date: filters.endDate,
        status: filters.status === 'all' ? '' : filters.status as any
      })
      setSessions(reports)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const handleViewSession = (session: TillSessionReport) => {
    setSelectedSession(session)
    setShowSessionDetails(true)
  }

  const handlePrintReport = (session: TillSessionReport) => {
    // TODO: Implement report printing
    console.log('Printing report for session:', session.session_number)
  }

  const handleDownloadReport = (session: TillSessionReport) => {
    // TODO: Implement report download
    console.log('Downloading report for session:', session.session_number)
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

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'Active'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-blue-100 text-blue-800'
      case 'reconciled':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats
  const stats = {
    totalSessions: sessions.length,
    totalSales: sessions.reduce((sum, s) => sum + s.total_sales, 0),
    totalTransactions: sessions.reduce((sum, s) => sum + (s.cash_sales + s.card_sales + s.transfer_sales + s.mpesa_sales + s.ecocash_sales + s.credit_sales), 0),
    averageSessionDuration: sessions.length > 0 ? 
      sessions.reduce((sum, s) => {
        if (s.closing_time) {
          const start = new Date(s.opening_time)
          const end = new Date(s.closing_time)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }
        return sum
      }, 0) / sessions.length : 0
  }

  return (
    <div className="space-y-6 px-6">
      <PageHeader
        title="Till Session Reports"
        icon={<BarChart3 className="h-5 w-5" />}
      />

      {/* Stats Bar */}
      <StatsBar
        stats={[
          {
            label: 'Total Sessions',
            value: stats.totalSessions.toString(),
            icon: BarChart3,
            trend: '+3',
            trendDirection: 'up'
          },
          {
            label: 'Total Sales',
            value: formatCurrency(stats.totalSales),
            icon: DollarSign,
            trend: '+12%',
            trendDirection: 'up'
          },
          {
            label: 'Total Transactions',
            value: stats.totalTransactions.toString(),
            icon: TrendingUp,
            trend: '+8%',
            trendDirection: 'up'
          },
          {
            label: 'Avg Duration',
            value: `${stats.averageSessionDuration.toFixed(1)}h`,
            icon: Clock,
            trend: '+0.5h',
            trendDirection: 'up'
          }
        ]}
      />

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
            <div>
              <label className="text-sm font-medium mb-2 block">Cashier</label>
              <Select value={filters.cashier} onValueChange={(value) => setFilters(prev => ({ ...prev, cashier: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All cashiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cashiers</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="jane">Jane Doe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="reconciled">Reconciled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleLoadSessions} disabled={loading}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Till Sessions
          </CardTitle>
          <CardDescription>
            View all till session reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Cash Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.session_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.opening_time)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{session.cashier_name}</TableCell>
                  <TableCell>{formatDuration(session.opening_time, session.closing_time)}</TableCell>
                  <TableCell>{formatCurrency(session.total_sales)}</TableCell>
                  <TableCell>{formatCurrency(session.cash_sales)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSession(session)}
                        title="View details"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintReport(session)}
                        title="Print report"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(session)}
                        title="Download report"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Session Details - {selectedSession.session_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Session Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cashier:</span>
                    <span>{selectedSession.cashier_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opening Time:</span>
                    <span>{formatDate(selectedSession.opening_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing Time:</span>
                    <span>{selectedSession.closing_time ? formatDate(selectedSession.closing_time) : 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(selectedSession.opening_time, selectedSession.closing_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedSession.status)}>
                      {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opening Amount:</span>
                    <span>{formatCurrency(selectedSession.opening_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing Amount:</span>
                    <span>{formatCurrency(selectedSession.closing_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sales:</span>
                    <span className="text-green-600">{formatCurrency(selectedSession.total_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Sales:</span>
                    <span>{formatCurrency(selectedSession.cash_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card Sales:</span>
                    <span>{formatCurrency(selectedSession.card_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Drops:</span>
                    <span className="text-red-600">-{formatCurrency(selectedSession.cash_drops)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Expected Cash:</span>
                    <span>{formatCurrency(selectedSession.expected_cash)}</span>
                  </div>
                  {selectedSession.actual_cash && (
                    <div className="flex justify-between font-semibold">
                      <span>Actual Cash:</span>
                      <span>{formatCurrency(selectedSession.actual_cash)}</span>
                    </div>
                  )}
                  {selectedSession.variance !== undefined && (
                    <div className="flex justify-between font-semibold">
                      <span>Variance:</span>
                      <span className={selectedSession.variance === 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(selectedSession.variance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedSession.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground">{selectedSession.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <BarChart3 className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 