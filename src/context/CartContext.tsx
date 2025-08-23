'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import type { CartItem, Product, Customer } from '@/features/pos/types'

interface CartContextType {
  cart: CartItem[]
  customer: Customer | null
  discount: number
  discountType: 'percentage' | 'fixed'
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setCustomer: (customer: Customer | null) => void
  clearCustomer: () => void
  setDiscount: (discount: number, type: 'percentage' | 'fixed') => void
  total: number
  itemCount: number
  loadCartFromSale: (saleData: any) => void
  loadCartFromQuote: (quoteData: any) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCartContext = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [discount, setDiscountState] = useState(0)
  const [discountType, setDiscountTypeState] = useState<'percentage' | 'fixed'>('percentage')

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice
              }
            : item
        )
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity
        }
        return [...prevCart, newItem]
      }
    })
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: quantity * item.unitPrice
            }
          : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart([])
    setCustomer(null)
    setDiscountState(0)
    setDiscountTypeState('percentage')
  }, [])

  const clearCustomer = useCallback(() => {
    setCustomer(null)
  }, [])

  const setDiscount = useCallback((discount: number, type: 'percentage' | 'fixed') => {
    setDiscountState(discount)
    setDiscountTypeState(type)
  }, [])

  const loadCartFromSale = useCallback((saleData: any) => {
    if (saleData.items) {
      setCart(saleData.items)
    }
    if (saleData.customer) {
      setCustomer(saleData.customer)
    }
    if (saleData.discount !== undefined) {
      setDiscountState(saleData.discount)
    }
    if (saleData.discountType) {
      setDiscountTypeState(saleData.discountType)
    }
  }, [])

  const loadCartFromQuote = useCallback((quoteData: any) => {
    if (quoteData.items) {
      setCart(quoteData.items)
    }
    if (quoteData.customer) {
      setCustomer(quoteData.customer)
    }
    if (quoteData.discount !== undefined) {
      setDiscountState(quoteData.discount)
    }
    if (quoteData.discountType) {
      setDiscountTypeState(quoteData.discountType)
    }
  }, [])

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [cart])

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const value = {
    cart,
    customer,
    discount,
    discountType,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomer,
    clearCustomer,
    setDiscount,
    total,
    itemCount,
    loadCartFromSale,
    loadCartFromQuote
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 