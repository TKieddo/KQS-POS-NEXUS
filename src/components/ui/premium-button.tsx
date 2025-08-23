import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'gradient' | 'glass' | 'outline'
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  className?: string
}

export const PremiumButton = ({
  children,
  variant = 'default',
  gradient = 'blue',
  size = 'sm',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  onClick,
  ...props
}: PremiumButtonProps) => {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  }

  const variantClasses = {
    default: 'bg-black text-white hover:bg-gray-800 shadow-sm shadow-gray-200/30 border border-gray-200/20',
    gradient: {
      blue: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm shadow-blue-200/30',
      purple: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-sm shadow-purple-200/30',
      green: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-sm shadow-green-200/30',
      orange: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-sm shadow-orange-200/30',
      pink: 'bg-gradient-to-r from-pink-600 to-pink-700 text-white hover:from-pink-700 hover:to-pink-800 shadow-sm shadow-pink-200/30'
    },
    glass: 'bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white/90 border border-white/30 shadow-sm',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
  }

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const classes = cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
    sizeClasses[size],
    variant === 'default' && variantClasses.default,
    variant === 'gradient' && variantClasses.gradient[gradient],
    variant === 'glass' && variantClasses.glass,
    variant === 'outline' && variantClasses.outline,
    className
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button 
      className={classes} 
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={cn(iconSizeClasses[size], "mr-1.5")} />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className={cn(iconSizeClasses[size], "ml-1.5")} />
      )}
    </button>
  )
} 