'use client'

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatItem {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  trendDirection?: 'up' | 'down'
}

interface StatsBarProps {
  stats: StatItem[]
  className?: string
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, className = '' }) => {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 mb-6", className)}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          
          return (
            <div key={index} className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {IconComponent && <IconComponent className="h-4 w-4 text-gray-500" />}
                  <div>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                {stat.trend && (
                  <div className={cn(
                    "flex items-center space-x-1 text-xs",
                    stat.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.trendDirection === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{stat.trend}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 