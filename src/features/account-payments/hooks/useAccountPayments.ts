'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { accountPaymentsService } from '../services/account-payments-service'
import type {
  AccountPayment,
  CustomerStatement,
  TillSessionReport,
  CashDrop,
  CashWithdrawal,
  AccountPaymentFormData,
  CustomerStatementFilters,
  TillSessionFilters,
  CashDropFormData,
  CashWithdrawalFormData
} from '../types'

export const useAccountPayments = () => {
  const { selectedBranch } = useBranch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentPayments, setRecentPayments] = useState<AccountPayment[]>([])
  const [recentCashDrops, setRecentCashDrops] = useState<CashDrop[]>([])
  const [recentWithdrawals, setRecentWithdrawals] = useState<CashWithdrawal[]>([])

  const branchId = selectedBranch?.id || 'global'

  // Load recent data
  const loadRecentData = useCallback(async () => {
    if (branchId === 'global') return

    setLoading(true)
    setError(null)

    try {
      const [payments, cashDrops, withdrawals] = await Promise.all([
        accountPaymentsService.getRecentAccountPayments(5),
        accountPaymentsService.getRecentCashDrops(5),
        accountPaymentsService.getRecentCashWithdrawals(5)
      ])

      setRecentPayments(payments)
      setRecentCashDrops(cashDrops)
      setRecentWithdrawals(withdrawals)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId])

  // Process account payment
  const processAccountPayment = useCallback(async (data: AccountPaymentFormData): Promise<AccountPayment> => {
    if (branchId === 'global') {
      throw new Error('Please select a branch to process account payment')
    }

    setLoading(true)
    setError(null)

    try {
      const payment = await accountPaymentsService.processAccountPayment(data)
      
      // Refresh recent data
      await loadRecentData()

      return payment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process account payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadRecentData])

  // Get customer statement
  const getCustomerStatement = useCallback(async (
    customerId: string, 
    filters?: CustomerStatementFilters
  ): Promise<CustomerStatement> => {
    setLoading(true)
    setError(null)

    try {
      const statement = await accountPaymentsService.getCustomerStatement(customerId, filters)
      return statement
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get customer statement'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get till session reports
  const getTillSessionReports = useCallback(async (
    filters?: TillSessionFilters
  ): Promise<TillSessionReport[]> => {
    setLoading(true)
    setError(null)

    try {
      const reports = await accountPaymentsService.getTillSessionReports(filters)
      return reports
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get till session reports'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Process cash drop
  const processCashDrop = useCallback(async (data: CashDropFormData): Promise<CashDrop> => {
    if (branchId === 'global') {
      throw new Error('Please select a branch to process cash drop')
    }

    setLoading(true)
    setError(null)

    try {
      const cashDrop = await accountPaymentsService.processCashDrop(data)
      
      // Refresh recent data
      await loadRecentData()

      return cashDrop
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process cash drop'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadRecentData])

  // Process cash withdrawal
  const processCashWithdrawal = useCallback(async (data: CashWithdrawalFormData): Promise<CashWithdrawal> => {
    if (branchId === 'global') {
      throw new Error('Please select a branch to process cash withdrawal')
    }

    setLoading(true)
    setError(null)

    try {
      const withdrawal = await accountPaymentsService.processCashWithdrawal(data)
      
      // Refresh recent data
      await loadRecentData()

      return withdrawal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process cash withdrawal'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadRecentData])

  // Load data on mount and when branch changes
  useEffect(() => {
    loadRecentData()
  }, [loadRecentData])

  return {
    // State
    loading,
    error,
    recentPayments,
    recentCashDrops,
    recentWithdrawals,
    
    // Actions
    processAccountPayment,
    getCustomerStatement,
    getTillSessionReports,
    processCashDrop,
    processCashWithdrawal,
    loadRecentData,
    
    // Utilities
    clearError: () => setError(null)
  }
} 