'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'
import { Input } from './input'

interface FilterOption {
  value: string
  label: string
}

interface SearchFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  filters?: {
    value: string
    onChange: (value: string) => void
    options: FilterOption[]
    placeholder?: string
  }[]
  className?: string
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  className = ''
}) => {
  return (
    <div className={`bg-white/60 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 transition-all duration-200 text-xs"
              />
            </div>
          </div>
          
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] h-8"
              >
                {filter.placeholder && (
                  <option value="">{filter.placeholder}</option>
                )}
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 