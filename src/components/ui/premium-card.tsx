import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'glass' | 'dark'
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
}

export const PremiumCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  gradient = 'blue'
}: PremiumCardProps) => {
  const baseClasses = "rounded-2xl border transition-all duration-300 hover:shadow-lg"
  
  const variantClasses = {
    default: "bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-sm",
    gradient: {
      blue: "bg-gradient-to-br from-blue-50/95 to-indigo-100/95 border-blue-200/40 shadow-md",
      purple: "bg-gradient-to-br from-purple-50/95 to-pink-100/95 border-purple-200/40 shadow-md",
      green: "bg-gradient-to-br from-green-50/95 to-emerald-100/95 border-green-200/40 shadow-md",
      orange: "bg-gradient-to-br from-orange-50/95 to-red-100/95 border-orange-200/40 shadow-md",
      pink: "bg-gradient-to-br from-pink-50/95 to-rose-100/95 border-pink-200/40 shadow-md"
    },
    glass: "bg-white/70 backdrop-blur-md border-white/30 shadow-xl",
    dark: "bg-gradient-to-br from-gray-900/95 to-slate-800/95 border-gray-700/50 shadow-xl"
  }

  const classes = cn(
    baseClasses,
    variant === 'default' && variantClasses.default,
    variant === 'gradient' && variantClasses.gradient[gradient],
    variant === 'glass' && variantClasses.glass,
    variant === 'dark' && variantClasses.dark,
    className
  )

  return (
    <div className={classes}>
      {children}
    </div>
  )
} 