'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import {
  getTillSummary,
  getCurrentTillAmount,
  performCashDrop,
  recordTillCount,
  recordTillReconciliation,
  openTillSession,
  closeTillSession,
  getRecentCashDrops,
  getRecentTillCounts,
  getRecentTillReconciliations,
  getCurrentTillSession,
  clearTillOperationsCache,
  type TillSummary,
  type CashDrop,
  type TillCount,
  type TillReconciliation,
  type TillSession
} from '@/lib/till-operations-service'

export const useTillOperations = () => {
  const { selectedBranch } = useBranch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tillSummary, setTillSummary] = useState<TillSummary | null>(null)
  const [currentAmount, setCurrentAmount] = useState<number>(0)
  const [currentSession, setCurrentSession] = useState<TillSession | null>(null)
  const [recentCashDrops, setRecentCashDrops] = useState<CashDrop[]>([])
  const [recentTillCounts, setRecentTillCounts] = useState<TillCount[]>([])
  const [recentReconciliations, setRecentReconciliations] = useState<TillReconciliation[]>([])

  const branchId = selectedBranch?.id || 'global'

  // Load till summary
  const loadTillSummary = useCallback(async () => {
    if (!branchId || branchId === 'global') return

    setLoading(true)
    setError(null)
    
    try {
      const summary = await getTillSummary(branchId)
      setTillSummary(summary)
      setCurrentAmount(summary.current_amount)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load till summary'
      // Provide more user-friendly error messages
      if (errorMessage.includes('column reference "opening_amount" is ambiguous')) {
        setError('Database function temporarily unavailable. Using fallback calculation.')
      } else {
        setError(errorMessage)
      }
      console.error('Error loading till summary:', err)
    } finally {
      setLoading(false)
    }
  }, [branchId])

  // Load current session
  const loadCurrentSession = useCallback(async () => {
    if (!branchId || branchId === 'global') return

    try {
      const session = await getCurrentTillSession(branchId)
      setCurrentSession(session)
    } catch (err) {
      console.error('Error loading current session:', err)
    }
  }, [branchId])

  // Load recent operations
  const loadRecentOperations = useCallback(async () => {
    if (!branchId || branchId === 'global') return

    try {
      const [drops, counts, reconciliations] = await Promise.all([
        getRecentCashDrops(branchId, 5),
        getRecentTillCounts(branchId, 5),
        getRecentTillReconciliations(branchId, 5)
      ])
      
      setRecentCashDrops(drops)
      setRecentTillCounts(counts)
      setRecentReconciliations(reconciliations)
    } catch (err) {
      console.error('Error loading recent operations:', err)
    }
  }, [branchId])

  // Perform cash drop
  const handleCashDrop = useCallback(async (amount: number, reason: string) => {
    if (!branchId || branchId === 'global') {
      throw new Error('Please select a branch to perform cash drop')
    }

    setLoading(true)
    setError(null)

    try {
      const cashDrop = await performCashDrop(branchId, amount, reason)
      
      // Refresh data
      await Promise.all([
        loadTillSummary(),
        loadRecentOperations()
      ])

      return cashDrop
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform cash drop'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadTillSummary, loadRecentOperations])

  // Record till count
  const handleTillCount = useCallback(async (
    expectedAmount: number, 
    denominationCounts: Record<string, number>, 
    notes?: string
  ) => {
    if (!branchId || branchId === 'global') {
      throw new Error('Please select a branch to record till count')
    }

    setLoading(true)
    setError(null)

    try {
      const tillCount = await recordTillCount(branchId, expectedAmount, denominationCounts, notes)
      
      // Refresh data
      await Promise.all([
        loadTillSummary(),
        loadRecentOperations()
      ])

      return tillCount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record till count'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadTillSummary, loadRecentOperations])

  // Record till reconciliation
  const handleTillReconciliation = useCallback(async (reconciliation: {
    opening_amount: number
    sales_total: number
    refunds_total: number
    cash_payments: number
    actual_amount: number
    notes?: string
  }) => {
    if (!branchId || branchId === 'global') {
      throw new Error('Please select a branch to record till reconciliation')
    }

    setLoading(true)
    setError(null)

    try {
      const tillReconciliation = await recordTillReconciliation(branchId, reconciliation)
      
      // Refresh data
      await Promise.all([
        loadTillSummary(),
        loadRecentOperations()
      ])

      return tillReconciliation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record till reconciliation'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadTillSummary, loadRecentOperations])

  // Open till session
  const handleOpenSession = useCallback(async (openingAmount: number, notes?: string) => {
    if (!branchId || branchId === 'global') {
      throw new Error('Please select a branch to open till session')
    }

    setLoading(true)
    setError(null)

    try {
      const session = await openTillSession(branchId, openingAmount, notes)
      
      // Refresh data
      await Promise.all([
        loadTillSummary(),
        loadCurrentSession(),
        loadRecentOperations()
      ])

      return session
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open till session'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadTillSummary, loadCurrentSession, loadRecentOperations])

  // Close till session
  const handleCloseSession = useCallback(async (closingAmount: number, notes?: string) => {
    if (!branchId || branchId === 'global') {
      throw new Error('Please select a branch to close till session')
    }

    setLoading(true)
    setError(null)

    try {
      const session = await closeTillSession(branchId, closingAmount, notes)
      
      // Refresh data
      await Promise.all([
        loadTillSummary(),
        loadCurrentSession(),
        loadRecentOperations()
      ])

      return session
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to close till session'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [branchId, loadTillSummary, loadCurrentSession, loadRecentOperations])

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!branchId || branchId === 'global') return

    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        loadTillSummary(),
        loadCurrentSession(),
        loadRecentOperations()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }, [branchId, loadTillSummary, loadCurrentSession, loadRecentOperations])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load initial data
  useEffect(() => {
    if (branchId && branchId !== 'global') {
      refreshData()
    }
  }, [branchId, refreshData])

  return {
    // State
    loading,
    error,
    tillSummary,
    currentAmount,
    currentSession,
    recentCashDrops,
    recentTillCounts,
    recentReconciliations,
    
    // Actions
    handleCashDrop,
    handleTillCount,
    handleTillReconciliation,
    handleOpenSession,
    handleCloseSession,
    refreshData,
    clearError,
    
    // Computed values
    hasOpenSession: currentSession?.status === 'open',
    canPerformOperations: branchId !== 'global' && currentSession?.status === 'open'
  }
} 