import React from 'react'
import { cn } from '@/lib/utils'
import { PremiumInput } from '@/components/ui/premium-input'

interface SettingsFieldProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel'
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helpText?: string
  icon?: React.ComponentType<{ className?: string }>
  suffix?: string
  prefix?: string
  min?: number
  max?: number
  step?: number
}

export const SettingsField: React.FC<SettingsFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  className,
  helpText,
  icon: Icon,
  suffix,
  prefix,
  min,
  max,
  step
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        
        {prefix && (
          <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
            {prefix}
          </div>
        )}
        
        <PremiumInput
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "h-8 text-sm px-2.5",
            Icon && "pl-8",
            prefix && "pl-10",
            suffix && "pr-10"
          )}
          min={min}
          max={max}
          step={step}
        />
        
        {suffix && (
          <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
            {suffix}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
} 