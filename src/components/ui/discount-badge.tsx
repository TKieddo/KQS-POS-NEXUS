import { Tag, Clock } from "lucide-react"
import { formatDiscountDisplay, isDiscountValid } from "@/lib/utils"

interface DiscountBadgeProps {
  amount: number
  type: 'percentage' | 'fixed'
  description?: string
  expiresAt?: string
  isActive: boolean
  size?: 'sm' | 'md' | 'lg'
  showExpiry?: boolean
}

export const DiscountBadge = ({ 
  amount, 
  type, 
  description, 
  expiresAt, 
  isActive, 
  size = 'md',
  showExpiry = true 
}: DiscountBadgeProps) => {
  const isValid = isDiscountValid(isActive, expiresAt)
  
  if (!isActive || !isValid) return null

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className="space-y-1">
      <span className={`inline-flex items-center rounded-full font-medium bg-red-100 text-red-800 ${sizeClasses[size]}`}>
        <Tag className={`${iconSizes[size]} mr-1`} />
        {formatDiscountDisplay(amount, type)}
      </span>
      
      {description && (
        <div className={`text-gray-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {description}
        </div>
      )}
      
      {showExpiry && expiresAt && (
        <div className={`inline-flex items-center text-orange-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          <Clock className={`${iconSizes[size]} mr-1`} />
          Expires: {new Date(expiresAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

export const DiscountBadgeCompact = ({ 
  amount, 
  type, 
  isActive, 
  size = 'sm' 
}: Omit<DiscountBadgeProps, 'description' | 'expiresAt' | 'showExpiry'>) => {
  if (!isActive) return null

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium bg-red-100 text-red-800 ${sizeClasses[size]}`}>
      <Tag className={`${iconSizes[size]} mr-1`} />
      {formatDiscountDisplay(amount, type)}
    </span>
  )
} 