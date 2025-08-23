import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomerFilter as CustomerFilterType } from '../types'

interface CustomerFilterProps {
  filter: CustomerFilterType
  onFilterChange: (filter: CustomerFilterType) => void
  onClearFilters: () => void
}

export const CustomerFilter = ({ filter, onFilterChange, onClearFilters }: CustomerFilterProps) => {
  const hasActiveFilters = 
    filter.search ||
    filter.status !== 'all' ||
    filter.customerType !== 'all' ||
    filter.creditStatus !== 'all' ||
    filter.loyaltyTier !== 'all'

  const updateFilter = (updates: Partial<CustomerFilterType>) => {
    onFilterChange({ ...filter, ...updates })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers by name, email, phone, or customer number..."
          value={filter.search}
          onChange={(e) => updateFilter({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={filter.status}
            onChange={(e) => updateFilter({ status: e.target.value as any })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Customer Type Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <select
            value={filter.customerType}
            onChange={(e) => updateFilter({ customerType: e.target.value as any })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="regular">Regular</option>
            <option value="vip">VIP</option>
            <option value="wholesale">Wholesale</option>
          </select>
        </div>

        {/* Credit Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Credit:</span>
          <select
            value={filter.creditStatus}
            onChange={(e) => updateFilter({ creditStatus: e.target.value as any })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Credit Status</option>
            <option value="good">Good Standing</option>
            <option value="overdue">Overdue</option>
            <option value="at_limit">At Credit Limit</option>
          </select>
        </div>

        {/* Loyalty Tier Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Loyalty:</span>
          <select
            value={filter.loyaltyTier}
            onChange={(e) => updateFilter({ loyaltyTier: e.target.value as any })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center space-x-1"
          >
            <X className="h-3 w-3" />
            <span>Clear Filters</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          
          {filter.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filter.search}"
              <button
                onClick={() => updateFilter({ search: '' })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filter.status !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filter.status}
              <button
                onClick={() => updateFilter({ status: 'all' })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filter.customerType !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Type: {filter.customerType}
              <button
                onClick={() => updateFilter({ customerType: 'all' })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filter.creditStatus !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Credit: {filter.creditStatus}
              <button
                onClick={() => updateFilter({ creditStatus: 'all' })}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filter.loyaltyTier !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Loyalty: {filter.loyaltyTier}
              <button
                onClick={() => updateFilter({ loyaltyTier: 'all' })}
                className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
} 