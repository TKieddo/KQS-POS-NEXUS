'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'

interface MenuCardProps {
  title: string
  icon: React.ReactNode
  description: string
  color: 'green' | 'yellow' | 'blue' | 'purple' | 'pink' | 'orange' | 'black'
  onClick: () => void
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  icon,
  description,
  color,
  onClick
}) => {
  const colorClasses = {
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400',
    orange: 'bg-orange-400',
    black: 'bg-black'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full aspect-square rounded-xl p-6 flex flex-col bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]',
        colorClasses[color]
      )}
    >
      {/* Top section with icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", color === 'black' ? 'bg-white/20' : 'bg-black/10')}>
          <div className={cn(color === 'black' ? 'text-white' : 'text-black')}>
            {icon}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className={cn("text-sm font-bold mb-2 text-left", color === 'black' ? 'text-white' : 'text-black')}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn("text-xs text-left mb-4 flex-grow", color === 'black' ? 'text-white/80' : 'text-black/80')}>
        {description}
      </p>

      {/* Bottom section with action */}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", color === 'black' ? 'text-white' : 'text-black')}>
          Open Feature
        </span>
        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200", color === 'black' ? 'bg-white' : 'bg-black')}>
          <ArrowUpRight className={cn("w-3 h-3", color === 'black' ? 'text-black' : 'text-white')} />
        </div>
      </div>
    </button>
  )
} 