'use client'

import React, { useState, useEffect } from 'react'
import { CustomerOrdersPage } from '@/features/customers/components/CustomerOrdersPage'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface CustomerOrder {
  id: string
  orderNumber: string
  customer: Customer
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  expectedDelivery: string
  notes: string
  createdAt: string
}

export default function CustomerOrdersPageContainer() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with Supabase integration
    const mockOrders: CustomerOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customer: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        items: [
          { name: 'Laptop Computer', quantity: 1, price: 999.99, total: 999.99 },
          { name: 'Wireless Mouse', quantity: 2, price: 29.99, total: 59.98 }
        ],
        subtotal: 1059.97,
        tax: 84.80,
        total: 1144.77,
        status: 'delivered',
        orderDate: '2024-01-15',
        expectedDelivery: '2024-01-22',
        notes: 'Please deliver during business hours',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customer: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        },
        items: [
          { name: 'Office Chair', quantity: 1, price: 199.99, total: 199.99 },
          { name: 'Desk Lamp', quantity: 1, price: 49.99, total: 49.99 }
        ],
        subtotal: 249.98,
        tax: 20.00,
        total: 269.98,
        status: 'shipped',
        orderDate: '2024-01-20',
        expectedDelivery: '2024-01-27',
        notes: 'Fragile items - handle with care',
        createdAt: '2024-01-20T14:30:00Z'
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        customer: {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+1122334455'
        },
        items: [
          { name: 'Notebook Set', quantity: 5, price: 19.99, total: 99.95 }
        ],
        subtotal: 99.95,
        tax: 8.00,
        total: 107.95,
        status: 'pending',
        orderDate: '2024-01-25',
        expectedDelivery: '2024-02-01',
        notes: 'Standard delivery is fine',
        createdAt: '2024-01-25T09:15:00Z'
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        customer: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        items: [
          { name: 'Laptop Computer', quantity: 1, price: 999.99, total: 999.99 }
        ],
        subtotal: 999.99,
        tax: 80.00,
        total: 1079.99,
        status: 'confirmed',
        orderDate: '2024-01-28',
        expectedDelivery: '2024-02-04',
        notes: 'Second laptop for home office',
        createdAt: '2024-01-28T16:45:00Z'
      }
    ]
    
    setOrders(mockOrders)
    setIsLoading(false)
  }, [])

  const handleViewOrder = (order: CustomerOrder) => {
    // TODO: Navigate to order details page or open modal
    console.log('Viewing order:', order.orderNumber)
  }

  const handleEditOrder = (order: CustomerOrder) => {
    // TODO: Navigate to edit order page or open modal
    console.log('Editing order:', order.orderNumber)
  }

  const handleUpdateStatus = async (orderId: string, status: CustomerOrder['status']) => {
    try {
      // TODO: Integrate with Supabase
      console.log('Updating order status:', orderId, status)
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
      
      // TODO: Add success notification
    } catch (error) {
      console.error('Error updating order status:', error)
      // TODO: Add error notification
    }
  }

  return (
    <CustomerOrdersPage 
      orders={orders}
      isLoading={isLoading}
      onViewOrder={handleViewOrder}
      onEditOrder={handleEditOrder}
      onUpdateStatus={handleUpdateStatus}
    />
  )
} 