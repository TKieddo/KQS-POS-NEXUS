'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CreditCard, DollarSign, User, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { SearchFilters } from '@/components/ui/search-filters'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
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
  searchQuery?: string
  onSearchChange?: (query: string) => void
  statusFilter?: 'all' | 'active' | 'completed' | 'cancelled'
  onStatusFilterChange?: (status: 'all' | 'active' | 'completed' | 'cancelled') => void
  onAddPayment: (contract: LayByeContract) => void
  onCancelContract: (contract: LayByeContract) => void
  onProcessPayment: (paymentData: { amount: number; method: 'cash' | 'card' | 'transfer'; notes?: string; amountReceived?: number; isCompleted?: boolean }) => Promise<void>
  onProcessCancellation: (contractId: string, reason: string) => Promise<void>
}

export const LayByePaymentsPage: React.FC<LayByePaymentsPageProps> = ({
  contracts,
  isLoading,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  statusFilter: externalStatusFilter,
  onStatusFilterChange: externalOnStatusFilterChange,
  onAddPayment,
  onCancelContract,
  onProcessPayment,
  onProcessCancellation
}) => {
  // Use external search state if provided, otherwise use internal state
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [internalStatusFilter, setInternalStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter
  
  const setSearchQuery = externalOnSearchChange || setInternalSearchQuery
  const setStatusFilter = externalOnStatusFilterChange || setInternalStatusFilter
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer' | 'progress'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedContract, setSelectedContract] = useState<LayByeContract | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successDetails, setSuccessDetails] = useState<{ paymentMethod: string; totalAmount: number; amountPaid: number; change: number; contract?: LayByeContract; isCompleted?: boolean } | null>(null)

  // Get branch and user information for receipt printing
  const { selectedBranch } = useBranch()
  const { user } = useAuth()

  // Use contracts directly since we're doing server-side search
  const filteredContracts = contracts

  // Auto-print final receipt when success modal is displayed for completed laybye orders
  useEffect(() => {
    if (showSuccessModal && successDetails?.isCompleted && successDetails?.contract) {
      const contract = successDetails.contract // Extract to avoid repeated checks
      // Use setTimeout to avoid infinite loops and ensure modal is fully rendered
      const timer = setTimeout(async () => {
        try {
          // Import the printing service
          const { printTransactionReceipt } = await import('@/lib/receipt-printing-service')
          
          // Generate transaction number for final receipt
          const now = new Date()
          const transactionNumber = `FINAL-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
          
          // Create final receipt data
          const finalReceiptData = {
            transactionNumber,
            laybyeId: contract.contractNumber,
            paymentId: `FINAL-${Date.now()}`,
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-GB'),
            cashier: user?.user_metadata?.full_name || user?.email || 'Cashier',
            customer: contract.customer.name,
            items: contract.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              category: 'Accessories' // Default category
            })),
            total: successDetails.totalAmount,
            paymentAmount: successDetails.totalAmount, // Total paid is now the full amount
            totalPaid: successDetails.totalAmount, // Total paid is now the full amount
            balanceRemaining: 0, // No balance remaining when completed
            paymentMethod: successDetails.paymentMethod
          }
          
          // Print the final receipt
          await printTransactionReceipt({
            transactionType: 'laybye_final',
            branchId: selectedBranch?.id || '00000000-0000-0000-0000-000000000001',
            transactionData: finalReceiptData
          })
          
          console.log('Final laybye receipt printed successfully')
        } catch (error) {
          console.error('Error printing final receipt:', error)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [showSuccessModal, successDetails?.isCompleted, successDetails?.contract?.id, selectedBranch?.id, user?.user_metadata?.full_name, user?.email])

  // Calculate stats
  const stats = [
    { label: 'Active', value: contracts.filter(c => c.status === 'active').length.toString(), icon: CheckCircle, color: 'bg-green-400' },
    { label: 'Completed', value: contracts.filter(c => c.status === 'completed').length.toString(), icon: CreditCard, color: 'bg-blue-400' },
    { label: 'Cancelled', value: contracts.filter(c => c.status === 'cancelled').length.toString(), icon: XCircle, color: 'bg-red-400' }
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

  const handleProcessPayment = async (paymentData: { amount: number; method: 'cash' | 'card' | 'transfer'; notes?: string; amountReceived?: number; isCompleted?: boolean }) => {
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
        change,
        isCompleted: paymentData.isCompleted || false,
        contract: selectedContract // Pass the selected contract
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

  const handleSuccessModalOpen = async () => {
    // Print receipt based on whether it's a final payment or regular payment
    if (successDetails?.contract && successDetails) {
      try {
        // Import the printing service
        const { printTransactionReceipt } = await import('@/lib/receipt-printing-service')
        
        // Generate transaction number
        const now = new Date()
        
        // Debug logging
        console.log('Print receipt debug:', {
          isCompleted: successDetails.isCompleted,
          remainingAmount: successDetails.contract.remainingAmount,
          totalAmount: successDetails.contract.totalAmount,
          paymentAmount: successDetails.totalAmount
        })
        
        // Determine if this is a final payment (either by flag or by checking if remaining amount is 0)
        const isFinalPayment = successDetails.isCompleted || 
          (successDetails.contract.remainingAmount - successDetails.totalAmount <= 0)
        
        console.log('Is final payment:', isFinalPayment)
        
        const transactionNumber = isFinalPayment 
          ? `FINAL-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
          : `PAY-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
        
        if (isFinalPayment) {
          // Use the new laybye final receipt template for final payments
          const finalReceiptData = {
            transactionNumber,
            laybyeId: successDetails.contract!.contractNumber,
            paymentId: `FINAL-${Date.now()}`,
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-GB'),
            cashier: user?.user_metadata?.full_name || user?.email || 'Cashier',
            customer: successDetails.contract!.customer.name,
            items: successDetails.contract!.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              category: 'Accessories' // Default category
            })),
            total: successDetails.contract!.totalAmount,
            paymentAmount: successDetails.totalAmount,
            totalPaid: successDetails.contract!.totalAmount, // Full amount paid
            balanceRemaining: 0, // No balance remaining when completed
            paymentMethod: successDetails.paymentMethod,
            // Add laybye-specific completion data
            laybyeStartDate: successDetails.contract!.createdAt,
            completionDate: now.toISOString(),
            totalDaysTaken: Math.ceil((new Date(now).getTime() - new Date(successDetails.contract!.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            daysEarly: Math.max(0, 90 - Math.ceil((new Date(now).getTime() - new Date(successDetails.contract!.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
          }
          
          // Print the final laybye receipt using the new template
          await printTransactionReceipt({
            transactionType: 'laybye_final',
            branchId: selectedBranch?.id || '00000000-0000-0000-0000-000000000001',
            transactionData: finalReceiptData
          })
          
          console.log('Final laybye receipt printed successfully')
        } else {
          // Use regular retail receipt for regular payments
          const receiptData = {
            transactionNumber,
            date: now.toLocaleDateString('en-GB'),
            time: now.toLocaleTimeString('en-GB'),
            cashier: user?.user_metadata?.full_name || user?.email || 'Cashier',
            customer: successDetails.contract!.customer.name,
            items: successDetails.contract!.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              category: 'Accessories' // Default category
            })),
            subtotal: successDetails.totalAmount,
            tax: 0, // No tax for laybye payments
            total: successDetails.totalAmount,
            paymentMethod: successDetails.paymentMethod,
            amountReceived: successDetails.amountPaid,
            change: successDetails.change,
            // Add laybye-specific info
            laybyeId: successDetails.contract!.contractNumber,
            isLaybyePayment: true,
            isLaybyeFinal: false
          }
          
          // Use regular retail receipt for regular payments
          await printTransactionReceipt({
            transactionType: 'sale', // Use regular sale receipt
            branchId: selectedBranch?.id || '00000000-0000-0000-0000-000000000001',
            transactionData: receiptData
          })
          
          console.log('Laybye payment receipt printed successfully')
        }
      } catch (error) {
        console.error('Error printing receipt:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header with enhanced styling */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <PageHeader
            title="Lay-Bye Payments"
            icon={<CreditCard className="h-6 w-6 text-indigo-600" />}
          />
        </div>
      </div>

      {/* Stats with enhanced styling */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <StatsBar stats={stats} />
        </div>
      </div>

      {/* Search and Filters with enhanced styling */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by customer name, order number, or phone..."
            filters={[
              {
                value: statusFilter,
                onChange: (value: string) => setStatusFilter(value as 'all' | 'active' | 'completed' | 'cancelled'),
                options: statusFilterOptions,
                placeholder: 'All Status'
              },
              {
                value: dateFilter,
                onChange: (value: string) => setDateFilter(value as 'all' | 'today' | 'week' | 'month'),
                options: dateFilterOptions,
                placeholder: 'All Time'
              },
              {
                value: sortBy,
                onChange: (value: string) => setSortBy(value as 'date' | 'amount' | 'customer' | 'progress'),
                options: sortOptions,
                placeholder: 'Sort By'
              }
            ]}
          />
        </div>
      </div>

      {/* Main Content with enhanced spacing and styling */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner text="Loading contracts..." />
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <EmptyState
              icon={<CreditCard className="h-12 w-12 text-gray-400" />}
              title="No lay-bye contracts found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No lay-bye contracts have been created yet'
              }
            />
          </div>
        ) : (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Today's Revenue */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-xl rounded-3xl border border-emerald-200/50 shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">Today's Revenue</p>
                    <p className="text-3xl font-bold text-emerald-800">${getTodayRevenue().toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 font-medium">Contracts: {getTodayContracts().length}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100 px-3 py-1 rounded-full">+{getTodayPayments()} payments</span>
                </div>
              </div>
              
              {/* Total Contracts */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-3xl border border-blue-200/50 shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">Total Contracts</p>
                    <p className="text-3xl font-bold text-blue-800">{contracts.length}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 font-medium">Active: {contracts.filter(c => c.status === 'active').length}</span>
                  <span className="text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full">+{contracts.filter(c => c.status === 'completed').length} completed</span>
                </div>
              </div>
              
              {/* Outstanding Balance */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl rounded-3xl border border-orange-200/50 shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-1">Outstanding Balance</p>
                    <p className="text-3xl font-bold text-orange-800">
                      ${contracts.reduce((sum, contract) => sum + contract.remainingAmount, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600 font-medium">Overdue: {contracts.filter(c => c.status === 'active' && new Date(c.endDate) < new Date()).length}</span>
                  <span className="text-orange-700 font-semibold bg-orange-100 px-3 py-1 rounded-full">Due soon</span>
                </div>
              </div>
              
              {/* Collection Rate */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl rounded-3xl border border-green-200/50 shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-1">Collection Rate</p>
                    <p className="text-3xl font-bold text-green-800">
                      {contracts.length > 0 
                        ? Math.round((contracts.filter(c => c.status === 'completed').length / contracts.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">Completed: {contracts.filter(c => c.status === 'completed').length}</span>
                  <span className="text-green-700 font-semibold bg-green-100 px-3 py-1 rounded-full">On track</span>
                </div>
              </div>
            </div>

            {/* Enhanced Contracts Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Lay-Bye Contracts</h2>
                <div className="text-sm text-gray-600">
                  Showing {filteredContracts.length} of {contracts.length} contracts
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          onPrintReceipt={handleSuccessModalOpen}
        />
      )}
    </div>
  )
}