import React, { useState } from 'react'
import { DollarSign, Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CashDropModal } from './CashDropModal'
import { TillCountModal } from './TillCountModal'
import { TillReconciliationModal } from './TillReconciliationModal'
import { useTillOperations } from '../../hooks/useTillOperations'

export const QuickActions: React.FC = () => {
  const [cashDropModalOpen, setCashDropModalOpen] = useState(false)
  const [tillCountModalOpen, setTillCountModalOpen] = useState(false)
  const [reconciliationModalOpen, setReconciliationModalOpen] = useState(false)

  const {
    currentAmount,
    tillSummary,
    hasOpenSession,
    canPerformOperations,
    handleCashDrop,
    handleTillCount,
    handleTillReconciliation,
    loading,
    error
  } = useTillOperations()

  // Wrapper functions to handle the return types
  const handleCashDropWrapper = async (amount: number, reason: string) => {
    await handleCashDrop(amount, reason)
  }

  const handleTillCountWrapper = async (expectedAmount: number, denominationCounts: Record<string, number>, notes?: string) => {
    await handleTillCount(expectedAmount, denominationCounts, notes)
  }

  const handleReconciliationWrapper = async (reconciliation: {
    opening_amount: number
    sales_total: number
    refunds_total: number
    cash_payments: number
    actual_amount: number
    notes?: string
  }) => {
    await handleTillReconciliation(reconciliation)
  }

  const quickActions = [
    {
      id: 'cash-drop',
      title: 'Perform Cash Drop',
      description: 'Remove cash from the till',
      icon: DollarSign,
      color: 'blue',
      onClick: () => setCashDropModalOpen(true),
      disabled: !canPerformOperations || currentAmount <= 0
    },
    {
      id: 'till-count',
      title: 'Count Till',
      description: 'Record actual cash in till',
      icon: Calculator,
      color: 'green',
      onClick: () => setTillCountModalOpen(true),
      disabled: !canPerformOperations
    },
    {
      id: 'reconcile',
      title: 'Reconcile Till',
      description: 'Compare expected vs actual amount',
      icon: TrendingUp,
      color: 'purple',
      onClick: () => setReconciliationModalOpen(true),
      disabled: !canPerformOperations
    }
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100'
      case 'green': return 'text-green-600 bg-green-100'
      case 'purple': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getButtonColor = (color: string) => {
    switch (color) {
      case 'blue': return 'hover:bg-blue-50 border-blue-200'
      case 'green': return 'hover:bg-green-50 border-green-200'
      case 'purple': return 'hover:bg-purple-50 border-purple-200'
      default: return 'hover:bg-gray-50 border-gray-200'
    }
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Common till operations</p>
          </div>
          {!hasOpenSession && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 rounded-full">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">No open session</span>
            </div>
          )}
          {hasOpenSession && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Session active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className={`h-auto p-4 flex flex-col items-center space-y-3 ${getButtonColor(action.color)}`}
              >
                <div className={`p-3 rounded-lg ${getIconColor(action.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Current Till Status */}
        {tillSummary && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Till Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">Current Amount</div>
                <div className="text-lg font-semibold text-gray-900">
                  R {currentAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Opening Amount</div>
                <div className="text-sm font-medium text-gray-700">
                  R {tillSummary.opening_amount.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Sales Total</div>
                <div className="text-sm font-medium text-gray-700">
                  R {tillSummary.sales_total.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Cash Drops</div>
                <div className="text-sm font-medium text-gray-700">
                  R {tillSummary.cash_drops_total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">{error}</p>
              {error.includes('fallback calculation') && (
                <p className="text-xs mt-1">This is normal for new systems. All functionality will work correctly.</p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <CashDropModal
        isOpen={cashDropModalOpen}
        onClose={() => setCashDropModalOpen(false)}
        onConfirm={handleCashDropWrapper}
        currentTillAmount={currentAmount}
        loading={loading}
      />

      <TillCountModal
        isOpen={tillCountModalOpen}
        onClose={() => setTillCountModalOpen(false)}
        onConfirm={handleTillCountWrapper}
        loading={loading}
      />

      <TillReconciliationModal
        isOpen={reconciliationModalOpen}
        onClose={() => setReconciliationModalOpen(false)}
        onConfirm={handleReconciliationWrapper}
        loading={loading}
      />
    </>
  )
} 