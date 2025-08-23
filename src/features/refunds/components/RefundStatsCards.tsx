import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, Users } from 'lucide-react'
import { RefundStats } from '../types'

interface RefundStatsCardsProps {
  stats: RefundStats
}

export const RefundStatsCards: React.FC<RefundStatsCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Refunds',
      value: stats.totalRefunds.toString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20',
      iconColor: 'text-[#E5FF29]',
      borderColor: 'border-[#E5FF29]/30'
    },
    {
      title: 'Total Refund Amount',
      value: formatCurrency(stats.totalRefundAmount),
      change: '+8.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-black/5 to-black/10',
      iconColor: 'text-white',
      borderColor: 'border-black/20'
    },
    {
      title: 'This Month',
      value: stats.refundsThisMonth.toString(),
      change: '+15%',
      changeType: 'increase' as const,
      icon: Clock,
      color: 'bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20',
      iconColor: 'text-[#E5FF29]',
      borderColor: 'border-[#E5FF29]/30'
    },
    {
      title: 'This Week',
      value: stats.refundsThisWeek.toString(),
      change: '-3%',
      changeType: 'decrease' as const,
      icon: TrendingDown,
      color: 'bg-gradient-to-br from-black/5 to-black/10',
      iconColor: 'text-white',
      borderColor: 'border-black/20'
    },
    {
      title: 'Average Refund',
      value: formatCurrency(stats.averageRefundAmount),
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-gradient-to-br from-[#E5FF29]/10 to-[#E5FF29]/20',
      iconColor: 'text-[#E5FF29]',
      borderColor: 'border-[#E5FF29]/30'
    },
    {
      title: 'Pending Approvals',
      value: '3',
      change: '+1',
      changeType: 'increase' as const,
      icon: AlertTriangle,
      color: 'bg-gradient-to-br from-black/5 to-black/10',
      iconColor: 'text-white',
      borderColor: 'border-black/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border ${card.borderColor} ${card.color} p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-black ${card.iconColor} shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.changeType === 'increase' 
                    ? 'bg-[#E5FF29] text-black' 
                    : 'bg-black text-[#E5FF29]'
                }`}>
                  {card.changeType === 'increase' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{card.change}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 