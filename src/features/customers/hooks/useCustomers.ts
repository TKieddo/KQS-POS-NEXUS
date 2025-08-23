import { useState, useEffect, useCallback } from 'react'
import { CustomersService } from '../services/customers-service'
import type { Customer, CustomerFilter, CustomerStats } from '../types'
import { useBranch } from '@/context/BranchContext'

export const useCustomers = () => {
  const { selectedBranch, viewMode } = useBranch()
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
      
      // If Central Warehouse is selected, pass undefined to get all customers
      // If specific branch is selected, pass the branch ID
      const branchId = selectedBranch?.id === '00000000-0000-0000-0000-000000000001' ? undefined : selectedBranch?.id
      const { data, error } = await CustomersService.getCustomers(filter, branchId)
      
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
  }, [filter, selectedBranch?.id])

  // Fetch customer stats
  const fetchStats = useCallback(async () => {
    try {
      // If Central Warehouse is selected, pass undefined to get all stats
      // If specific branch is selected, pass the branch ID
      const branchId = selectedBranch?.id === '00000000-0000-0000-0000-000000000001' ? undefined : selectedBranch?.id
      const { data, error } = await CustomersService.getCustomerStats(branchId)
      
      if (error) {
        console.error('Failed to fetch stats:', error)
        return
      }
      
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [selectedBranch?.id])

  // Create customer
  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'customerNumber' | 'createdAt' | 'updatedAt' | 'creditAccount' | 'loyaltyAccount'>) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.createCustomer(customerData)
      
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
  const updateCustomer = useCallback(async (id: string, customerData: Partial<Customer> & { creditAccount?: { isActive: boolean; creditLimit: number; paymentTerms: number }; loyaltyAccount?: { cardNumber?: string; tier: string; nextTierPoints?: number; pointsToNextTier?: number } }) => {
    try {
      setError(null)
      
      const { data, error } = await CustomersService.updateCustomer(id, customerData)
      
      if (error) {
        setError(error)
        return { success: false, error }
      }
      
      if (data) {
        // Instead of updating local state with incomplete data,
        // refetch the customers to get the complete data with loyalty accounts
        await fetchCustomers()
        await fetchStats() // Refresh stats
      }
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchCustomers, fetchStats])

  // Delete customer
  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null)
      
      const { error } = await CustomersService.deleteCustomer(id)
      
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
      
      const { error } = await CustomersService.deleteCustomers(ids)
      
      if (error) {
        setError(error)
        return { success: false, error }
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