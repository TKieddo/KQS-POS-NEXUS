import React from 'react'
import { Search, Filter, Calendar, User, CreditCard } from 'lucide-react'
import { RefundFilters as RefundFiltersType } from '../types'

interface RefundFiltersProps {
  filters: RefundFiltersType
  onFilterChange: (filters: RefundFiltersType) => void
  onNewRefund: () => void
  onExport: () => void
  onBulkApprove: () => void
}

export const RefundFilters: React.FC<RefundFiltersProps> = ({
  filters,
  onFilterChange,
  onNewRefund,
  onExport,
  onBulkApprove
}) => {
  const handleInputChange = (field: keyof RefundFiltersType, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search refunds, customers, or transaction IDs..."
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="appearance-none pl-8 pr-6 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white text-xs"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>

          {/* Refund Method Filter */}
          <div className="relative">
            <select
              value={filters.refundMethod}
              onChange={(e) => handleInputChange('refundMethod', e.target.value)}
              className="appearance-none pl-8 pr-6 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white text-xs"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="account_credit">Account Credit</option>
              <option value="loyalty_points">Loyalty Points</option>
              <option value="exchange_only">Exchange Only</option>
            </select>
            <CreditCard className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => handleInputChange('dateRange', e.target.value)}
              className="appearance-none pl-8 pr-6 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white text-xs"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onBulkApprove}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-100 transition-all duration-200 flex items-center space-x-1 text-xs"
          >
            <Filter className="w-3 h-3" />
            <span>Bulk Approve</span>
          </button>
          
          <button
            onClick={onExport}
            className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 flex items-center space-x-1 text-xs"
          >
            <Calendar className="w-3 h-3" />
            <span>Export</span>
          </button>
          
          <button
            onClick={onNewRefund}
            className="px-4 py-2 bg-black text-[#E5FF29] rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 flex items-center space-x-1 shadow-lg text-xs"
          >
            <User className="w-3 h-3" />
            <span>New Refund</span>
          </button>
        </div>
      </div>
    </div>
  )
} 