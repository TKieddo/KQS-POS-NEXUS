import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ========================================
// DISCOUNT UTILITIES
// ========================================

export interface DiscountInfo {
  amount: number
  type: 'percentage' | 'fixed'
  description?: string
  expiresAt?: string
  isActive: boolean
}

/**
 * Calculate the final price after applying a discount
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountAmount: number,
  discountType: 'percentage' | 'fixed'
): number {
  if (discountAmount <= 0) return originalPrice
  
  if (discountType === 'percentage') {
    return Math.max(originalPrice * (1 - discountAmount / 100), 0)
  } else {
    return Math.max(originalPrice - discountAmount, 0)
  }
}

/**
 * Check if a discount is still valid (not expired)
 */
export function isDiscountValid(
  isActive: boolean,
  expiresAt?: string
): boolean {
  if (!isActive) return false
  
  if (!expiresAt) return true // No expiration date means always valid
  
  return new Date() < new Date(expiresAt)
}

/**
 * Calculate discount savings amount
 */
export function calculateDiscountSavings(
  originalPrice: number,
  finalPrice: number
): number {
  return originalPrice - finalPrice
}

/**
 * Format discount display text
 */
export function formatDiscountDisplay(
  discountAmount: number,
  discountType: 'percentage' | 'fixed'
): string {
  if (discountType === 'percentage') {
    return `${discountAmount}% OFF`
  } else {
    return `$${discountAmount.toFixed(2)} OFF`
  }
}

/**
 * Get the effective price for a product (with discount applied if valid)
 */
export function getEffectivePrice(
  originalPrice: number,
  discountInfo?: DiscountInfo
): number {
  if (!discountInfo || !isDiscountValid(discountInfo.isActive, discountInfo.expiresAt)) {
    return originalPrice
  }
  
  return calculateDiscountedPrice(originalPrice, discountInfo.amount, discountInfo.type)
}

/**
 * Format price with discount indicator
 */
export function formatPriceWithDiscount(
  originalPrice: number,
  discountInfo?: DiscountInfo,
  currency = 'ZAR'
): string {
  const effectivePrice = getEffectivePrice(originalPrice, discountInfo)
  const formattedPrice = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(effectivePrice)
  
  if (effectivePrice < originalPrice) {
    return `${formattedPrice} (was ${new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(originalPrice)})`
  }
  
  return formattedPrice
}

/**
 * Format currency as Rands (R) for backoffice
 * Always uses Rands since backoffice doesn't have currency switcher
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return 'R0.00'
  }
  
  // Convert to number and handle NaN
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  
  if (isNaN(numAmount)) {
    return 'R0.00'
  }
  
  return `R${numAmount.toFixed(2)}`
}

/**
 * Format currency with thousands separator for better readability
 */
export function formatCurrencyWithSeparator(amount: number | string | undefined | null): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return 'R0.00'
  }
  
  // Convert to number and handle NaN
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  
  if (isNaN(numAmount)) {
    return 'R0.00'
  }
  
  return `R${numAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
} 

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLength: number = 60): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Truncate product description for table display
 */
export function truncateProductDescription(description: string | null | undefined): string {
  return truncateText(description, 60)
} 