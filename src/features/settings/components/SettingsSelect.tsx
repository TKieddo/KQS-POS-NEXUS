import React from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  description?: string
}

interface SettingsSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helpText?: string
  icon?: React.ComponentType<{ className?: string }>
  size?: 'sm' | 'md' | 'lg'
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className,
  helpText,
  icon: Icon,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-7 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-10 text-sm'
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-xs font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 rounded bg-[#E5FF29] flex items-center justify-center">
              <Icon className="h-2.5 w-2.5 text-black" />
            </div>
          </div>
        )}
        
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full px-2.5 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent bg-gray-900 text-white transition-colors",
            sizeClasses[size],
            Icon && "pl-8",
            error && "border-red-400 focus:ring-red-500 focus:border-red-400",
            disabled && "bg-gray-800 cursor-not-allowed text-gray-500"
          )}
        >
          <option value="" disabled className="bg-gray-900 text-white">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-900 text-white">
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  )
} 