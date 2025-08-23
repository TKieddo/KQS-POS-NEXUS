'use client'

import React, { useState, useEffect } from 'react'
import { AddNoteToSaleItemPage } from '@/features/sales/components/AddNoteToSaleItemPage'

// Mock data for development
const mockSales = [
  {
    id: '1',
    saleNumber: 'SALE-001',
    customer: {
      id: 'cust-1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    items: [
      {
        id: 'item-1',
        saleId: '1',
        productId: 'prod-1',
        productName: 'Premium T-Shirt',
        quantity: 2,
        price: 29.99,
        total: 59.98,
        notes: 'Customer requested large size',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'item-2',
        saleId: '1',
        productId: 'prod-2',
        productName: 'Designer Jeans',
        quantity: 1,
        price: 89.99,
        total: 89.99,
        notes: '',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ],
    subtotal: 149.97,
    tax: 14.99,
    total: 164.96,
    status: 'completed' as const,
    saleDate: '2024-01-15',
    cashier: 'Alice Johnson',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    saleNumber: 'SALE-002',
    customer: {
      id: 'cust-2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1987654321'
    },
    items: [
      {
        id: 'item-3',
        saleId: '2',
        productId: 'prod-3',
        productName: 'Summer Dress',
        quantity: 1,
        price: 79.99,
        total: 79.99,
        notes: 'Customer wants it gift wrapped',
        createdAt: '2024-01-14T14:20:00Z'
      },
      {
        id: 'item-4',
        saleId: '2',
        productId: 'prod-4',
        productName: 'Sunglasses',
        quantity: 1,
        price: 45.00,
        total: 45.00,
        notes: '',
        createdAt: '2024-01-14T14:20:00Z'
      }
    ],
    subtotal: 124.99,
    tax: 12.50,
    total: 137.49,
    status: 'completed' as const,
    saleDate: '2024-01-14',
    cashier: 'Bob Davis',
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    saleNumber: 'SALE-003',
    customer: {
      id: 'cust-3',
      name: 'Mike Brown',
      email: 'mike@example.com',
      phone: '+1122334455'
    },
    items: [
      {
        id: 'item-5',
        saleId: '3',
        productId: 'prod-5',
        productName: 'Casual Shirt',
        quantity: 3,
        price: 24.99,
        total: 74.97,
        notes: 'Customer prefers cotton material',
        createdAt: '2024-01-13T09:15:00Z'
      }
    ],
    subtotal: 74.97,
    tax: 7.50,
    total: 82.47,
    status: 'refunded' as const,
    saleDate: '2024-01-13',
    cashier: 'Carol White',
    createdAt: '2024-01-13T09:15:00Z'
  }
]

export default function AddNoteToSaleItemContainer() {
  const [sales, setSales] = useState(mockSales)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddNote = (saleId: string, itemId: string, note: string) => {
    setSales(prev => prev.map(sale => 
      sale.id === saleId 
        ? {
            ...sale,
            items: sale.items.map(item => 
              item.id === itemId 
                ? { ...item, notes: note }
                : item
            )
          }
        : sale
    ))
    // TODO: Update in Supabase
    console.log('Add note:', saleId, itemId, note)
  }

  const handleUpdateNote = (saleId: string, itemId: string, note: string) => {
    setSales(prev => prev.map(sale => 
      sale.id === saleId 
        ? {
            ...sale,
            items: sale.items.map(item => 
              item.id === itemId 
                ? { ...item, notes: note }
                : item
            )
          }
        : sale
    ))
    // TODO: Update in Supabase
    console.log('Update note:', saleId, itemId, note)
  }

  return (
    <AddNoteToSaleItemPage
      sales={sales}
      isLoading={isLoading}
      onAddNote={handleAddNote}
      onUpdateNote={handleUpdateNote}
    />
  )
} 