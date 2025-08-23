import * as React from 'react'
import { cn } from '@/lib/utils'
import { PremiumCard } from '@/components/ui/premium-card'
import { LucideIcon } from 'lucide-react'

export interface ProductFormSectionProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient'
  gradient?: 'blue' | 'purple' | 'green'
}

const ProductFormSection = ({ 
  title, 
  icon: Icon, 
  children, 
  className,
  variant = 'default',
  gradient = 'blue',
  ...props 
}: ProductFormSectionProps) => {
  return (
    <PremiumCard 
      variant={variant} 
      gradient={gradient}
      className={cn(
        "p-6 shadow-lg rounded-xl border border-gray-100/60",
        className
      )}
      {...props}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className={cn(
          "h-5 w-5",
          gradient === 'blue' && "text-blue-500",
          gradient === 'purple' && "text-purple-500",
          gradient === 'green' && "text-green-500"
        )} />
        {title}
      </h3>
      {children}
    </PremiumCard>
  )
}

ProductFormSection.displayName = 'ProductFormSection'

export { ProductFormSection } 