import { useState, useEffect, useCallback } from 'react'
import { CustomerService } from '../services/loyalty-service'
import { Customer, CustomerStats, CustomerFilter } from '@/types/loyalty'

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<CustomerFilter>({
    search: '',
    status: 'all',
    customerType: 'all',
    creditStatus: 'all',
    loyaltyTier: 'all',
    dateRange: { start: '', end: '' }
  })

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await CustomerService.getCustomers(filter)
      if (result.error) {
        setError(result.error)
      } else {
        setCustomers(result.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const result = await CustomerService.getStats()
      if (result.error) {
        console.error('Failed to fetch stats:', result.error)
      } else {
        setStats(result.data || null)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Create customer
  const createCustomer = useCallback(async (customerData: Partial<Customer>) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await CustomerService.createCustomer(customerData)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error, data: null }
      } else {
        // Refresh the customers list
        await fetchCustomers()
        return { success: true, error: null, data: result.data }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer'
      setError(errorMessage)
      return { success: false, error: errorMessage, data: null }
    } finally {
      setLoading(false)
    }
  }, [fetchCustomers])

  // Update customer
  const updateCustomer = useCallback(async (id: string, customerData: Partial<Customer>) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await CustomerService.updateCustomer(id, customerData)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        // Refresh the customers list
        await fetchCustomers()
        return { success: true }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [fetchCustomers])

  // Delete customer
  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await CustomerService.deleteCustomer(id)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      } else {
        // Remove from local state
        setCustomers(prev => prev.filter(customer => customer.id !== id))
        return { success: true }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Create loyalty account
  const createLoyaltyAccount = useCallback(async (customerId: string, accountData: any) => {
    try {
      const result = await CustomerService.createLoyaltyAccount(customerId, accountData)
      if (result.success) {
        // Refresh the customers list
        await fetchCustomers()
      }
      return result
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create loyalty account' }
    }
  }, [fetchCustomers])

  // Create credit account
  const createCreditAccount = useCallback(async (customerId: string, accountData: any) => {
    try {
      const result = await CustomerService.createCreditAccount(customerId, accountData)
      if (result.success) {
        // Refresh the customers list
        await fetchCustomers()
      }
      return result
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create credit account' }
    }
  }, [fetchCustomers])

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<CustomerFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [fetchCustomers, fetchStats])

  return {
    customers,
    stats,
    loading,
    error,
    filter,
    fetchCustomers,
    fetchStats,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createLoyaltyAccount,
    createCreditAccount,
    updateFilter,
    clearError
  }
} 