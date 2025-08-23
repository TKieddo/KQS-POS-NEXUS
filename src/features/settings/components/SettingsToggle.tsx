import React from 'react'
import { cn } from '@/lib/utils'

interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
  icon: Icon
}) => {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        <div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5FF29] focus:ring-offset-2",
          checked ? "bg-black" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )
} 