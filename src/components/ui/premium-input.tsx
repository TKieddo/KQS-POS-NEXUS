import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  variant?: 'default' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  as?: 'input' | 'textarea'
  rows?: number
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, variant = 'default', size = 'md', as = 'input', rows, className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-6 text-lg'
    }

    const baseInputClasses =
      'w-full border border-input bg-[hsl(var(--input))] rounded-[var(--radius)] shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-[hsl(var(--accent))]';

    const variantClasses = {
      default: '',
      glass: 'bg-white/60 backdrop-blur-md border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20'
    }

    const classes = cn(
      baseInputClasses,
      sizeClasses[size],
      variantClasses[variant],
      error && 'border-red-300 focus:border-red-500 focus:ring-red-200/50',
      className
    )

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-1">
            {label}
          </label>
        )}
        {as === 'textarea' ? (
          <textarea
            ref={ref as any}
            rows={rows}
            className={classes}
            {...props as any}
          />
        ) : (
          <input
            ref={ref}
            className={classes}
            {...props}
          />
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

PremiumInput.displayName = 'PremiumInput' 