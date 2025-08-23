'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, User, CreditCard, Receipt, TrendingUp, AlertCircle, CheckCircle, Search, Filter, Download, Printer } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useAccountPayments } from '../hooks/useAccountPayments'
import { AccountPaymentForm } from './AccountPaymentForm'
import { AccountPaymentHistory } from './AccountPaymentHistory'
import type { AccountPaymentFormData } from '../types'

export const AccountPaymentPage: React.FC = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const {
    loading,
    error,
    recentPayments,
    processAccountPayment,
    loadRecentData
  } = useAccountPayments()

  // Calculate stats
  const stats = {
    totalPayments: recentPayments.length,
    totalAmount: recentPayments.reduce((sum, payment) => sum + payment.amount, 0),
    averageAmount: recentPayments.length > 0 
      ? recentPayments.reduce((sum, payment) => sum + payment.amount, 0) / recentPayments.length 
      : 0,
    todayPayments: recentPayments.filter(payment => 
      new Date(payment.created_at).toDateString() === new Date().toDateString()
    ).length
  }

  const handleProcessPayment = async (data: AccountPaymentFormData) => {
    try {
      await processAccountPayment(data)
      setShowPaymentForm(false)
      setSelectedCustomer(null)
      // Show success message
      console.log('Payment processed successfully')
    } catch (error) {
      console.error('Failed to process payment:', error)
    }
  }

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer)
    setShowPaymentForm(true)
  }

  const filteredPayments = recentPayments.filter(payment => {
    const matchesSearch = payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = !dateFilter || 
                       new Date(payment.created_at).toDateString() === new Date(dateFilter).toDateString()
    
    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-6 px-6">
      <PageHeader
        title="Account Payments"
        icon={<DollarSign className="h-5 w-5" />}
      >
        <Button onClick={() => setShowPaymentForm(true)} className="ml-auto">
          <DollarSign className="h-4 w-4 mr-2" />
          New Payment
        </Button>
      </PageHeader>

      {/* Stats Bar */}
      <StatsBar
        stats={[
          {
            label: 'Total Payments',
            value: stats.totalPayments.toString(),
            icon: Receipt,
            trend: '+12%',
            trendDirection: 'up'
          },
          {
            label: 'Total Amount',
            value: formatCurrency(stats.totalAmount),
            icon: DollarSign,
            trend: '+8%',
            trendDirection: 'up'
          },
          {
            label: 'Average Payment',
            value: formatCurrency(stats.averageAmount),
            icon: TrendingUp,
            trend: '+5%',
            trendDirection: 'up'
          },
          {
            label: 'Today\'s Payments',
            value: stats.todayPayments.toString(),
            icon: CheckCircle,
            trend: '+3',
            trendDirection: 'up'
          }
        ]}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Process Payment
              </CardTitle>
              <CardDescription>
                Enter customer details and payment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showPaymentForm ? (
                <AccountPaymentForm
                  selectedCustomer={selectedCustomer}
                  onSubmit={handleProcessPayment}
                  onCancel={() => setShowPaymentForm(false)}
                  loading={loading}
                />
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click "New Payment" to process an account payment
                  </p>
                  <Button 
                    onClick={() => setShowPaymentForm(true)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Start Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Payments
              </CardTitle>
              <CardDescription>
                View and manage recent account payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
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

              {/* Payment History Table */}
              <AccountPaymentHistory
                payments={filteredPayments}
                loading={loading}
                onCustomerSelect={handleCustomerSelect}
              />
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