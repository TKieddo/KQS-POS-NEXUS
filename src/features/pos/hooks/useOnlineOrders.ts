import { useState, useEffect } from 'react'
import type { OnlineOrder } from '../types'

// Mock data for online orders
const mockOnlineOrders: OnlineOrder[] = [
  {
    id: '1',
    order_number: 'WEB-001',
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    customer_phone: '+1 (555) 123-4567',
    status: 'pending',
    order_date: '2024-01-15T10:30:00Z',
    pickup_date: '2024-01-16T14:00:00Z',
    total_amount: 89.99,
    items: [
      {
        id: '1',
        product_id: 'prod-1',
        product_name: 'Premium Cotton T-Shirt',
        quantity: 2,
        unit_price: 29.99,
        total_price: 59.98
      },
      {
        id: '2',
        product_id: 'prod-2',
        product_name: 'Denim Jeans',
        quantity: 1,
        unit_price: 29.99,
        total_price: 29.99
      }
    ],
    notes: 'Please ensure items are in good condition',
    payment_status: 'paid',
    payment_method: 'card',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    order_number: 'WEB-002',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.j@email.com',
    customer_phone: '+1 (555) 987-6543',
    status: 'confirmed',
    order_date: '2024-01-15T11:15:00Z',
    pickup_date: '2024-01-17T16:00:00Z',
    total_amount: 149.97,
    items: [
      {
        id: '3',
        product_id: 'prod-3',
        product_name: 'Leather Jacket',
        quantity: 1,
        unit_price: 149.99,
        total_price: 149.99
      }
    ],
    notes: '',
    payment_status: 'paid',
    payment_method: 'paypal',
    created_at: '2024-01-15T11:15:00Z',
    updated_at: '2024-01-15T11:15:00Z'
  },
  {
    id: '3',
    order_number: 'WEB-003',
    customer_name: 'Mike Wilson',
    customer_email: 'mike.w@email.com',
    customer_phone: '+1 (555) 456-7890',
    status: 'ready',
    order_date: '2024-01-14T15:45:00Z',
    pickup_date: '2024-01-15T12:00:00Z',
    total_amount: 67.98,
    items: [
      {
        id: '4',
        product_id: 'prod-4',
        product_name: 'Running Shoes',
        quantity: 1,
        unit_price: 67.99,
        total_price: 67.99
      }
    ],
    notes: 'Customer prefers early pickup if possible',
    payment_status: 'paid',
    payment_method: 'card',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-15T09:30:00Z'
  },
  {
    id: '4',
    order_number: 'WEB-004',
    customer_name: 'Emily Davis',
    customer_email: 'emily.d@email.com',
    customer_phone: '+1 (555) 321-6547',
    status: 'completed',
    order_date: '2024-01-13T09:20:00Z',
    pickup_date: '2024-01-14T13:00:00Z',
    total_amount: 199.98,
    items: [
      {
        id: '5',
        product_id: 'prod-5',
        product_name: 'Designer Handbag',
        quantity: 1,
        unit_price: 199.99,
        total_price: 199.99
      }
    ],
    notes: '',
    payment_status: 'paid',
    payment_method: 'card',
    created_at: '2024-01-13T09:20:00Z',
    updated_at: '2024-01-14T13:15:00Z'
  }
]

export const useOnlineOrders = () => {
  const [orders, setOrders] = useState<OnlineOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch online orders
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrders(mockOnlineOrders)
    } catch (err) {
      setError('Failed to fetch online orders')
      console.error('Error fetching online orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OnlineOrder['status']) => {
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status, updated_at: new Date().toISOString() }
            : order
        )
      )
      
      // Here you would typically make an API call to update the order
      console.log(`Order ${orderId} status updated to ${status}`)
    } catch (err) {
      setError('Failed to update order status')
      console.error('Error updating order status:', err)
    }
  }

  // Get orders by status
  const getOrdersByStatus = (status: OnlineOrder['status']) => {
    return orders.filter(order => order.status === status)
  }

  // Get pending orders count
  const getPendingOrdersCount = () => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(order.status)
    ).length
  }

  // Get today's orders
  const getTodayOrders = () => {
    const today = new Date().toDateString()
    return orders.filter(order => 
      new Date(order.order_date).toDateString() === today
    )
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    getOrdersByStatus,
    getPendingOrdersCount,
    getTodayOrders
  }
} 