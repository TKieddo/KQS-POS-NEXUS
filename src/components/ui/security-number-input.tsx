import * as React from "react"
import { cn } from "@/lib/utils"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { PremiumInput } from "./premium-input"

export interface SecurityNumberInputProps {
  value: number
  onChange: (value: number) => void
  title: string
  description: string
  icon?: React.ReactNode
  placeholder?: string
  min?: number
  max?: number
  step?: number
  unit?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'default' | 'warning' | 'success'
  className?: string
  error?: string
}

const SecurityNumberInput = React.forwardRef<HTMLDivElement, SecurityNumberInputProps>(
  ({ 
    value, 
    onChange, 
    title, 
    description, 
    icon = <Shield className="h-5 w-5" />,
    placeholder,
    min = 0,
    max = 999,
    step = 1,
    unit,
    disabled = false,
    loading = false,
    variant = 'default',
    className,
    error,
    ...props 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value) || 0
      if (newValue >= min && newValue <= max) {
        onChange(newValue)
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
          error && "border-red-200 bg-red-50",
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3">
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
              "mt-1 text-sm leading-5 mb-3",
              variantStyles.description
            )}>
              {description}
            </p>
            
            <div className="flex items-center space-x-2">
              <PremiumInput
                type="number"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                disabled={disabled || loading}
                className="w-24"
                error={error}
              />
              {unit && (
                <span className="text-sm text-gray-600 font-medium">
                  {unit}
                </span>
              )}
            </div>
            
            {error && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-red-700">
                <AlertTriangle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
            
            {!error && variant === 'warning' && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-orange-700">
                <AlertTriangle className="h-3 w-3" />
                <span>Consider security implications</span>
              </div>
            )}
            
            {!error && variant === 'success' && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-green-700">
                <CheckCircle className="h-3 w-3" />
                <span>Security setting is optimal</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

SecurityNumberInput.displayName = "SecurityNumberInput"

export { SecurityNumberInput } 