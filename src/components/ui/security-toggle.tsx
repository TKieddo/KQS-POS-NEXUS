import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@headlessui/react"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"

export interface SecurityToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  title: string
  description: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  variant?: 'default' | 'warning' | 'success'
  className?: string
}

const SecurityToggle = React.forwardRef<HTMLDivElement, SecurityToggleProps>(
  ({ 
    enabled, 
    onToggle, 
    title, 
    description, 
    icon = <Shield className="h-5 w-5" />,
    disabled = false,
    loading = false,
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    const handleToggle = () => {
      if (!disabled && !loading) {
        onToggle(!enabled)
      }
    }

    const getVariantStyles = () => {
      switch (variant) {
        case 'warning':
          return {
            container: 'border-orange-200 bg-orange-50',
            icon: 'text-orange-600',
            title: 'text-orange-900',
            description: 'text-orange-700'
          }
        case 'success':
          return {
            container: 'border-green-200 bg-green-50',
            icon: 'text-green-600',
            title: 'text-green-900',
            description: 'text-green-700'
          }
        default:
          return {
            container: 'border-gray-200 bg-gray-50',
            icon: 'text-gray-600',
            title: 'text-gray-900',
            description: 'text-gray-700'
          }
      }
    }

    const variantStyles = getVariantStyles()

    return (
      <div
        ref={ref}
        className={cn(
          "relative p-4 border rounded-xl transition-all duration-200",
          variantStyles.container,
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={cn("mt-0.5", variantStyles.icon)}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  "text-sm font-semibold leading-6",
                  variantStyles.title
                )}>
                  {title}
                </h3>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
              </div>
              <p className={cn(
                "mt-1 text-sm leading-5",
                variantStyles.description
              )}>
                {description}
              </p>
            </div>
          </div>
          
          <Switch
            checked={enabled}
            onChange={handleToggle}
            disabled={disabled || loading}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
              enabled 
                ? "bg-[#E5FF29] focus:ring-[#E5FF29]" 
                : "bg-gray-200 focus:ring-gray-500",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                enabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </Switch>
        </div>
        
        {enabled && variant === 'warning' && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-orange-700">
            <AlertTriangle className="h-3 w-3" />
            <span>This setting may affect user experience</span>
          </div>
        )}
        
        {enabled && variant === 'success' && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-green-700">
            <CheckCircle className="h-3 w-3" />
            <span>Security feature is active</span>
          </div>
        )}
      </div>
    )
  }
)

SecurityToggle.displayName = "SecurityToggle"

export { SecurityToggle } 