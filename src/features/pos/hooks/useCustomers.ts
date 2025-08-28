import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Customer } from '../types'

export type { Customer }

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use secure API route that uses service role key server-side
      const response = await fetch('/api/customers')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch customers')
      }

      const { data } = await response.json()
      console.log('useCustomers: Fetched customers:', data)
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return fetchCustomers()
    }

    setLoading(true)
    setError(null)

    try {
      // Use secure API route that uses service role key server-side
      const response = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search customers')
      }

      const { data } = await response.json()
      console.log('useCustomers: Searched customers:', data)
      setCustomers(data || [])
    } catch (err) {
      console.error('Error searching customers:', err)
      setError(err instanceof Error ? err.message : 'Failed to search customers')
    } finally {
      setLoading(false)
    }
  }

  const getCustomerById = async (id: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching customer by ID:', err)
      return null
    }
  }

  const createCustomer = async (customerData: Partial<Customer>): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh the customers list
      await fetchCustomers()
      return data
    } catch (err) {
      console.error('Error creating customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to create customer')
      return null
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh the customers list
      await fetchCustomers()
      return data
    } catch (err) {
      console.error('Error updating customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to update customer')
      return null
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    searchCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer
  }
}
