import React from 'react'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
      {/* Section Header */}
      <div 
        className={cn(
          "p-4 border-b border-gray-100",
          collapsible && "cursor-pointer hover:bg-gray-50 transition-colors"
        )}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-6 h-6 rounded-lg bg-[#E5FF29] flex items-center justify-center">
                <Icon className="h-4 w-4 text-black" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="text-xs text-gray-600 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          
          {collapsible && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {isCollapsed ? 'Click to expand' : 'Click to collapse'}
              </span>
              <div className={cn(
                "w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full transition-transform",
                isCollapsed ? "rotate-0" : "rotate-180"
              )} />
            </div>
          )}
        </div>
      </div>

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  )
} 