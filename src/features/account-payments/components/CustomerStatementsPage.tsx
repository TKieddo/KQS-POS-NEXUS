'use client'

import React, { useState } from 'react'
import { FileText, User, Calendar, Download, Printer, Search, Filter, Eye } from 'lucide-react'
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
import type { CustomerStatement, StatementTransaction } from '../types'

export const CustomerStatementsPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false)
  const [currentStatement, setCurrentStatement] = useState<CustomerStatement | null>(null)
  const [showStatement, setShowStatement] = useState(false)

  const { loading, error, getCustomerStatement } = useAccountPayments()

  // Mock customers for demo
  const mockCustomers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', balance: 1250.00 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', balance: 850.50 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', balance: 2100.75 },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', balance: 0.00 }
  ]

  // Mock statement data
  const mockStatement: CustomerStatement = {
    id: 'stmt-1',
    customer_id: '1',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '+1234567890',
    statement_date: new Date().toISOString(),
    opening_balance: 1500.00,
    closing_balance: 1250.00,
    total_charges: 2500.00,
    total_payments: 2750.00,
    transactions: [
      {
        id: '1',
        date: '2024-01-15T10:30:00Z',
        description: 'Purchase - Electronics',
        type: 'sale',
        amount: 500.00,
        balance: 2000.00,
        reference: 'SALE-001'
      },
      {
        id: '2',
        date: '2024-01-16T14:20:00Z',
        description: 'Account Payment',
        type: 'payment',
        amount: 750.00,
        balance: 1250.00,
        reference: 'PAY-001'
      }
    ],
    created_at: new Date().toISOString()
  }

  const handleGenerateStatement = async () => {
    if (!selectedCustomer) return

    try {
      const statement = await getCustomerStatement(selectedCustomer, {
        start_date: startDate,
        end_date: endDate,
        include_zero_balance: includeZeroBalance
      })
      setCurrentStatement(statement)
      setShowStatement(true)
    } catch (error) {
      console.error('Failed to generate statement:', error)
    }
  }

  const handlePrintStatement = (statement: CustomerStatement) => {
    // TODO: Implement statement printing
    console.log('Printing statement for:', statement.customer_name)
  }

  const handleDownloadStatement = (statement: CustomerStatement) => {
    // TODO: Implement statement download
    console.log('Downloading statement for:', statement.customer_name)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-red-100 text-red-800'
      case 'payment':
        return 'bg-green-100 text-green-800'
      case 'refund':
        return 'bg-blue-100 text-blue-800'
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 px-6">
      <PageHeader
        title="Customer Statements"
        icon={<FileText className="h-5 w-5" />}
      />

      {/* Stats Bar */}
      <StatsBar
        stats={[
          {
            label: 'Total Customers',
            value: mockCustomers.length.toString(),
            icon: User,
            trend: '+2',
            trendDirection: 'up'
          },
          {
            label: 'Active Accounts',
            value: mockCustomers.filter(c => c.balance > 0).length.toString(),
            icon: FileText,
            trend: '+1',
            trendDirection: 'up'
          },
          {
            label: 'Total Outstanding',
            value: formatCurrency(mockCustomers.reduce((sum, c) => sum + c.balance, 0)),
            icon: Calendar,
            trend: '+5%',
            trendDirection: 'up'
          },
          {
            label: 'Statements Generated',
            value: '12',
            icon: Download,
            trend: '+3',
            trendDirection: 'up'
          }
        ]}
      />

      {/* Statement Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Statement
          </CardTitle>
          <CardDescription>
            Select a customer and date range to generate a statement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{customer.name}</span>
                        <Badge variant={customer.balance > 0 ? 'destructive' : 'secondary'}>
                          {formatCurrency(customer.balance)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateStatement}
                disabled={!selectedCustomer || loading}
                className="w-full"
              >
                Generate Statement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement Display */}
      {showStatement && currentStatement && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Statement for {currentStatement.customer_name}
                </CardTitle>
                <CardDescription>
                  Generated on {formatDate(currentStatement.statement_date)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintStatement(currentStatement)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadStatement(currentStatement)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Statement Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(currentStatement.opening_balance)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Charges</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentStatement.total_charges)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentStatement.total_payments)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Closing Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(currentStatement.closing_balance)}</p>
              </div>
            </div>

            {/* Transactions Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStatement.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge className={getTransactionTypeColor(transaction.type)}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className={transaction.type === 'payment' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.balance)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {transaction.reference}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Eye className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 