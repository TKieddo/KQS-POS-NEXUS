import * as React from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import type { VariantOption } from '@/lib/variant-services'

export interface ExpandablePillSelectorProps {
  options: VariantOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  onAddNewOption?: (value: string, type: string) => Promise<boolean>
  label: string
  className?: string
  maxVisible?: number
  type: 'size' | 'color' | 'gender' | 'brand' | 'style'
}

const ExpandablePillSelector = ({
  options,
  selectedValues,
  onSelectionChange,
  onAddNewOption,
  label,
  className,
  maxVisible = 6,
  type
}: ExpandablePillSelectorProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [newOptionValue, setNewOptionValue] = React.useState('')

  const visibleOptions = isExpanded ? options : options.slice(0, maxVisible)
  const hasMoreOptions = options.length > maxVisible

  const handleOptionClick = (option: VariantOption) => {
    // Only add the option if it's not already selected
    if (!selectedValues.includes(option.value)) {
      onSelectionChange([...selectedValues, option.value])
    }
  }

  const handleAddNewOption = async () => {
    if (newOptionValue.trim() && onAddNewOption) {
      try {
        const success = await onAddNewOption(newOptionValue.trim(), type)
        if (success) {
          setNewOptionValue('')
          setShowAddForm(false)
        } else {
          alert(`Failed to add new ${label.toLowerCase()}. Please try again.`)
        }
      } catch (error) {
        console.error('Error adding new option:', error)
        alert(`Failed to add new ${label.toLowerCase()}. Please try again.`)
      }
    }
  }

  const getPillColor = (isSelected: boolean, type: string) => {
    if (isSelected) {
      switch (type) {
        case 'size': return 'bg-green-100 border-green-400 text-green-700'
        case 'color': return 'bg-purple-100 border-purple-400 text-purple-700'
        case 'gender': return 'bg-blue-100 border-blue-400 text-blue-700'
        case 'brand': return 'bg-orange-100 border-orange-400 text-orange-700'
        case 'style': return 'bg-indigo-100 border-indigo-400 text-indigo-700'
        default: return 'bg-gray-100 border-gray-400 text-gray-700'
      }
    }
    return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      
      <div className="space-y-2">
        {/* Selected options display */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map(value => {
              const option = options.find(opt => opt.value === value)
              return (
                <span
                  key={value}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium",
                    getPillColor(true, type)
                  )}
                >
                  {option?.label || value}
                  <button
                    type="button"
                    onClick={() => onSelectionChange(selectedValues.filter(v => v !== value))}
                    className="text-current hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* Available options */}
        <div className="flex flex-wrap gap-1">
          {visibleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={cn(
                "px-2 py-1 rounded-full border text-xs font-medium transition-all",
                getPillColor(selectedValues.includes(option.value), type)
              )}
            >
              {option.label}
            </button>
          ))}
          
          {/* See more button */}
          {hasMoreOptions && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="px-2 py-1 rounded-full border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              +{options.length - maxVisible} more
            </button>
          )}

          {/* Add new option button */}
          {onAddNewOption && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-2 py-1 rounded-full border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add {label}
            </button>
          )}
        </div>

        {/* Add new option form */}
        {showAddForm && onAddNewOption && (
          <div className="flex gap-1 items-center">
            <PremiumInput
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder={`Enter new ${label.toLowerCase()}`}
              className="flex-1 h-7 text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewOption()}
            />
            <PremiumButton
              onClick={handleAddNewOption}
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={!newOptionValue.trim()}
            >
              Add
            </PremiumButton>
            <PremiumButton
              variant="outline"
              onClick={() => {
                setShowAddForm(false)
                setNewOptionValue('')
              }}
              size="sm"
              className="h-7 px-2 text-xs"
            >
              Cancel
            </PremiumButton>
          </div>
        )}
      </div>
    </div>
  )
}

ExpandablePillSelector.displayName = 'ExpandablePillSelector'

export { ExpandablePillSelector } 