"use client"

import React from 'react'
import { useCurrency, type Currency } from '@/context/CurrencyContext'
import { DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

const CURRENCIES = [
  { code: 'L' as Currency, label: 'Loti', symbol: 'L', iconColor: 'text-blue-600' },
  { code: 'R' as Currency, label: 'Rand', symbol: 'R', iconColor: 'text-yellow-500' },
]

export interface CurrencySwitcherProps {
  className?: string
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ className }) => {
  const { currency, setCurrency } = useCurrency()

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full bg-white/70 dark:bg-background/80 shadow-md px-2 py-1 backdrop-blur border border-border',
        'transition-colors duration-200',
        className
      )}
      role="radiogroup"
      aria-label="Currency Switcher"
    >
      {CURRENCIES.map(({ code, label, symbol, iconColor }) => (
        <button
          key={code}
          type="button"
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            currency === code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
            'transition-colors duration-150'
          )}
          aria-checked={currency === code}
          aria-label={label}
          tabIndex={0}
          onClick={() => setCurrency(code)}
        >
          <DollarSign className={cn('w-4 h-4 mr-1', iconColor)} aria-hidden />
          <span className="font-medium text-xs">{symbol}</span>
        </button>
      ))}
    </div>
  )
}

CurrencySwitcher.displayName = 'CurrencySwitcher'