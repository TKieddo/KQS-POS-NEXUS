import React from 'react'
import { Calendar } from 'lucide-react'

export type TimePeriod = '1month' | '3months' | '6months' | '1year' | 'custom'

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
  customStartDate?: string
  customEndDate?: string
  onCustomDateChange?: (startDate: string, endDate: string) => void
}

const timePeriods = [
  { value: '1month' as TimePeriod, label: 'Last Month', days: 30 },
  { value: '3months' as TimePeriod, label: 'Last 3 Months', days: 90 },
  { value: '6months' as TimePeriod, label: 'Last 6 Months', days: 180 },
  { value: '1year' as TimePeriod, label: 'Last Year', days: 365 },
  { value: 'custom' as TimePeriod, label: 'Custom Range', days: 0 }
]

export function TimePeriodFilter({ 
  selectedPeriod, 
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomDateChange 
}: TimePeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <select
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      >
        {timePeriods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
      
      {selectedPeriod === 'custom' && onCustomDateChange && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStartDate || ''}
            onChange={(e) => onCustomDateChange(e.target.value, customEndDate || '')}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={customEndDate || ''}
            onChange={(e) => onCustomDateChange(customStartDate || '', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          />
        </div>
      )}
    </div>
  )
}

export { timePeriods }
