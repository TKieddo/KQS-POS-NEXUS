'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CashUpPage } from '@/features/pos/components/CashUpPage'
import { getCurrentCashUpSession, closeCashUpSession, reconcileCashUpSession } from '@/lib/cashup-service'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'

export default function CashUpContainer() {
  const { selectedBranch } = useBranch()
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Extract loadCurrentSession function so it can be reused
  const loadCurrentSession = useCallback(async () => {
    if (!selectedBranch?.id) return

    setIsLoading(true)
    try {
      const result = await getCurrentCashUpSession(selectedBranch.id)
      
      if (result.success) {
        if (result.data) {
          // Transform database format to component format
          const transformedSession = {
            id: result.data.id,
            sessionNumber: result.data.session_number,
            cashier: result.data.cashier_name,
            startTime: result.data.start_time,
            endTime: result.data.end_time,
            status: result.data.status,
            openingAmount: result.data.opening_amount,
            closingAmount: result.data.closing_amount,
            expectedAmount: result.data.expected_amount,
            actualAmount: result.data.actual_amount || 0,
            difference: result.data.difference || 0,
            sales: result.data.sales,
            refunds: result.data.refunds,
            expenses: result.data.expenses || [],
            notes: result.data.notes || '',
            createdAt: result.data.created_at
          }
          setCurrentSession(transformedSession)
        } else {
          setCurrentSession(null)
        }
      } else {
        toast.error('Failed to load current session')
        setCurrentSession(null)
      }
    } catch (error) {
      console.error('Error loading current session:', error)
      toast.error('Failed to load current session')
      setCurrentSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id])

  // Load current session on mount and branch change
  useEffect(() => {
    loadCurrentSession()
  }, [selectedBranch?.id, loadCurrentSession])

  const handleCloseSession = async (sessionData: {
    closingAmount: number
    actualAmount: number
    expenses: any[]
    notes: string
  }) => {
    if (!currentSession) return

    try {
      const result = await closeCashUpSession({
        session_id: currentSession.id,
        closing_amount: sessionData.closingAmount,
        actual_amount: sessionData.actualAmount,
        expenses: sessionData.expenses,
        notes: sessionData.notes
      })

      if (result.success) {
        toast.success('Session closed successfully!')
        
        // Automatically reload the session data from database
        await loadCurrentSession()
        
        // Clear the UI by resetting it to show no active session initially
        // This gives a clean slate for the next session
        setTimeout(() => {
          setCurrentSession(null)
          setIsLoading(false)
        }, 1000) // Small delay to show the success message
        
      } else {
        toast.error(result.error || 'Failed to close session')
      }
    } catch (error) {
      console.error('Error closing session:', error)
      toast.error('Failed to close session')
    }
  }

  const handleReconcileSession = async (sessionId: string, notes: string) => {
    try {
      const result = await reconcileCashUpSession(sessionId, notes)

      if (result.success) {
        toast.success('Session reconciled successfully!')
        // Update local session state
        setCurrentSession(prev => prev ? { ...prev, status: 'reconciled', notes } : null)
      } else {
        toast.error(result.error || 'Failed to reconcile session')
      }
    } catch (error) {
      console.error('Error reconciling session:', error)
      toast.error('Failed to reconcile session')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cashup session...</p>
        </div>
      </div>
    )
  }

  return (
    <CashUpPage
      currentSession={currentSession}
      isLoading={isLoading}
      onCloseSession={handleCloseSession}
      onReconcileSession={handleReconcileSession}
    />
  )
} 