'use client'

import { useState, useEffect } from 'react'
import type { CartItem, Customer } from '../types'

export interface HeldOrder {
  id: string
  cart: CartItem[]
  customer: Customer | null
  total: number
  discount: number
  discountType: 'percentage' | 'fixed'
  heldAt: string
  notes?: string
}

export const useHeldOrders = () => {
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([])

  // Load held orders from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pos-held-orders')
    if (saved) {
      try {
        setHeldOrders(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading held orders:', error)
        setHeldOrders([])
      }
    }
  }, [])

  // Save held orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pos-held-orders', JSON.stringify(heldOrders))
  }, [heldOrders])

  const holdOrder = (
    cart: CartItem[],
    customer: Customer | null,
    total: number,
    discount: number = 0,
    discountType: 'percentage' | 'fixed' = 'percentage',
    notes?: string
  ) => {
    const newHeldOrder: HeldOrder = {
      id: `HELD-${Date.now()}`,
      cart: [...cart],
      customer: customer ? { ...customer } : null,
      total,
      discount,
      discountType,
      heldAt: new Date().toISOString(),
      notes
    }

    setHeldOrders(prev => [newHeldOrder, ...prev])
    return newHeldOrder.id
  }

  const retrieveOrder = (orderId: string): HeldOrder | null => {
    const order = heldOrders.find(o => o.id === orderId)
    return order || null
  }

  const removeHeldOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId))
  }

  const clearAllHeldOrders = () => {
    setHeldOrders([])
  }

  return {
    heldOrders,
    holdOrder,
    retrieveOrder,
    removeHeldOrder,
    clearAllHeldOrders
  }
} 