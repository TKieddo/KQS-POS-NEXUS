'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { DollarSign, Calculator, Receipt, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { usePOSPrinting } from '@/lib/pos-printing-integration'
import { StartSessionModal } from './StartSessionModal'
import { VarianceModal } from './VarianceModal'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface CashUpSession {
  id: string
  sessionNumber: string
  cashier: string
  startTime: string
  endTime?: string
  status: 'active' | 'closed' | 'reconciled'
  openingAmount: number
  closingAmount?: number
  expectedAmount: number
  actualAmount: number
  difference: number
  sales: {
    cash: number
    card: number
    transfer: number
    mpesa: number
    ecocash: number
    total: number
  }
  refunds: {
    cash: number
    card: number
    transfer: number
    mpesa: number
    ecocash: number
    total: number
  }
  expenses: {
    description: string
    amount: number
    type: 'cash' | 'card' | 'transfer' | 'mpesa' | 'ecocash'
  }[]
  notes: string
  createdAt: string
}

interface CashUpPageProps {
  currentSession: CashUpSession | null
  isLoading: boolean
  onCloseSession: (sessionData: {
    closingAmount: number
    actualAmount: number
    expenses: CashUpSession['expenses']
    notes: string
  }) => void
  onReconcileSession: (sessionId: string, notes: string) => void
}

export const CashUpPage: React.FC<CashUpPageProps> = ({
  currentSession,
  isLoading,
  onCloseSession,
  onReconcileSession
}) => {
  const { createPrintingService } = usePOSPrinting()
  const [closingAmount, setClosingAmount] = useState(0)
  const [actualAmount, setActualAmount] = useState(0)
  const [expenses, setExpenses] = useState<CashUpSession['expenses']>([])
  const [notes, setNotes] = useState('')
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showReconcileModal, setShowReconcileModal] = useState(false)
  const [showStartSessionModal, setShowStartSessionModal] = useState(false)
  const [showVarianceModal, setShowVarianceModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    type: 'cash' as 'cash' | 'card' | 'transfer' | 'mpesa' | 'ecocash'
  })

  const totalExpenses = useMemo(() => {
    // Use saved expenses for closed sessions, otherwise use local expenses
    const expensesToUse = currentSession?.status === 'closed' ? (currentSession.expenses || []) : expenses
    return expensesToUse.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses, currentSession])

  const expectedAmount = useMemo(() => {
    if (!currentSession) return 0
    // Use saved expenses from session if available, otherwise use local expenses
    const sessionExpenses = currentSession.expenses || []
    const savedTotalExpenses = sessionExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const expensesToUse = currentSession.status === 'closed' ? savedTotalExpenses : totalExpenses
    
    return currentSession.openingAmount + currentSession.sales.total - currentSession.refunds.total - expensesToUse
  }, [currentSession, totalExpenses])

  const difference = useMemo(() => {
    return actualAmount - expectedAmount
  }, [actualAmount, expectedAmount])

  const getStatusColor = (status: CashUpSession['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reconciled': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifferenceColor = (diff: number) => {
    if (diff === 0) return 'text-green-600'
    if (Math.abs(diff) <= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDifferenceIcon = (diff: number) => {
    if (diff === 0) return <CheckCircle className="h-4 w-4" />
    if (diff > 0) return <TrendingUp className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount > 0) {
      setExpenses(prev => [...prev, { ...newExpense, amount: Number(newExpense.amount) }])
      setNewExpense({ description: '', amount: 0, type: 'cash' })
    }
  }

  const handleRemoveExpense = (index: number) => {
    setExpenses(prev => prev.filter((_, i) => i !== index))
  }

  const handleCloseSession = () => {
    onCloseSession({
      closingAmount,
      actualAmount,
      expenses,
      notes
    })
    setShowCloseModal(false)
    setClosingAmount(0)
    setActualAmount(0)
    setExpenses([])
    setNotes('')
    
    // Automatically print receipt when closing session
    setTimeout(async () => {
      try {
        await handlePrintReceipt()
        toast.success('✅ Cash up receipt printed successfully!')
      } catch (error) {
        console.error('Error printing cash up receipt:', error)
        toast.error('❌ Failed to print cash up receipt')
      }
    }, 500) // Small delay to ensure session is closed first
  }

  const handlePrintReceipt = async () => {
    if (!currentSession) {
      toast.error('No active session to print receipt for')
      return
    }
    
    try {
      const printingService = createPrintingService()
      
      // Calculate cash drops and payouts from expenses
      const cashDrops = expenses
        .filter(expense => expense.type === 'cash' && expense.description.toLowerCase().includes('drop'))
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      const cashPayouts = expenses
        .filter(expense => expense.type === 'cash' && expense.description.toLowerCase().includes('payout'))
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      // Fetch comprehensive session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            product:products (
              category:categories (name)
            )
          )
        `)
        .eq('session_id', currentSession.id)
        .gte('created_at', currentSession.startTime)
        .lte('created_at', currentSession.endTime || new Date().toISOString())
      
      if (sessionError) {
        console.error('Error fetching session data:', sessionError)
      }
      
      // Calculate payment methods breakdown
      const paymentMethods: Record<string, number> = {}
      if (sessionData) {
        sessionData.forEach((sale: any) => {
          const method = sale.payment_method || 'Unknown'
          paymentMethods[method] = (paymentMethods[method] || 0) + sale.total_amount
        })
      }
      
      // Calculate product categories breakdown
      const productCategories: Record<string, number> = {}
      if (sessionData) {
        sessionData.forEach((sale: any) => {
          sale.sale_items?.forEach((item: any) => {
            const category = item.product?.category?.name || 'Uncategorized'
            productCategories[category] = (productCategories[category] || 0) + (item.price * item.quantity)
          })
        })
      }
      
      // Calculate transaction types breakdown
      const transactionTypes: Record<string, number> = {
        'Sales': currentSession.sales.cash + currentSession.sales.card,
        'Laybye Payments': 0, // Will be calculated from laybye_payments table
        'Refunds': 0, // Will be calculated from refunds table
        'Account Payments': 0 // Will be calculated from account_payments table
      }
      
      // Fetch laybye payments for this session
      const { data: laybyePayments } = await supabase
        .from('laybye_payments')
        .select('payment_amount')
        .eq('session_id', currentSession.id)
      
      if (laybyePayments) {
        transactionTypes['Laybye Payments'] = laybyePayments.reduce((sum: number, payment: any) => sum + payment.payment_amount, 0)
      }
      
      // Fetch refunds for this session
      const { data: refunds } = await supabase
        .from('refunds')
        .select('refund_amount')
        .eq('session_id', currentSession.id)
      
      if (refunds) {
        transactionTypes['Refunds'] = refunds.reduce((sum: number, refund: any) => sum + refund.refund_amount, 0)
      }
      
      // Fetch account payments for this session
      const { data: accountPayments } = await supabase
        .from('account_payments')
        .select('payment_amount')
        .eq('session_id', currentSession.id)
      
      if (accountPayments) {
        transactionTypes['Account Payments'] = accountPayments.reduce((sum: number, payment: any) => sum + payment.payment_amount, 0)
      }
      
      // Calculate Grasshopper delivery fees
      const { data: deliveries } = await supabase
        .from('deliveries')
        .select('delivery_fee')
        .eq('session_id', currentSession.id)
        .eq('status', 'completed')
      
      const grasshopperFees = deliveries ? deliveries.reduce((sum, delivery) => sum + (delivery.delivery_fee || 0), 0) : 0
      
      await printingService.printCashUpReceipt({
        transactionNumber: `CASHUP-${Date.now()}`,
        sessionNumber: currentSession.sessionNumber,
        cashier: currentSession.cashier,
        openingFloat: currentSession.openingAmount,
        cashSales: currentSession.sales.cash,
        cardSales: currentSession.sales.card,
        cashDrops: cashDrops,
        cashPayouts: cashPayouts,
        closingBalance: expectedAmount,
        countedCash: actualAmount,
        variance: difference,
        notes: notes || 'Cash up completed',
        paymentMethods,
        productCategories,
        transactionTypes,
        grasshopperFees
      })
      
      console.log('Cash up receipt printed successfully')
    } catch (error) {
      console.error('Error printing cashup receipt:', error)
      throw error // Re-throw to be caught by caller
    }
  }

  const handleTestPrint = async () => {
    try {
      const printingService = createPrintingService()
      
      // Test with sample cashup data
      const testCashUpData = {
        transactionNumber: `TEST-CASHUP-${Date.now()}`,
        sessionNumber: 'TEST-SESSION-001',
        cashier: 'Test Cashier',
        openingFloat: 1000.00,
        cashSales: 2500.00,
        cardSales: 1500.00,
        cashDrops: 500.00,
        cashPayouts: 200.00,
        closingBalance: 3300.00,
        countedCash: 3250.00,
        variance: -50.00,
        notes: 'Test cash up session'
      }
      
      toast.info('🖨️ Testing cashup receipt printing...')
      await printingService.printCashUpReceipt(testCashUpData)
      toast.success('✅ Test cashup receipt printed successfully!')
      
    } catch (error) {
      console.error('Test cashup printing failed:', error)
      toast.error('❌ Test cashup printing failed. Check console for details.')
    }
  }

  const handleReconcileSession = () => {
    if (currentSession) {
      onReconcileSession(currentSession.id, notes)
      setShowReconcileModal(false)
      setNotes('')
    }
  }

  const handleSessionStarted = (session: any) => {
    // Reload the page to fetch the new session data
    window.location.reload()
  }

  const stats = useMemo(() => [
    {
      label: 'Opening Amount',
      count: currentSession?.openingAmount || 0,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Sales',
      count: currentSession?.sales.total || 0,
      color: 'bg-green-500'
    },
    {
      label: 'Total Refunds',
      count: currentSession?.refunds.total || 0,
      color: 'bg-red-500'
    },
    {
      label: 'Expected Amount',
      count: expectedAmount,
      color: 'bg-purple-500'
    }
  ], [currentSession, expectedAmount])

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <PageHeader 
          title="Cash Up (Close Drawer)" 
          icon={<DollarSign className="h-4 w-4 text-black" />}
        />
        
        <div className="pt-6">
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Session</h2>
            <p className="text-gray-600 mb-6">There is no active cash register session to close.</p>
              
              <div className="space-y-4">
            <Button
                  onClick={() => window.location.href = '/pos'}
              className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
            >
                  Go to POS
                </Button>
                
                <Button
                  onClick={() => setShowStartSessionModal(true)}
                  variant="outline"
                  className="border-black hover:bg-black hover:text-white"
                >
                  Start New Session
            </Button>
                
                <div className="text-sm text-gray-500">
                  <p>• Start selling in POS to automatically create a session</p>
                  <p>• Or manually start a session above</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Cash Up (Close Drawer)" 
        icon={<DollarSign className="h-4 w-4 text-black" />}
      />
      
      <div className="pt-6"> {/* Add top padding to prevent content from going behind header */}
      <StatsBar stats={stats} />
      
      <div className="max-w-6xl mx-auto p-4">
        {/* Session Info */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentSession.sessionNumber}</h2>
              <p className="text-gray-600">Cashier: {currentSession.cashier}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentSession.status)}`}>
              {currentSession.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Start Time:</span>
              <p className="font-medium">{new Date(currentSession.startTime).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="font-medium">
                {Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / (1000 * 60 * 60))} hours
              </p>
            </div>
            <div>
              <span className="text-gray-600">Opening Amount:</span>
              <p className="font-medium">{formatCurrency(currentSession.openingAmount)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Summary */}
          <div className="bg-black/95 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Sales Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Cash Sales:</span>
                <span className="font-medium text-white">{formatCurrency(currentSession.sales.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Card Sales:</span>
                <span className="font-medium text-white">{formatCurrency(currentSession.sales.card)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Transfer Sales:</span>
                <span className="font-medium text-white">{formatCurrency(currentSession.sales.transfer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mpesa Sales:</span>
                <span className="font-medium text-white">{formatCurrency(currentSession.sales.mpesa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Ecocash Sales:</span>
                <span className="font-medium text-white">{formatCurrency(currentSession.sales.ecocash)}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between font-bold">
                <span className="text-[#E5FF29]">Total Sales:</span>
                <span className="text-[#E5FF29]">{formatCurrency(currentSession.sales.total)}</span>
              </div>
            </div>
          </div>

          {/* Refunds Summary */}
          <div className="bg-[#E5FF29] backdrop-blur-xl rounded-2xl border border-[#E5FF29] shadow-xl p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-black" />
              Refunds Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black">Cash Refunds:</span>
                <span className="font-medium text-black">{formatCurrency(currentSession.refunds.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Card Refunds:</span>
                <span className="font-medium text-black">{formatCurrency(currentSession.refunds.card)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Transfer Refunds:</span>
                <span className="font-medium text-black">{formatCurrency(currentSession.refunds.transfer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Mpesa Refunds:</span>
                <span className="font-medium text-black">{formatCurrency(currentSession.refunds.mpesa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">Ecocash Refunds:</span>
                <span className="font-medium text-black">{formatCurrency(currentSession.refunds.ecocash)}</span>
              </div>
              <div className="border-t border-black/20 pt-3 flex justify-between font-bold">
                <span className="text-black">Total Refunds:</span>
                <span className="text-black">{formatCurrency(currentSession.refunds.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Expenses
          </h3>
          
          <div className="space-y-4">
              {/* Show saved expenses for closed sessions, or local expenses for active sessions */}
              {(currentSession.status === 'closed' ? currentSession.expenses || [] : expenses).map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-600 capitalize">{expense.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatCurrency(expense.amount)}</span>
                    {currentSession.status !== 'closed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveExpense(index)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                    )}
                  </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Expense description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-24"
                />
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                  <option value="mpesa">Mpesa</option>
                  <option value="ecocash">Ecocash</option>
                </select>
                <Button
                  onClick={handleAddExpense}
                  className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total Expenses:</span>
              <span>{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Cash Count */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Cash Count
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Amount
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(expectedAmount)}
                </div>
                <p className="text-sm text-gray-600">
                  Opening + Sales - Refunds - Expenses
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Amount Counted
                </label>
                <Input
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(Number(e.target.value))}
                  placeholder="Enter actual amount"
                  className="text-lg font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difference
                </label>
                <div className={`text-2xl font-bold flex items-center ${getDifferenceColor(difference)}`}>
                  {getDifferenceIcon(difference)}
                  <span className="ml-2">{formatCurrency(difference)}</span>
                </div>
                <p className="text-sm text-gray-600">
                   {difference === 0 ? 'Perfect match! Counted amount equals expected amount.' : 
                    Math.abs(difference) <= 5 ? 'Minor difference - within acceptable range' : 'Significant difference - requires investigation'}
                 </p>
                 
                 {/* Variance tracking button */}
                 {difference !== 0 && actualAmount > 0 && (
                   <Button
                     onClick={() => setShowVarianceModal(true)}
                     variant="outline"
                     size="sm"
                     className="mt-2 border-orange-200 hover:bg-orange-50 text-orange-600"
                   >
                     Record Variance
                   </Button>
                 )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the cash count..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setShowCloseModal(true)}
            className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 px-8"
          >
            Close Session
          </Button>
          
          <Button
            onClick={handlePrintReceipt}
            variant="outline"
            className="px-8 border-black hover:bg-black hover:text-white"
          >
            Print Receipt
          </Button>
          
          <Button
            onClick={handleTestPrint}
            variant="outline"
            className="px-8 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            🖨️ Test Print
          </Button>
          
          {currentSession.status === 'closed' && (
            <Button
              onClick={() => setShowReconcileModal(true)}
              variant="outline"
              className="px-8"
            >
              Reconcile Session
            </Button>
          )}
          </div>
        </div>
      </div>

      {/* Close Session Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Close Cash Session</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Expected Amount:</span>
                <span className="font-medium">{formatCurrency(expectedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Counted Amount:</span>
                <span className="font-medium">{formatCurrency(actualAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Difference:</span>
                <span className={`font-medium ${getDifferenceColor(difference)}`}>
                  {formatCurrency(difference)}
                </span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  A cashup receipt will be printed automatically when you close the session.
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleCloseSession}
                className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
              >
                Confirm Close
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Session Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Reconcile Session</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reconciliation Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add reconciliation notes..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  You can print a cashup receipt after reconciliation.
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleReconcileSession}
                className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
              >
                Reconcile
              </Button>
              <Button
                onClick={handlePrintReceipt}
                variant="outline"
                className="px-4 border-black hover:bg-black hover:text-white"
              >
                Print Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReconcileModal(false)}
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={showStartSessionModal}
        onClose={() => setShowStartSessionModal(false)}
        onSessionStarted={handleSessionStarted}
      />

      {/* Variance Modal */}
      {currentSession && (
        <VarianceModal
          isOpen={showVarianceModal}
          onClose={() => setShowVarianceModal(false)}
          sessionId={currentSession.id}
          expectedAmount={expectedAmount}
          actualAmount={actualAmount}
          difference={difference}
          onVarianceCreated={() => {
            // Optionally refresh session data or show confirmation
            console.log('Variance recorded successfully')
          }}
        />
      )}
    </div>
  )
} 