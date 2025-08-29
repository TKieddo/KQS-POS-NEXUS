'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BranchSelector } from './BranchSelector'
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Star,
  PieChart,
  Activity,
  Award,
  Target,
  Crown,
  Gift,
  Printer,
  Building2
} from 'lucide-react'
import React from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: DollarSign,
  },
  {
    name: 'Inventory',
    href: '/admin/inventory',
    icon: DollarSign,
  },
  {
    name: 'Customer List',
    href: '/admin/customer-list',
    icon: Users,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Sales',
    href: '/admin/sales',
    icon: ShoppingCart,
  },
  {
    name: 'Lay-bye',
    href: '/admin/laybye',
    icon: Calendar,
  },
  {
    name: 'Refunds & Exchanges',
    href: '/admin/refunds',
    icon: RotateCcw,
  },
  {
    name: 'Printers',
    href: '/admin/printers',
    icon: Printer,
  },
  {
    name: 'Receipts',
    href: '/admin/receipts',
    icon: FileText,
  },
  {
    name: 'Branch Management',
    href: '/admin/branch-management',
    icon: Building2,
  },
  {
    name: 'Suppliers',
    href: '/admin/suppliers',
    icon: DollarSign,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: TrendingUp,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Branch Selector */}
        <div className="px-4">
          <BranchSelector />
        </div>
        
        {/* Navigation - Scrollable if needed */}
        <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Fixed Bottom User Info */}
      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">A</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@kqs.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
} 