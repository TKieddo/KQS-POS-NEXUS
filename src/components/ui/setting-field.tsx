// Setting Field Component
// Handles different input types for settings with proper validation

import * as React from "react"
import { cn } from "@/lib/utils"
import { PremiumInput } from "./premium-input"
import { PremiumButton } from "./premium-button"
import { Check, Eye, EyeOff, Copy, RefreshCw } from "lucide-react"
import type { EffectiveSetting, SettingType } from "@/types/settings"
import { parseSettingValue, stringifySettingValue } from "@/lib/settings-service"

export interface SettingFieldProps {
  setting: EffectiveSetting
  value: string | number | boolean | object | null
  onChange: (value: string | number | boolean | object | null) => void
  error?: string
  disabled?: boolean
  showInheritance?: boolean
  onResetToGlobal?: () => void
  className?: string
}

const SettingField = React.forwardRef<HTMLDivElement, SettingFieldProps>(
  ({ 
    setting, 
    value, 
    onChange, 
    error, 
    disabled = false,
    showInheritance = true,
    onResetToGlobal,
    className,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [copied, setCopied] = React.useState(false)

    // Handle value changes
    const handleValueChange = (newValue: string | number | boolean | object | null) => {
      const stringValue = stringifySettingValue(newValue)
      onChange(newValue)
    }

    // Copy to clipboard
    const handleCopy = async () => {
      if (typeof value === 'string') {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (error) {
          console.error('Failed to copy to clipboard:', error)
        }
      }
    }

    // Reset to global value
    const handleReset = () => {
      if (onResetToGlobal) {
        onResetToGlobal()
      }
    }

    // Render different input types
    const renderInput = () => {
      const isPassword = setting.is_sensitive && setting.setting_type === 'string'
      const displayValue = isPassword && !showPassword ? '••••••••' : value

      switch (setting.setting_type) {
        case 'string':
          return (
            <div className="relative">
              <PremiumInput
                type={isPassword && !showPassword ? 'password' : 'text'}
                value={displayValue as string || ''}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={setting.description || `Enter ${setting.display_name.toLowerCase()}`}
                disabled={disabled}
                className={cn(
                  "pr-20",
                  error && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={disabled}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
                {typeof value === 'string' && value && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={disabled}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          )

        case 'number':
          return (
            <PremiumInput
              type="number"
              value={value as number || ''}
              onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
              placeholder={setting.description || `Enter ${setting.display_name.toLowerCase()}`}
              disabled={disabled}
              className={cn(
                error && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
          )

        case 'boolean':
          return (
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean || false}
                  onChange={(e) => handleValueChange(e.target.checked)}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className={cn(
                  "relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600",
                  disabled && "opacity-50 cursor-not-allowed"
                )} />
              </label>
              <span className="text-sm text-gray-600">
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          )

        case 'json':
          return (
            <div className="space-y-2">
              <textarea
                value={typeof value === 'object' ? JSON.stringify(value, null, 2) : (value as string || '')}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleValueChange(parsed)
                  } catch {
                    // Allow invalid JSON while typing
                    handleValueChange(e.target.value)
                  }
                }}
                placeholder={setting.description || 'Enter JSON data'}
                disabled={disabled}
                rows={4}
                className={cn(
                  "w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm",
                  error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                  disabled && "bg-gray-50 cursor-not-allowed"
                )}
              />
              {typeof value === 'object' && (
                <div className="flex items-center gap-2">
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={disabled}
                    className="text-xs"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </PremiumButton>
                </div>
              )}
            </div>
          )

        case 'date':
          return (
            <PremiumInput
              type="datetime-local"
              value={value as string || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={setting.description || `Select ${setting.display_name.toLowerCase()}`}
              disabled={disabled}
              className={cn(
                error && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
          )

        default:
          return (
            <PremiumInput
              value={value as string || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={setting.description || `Enter ${setting.display_name.toLowerCase()}`}
              disabled={disabled}
              className={cn(
                error && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
          )
      }
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {/* Label */}
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {setting.display_name}
            {setting.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {/* Inheritance indicator and actions */}
          <div className="flex items-center gap-2">
            {showInheritance && setting.is_override && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Override
              </span>
            )}
            {showInheritance && !setting.is_override && onResetToGlobal && (
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset
              </PremiumButton>
            )}
          </div>
        </div>

        {/* Input */}
        {renderInput()}

        {/* Description */}
        {setting.description && (
          <p className="text-xs text-gray-500">
            {setting.description}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Default value indicator */}
        {setting.default_value && value !== setting.default_value && (
          <p className="text-xs text-gray-400">
            Default: {setting.default_value}
          </p>
        )}
      </div>
    )
  }
)

SettingField.displayName = "SettingField"

export { SettingField } 