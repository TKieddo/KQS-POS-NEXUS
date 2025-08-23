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
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  {
    name: 'POS',
    href: '/pos',
    icon: ShoppingCart,
    description: 'Point of Sale'
  },
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
    name: 'Receipts',
    href: '/pos/receipts',
    icon: Receipt,
    description: 'Receipt History'
  },
  {
    name: 'Settings',
    href: '/pos/settings',
    icon: Settings,
    description: 'POS Settings'
  }
]

export const POSNavigation: React.FC = () => {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">KQS</span>
          </div>
          <h1 className="text-lg font-bold text-[hsl(var(--primary))]">POS</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
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
        <Link href="/admin">
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
  )
} 