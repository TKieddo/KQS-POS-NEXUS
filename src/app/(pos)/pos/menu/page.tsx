'use client'

import React from 'react'
import { MenuCard } from '@/features/pos/components/MenuCard'
import { ArrowLeft, Truck, FileText, DollarSign, CreditCard, FolderOpen, Package, MessageSquare, User, Search, Wallet, Receipt, BarChart3, PiggyBank, Printer, RotateCcw, Edit, HelpCircle, ArrowUpRight, Globe, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type CardColor = 'green' | 'yellow' | 'blue' | 'purple' | 'pink' | 'orange' | 'black'

interface MenuItem {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  route: string
  color: CardColor
}

export default function MenuPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/pos/branch-select')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems: MenuItem[] = [
    // Row 1 - Green cards
    {
      id: 'deliveries',
      title: 'Deliveries',
      icon: <Truck className="h-8 w-8" />,
      description: 'Manage delivery orders',
      route: '/pos/deliveries',
      color: 'green'
    },
    {
      id: 'convert-sale-to-quote',
      title: 'Convert Sale To Quote',
      icon: <FileText className="h-8 w-8" />,
      description: 'Convert current sale to quote',
      route: '/pos/convert-quote',
      color: 'yellow'
    },
    {
      id: 'convert-sale-to-quote-from-list',
      title: 'Convert Sale To Quote (From List)',
      icon: <FileText className="h-8 w-8" />,
      description: 'Convert completed sale to quote',
      route: '/pos/convert-sale-to-quote',
      color: 'orange'
    },
    {
      id: 'convert-quote-to-sale',
      title: 'Convert Quote to Sale',
      icon: <DollarSign className="h-8 w-8" />,
      description: 'Convert quote to sale',
      route: '/pos/convert-quote-to-sale',
      color: 'blue'
    },
    {
      id: 'convert-sale-to-laybye',
      title: 'Convert Sale To Lay-By Contract',
      icon: <FileText className="h-8 w-8" />,
      description: 'Convert sale to lay-bye',
      route: '/pos/convert-sale-to-laybye',
      color: 'purple'
    },
    {
      id: 'laybye-payments',
      title: 'Lay-By Payments and Cancellations',
      icon: <CreditCard className="h-8 w-8" />,
      description: 'Manage lay-bye payments',
      route: '/pos/laybye-payments',
      color: 'pink'
    },

    // Row 2 - Yellow cards
    {
      id: 'start-job',
      title: 'Start a Job',
      icon: <FolderOpen className="h-8 w-8" />,
      description: 'Start new job',
      route: '/pos/jobs/start',
      color: 'yellow'
    },
    {
      id: 'invoice-job',
      title: 'Invoice a Job',
      icon: <FileText className="h-8 w-8" />,
      description: 'Create job invoice',
      route: '/pos/jobs/invoice',
      color: 'green'
    },
    {
      id: 'new-customer-order',
      title: 'New Customer Order',
      icon: <Package className="h-8 w-8" />,
      description: 'Create customer order',
      route: '/pos/customer-orders/new',
      color: 'blue'
    },
    {
      id: 'customer-orders',
      title: 'Customer Orders',
      icon: <Package className="h-8 w-8" />,
      description: 'View customer orders',
      route: '/pos/customer-orders',
      color: 'purple'
    },
    {
      id: 'online-orders',
      title: 'Online Orders',
      icon: <Globe className="h-8 w-8" />,
      description: 'Manage website orders',
      route: '/pos/online-orders',
      color: 'green'
    },
    {
      id: 'add-note',
      title: 'Add Note to Sale Item',
      icon: <MessageSquare className="h-8 w-8" />,
      description: 'Add notes to items',
      route: '/pos/notes',
      color: 'pink'
    },

    // Row 3 - Blue cards
    {
      id: 'salesperson',
      title: 'Salesperson',
      icon: <User className="h-8 w-8" />,
      description: 'Manage salesperson',
      route: '/pos/salesperson',
      color: 'blue'
    },
    {
      id: 'product-lookup',
      title: 'Product Lookup',
      icon: <Search className="h-8 w-8" />,
      description: 'Search products',
      route: '/pos/product-lookup',
      color: 'green'
    },
    {
      id: 'cash-up',
      title: 'Cash Up (Close Drawer)',
      icon: <Wallet className="h-8 w-8" />,
      description: 'Close cash drawer',
      route: '/pos/cashup',
      color: 'yellow'
    },
    {
      id: 'account-payment',
      title: 'Account Payment',
      icon: <CreditCard className="h-8 w-8" />,
      description: 'Process account payments',
      route: '/pos/account-payment',
      color: 'purple'
    },
    {
      id: 'customer-statements',
      title: 'Customer Statements',
      icon: <BarChart3 className="h-8 w-8" />,
      description: 'View customer statements',
      route: '/pos/statements',
      color: 'pink'
    },

    // Row 4 - Purple cards
    {
      id: 'till-session-report',
      title: 'Till Session Report',
      icon: <BarChart3 className="h-8 w-8" />,
      description: 'View till reports',
      route: '/pos/reports/till-session',
      color: 'purple'
    },
    {
      id: 'cash-drop',
      title: 'Cash Drop',
      icon: <PiggyBank className="h-8 w-8" />,
      description: 'Process cash drops',
      route: '/pos/cash-drop',
      color: 'green'
    },
    {
      id: 'withdraw-cash',
      title: 'Withdraw Cash / Petty Cash',
      icon: <DollarSign className="h-8 w-8" />,
      description: 'Withdraw petty cash',
      route: '/pos/withdraw-cash',
      color: 'yellow'
    },
    {
      id: 'reprint-slip',
      title: 'Reprint Slip (History)',
      icon: <Printer className="h-8 w-8" />,
      description: 'Reprint receipts',
      route: '/pos/reprint',
      color: 'blue'
    },
    {
      id: 'refund-item',
      title: 'Refund Item',
      icon: <RotateCcw className="h-8 w-8" />,
      description: 'Refund individual items',
      route: '/pos/refunds/item',
      color: 'pink'
    },

    // Row 5 - Pink cards
    {
      id: 'refund-sale',
      title: 'Refund Sale',
      icon: <RotateCcw className="h-8 w-8" />,
      description: 'Refund entire sale',
      route: '/pos/refunds/sale',
      color: 'pink'
    },
    {
      id: 'open-cash-drawer',
      title: 'Open Electronic Cash Drawer',
      icon: <Wallet className="h-8 w-8" />,
      description: 'Open cash drawer',
      route: '/pos/cash-drawer',
      color: 'green'
    },

    {
      id: 'edit-sale',
      title: 'Edit Sale / Redo Payment',
      icon: <Edit className="h-8 w-8" />,
      description: 'Edit sales and payments',
      route: '/pos/edit-sale',
      color: 'blue'
    },
    {
      id: 'online-help',
      title: 'Online Help',
      icon: <HelpCircle className="h-8 w-8" />,
      description: 'Access help system',
      route: '/pos/help',
      color: 'purple'
    },

    // Admin Dashboard Card - Prominent placement
    {
      id: 'admin-dashboard',
      title: 'Go to Admin Dashboard',
      icon: <Settings className="h-8 w-8" />,
      description: 'Access admin panel',
      route: '/admin',
      color: 'orange'
    },

    // Sign Out Card - Black card
    {
      id: 'sign-out',
      title: 'Sign Out',
      icon: <LogOut className="h-8 w-8" />,
      description: 'Sign out of POS system',
      route: '', // Will be handled by onClick
      color: 'black'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pos')}
              className="text-gray-600 hover:bg-gray-100 h-10 px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to POS
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open('https://your-website.com', '_blank')}
              className="relative h-9 px-4 bg-black/90 backdrop-blur-sm text-white font-medium rounded-full shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:bg-black border border-[#E5FF29]/30 hover:border-[#E5FF29] group overflow-hidden"
            >
              {/* Floating particles effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-1 left-2 w-1 h-1 bg-[#E5FF29] rounded-full animate-pulse"></div>
                <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-[#E5FF29] rounded-full animate-ping"></div>
                <div className="absolute bottom-1 left-4 w-0.5 h-0.5 bg-[#E5FF29] rounded-full animate-bounce"></div>
              </div>
              
              {/* Magnetic glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E5FF29]/0 via-[#E5FF29]/5 to-[#E5FF29]/0 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md"></div>
              
              {/* Content with floating animation */}
              <div className="relative flex items-center space-x-2 group-hover:animate-pulse">
                <div className="relative">
                  <Globe className="h-4 w-4 text-[#E5FF29] group-hover:animate-spin group-hover:scale-110 transition-all duration-500" />
                  {/* Orbital rings */}
                  <div className="absolute inset-0 rounded-full border border-[#E5FF29]/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 scale-150"></div>
                  <div className="absolute inset-0 rounded-full border border-[#E5FF29]/10 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700 scale-200 delay-100"></div>
                </div>
                <span className="text-xs font-bold tracking-wider group-hover:text-[#E5FF29] transition-colors duration-300">WEB</span>
                
                {/* Pulsing dot */}
                <div className="w-1 h-1 bg-[#E5FF29] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300"></div>
              </div>
              
              {/* Energy wave effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#E5FF29]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
              
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#E5FF29]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#E5FF29]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Menu Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 gap-6">
            {menuItems.map((item) => (
              <MenuCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                description={item.description}
                color={item.color}
                onClick={() => {
                  if (item.id === 'sign-out') {
                    handleSignOut()
                  } else {
                    router.push(item.route)
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 