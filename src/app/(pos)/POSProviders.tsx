'use client'

import React from 'react'
import { CartProvider } from '@/context/CartContext'
import { BranchProvider } from '@/context/BranchContext'
import { AuthProvider } from '@/context/AuthContext'

interface POSProvidersProps {
  children: React.ReactNode
}

export function POSProviders({ children }: POSProvidersProps) {
  return (
    <AuthProvider>
      <BranchProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </BranchProvider>
    </AuthProvider>
  )
}