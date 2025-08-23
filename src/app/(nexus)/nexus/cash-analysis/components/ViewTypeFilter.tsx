import React from 'react'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

export type ViewType = 'overview' | 'detailed' | 'comparison' | 'trends'

interface ViewTypeFilterProps {
  selectedView: ViewType
  onViewChange: (view: ViewType) => void
  className?: string
}

const viewTypes = [
  { 
    value: 'overview' as ViewType, 
    label: 'Overview', 
    icon: BarChart3,
    description: 'Summary dashboard with key metrics'
  },
  { 
    value: 'detailed' as ViewType, 
    label: 'Detailed', 
    icon: PieChart,
    description: 'In-depth analysis with charts and breakdowns'
  },
  { 
    value: 'comparison' as ViewType, 
    label: 'Comparison', 
    icon: TrendingUp,
    description: 'Compare periods and trends'
  },
  { 
    value: 'trends' as ViewType, 
    label: 'Trends', 
    icon: TrendingUp,
    description: 'Historical trends and patterns'
  }
]

export function ViewTypeFilter({ selectedView, onViewChange, className = '' }: ViewTypeFilterProps) {
  const selectedViewType = viewTypes.find(vt => vt.value === selectedView)
  const IconComponent = selectedViewType?.icon || BarChart3

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconComponent className="h-4 w-4 text-gray-500" />
      <select
        value={selectedView}
        onChange={(e) => onViewChange(e.target.value as ViewType)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      >
        {viewTypes.map((viewType) => (
          <option key={viewType.value} value={viewType.value}>
            {viewType.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export { viewTypes }
