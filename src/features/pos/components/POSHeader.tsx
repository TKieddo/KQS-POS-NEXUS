'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, Bell, Menu, Package, Globe, Clock, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/context/BranchContext'

import { NotificationsPanel } from './NotificationsPanel'
import { OnlineOrdersPanel } from './OnlineOrdersPanel'

interface Category {
  id: string
  name: string
  count: number
}

interface POSHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  cartItemCount: number
  categories: Category[]
  onResetOrder: () => void
  onOrderDetails: () => void
  onRefresh: () => void
  heldOrdersCount?: number
  onShowHeldOrders?: () => void
  onBarcodeScan?: (barcode: string) => void
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  cartItemCount,
  categories,
  onResetOrder,
  onOrderDetails,
  onRefresh,
  heldOrdersCount = 0,
  onShowHeldOrders
}) => {
  const router = useRouter()
  const { selectedBranch } = useBranch()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isOnlineOrdersOpen, setIsOnlineOrdersOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleResetOrder = () => {
    if (cartItemCount > 0) {
      if (confirm('Are you sure you want to reset the current order? This action cannot be undone.')) {
        onResetOrder()
      }
    } else {
      alert('No items in order to reset.')
    }
  }

  const handleOrderDetails = () => {
    if (cartItemCount > 0) {
      onOrderDetails()
    } else {
      alert('No items in order to view details.')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      // Show success feedback
      console.log('System refreshed successfully')
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleNotifications = () => {
    setIsNotificationsOpen(true)
  }

  const handleHeldOrders = () => {
    if (onShowHeldOrders) {
      onShowHeldOrders()
    }
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        {/* Main Header */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation and Branch */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-gray-600 h-8 px-3"
                  onClick={() => router.push('/pos/menu')}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </Button>
                <Button variant="default" className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-8 px-3 font-medium">
                  POS
                </Button>
              </div>
                              {/* Branch Display - Read Only */}
                <div className="flex items-center space-x-3">
                  <Store className={`h-5 w-5 ${selectedBranch ? 'text-gray-600' : 'text-red-500'}`} />
                  <div
                    className={`h-9 px-4 text-sm font-semibold flex items-center rounded-md border ${
                      selectedBranch?.id === '00000000-0000-0000-0000-000000000001'
                        ? 'text-blue-700 border-blue-300 bg-blue-50'
                        : selectedBranch 
                        ? 'text-gray-700 border-gray-300 bg-gray-50' 
                        : 'text-red-700 border-red-300 bg-red-50'
                    }`}
                  >
                    {selectedBranch?.name || '⚠️ No Branch Selected'}
                    {selectedBranch && (
                      <div className={`ml-2 w-2 h-2 rounded-full ${
                        selectedBranch.id === '00000000-0000-0000-0000-000000000001' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                    )}
                  </div>
                </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white h-9"
                />
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-gray-100 relative"
                onClick={handleNotifications}
              >
                <Bell className="h-4 w-4" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs relative"
                onClick={handleHeldOrders}
              >
                <Clock className="h-3 w-3 mr-1" />
                Held Orders
                {heldOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#E5FF29] rounded-full text-xs text-black flex items-center justify-center font-bold">
                    {heldOrdersCount}
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={handleOrderDetails}
              >
                Order Details
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={handleResetOrder}
              >
                Reset Order
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setIsOnlineOrdersOpen(true)}
              >
                <Package className="h-3 w-3 mr-1" />
                Online Orders
              </Button>

            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-4 flex items-center justify-between bg-black px-4 py-2 w-screen -ml-8 -mr-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-sm font-semibold text-white">Products</h2>
              <div className="flex items-center space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onCategoryChange(category.id)}
                    className={
                      selectedCategory === category.id
                        ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-6 px-2 text-xs font-medium rounded-full'
                        : 'hover:bg-gray-800 text-white h-6 px-2 text-xs rounded-full'
                    }
                  >
                    {category.name} {category.count}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-3 text-xs font-medium border-white/20 text-white hover:bg-white hover:text-black transition-colors"
              onClick={() => window.open('https://your-website.com', '_blank')}
              title="Visit Website"
            >
              <Globe className="h-3 w-3 mr-1" />
              Website
            </Button>
          </div>
        </div>
      </div>



      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

            {/* Online Orders Panel */}
      <OnlineOrdersPanel 
        isOpen={isOnlineOrdersOpen} 
        onClose={() => setIsOnlineOrdersOpen(false)} 
      />
    </>
  )
} 