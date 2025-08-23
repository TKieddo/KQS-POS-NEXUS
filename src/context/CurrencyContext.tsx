"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = 'R' | 'L'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('R')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('currency') : null
    if (stored === 'R' || stored === 'L') setCurrency(stored)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('currency', currency)
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
} 