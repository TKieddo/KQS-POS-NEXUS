import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content?: ReactNode
}

interface PremiumTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

export const PremiumTabs = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className = ''
}: PremiumTabsProps) => {
  const variantClasses = {
    default: {
      container: "flex space-x-1 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-2xl border border-gray-200/50 backdrop-blur-sm",
      tab: "flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300",
      active: "bg-white text-gray-900 shadow-lg shadow-gray-200/50 border border-gray-200/30",
      inactive: "text-gray-600 hover:text-gray-900 hover:bg-white/50"
    },
    pills: {
      container: "flex space-x-2 p-1",
      tab: "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
      active: "bg-blue-600 text-white shadow-lg shadow-blue-200/50",
      inactive: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    },
    underline: {
      container: "flex space-x-8 border-b border-gray-200",
      tab: "py-3 px-1 text-sm font-medium transition-all duration-300 border-b-2",
      active: "border-blue-600 text-blue-600",
      inactive: "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
    }
  }

  const classes = variantClasses[variant]

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={classes.container}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              classes.tab,
              activeTab === tab.id ? classes.active : classes.inactive
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabs.find(tab => tab.id === activeTab)?.content && (
        <div className="mt-6">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      )}
    </div>
  )
} 