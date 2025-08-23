import { useState, useEffect, useCallback } from 'react'
import { FreshCustomersService } from '../services/fresh-customers-service'
import type { Customer, CustomerFilter, CustomerStats, CreateCustomerData, UpdateCustomerData } from '../types/fresh-types'

export const useFreshCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [filter, setFilter] = useState<CustomerFilter>({
    search: '',
    status: 'all',
    customerType: 'all',
    creditStatus: 'all',
    loyaltyTier: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  })

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await FreshCustomersService.getCustomers(filter)
      
      if (error) {
        setError(error)
        return
      }
      
      setCustomers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Fetch customer stats
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await FreshCustomersService.getCustomerStats()
      
      if (error) {
        console.error('Failed to fetch stats:', error)
        return
      }
      
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Create customer
  const createCustomer = useCallback(async (customerData: CreateCustomerData) => {
    try {
      setError(null)
      
      const { data, error } = await FreshCustomersService.createCustomer(customerData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        setCustomers(prev => [data, ...prev])
        await fetchStats() // Refresh stats
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchStats])

  // Update customer
  const updateCustomer = useCallback(async (id: string, customerData: UpdateCustomerData) => {
    try {
      setError(null)
      
      const { data, error } = await FreshCustomersService.updateCustomer(id, customerData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        setCustomers(prev => prev.map(c => c.id === id ? data : c))
        await fetchStats() // Refresh stats
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchStats])

  // Delete customer
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null)
      
      const { error } = await FreshCustomersService.deleteCustomer(id)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      setCustomers(prev => prev.filter(c => c.id !== id))
      await fetchStats() // Refresh stats
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchStats])

  // Bulk delete customers
  const deleteCustomers = useCallback(async (ids: string[]) => {
    try {
      setError(null)
      
      // Delete customers one by one (Supabase doesn't support bulk delete with RLS)
      for (const id of ids) {
        const { error } = await FreshCustomersService.deleteCustomer(id)
        if (error) {
          setError(error)
          return { success: false, error }
        }
      }
      
      setCustomers(prev => prev.filter(c => !ids.includes(c.id)))
      await fetchStats() // Refresh stats
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customers'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchStats])

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<CustomerFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refetch customers
  const refetch = useCallback(() => {
    fetchCustomers()
    fetchStats()
  }, [fetchCustomers, fetchStats])

  // Initial load
  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [fetchCustomers, fetchStats])

  return {
    customers,
    loading,
    error,
    stats,
    filter,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    deleteCustomers,
    updateFilter,
    clearError,
    refetch
  }
} 