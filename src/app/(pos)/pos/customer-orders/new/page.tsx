'use client'

import React, { useState, useEffect } from 'react'
import { CreateCustomerOrderPage } from '@/features/customers/components/CreateCustomerOrderPage'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Product {
  id: string
  name: string
  price: number
  stockQuantity: number
  category: string
}

interface CustomerOrder {
  id: string
  orderNumber: string
  customer: Customer
  items: Array<{
    productId: string
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

export default function NewCustomerOrderPageContainer() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with Supabase integration
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St, City, State 12345'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        address: '456 Oak Ave, City, State 12345'
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+1122334455',
        address: '789 Pine Rd, City, State 12345'
      }
    ]

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Laptop Computer',
        price: 999.99,
        stockQuantity: 15,
        category: 'Electronics'
      },
      {
        id: '2',
        name: 'Wireless Mouse',
        price: 29.99,
        stockQuantity: 50,
        category: 'Electronics'
      },
      {
        id: '3',
        name: 'Office Chair',
        price: 199.99,
        stockQuantity: 8,
        category: 'Furniture'
      },
      {
        id: '4',
        name: 'Desk Lamp',
        price: 49.99,
        stockQuantity: 25,
        category: 'Furniture'
      },
      {
        id: '5',
        name: 'Notebook Set',
        price: 19.99,
        stockQuantity: 100,
        category: 'Office Supplies'
      }
    ]
    
    setCustomers(mockCustomers)
    setProducts(mockProducts)
    setIsLoading(false)
  }, [])

  const handleCreateOrder = async (orderData: Omit<CustomerOrder, 'id' | 'createdAt'>) => {
    try {
      // TODO: Integrate with Supabase
      console.log('Creating customer order:', orderData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Add success notification
      console.log('Customer order created successfully')
    } catch (error) {
      console.error('Error creating customer order:', error)
      // TODO: Add error notification
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <CreateCustomerOrderPage 
      customers={customers}
      products={products}
      onCreateOrder={handleCreateOrder}
      isLoading={false}
    />
  )
} 