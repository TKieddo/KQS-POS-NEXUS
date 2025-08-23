'use client'

import React from 'react'
import { DollarSign, User, Calendar, Receipt, Eye, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import type { AccountPayment } from '../types'

interface AccountPaymentHistoryProps {
  payments: AccountPayment[]
  loading?: boolean
  onCustomerSelect?: (customer: any) => void
}

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'cash':
      return <DollarSign className="h-4 w-4" />
    case 'card':
    case 'transfer':
    case 'mpesa':
    case 'ecocash':
      return <Receipt className="h-4 w-4" />
    default:
      return <DollarSign className="h-4 w-4" />
  }
}

const getPaymentMethodColor = (method: string) => {
  switch (method) {
    case 'cash':
      return 'bg-green-100 text-green-800'
    case 'card':
      return 'bg-blue-100 text-blue-800'
    case 'transfer':
      return 'bg-purple-100 text-purple-800'
    case 'mpesa':
      return 'bg-green-100 text-green-800'
    case 'ecocash':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const AccountPaymentHistory: React.FC<AccountPaymentHistoryProps> = ({
  payments,
  loading = false,
  onCustomerSelect
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrintReceipt = (payment: AccountPayment) => {
    // TODO: Implement receipt printing
    console.log('Printing receipt for payment:', payment.reference_number)
  }

  const handleDownloadReceipt = (payment: AccountPayment) => {
    // TODO: Implement receipt download
    console.log('Downloading receipt for payment:', payment.reference_number)
  }

  const handleViewDetails = (payment: AccountPayment) => {
    // TODO: Implement payment details view
    console.log('Viewing details for payment:', payment.reference_number)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">No payments found</p>
        <p className="text-sm text-muted-foreground">
          Process your first account payment to see it here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{payment.customer_name}</p>
                    {onCustomerSelect && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => onCustomerSelect({ id: payment.customer_id, name: payment.customer_name })}
                      >
                        View customer
                      </Button>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium text-green-600">
                  {formatCurrency(payment.amount)}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={getPaymentMethodColor(payment.payment_method)}>
                  <div className="flex items-center gap-1">
                    {getPaymentMethodIcon(payment.payment_method)}
                    {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                  </div>
                </Badge>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {payment.reference_number}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(payment.created_at)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(payment)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrintReceipt(payment)}
                    title="Print receipt"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadReceipt(payment)}
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

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {payments.length} recent payments</span>
        <div className="flex items-center gap-4">
          <span>
            Total: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
          </span>
        </div>
      </div>
    </div>
  )
} 