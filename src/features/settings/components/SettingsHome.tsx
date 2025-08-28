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
  Package,
  Building2,
  Receipt,
  Calculator,
  Shield
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
    href: '/settings/business-info',
    description: 'Manage business details and contact information',
    category: 'business'
  },
  { 
    label: 'General', 
    icon: Globe, 
    href: '/settings/general',
    description: 'Configure currency, language, and regional settings',
    category: 'business'
  },
  { 
    label: 'Payment Options', 
    icon: CreditCard, 
    href: '/settings/payment-options',
    description: 'Set up payment methods and processors',
    category: 'business'
  },
  { 
    label: 'Sales Tax', 
    icon: DollarSign, 
    href: '/settings/sales-tax',
    description: 'Configure tax rates and tax display',
    category: 'business'
  },
  { 
    label: 'Loyalty Program', 
    icon: Star, 
    href: '/settings/loyalty',
    description: 'Set up customer loyalty and rewards',
    category: 'business'
  },
  { 
    label: 'Product & Pricing', 
    icon: ShoppingCart, 
    href: '/settings/product-pricing',
    description: 'Configure product pricing rules and discounts',
    category: 'business'
  },
  { 
    label: 'Products Management', 
    icon: Package, 
    href: '/settings/products',
    description: 'Manage products, categories, brands, and product variants',
    category: 'business'
  },
  { 
    label: 'Branch Receipts', 
    icon: FileText, 
    href: '/settings/branch-receipts',
    description: 'Manage receipt templates and business info per branch',
    category: 'business'
  },
  { 
    label: 'POS Settings', 
    icon: Monitor, 
    href: '/settings/pos',
    description: 'Configure POS interface settings, laybye duration, and cashier options',
    category: 'business'
  },
  
  // System Settings
  { 
    label: 'Security Settings', 
    icon: Lock, 
    href: '/settings/security',
    description: 'Manage user roles, permissions, and security policies',
    category: 'system'
  },
  { 
    label: 'User Management', 
    icon: Users, 
    href: '/settings/user-management',
    description: 'Manage users, employees, and access controls',
    category: 'system'
  },
  { 
    label: 'Printers', 
    icon: Printer, 
    href: '/settings/printers',
    description: 'Configure and test receipt printers',
    category: 'system'
  },
  { 
    label: 'Receipts', 
    icon: FileText, 
    href: '/receipts',
    description: 'Design and manage receipt templates and previews',
    category: 'system'
  },
  { 
    label: 'Notifications & Integrations', 
    icon: Bell, 
    href: '/settings/notifications-integrations',
    description: 'Configure notifications, email, SMS, and third-party integrations',
    category: 'system'
  },
  { 
    label: 'Reports & Export', 
    icon: BarChart3, 
    href: '/settings/reports-export',
    description: 'Configure report formats, export settings, and data delivery',
    category: 'system'
  },
  { 
    label: 'Data Management', 
    icon: Database, 
    href: '/settings/data-management',
    description: 'Backup, restore, and manage system data',
    category: 'system'
  },
  { 
    label: 'Till & Cash Management', 
    icon: DollarSign, 
    href: '/settings/till-cash',
    description: 'Configure till settings, cash handling, and cashup procedures',
    category: 'system'
  },
  
  // Advanced Settings
  { 
    label: 'Advanced Settings', 
    icon: Settings, 
    href: '/settings/advanced',
    description: 'Advanced system configuration and developer options',
    category: 'advanced'
  },
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