import { useState, useEffect, useCallback } from 'react'
import { CustomersService } from '../services/customers-service'
import type { CreditAccount, CreditTransaction } from '../types'

export const useCreditManagement = () => {
  const [creditAccounts, setCreditAccounts] = useState<CreditAccount[]>([])
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // Fetch all credit accounts
  const fetchCreditAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await CustomersService.getCustomers()
      
      if (error) {
        setError(error)
        return
      }
      
      // Extract credit accounts from customers
      const accounts = data?.filter(customer => customer.creditAccount).map(customer => customer.creditAccount!) || []
      setCreditAccounts(accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch transactions for a specific customer
  const fetchTransactions = useCallback(async (customerId: string) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.getCreditTransactions(customerId)
      
      if (error) {
        setError(error)
        return
      }
      
      setTransactions(data || [])
      setSelectedCustomerId(customerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    }
  }, [])

  // Add credit transaction
  const addCreditTransaction = useCallback(async (transactionData: Omit<CreditTransaction, 'id' | 'date'>) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.addCreditTransaction(transactionData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        setTransactions(prev => [data, ...prev])
        // Refresh credit accounts to update balances
        await fetchCreditAccounts()
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchCreditAccounts])

  // Update credit account
  const updateCreditAccount = useCallback(async (customerId: string, creditData: Partial<CreditAccount>) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.updateCreditAccount(customerId, creditData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        setCreditAccounts(prev => prev.map(account => 
          account.customerId === customerId ? data : account
        ))
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update credit account'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Calculate credit statistics
  const getCreditStats = useCallback(() => {
    const totalCreditLimit = creditAccounts.reduce((sum, account) => sum + account.creditLimit, 0)
    const totalOutstanding = creditAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
    const totalOverdue = creditAccounts.reduce((sum, account) => sum + account.overdueAmount, 0)
    const activeAccounts = creditAccounts.filter(account => account.isActive).length
    const accountsWithOverdue = creditAccounts.filter(account => account.overdueAmount > 0).length

    return {
      totalCreditLimit,
      totalOutstanding,
      totalOverdue,
      activeAccounts,
      accountsWithOverdue,
      utilizationRate: totalCreditLimit > 0 ? (totalOutstanding / totalCreditLimit) * 100 : 0
    }
  }, [creditAccounts])

  // Filter credit accounts
  const filterCreditAccounts = useCallback((filter: 'all' | 'active' | 'overdue' | 'suspended', searchTerm: string = '') => {
    return creditAccounts.filter(account => {
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && account.isActive) ||
        (filter === 'overdue' && account.overdueAmount > 0) ||
        (filter === 'suspended' && !account.isActive)
      
      // For search, we'd need customer names, but we only have customer IDs
      // This would need to be enhanced with customer data
      const matchesSearch = true // Placeholder for search functionality
      
      return matchesFilter && matchesSearch
    })
  }, [creditAccounts])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial load
  useEffect(() => {
    fetchCreditAccounts()
  }, [fetchCreditAccounts])

  return {
    creditAccounts,
    transactions,
    loading,
    error,
    selectedCustomerId,
    fetchCreditAccounts,
    fetchTransactions,
    addCreditTransaction,
    updateCreditAccount,
    getCreditStats,
    filterCreditAccounts,
    clearError
  }
} 