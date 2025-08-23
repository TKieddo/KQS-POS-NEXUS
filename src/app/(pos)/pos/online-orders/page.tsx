'use client'

import React, { useState, useEffect } from 'react'
import { OnlineOrdersPage } from '@/features/orders/components/OnlineOrdersPage'

// Mock data for development
const mockOnlineOrders = [
  {
    id: '1',
    orderNumber: 'WEB-001',
    customer: {
      id: 'cust-1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State'
    },
    items: [
      {
        id: 'item-1',
        name: 'Premium T-Shirt',
        quantity: 2,
        price: 29.99,
        total: 59.98
      },
      {
        id: 'item-2',
        name: 'Designer Jeans',
        quantity: 1,
        price: 89.99,
        total: 89.99
      }
    ],
    subtotal: 149.97,
    tax: 14.99,
    shipping: 9.99,
    total: 174.95,
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    orderDate: '2024-01-15',
    expectedDelivery: '2024-01-20',
    shippingMethod: 'standard' as const,
    notes: 'Please deliver after 6 PM',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    orderNumber: 'WEB-002',
    customer: {
      id: 'cust-2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1987654321',
      address: '456 Oak Ave, Town, State'
    },
    items: [
      {
        id: 'item-3',
        name: 'Summer Dress',
        quantity: 1,
        price: 79.99,
        total: 79.99
      }
    ],
    subtotal: 79.99,
    tax: 8.00,
    shipping: 12.99,
    total: 100.98,
    status: 'confirmed' as const,
    paymentStatus: 'paid' as const,
    orderDate: '2024-01-14',
    expectedDelivery: '2024-01-18',
    shippingMethod: 'express' as const,
    notes: '',
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    orderNumber: 'WEB-003',
    customer: {
      id: 'cust-3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      phone: '+1122334455',
      address: '789 Pine St, Village, State'
    },
    items: [
      {
        id: 'item-4',
        name: 'Casual Shirt',
        quantity: 3,
        price: 24.99,
        total: 74.97
      },
      {
        id: 'item-5',
        name: 'Sneakers',
        quantity: 1,
        price: 129.99,
        total: 129.99
      }
    ],
    subtotal: 204.96,
    tax: 20.50,
    shipping: 0,
    total: 225.46,
    status: 'processing' as const,
    paymentStatus: 'paid' as const,
    orderDate: '2024-01-13',
    expectedDelivery: '2024-01-17',
    shippingMethod: 'pickup' as const,
    notes: 'Customer will pick up',
    createdAt: '2024-01-13T09:15:00Z'
  }
]

export default function OnlineOrdersContainer() {
  const [orders, setOrders] = useState(mockOnlineOrders)
  const [isLoading, setIsLoading] = useState(false)

  const handleViewOrder = (order: any) => {
    // TODO: Implement order details modal or navigation
    console.log('View order:', order)
  }

  const handleUpdateStatus = (orderId: string, status: any) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ))
    // TODO: Update in Supabase
    console.log('Update status:', orderId, status)
  }

  const handleUpdatePaymentStatus = (orderId: string, paymentStatus: any) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, paymentStatus } : order
    ))
    // TODO: Update in Supabase
    console.log('Update payment status:', orderId, paymentStatus)
  }

  return (
    <OnlineOrdersPage
      orders={orders}
      isLoading={isLoading}
      onViewOrder={handleViewOrder}
      onUpdateStatus={handleUpdateStatus}
      onUpdatePaymentStatus={handleUpdatePaymentStatus}
    />
  )
} 