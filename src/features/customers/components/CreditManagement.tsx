import React, { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, DollarSign, Calendar, AlertTriangle, TrendingUp, TrendingDown, Plus, Filter, Download, Eye } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'
import { useCreditManagement } from '../hooks/useCreditManagement'
import { toast } from 'sonner'

interface CreditTransaction {
  id: string
  customerId: string
  type: 'purchase' | 'payment' | 'adjustment'
  amount: number
  description: string
  date: string
  balance: number
  status: 'completed' | 'pending' | 'failed'
}

interface CreditAccount {
  id: string
  customerId: string
  customerName: string
  creditLimit: number
  currentBalance: number
  availableCredit: number
  paymentTerms: number
  overdueAmount: number
  lastPaymentDate: string
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
  status: 'active' | 'suspended' | 'closed'
}

export const CreditManagement = () => {
  const {
    creditAccounts,
    transactions,
    loading,
    error,
    getCreditStats,
    filterCreditAccounts,
    addCreditTransaction,
    updateCreditAccount,
    clearError
  } = useCreditManagement()

  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'suspended'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const filteredAccounts = filterCreditAccounts(filter, searchTerm)

  const getCreditScoreColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
  }

  const stats = getCreditStats()

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [error, clearError])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Credit Management</h2>
          <p className="text-gray-600 mt-1">Manage customer credit accounts and payments</p>
        </div>
        <div className="flex gap-3">
          <PremiumButton variant="outline" size="sm" icon={Download}>
            Export Report
          </PremiumButton>
          <PremiumButton size="sm" icon={Plus} gradient="blue">
            New Credit Account
          </PremiumButton>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <p className="text-blue-800 font-medium">Debug Information</p>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Credit Accounts Found: {creditAccounts.length}</p>
            <p>Filtered Accounts: {filteredAccounts.length}</p>
            {creditAccounts.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Credit Accounts:</p>
                <ul className="list-disc list-inside ml-2">
                  {creditAccounts.slice(0, 3).map((account, index) => (
                    <li key={index}>
                      Customer ID: {account.customerId}, 
                      Limit: ${account.creditLimit}, 
                      Balance: ${account.currentBalance}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credit Limit</p>
              <p className="text-2xl font-bold text-gray-900">${formatCurrency(stats.totalCreditLimit)}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900">${formatCurrency(stats.totalOutstanding)}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">${formatCurrency(stats.totalOverdue)}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAccounts}</p>
            </div>
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { value: 'all', label: 'All Accounts' },
              { value: 'active', label: 'Active' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'suspended', label: 'Suspended' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === filterOption.value 
                    ? 'bg-[#E5FF29] text-black' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
        
        <PremiumInput
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          className="w-64 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
        />
      </div>

      {/* Credit Accounts Table */}
      <PremiumCard variant="default" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading credit accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {creditAccounts.length === 0 ? 'No credit accounts found. Create customers with credit accounts to see them here.' : 'No accounts match your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Customer #{account.customerId}</div>
                        <div className="text-sm text-gray-500">Credit Account</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${formatCurrency(account.creditLimit)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${formatCurrency(account.currentBalance)}</div>
                      <div className="text-xs text-gray-500">
                        {account.creditLimit > 0 ? ((account.currentBalance / account.creditLimit) * 100).toFixed(1) : 0}% used
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${formatCurrency(account.availableCredit)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {account.overdueAmount > 0 ? (
                        <div className="text-sm font-medium text-red-600">${formatCurrency(account.overdueAmount)}</div>
                      ) : (
                        <div className="text-sm text-green-600">$0</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.isActive)}`}>
                        {account.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedAccount(account)}
                          className="text-[#E5FF29] hover:text-[#E5FF29]/80 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setShowPaymentModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Payment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setShowAdjustmentModal(true)
                          }}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setPaymentAmount('')
          setSelectedAccount(null)
        }}
        title="Record Payment"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {selectedAccount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Customer: #{selectedAccount.customerId}</p>
              <p className="text-sm text-gray-600">Current Balance: ${formatCurrency(selectedAccount.currentBalance)}</p>
            </div>
          )}
          <PremiumInput
            label="Payment Amount"
            type="number"
            placeholder="0.00"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <PremiumInput
            label="Payment Method"
            placeholder="Cash, Check, Bank Transfer"
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <PremiumInput
            label="Reference Number"
            placeholder="Optional reference number"
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <div className="flex gap-3 pt-4">
            <PremiumButton 
              variant="outline" 
              onClick={() => {
                setShowPaymentModal(false)
                setPaymentAmount('')
                setSelectedAccount(null)
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton 
              gradient="blue"
              onClick={async () => {
                if (!selectedAccount || !paymentAmount) {
                  toast.error('Please enter a payment amount')
                  return
                }
                
                const amount = parseFloat(paymentAmount)
                if (amount <= 0) {
                  toast.error('Payment amount must be greater than 0')
                  return
                }

                const result = await addCreditTransaction({
                  customerId: selectedAccount.customerId,
                  creditAccountId: selectedAccount.id,
                  type: 'payment',
                  amount: -amount, // Negative for payments
                  description: `Payment of $${amount}`,
                  reference: 'Manual payment',
                  balanceAfter: selectedAccount.currentBalance - amount,
                  createdBy: 'current-user' // This should come from auth context
                })

                if (result.success) {
                  toast.success('Payment recorded successfully')
                  setShowPaymentModal(false)
                  setPaymentAmount('')
                  setSelectedAccount(null)
                } else {
                  toast.error(result.error || 'Failed to record payment')
                }
              }}
            >
              Record Payment
            </PremiumButton>
          </div>
        </div>
      </Modal>

      {/* Adjustment Modal */}
      <Modal
        isOpen={showAdjustmentModal}
        onClose={() => {
          setShowAdjustmentModal(false)
          setAdjustmentAmount('')
          setAdjustmentReason('')
          setSelectedAccount(null)
        }}
        title="Credit Adjustment"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {selectedAccount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Customer: #{selectedAccount.customerId}</p>
              <p className="text-sm text-gray-600">Current Balance: ${formatCurrency(selectedAccount.currentBalance)}</p>
            </div>
          )}
          <PremiumInput
            label="Adjustment Amount"
            type="number"
            placeholder="0.00"
            value={adjustmentAmount}
            onChange={(e) => setAdjustmentAmount(e.target.value)}
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <PremiumInput
            label="Reason"
            placeholder="Reason for adjustment"
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            size="sm"
            className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
          />
          <div className="flex gap-3 pt-4">
            <PremiumButton 
              variant="outline" 
              onClick={() => {
                setShowAdjustmentModal(false)
                setAdjustmentAmount('')
                setAdjustmentReason('')
                setSelectedAccount(null)
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton 
              gradient="blue"
              onClick={async () => {
                if (!selectedAccount || !adjustmentAmount || !adjustmentReason) {
                  toast.error('Please fill in all fields')
                  return
                }
                
                const amount = parseFloat(adjustmentAmount)
                if (amount === 0) {
                  toast.error('Adjustment amount cannot be zero')
                  return
                }

                const result = await addCreditTransaction({
                  customerId: selectedAccount.customerId,
                  creditAccountId: selectedAccount.id,
                  type: 'adjustment',
                  amount: amount,
                  description: `Adjustment: ${adjustmentReason}`,
                  reference: 'Manual adjustment',
                  balanceAfter: selectedAccount.currentBalance + amount,
                  createdBy: 'current-user' // This should come from auth context
                })

                if (result.success) {
                  toast.success('Adjustment applied successfully')
                  setShowAdjustmentModal(false)
                  setAdjustmentAmount('')
                  setAdjustmentReason('')
                  setSelectedAccount(null)
                } else {
                  toast.error(result.error || 'Failed to apply adjustment')
                }
              }}
            >
              Apply Adjustment
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 