import { useState, useEffect, useCallback } from 'react'
import { CustomersService } from '../services/customers-service'
import type { LoyaltyAccount, LoyaltyTransaction } from '../types'

export const useLoyaltyManagement = () => {
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([])
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // Fetch all loyalty accounts
  const fetchLoyaltyAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await CustomersService.getCustomers()
      
      if (error) {
        setError(error)
        return
      }
      
      // Extract loyalty accounts from customers
      const accounts = data?.filter(customer => customer.loyaltyAccount).map(customer => customer.loyaltyAccount!) || []
      setLoyaltyAccounts(accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loyalty accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch transactions for a specific customer
  const fetchTransactions = useCallback(async (customerId: string) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.getLoyaltyTransactions(customerId)
      
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

  // Add loyalty transaction
  const addLoyaltyTransaction = useCallback(async (transactionData: Omit<LoyaltyTransaction, 'id' | 'date'>) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.addLoyaltyTransaction(transactionData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        setTransactions(prev => [data, ...prev])
        // Refresh loyalty accounts to update balances
        await fetchLoyaltyAccounts()
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchLoyaltyAccounts])

  // Update loyalty account
  const updateLoyaltyAccount = useCallback(async (customerId: string, loyaltyData: Partial<LoyaltyAccount>) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.updateLoyaltyAccount(customerId, loyaltyData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        setLoyaltyAccounts(prev => prev.map(account => 
          account.customerId === customerId ? data : account
        ))
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update loyalty account'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Calculate loyalty statistics
  const getLoyaltyStats = useCallback(() => {
    const totalPoints = loyaltyAccounts.reduce((sum, account) => sum + account.currentPoints, 0)
    const totalLifetimePoints = loyaltyAccounts.reduce((sum, account) => sum + account.lifetimePoints, 0)
    const activeAccounts = loyaltyAccounts.length
    const tierDistribution = {
      bronze: loyaltyAccounts.filter(account => account.tier === 'bronze').length,
      silver: loyaltyAccounts.filter(account => account.tier === 'silver').length,
      gold: loyaltyAccounts.filter(account => account.tier === 'gold').length,
      platinum: loyaltyAccounts.filter(account => account.tier === 'platinum').length
    }

    return {
      totalPoints,
      totalLifetimePoints,
      activeAccounts,
      tierDistribution,
      averagePoints: activeAccounts > 0 ? totalPoints / activeAccounts : 0
    }
  }, [loyaltyAccounts])

  // Filter loyalty accounts by tier
  const filterLoyaltyAccounts = useCallback((filter: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum', searchTerm: string = '') => {
    return loyaltyAccounts.filter(account => {
      const matchesFilter = filter === 'all' || account.tier === filter
      
      // For search, we'd need customer names, but we only have customer IDs
      // This would need to be enhanced with customer data
      const matchesSearch = true // Placeholder for search functionality
      
      return matchesFilter && matchesSearch
    })
  }, [loyaltyAccounts])

  // Calculate tier progress
  const calculateTierProgress = useCallback((account: LoyaltyAccount) => {
    const progress = (account.tierPoints / account.nextTierPoints) * 100
    return Math.min(progress, 100)
  }, [])

  // Get next tier requirements
  const getNextTierRequirements = useCallback((currentTier: string) => {
    const requirements = {
      bronze: { next: 'silver', points: 1000 },
      silver: { next: 'gold', points: 5000 },
      gold: { next: 'platinum', points: 15000 },
      platinum: { next: 'platinum', points: 0 }
    }
    return requirements[currentTier as keyof typeof requirements] || requirements.bronze
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial load
  useEffect(() => {
    fetchLoyaltyAccounts()
  }, [fetchLoyaltyAccounts])

  return {
    loyaltyAccounts,
    transactions,
    loading,
    error,
    selectedCustomerId,
    fetchLoyaltyAccounts,
    fetchTransactions,
    addLoyaltyTransaction,
    updateLoyaltyAccount,
    getLoyaltyStats,
    filterLoyaltyAccounts,
    calculateTierProgress,
    getNextTierRequirements,
    clearError
  }
} 