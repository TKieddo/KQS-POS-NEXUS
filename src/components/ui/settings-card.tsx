// Settings Card Component
// Provides a consistent layout for settings sections

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

export interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "outlined" | "elevated"
  padding?: "sm" | "md" | "lg"
  collapsible?: boolean
  defaultCollapsed?: boolean
  children: React.ReactNode
}

const SettingsCard = React.forwardRef<HTMLDivElement, SettingsCardProps>(
  ({ 
    className, 
    title, 
    description, 
    icon, 
    variant = "default", 
    padding = "md",
    collapsible = false,
    defaultCollapsed = false,
    children, 
    ...props 
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

    const paddingClasses = {
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    }

    const variantClasses = {
      default: "bg-white border border-gray-200 shadow-sm",
      outlined: "bg-white border-2 border-gray-200 shadow-none",
      elevated: "bg-white border border-gray-200 shadow-lg"
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {(title || description || icon) && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="flex-shrink-0 text-blue-600">
                    {icon}
                  </div>
                )}
                <div className="flex-1">
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              {collapsible && (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                  <svg
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isCollapsed ? "rotate-180" : ""
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className={cn(
          "transition-all duration-200",
          collapsible && isCollapsed ? "hidden" : "block"
        )}>
          {children}
        </div>
      </Card>
    )
  }
)

SettingsCard.displayName = "SettingsCard"

export { SettingsCard } 