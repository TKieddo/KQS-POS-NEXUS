import * as React from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumInput } from '@/components/ui/premium-input'
import type { VariantOption } from '@/lib/variant-options'

export interface VariantSelectorProps {
  options: VariantOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  label: string
  placeholder?: string
  className?: string
  multiple?: boolean
}

const VariantSelector = ({
  options,
  selectedValues,
  onSelectionChange,
  label,
  placeholder = "Search options...",
  className,
  multiple = true
}: VariantSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOptionClick = (option: VariantOption) => {
    if (multiple) {
      const newSelection = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value]
      onSelectionChange(newSelection)
    } else {
      onSelectionChange([option.value])
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleRemoveSelection = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value))
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("relative", className)}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Selected values display */}
        <div 
          className="min-h-8 p-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between text-xs"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedValues.length > 0 ? (
              selectedValues.map(value => {
                const option = options.find(opt => opt.value === value)
                return (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >
                    {option?.label || value}
                    {multiple && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveSelection(value)
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    )}
                  </span>
                )
              })
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn("h-3 w-3 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <PremiumInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-7 pl-7 text-xs border-0 focus:ring-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-32 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors",
                      selectedValues.includes(option.value) && "bg-blue-50 text-blue-700"
                    )}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

VariantSelector.displayName = 'VariantSelector'

export { VariantSelector } 