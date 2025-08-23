import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  CalendarDays,
  CalendarRange
} from 'lucide-react'
import type { TaskStats as TaskStatsType } from '../types'

interface TaskStatsProps {
  stats: TaskStatsType
}

export function TaskStats({ stats }: TaskStatsProps) {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      isBlack: false
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      isBlack: true
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      isBlack: false
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      isBlack: true
    },
    {
      title: 'Due Today',
      value: stats.today,
      icon: CalendarDays,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      isBlack: false
    },
    {
      title: 'This Week',
      value: stats.thisWeek,
      icon: CalendarRange,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      isBlack: true
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className={`${stat.isBlack ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl group hover:scale-105`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-2xl ${stat.color} shadow-lg`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${stat.isBlack ? 'text-white' : 'bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'}`}>
                    {stat.value}
                  </div>
                  <p className={`text-xs font-medium ${stat.isBlack ? 'text-slate-300' : 'text-slate-500'}`}>
                    {stat.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
