'use client'

import React, { useState, useEffect } from 'react'
import { DeliveriesPage } from '@/features/deliveries/components/DeliveriesPage'
import type { Delivery } from '@/features/pos/types/deliveries'

export default function DeliveriesPageContainer() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with Supabase query
  useEffect(() => {
    const mockDeliveries: Delivery[] = [
      {
        id: 'DEL-001',
        orderNumber: 'ORD-2024-001',
        customerName: 'John Smith',
        customerPhone: '+1 (555) 123-4567',
        customerAddress: '123 Main St, City, State 12345',
        items: [
          { name: 'Nike Air Max 270', quantity: 1, price: 150.00 },
          { name: 'Adidas Ultraboost', quantity: 1, price: 180.00 }
        ],
        totalAmount: 330.00,
        status: 'pending',
        deliveryDate: '2024-01-25',
        deliveryTime: '14:00-16:00',
        notes: 'Please call before delivery',
        createdAt: '2024-01-20T10:30:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'DEL-002',
        orderNumber: 'ORD-2024-002',
        customerName: 'Sarah Johnson',
        customerPhone: '+1 (555) 234-5678',
        customerAddress: '456 Oak Ave, City, State 12345',
        items: [
          { name: 'Puma RS-X', quantity: 1, price: 120.00 }
        ],
        totalAmount: 120.00,
        status: 'in-transit',
        deliveryDate: '2024-01-24',
        deliveryTime: '10:00-12:00',
        notes: 'Leave at front door if no answer',
        createdAt: '2024-01-19T15:45:00Z',
        updatedAt: '2024-01-24T09:15:00Z'
      },
      {
        id: 'DEL-003',
        orderNumber: 'ORD-2024-003',
        customerName: 'Mike Wilson',
        customerPhone: '+1 (555) 345-6789',
        customerAddress: '789 Pine Rd, City, State 12345',
        items: [
          { name: 'New Balance 990', quantity: 1, price: 200.00 },
          { name: 'Converse Chuck Taylor', quantity: 2, price: 65.00 }
        ],
        totalAmount: 330.00,
        status: 'delivered',
        deliveryDate: '2024-01-23',
        deliveryTime: '16:00-18:00',
        notes: 'Delivered successfully',
        createdAt: '2024-01-18T11:20:00Z',
        updatedAt: '2024-01-23T17:30:00Z'
      }
    ]

    setDeliveries(mockDeliveries)
    setIsLoading(false)
  }, [])

  const handleCreateDelivery = (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDelivery: Delivery = {
      ...deliveryData,
      id: `DEL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setDeliveries(prev => [newDelivery, ...prev])
  }

  const handleUpdateDeliveryStatus = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(prev => prev.map(delivery =>
      delivery.id === deliveryId
        ? { ...delivery, status: newStatus, updatedAt: new Date().toISOString() }
        : delivery
    ))
  }

  const handleDeleteDelivery = (deliveryId: string) => {
    if (confirm('Are you sure you want to delete this delivery?')) {
      setDeliveries(prev => prev.filter(delivery => delivery.id !== deliveryId))
    }
  }

  return (
    <DeliveriesPage
      deliveries={deliveries}
      isLoading={isLoading}
        onCreateDelivery={handleCreateDelivery}
      onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
      onDeleteDelivery={handleDeleteDelivery}
    />
  )
} 