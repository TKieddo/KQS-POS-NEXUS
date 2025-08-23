'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingCart, 
  DollarSign, 
  RefreshCw, 
  Settings, 
  BarChart3,
  Users,
  Receipt,
  Home,
  X,
  Lock,
  Edit,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface POSMenuSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  {
    name: 'Cashup',
    href: '/pos/cashup',
    icon: DollarSign,
    description: 'End of Day'
  },
  {
    name: 'Refunds',
    href: '/pos/refunds',
    icon: RefreshCw,
    description: 'Returns & Exchanges'
  },
  {
    name: 'Customers',
    href: '/pos/customers',
    icon: Users,
    description: 'Customer Management'
  },
  {
    name: 'Reports',
    href: '/pos/reports',
    icon: BarChart3,
    description: 'Sales Reports'
  },
  {
    name: 'Receipts & Reprint',
    href: '/pos/receipts',
    icon: Receipt,
    description: 'Receipt History & Reprint'
  },
  {
    name: 'Cash Drawer',
    href: '/pos/cash-drawer',
    icon: Lock,
    description: 'Drawer Control'
  },
  {
    name: 'Edit Sales',
    href: '/pos/edit-sales',
    icon: Edit,
    description: 'Modify Transactions'
  },
  {
    name: 'Help',
    href: '/pos/help',
    icon: BookOpen,
    description: 'Online Help'
  },
  {
    name: 'Settings',
    href: '/pos/settings',
    icon: Settings,
    description: 'POS Settings'
  }
]

export const POSMenuSidebar: React.FC<POSMenuSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">KQS</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Menu</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start h-12 ${
                    isActive 
                      ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/admin" onClick={onClose}>
            <Button
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
} 