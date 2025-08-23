'use client'

import { useState } from 'react'
import { Search, Filter, Mail, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface LaybyeFiltersProps {
  onFilterChange: (filters: LaybyeFilters) => void
  onNewLaybye: () => void
  onSendReminders: () => void
  onExport: () => void
}

export interface LaybyeFilters {
  search: string
  status: string
  dateRange: string
  customerId?: string
}

export function LaybyeFilters({ 
  onFilterChange, 
  onNewLaybye, 
  onSendReminders, 
  onExport 
}: LaybyeFiltersProps) {
  const [filters, setFilters] = useState<LaybyeFilters>({
    search: '',
    status: 'all',
    dateRange: 'all'
  })

  const handleFilterChange = (key: keyof LaybyeFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <Card className="p-6 border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search lay-byes, customers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="due">Due Today</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={onSendReminders}
            className="border-gray-200 hover:bg-gray-50"
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Reminders
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onExport}
            className="border-gray-200 hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button 
            onClick={onNewLaybye}
            className="bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Lay-bye
          </Button>
        </div>
      </div>
    </Card>
  )
} 