import { useState, useCallback } from 'react'
import type { Customer } from '../types'

export const useCustomer = () => {
  const [customer, setCustomer] = useState<Customer | null>(null)

  const clearCustomer = useCallback(() => {
    setCustomer(null)
  }, [])

  return {
    customer,
    setCustomer,
    clearCustomer
  }
} 