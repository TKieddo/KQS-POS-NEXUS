'use client'

import React, { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, Clock, Trash2, ShoppingCart, Package, DollarSign, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'order' | 'inventory' | 'system' | 'payment' | 'customer'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      category: 'inventory',
      title: 'Low Stock Alert',
      message: 'Premium Cotton T-Shirt is running low on stock (5 units remaining)',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'success',
      category: 'order',
      title: 'Online Order Received',
      message: 'New order #12345 from John Smith - 3 items, Total: $89.99',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'urgent'
    },
    {
      id: '3',
      type: 'success',
      category: 'payment',
      title: 'Payment Successful',
      message: 'Order #12344 has been completed successfully via credit card',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'info',
      category: 'system',
      title: 'System Update',
      message: 'POS system has been updated to version 2.1.0 with new features',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'error',
      category: 'payment',
      title: 'Payment Processor Issue',
      message: 'Temporary connection issue with payment processor. Cash payments only.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      priority: 'high'
    },
    {
      id: '6',
      type: 'info',
      category: 'customer',
      title: 'Customer Feedback',
      message: 'New 5-star review received for Premium Cotton T-Shirt',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const getNotificationIcon = (category: Notification['category']) => {
    switch (category) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      case 'inventory':
        return <Package className="h-5 w-5 text-orange-500" />
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />
      case 'system':
        return <Wifi className="h-5 w-5 text-purple-500" />
      case 'customer':
        return <Info className="h-5 w-5 text-cyan-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 ring-2 ring-red-100'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-gray-500 bg-gray-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityLabel = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">URGENT</span>
      case 'high':
        return <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">HIGH</span>
      case 'medium':
        return <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">MEDIUM</span>
      case 'low':
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">LOW</span>
      default:
        return null
    }
  }

  const getCategoryLabel = (category: Notification['category']) => {
    switch (category) {
      case 'order':
        return 'Orders'
      case 'inventory':
        return 'Inventory'
      case 'payment':
        return 'Payments'
      case 'system':
        return 'System'
      case 'customer':
        return 'Customers'
      default:
        return 'Other'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length

  const filteredNotifications = selectedCategory === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All', count: notifications.length },
    { id: 'order', name: 'Orders', count: notifications.filter(n => n.category === 'order').length },
    { id: 'inventory', name: 'Inventory', count: notifications.filter(n => n.category === 'inventory').length },
    { id: 'payment', name: 'Payments', count: notifications.filter(n => n.category === 'payment').length },
    { id: 'system', name: 'System', count: notifications.filter(n => n.category === 'system').length },
    { id: 'customer', name: 'Customers', count: notifications.filter(n => n.category === 'customer').length }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {unreadCount} unread
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {urgentCount} urgent
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-3 text-xs"
                disabled={unreadCount === 0}
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                disabled={notifications.length === 0}
              >
                Clear all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-4 flex items-center space-x-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-7 px-3 text-xs font-medium rounded-full'
                    : 'hover:bg-gray-100 text-gray-700 h-7 px-3 text-xs rounded-full'
                }
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No notifications in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'ring-2 ring-blue-100 shadow-sm' : ''
                  } transition-all duration-200 hover:shadow-md`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {getPriorityLabel(notification.priority)}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {getCategoryLabel(notification.category)}
                          </span>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <Button
            className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-12 text-sm font-semibold"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
} 