'use client'

import { 
  Package, 
  DollarSign, 
  TrendingDown, 
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LaybyeStatsCardsProps {
  stats: {
    totalLaybyes: number
    totalValue: number
    outstandingBalance: number
    overdueLaybyes: number
    completedThisMonth: number
    averagePaymentTime: number
  }
}

export function LaybyeStatsCards({ stats }: LaybyeStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="p-5 bg-black border-gray-800 hover:border-[#E5FF29]/30 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 mb-1">Active Lay-byes</p>
            <p className="text-lg font-bold text-[#E5FF29] truncate">
              {stats.totalLaybyes}
            </p>
          </div>
          <div className="h-8 w-8 bg-[#E5FF29]/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
            <Package className="h-4 w-4 text-[#E5FF29]" />
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-black border-gray-800 hover:border-[#E5FF29]/30 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 mb-1">Outstanding</p>
            <p className="text-lg font-bold text-[#E5FF29] truncate">
              ${stats.outstandingBalance.toLocaleString()}
            </p>
          </div>
          <div className="h-8 w-8 bg-[#E5FF29]/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
            <TrendingDown className="h-4 w-4 text-[#E5FF29]" />
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-black border-gray-800 hover:border-[#E5FF29]/30 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 mb-1">Overdue</p>
            <p className="text-lg font-bold text-[#E5FF29] truncate">
              {stats.overdueLaybyes}
            </p>
          </div>
          <div className="h-8 w-8 bg-[#E5FF29]/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-[#E5FF29]" />
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-black border-gray-800 hover:border-[#E5FF29]/30 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 mb-1">Completed</p>
            <p className="text-lg font-bold text-[#E5FF29] truncate">
              {stats.completedThisMonth}
            </p>
            <p className="text-xs text-gray-500">This month</p>
          </div>
          <div className="h-8 w-8 bg-[#E5FF29]/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-[#E5FF29]" />
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-black border-gray-800 hover:border-[#E5FF29]/30 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 mb-1">Avg. Time</p>
            <p className="text-lg font-bold text-[#E5FF29] truncate">
              {stats.averagePaymentTime}
            </p>
            <p className="text-xs text-gray-500">Days</p>
          </div>
          <div className="h-8 w-8 bg-[#E5FF29]/20 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
            <Clock className="h-4 w-4 text-[#E5FF29]" />
          </div>
        </div>
      </Card>
    </div>
  )
} 