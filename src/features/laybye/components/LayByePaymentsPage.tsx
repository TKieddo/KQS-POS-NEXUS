'use client'

import React, { useState } from 'react'
import { CreditCard, DollarSign, User, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { SearchFilters } from '@/components/ui/search-filters'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter'
import { LayByeContractCard } from './LayByeContractCard'
import { PaymentModal } from './PaymentModal'
import { CancelModal } from './CancelModal'
import { PaymentSuccessModal } from '@/features/pos/components/PaymentSuccessModal'

interface LayByeContract {
  id: string
  contractNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly'
  paymentAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
  payments: Array<{
    id: string
    amount: number
    date: string
    method: 'cash' | 'card' | 'transfer'
    notes?: string
  }>
  createdAt: string
  updatedAt: string
}

interface LayByePaymentsPageProps {
  contracts: LayByeContract[]
  isLoading: boolean
  onAddPayment: (contract: LayByeContract) => void
  onCancelContract: (contract: LayByeContract) => void
  onProcessPayment: (paymentData: { amount: number; method: 'cash' | 'card' | 'transfer'; notes?: string; amountReceived?: number }) => Promise<void>
  onProcessCancellation: (contractId: string, reason: string) => Promise<void>
}

export const LayByePaymentsPage: React.FC<LayByePaymentsPageProps> = ({
  contracts,
  isLoading,
  onAddPayment,
  onCancelContract,
  onProcessPayment,
  onProcessCancellation
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer' | 'progress'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedContract, setSelectedContract] = useState<LayByeContract | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successDetails, setSuccessDetails] = useState<{ paymentMethod: string; totalAmount: number; amountPaid: number; change: number; transactionNumber?: string } | null>(null)

  // Use the search and filter hook
  const filteredContracts = useSearchAndFilter({
    data: contracts,
    searchFields: ['contractNumber', 'customer.name', 'customer.phone'],
    searchQuery,
    filters: {
      status: {
        value: statusFilter,
        field: 'status'
      }
    }
  })

  // Calculate stats
  const stats = [
    { label: 'Active', count: contracts.filter(c => c.status === 'active').length, color: 'bg-green-400' },
    { label: 'Completed', count: contracts.filter(c => c.status === 'completed').length, color: 'bg-blue-400' },
    { label: 'Cancelled', count: contracts.filter(c => c.status === 'cancelled').length, color: 'bg-red-400' }
  ]

  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'customer', label: 'Customer' },
    { value: 'progress', label: 'Progress' }
  ]

  const getProgressPercentage = (contract: LayByeContract) => {
    const totalPaid = contract.depositAmount + contract.payments.reduce((sum, payment) => sum + payment.amount, 0)
    return Math.round((totalPaid / contract.totalAmount) * 100)
  }

  const getTodayRevenue = () => {
    const today = new Date().toISOString().split('T')[0]
    return contracts.reduce((sum, contract) => {
      const todayPayments = contract.payments.filter(payment => payment.date === today)
      return sum + todayPayments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
    }, 0)
  }

  const getTodayContracts = () => {
    const today = new Date().toISOString().split('T')[0]
    return contracts.filter(contract => contract.createdAt.startsWith(today))
  }

  const getTodayPayments = () => {
    const today = new Date().toISOString().split('T')[0]
    return contracts.reduce((sum, contract) => {
      const todayPayments = contract.payments.filter(payment => payment.date === today)
      return sum + todayPayments.length
    }, 0)
  }

  const handleAddPayment = (contract: LayByeContract) => {
    setSelectedContract(contract)
    setShowPaymentModal(true)
  }

  const handleCancelContract = (contract: LayByeContract) => {
    setSelectedContract(contract)
    setShowCancelModal(true)
  }

  const handleProcessPayment = async (paymentData: { amount: number; method: 'cash' | 'card' | 'transfer'; notes?: string; amountReceived?: number }) => {
    if (!selectedContract) return

    setIsProcessing(true)
    try {
      await onProcessPayment(paymentData)
      // Show success with change if cash
      const paid = paymentData.amountReceived ?? paymentData.amount
      const change = paymentData.method === 'cash' ? Math.max(0, paid - paymentData.amount) : 0
      setSuccessDetails({
        paymentMethod: paymentData.method,
        totalAmount: paymentData.amount,
        amountPaid: paid,
        change
      })
      setShowSuccessModal(true)
      setShowPaymentModal(false)
      setSelectedContract(null)
    } catch (error) {
      console.error('Error processing payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcessCancellation = async (reason: string) => {
    if (!selectedContract) return

    setIsProcessing(true)
    try {
      await onProcessCancellation(selectedContract.id, reason)
      setShowCancelModal(false)
      setSelectedContract(null)
    } catch (error) {
      console.error('Error processing cancellation:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <PageHeader
        title="Lay-Bye Payments"
        icon={<CreditCard className="h-4 w-4 text-black" />}
      />

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search contracts..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusFilterOptions,
            placeholder: 'All Status'
          },
          {
            value: dateFilter,
            onChange: setDateFilter,
            options: dateFilterOptions,
            placeholder: 'All Time'
          },
          {
            value: sortBy,
            onChange: setSortBy,
            options: sortOptions,
            placeholder: 'Sort By'
          }
        ]}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <LoadingSpinner text="Loading contracts..." />
        ) : filteredContracts.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-8 w-8" />}
            title="No lay-bye contracts found"
            description={
              searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No lay-bye contracts have been created yet'
            }
          />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Today's Revenue */}
              <div className="bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/5 backdrop-blur-xl rounded-2xl border border-[#E5FF29]/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#E5FF29]/20 rounded-xl">
                    <DollarSign className="h-6 w-6 text-black" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Today's Revenue</p>
                    <p className="text-2xl font-bold text-black">{getTodayRevenue().toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Contracts: {getTodayContracts().length}</span>
                  <span className="text-green-600 font-semibold">+{getTodayPayments()} payments</span>
                </div>
              </div>
              
              {/* Total Contracts */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-xl rounded-2xl border border-blue-200/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Contracts</p>
                    <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active: {contracts.filter(c => c.status === 'active').length}</span>
                  <span className="text-blue-600 font-semibold">+{contracts.filter(c => c.status === 'completed').length} completed</span>
                </div>
              </div>
              
              {/* Outstanding Balance */}
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-xl rounded-2xl border border-orange-200/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {contracts.reduce((sum, contract) => sum + contract.remainingAmount, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overdue: {contracts.filter(c => c.status === 'active' && new Date(c.endDate) < new Date()).length}</span>
                  <span className="text-orange-600 font-semibold">Due soon</span>
                </div>
              </div>
              
              {/* Collection Rate */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-xl rounded-2xl border border-green-200/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Collection Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {contracts.length > 0 
                        ? Math.round((contracts.filter(c => c.status === 'completed').length / contracts.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed: {contracts.filter(c => c.status === 'completed').length}</span>
                  <span className="text-green-600 font-semibold">On track</span>
                </div>
              </div>
            </div>

            {/* Contracts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContracts.map((contract) => (
                <LayByeContractCard
                  key={contract.id}
                  contract={contract}
                  onAddPayment={() => handleAddPayment(contract)}
                  onCancelContract={() => handleCancelContract(contract)}
                  getProgressPercentage={getProgressPercentage}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showPaymentModal && selectedContract && (
        <PaymentModal
          contract={selectedContract}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedContract(null)
          }}
          onSubmit={handleProcessPayment}
          isProcessing={isProcessing}
        />
      )}

      {showCancelModal && selectedContract && (
        <CancelModal
          contract={selectedContract}
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false)
            setSelectedContract(null)
          }}
          onSubmit={handleProcessCancellation}
          isProcessing={isProcessing}
        />
      )}

      {/* Success Modal showing change due like POS */}
      {showSuccessModal && successDetails && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          paymentMethod={successDetails.paymentMethod}
          totalAmount={successDetails.totalAmount}
          amountPaid={successDetails.amountPaid}
          change={successDetails.change}
          cart={[]}
          customer={null}
        />
      )}
    </div>
  )
} 