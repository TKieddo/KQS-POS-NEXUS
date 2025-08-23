import React from 'react'
import Link from 'next/link'
import { 
  Settings, 
  CreditCard, 
  Lock, 
  Printer, 
  Star, 
  Palette, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Building,
  Globe,
  Bell,
  Database,
  FileText,
  Monitor,
  Package
} from 'lucide-react'

interface SettingsLink {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  description: string
  category: 'business' | 'system' | 'advanced'
}

const settingsLinks: SettingsLink[] = [
  // Business Settings
  { 
    label: 'Business Info', 
    icon: Building, 
    href: '/admin/settings/business-info',
    description: 'Manage business details and contact information',
    category: 'business'
  },
  { 
    label: 'General', 
    icon: Globe, 
    href: '/admin/settings/general',
    description: 'Configure currency, language, and regional settings',
    category: 'business'
  },
  { 
    label: 'Payment Options', 
    icon: CreditCard, 
    href: '/admin/settings/payment-options',
    description: 'Set up payment methods and processors',
    category: 'business'
  },
  { 
    label: 'Sales Tax', 
    icon: DollarSign, 
    href: '/admin/settings/sales-tax',
    description: 'Configure tax rates and tax display',
    category: 'business'
  },
  { 
    label: 'Loyalty Program', 
    icon: Star, 
    href: '/admin/settings/loyalty',
    description: 'Set up customer loyalty and rewards',
    category: 'business'
  },
  { 
    label: 'Product & Pricing', 
    icon: ShoppingCart, 
    href: '/admin/settings/product-pricing',
    description: 'Configure product pricing rules and discounts',
    category: 'business'
  },
  { 
    label: 'Products Management', 
    icon: Package, 
    href: '/admin/settings/products',
    description: 'Manage products, categories, brands, and product variants',
    category: 'business'
  },
  { 
    label: 'Branch Receipts', 
    icon: FileText, 
    href: '/admin/settings/branch-receipts',
    description: 'Manage receipt templates and business info per branch',
    category: 'business'
  },
  { 
    label: 'POS Settings', 
    icon: Monitor, 
    href: '/admin/settings/pos',
    description: 'Configure POS interface settings, laybye duration, and cashier options',
    category: 'business'
  },
  
  // System Settings
  { 
    label: 'Security Settings', 
    icon: Lock, 
    href: '/admin/settings/security',
    description: 'Configure authentication and security policies',
    category: 'system'
  },
  { 
    label: 'Till & Cash', 
    icon: DollarSign, 
    href: '/admin/settings/till-cash',
    description: 'Manage till operations and cash handling',
    category: 'system'
  },
  { 
    label: 'User Management', 
    icon: Users, 
    href: '/admin/settings/user-management',
    description: 'Manage user accounts and permissions',
    category: 'system'
  },
  { 
    label: 'Receipts', 
    icon: FileText, 
    href: '/admin/receipts',
    description: 'Manage receipt templates and previews',
    category: 'system'
  },
  { 
    label: 'Printers', 
    icon: Printer, 
    href: '/admin/printers',
    description: 'Configure and manage printers',
    category: 'system'
  },
  { 
    label: 'Notifications & Integrations', 
    icon: Bell, 
    href: '/admin/settings/notifications-integrations',
    description: 'Set up notifications and third-party integrations',
    category: 'system'
  },
  { 
    label: 'Reports & Export', 
    icon: FileText, 
    href: '/admin/settings/reports-export',
    description: 'Configure report generation and data export',
    category: 'system'
  },
  
  // Advanced Settings
  { 
    label: 'Data Management', 
    icon: Database, 
    href: '/admin/settings/data-management',
    description: 'Backup, restore, and manage data',
    category: 'advanced'
  },
  { 
    label: 'Advanced', 
    icon: Settings, 
    href: '/admin/settings/advanced',
    description: 'Advanced system configuration options',
    category: 'advanced'
  }
]

interface SettingsHomeProps {
  className?: string
}

export const SettingsHome: React.FC<SettingsHomeProps> = ({ className }) => {
  const businessSettings = settingsLinks.filter(link => link.category === 'business')
  const systemSettings = settingsLinks.filter(link => link.category === 'system')
  const advancedSettings = settingsLinks.filter(link => link.category === 'advanced')

  const renderSettingsSection = (title: string, links: SettingsLink[]) => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(({ label, icon: Icon, href, description }) => (
          <Link href={href} key={label}>
            <div className="group rounded-xl p-4 shadow-sm border border-gray-700 bg-black hover:shadow-lg hover:shadow-[#E5FF29]/10 transition-all duration-200 hover:scale-[1.01] cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-[#E5FF29] flex items-center justify-center group-hover:bg-[#E5FF29]/90 transition-colors">
                    <Icon className="h-5 w-5 text-black" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#E5FF29] transition-colors">
                    {label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[#E5FF29] flex items-center justify-center">
            <Settings className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings & Configuration</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage every aspect of your POS system. Update business info, control user access, customize receipts, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {renderSettingsSection('Business Settings', businessSettings)}
        {renderSettingsSection('System Settings', systemSettings)}
        {renderSettingsSection('Advanced Settings', advancedSettings)}
      </div>

      {/* Quick Actions */}
      <div className="bg-black rounded-xl p-4 border border-gray-700">
        <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-[#E5FF29] hover:shadow-sm hover:shadow-[#E5FF29]/10 transition-all">
            <div className="w-6 h-6 rounded bg-[#E5FF29] flex items-center justify-center">
              <BarChart3 className="h-3 w-3 text-black" />
            </div>
            <span className="text-xs font-medium text-gray-900">View Reports</span>
          </button>
          <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-[#E5FF29] hover:shadow-sm hover:shadow-[#E5FF29]/10 transition-all">
            <div className="w-6 h-6 rounded bg-[#E5FF29] flex items-center justify-center">
              <Database className="h-3 w-3 text-black" />
            </div>
            <span className="text-xs font-medium text-gray-900">Backup Data</span>
          </button>
          <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-[#E5FF29] hover:shadow-sm hover:shadow-[#E5FF29]/10 transition-all">
            <div className="w-6 h-6 rounded bg-[#E5FF29] flex items-center justify-center">
              <Users className="h-3 w-3 text-black" />
            </div>
            <span className="text-xs font-medium text-gray-900">Manage Users</span>
          </button>
          <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 hover:border-[#E5FF29] hover:shadow-sm hover:shadow-[#E5FF29]/10 transition-all">
            <div className="w-6 h-6 rounded bg-[#E5FF29] flex items-center justify-center">
              <Bell className="h-3 w-3 text-black" />
            </div>
            <span className="text-xs font-medium text-gray-900">Notifications</span>
          </button>
        </div>
      </div>
    </div>
  )
} 