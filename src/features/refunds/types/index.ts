export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  accountBalance?: number
  loyaltyPoints?: number
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  stockQuantity: number
  category: string
  image?: string
}

export interface RefundItem {
  id: string
  product: Product
  quantity: number
  originalPrice: number
  refundAmount: number
  reason: string
  condition: 'new' | 'used' | 'damaged'
  notes?: string
}

export interface ExchangeItem {
  id: string
  originalProduct: Product
  newProduct: Product
  quantity: number
  priceDifference: number
  reason: string
  condition: 'new' | 'used' | 'damaged'
  notes?: string
}

export interface RefundTransaction {
  id: string
  transactionId: string
  customer: Customer
  items: RefundItem[]
  totalRefundAmount: number
  refundMethod: 'cash' | 'account_credit' | 'loyalty_points' | 'exchange_only'
  refundReason: string
  processedBy: string
  processedAt: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  notes?: string
  receiptNumber?: string
}

export interface ExchangeTransaction {
  id: string
  originalTransactionId: string
  customer: Customer
  items: ExchangeItem[]
  totalPriceDifference: number
  exchangeReason: string
  processedBy: string
  processedAt: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  notes?: string
  receiptNumber?: string
}

export interface RefundStats {
  totalRefunds: number
  totalRefundAmount: number
  refundsThisMonth: number
  refundsThisWeek: number
  averageRefundAmount: number
  topRefundReasons: Array<{ reason: string; count: number; percentage: number }>
  refundMethods: Array<{ method: string; count: number; amount: number }>
}

export interface RefundFilters {
  search: string
  status: 'all' | 'pending' | 'approved' | 'completed' | 'rejected'
  refundMethod: 'all' | 'cash' | 'account_credit' | 'loyalty_points' | 'exchange_only'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'
  customerId?: string
}

export interface RefundAnalytics {
  totalRefunds: number
  totalRefundAmount: number
  refundsThisMonth: number
  refundsThisWeek: number
  averageRefundAmount: number
  refundRate: number
  monthlyTrends: Array<{
    month: string
    refunds: number
    amount: number
    percentage: number
  }>
  topRefundReasons: Array<{
    reason: string
    count: number
    percentage: number
    totalAmount: number
  }>
  refundMethods: Array<{
    method: string
    count: number
    amount: number
    percentage: number
  }>
  topProducts: Array<{
    product: Product
    refundCount: number
    refundAmount: number
    refundRate: number
  }>
  customerRefunds: Array<{
    customer: Customer
    refundCount: number
    refundAmount: number
    averageRefund: number
  }>
}

export interface RefundPolicy {
  id: string
  name: string
  description: string
  timeLimit: number // in days
  conditions: string[]
  refundMethods: ('cash' | 'account_credit' | 'loyalty_points' | 'exchange_only')[]
  requiresApproval: boolean
  isActive: boolean
}

export interface RefundReason {
  id: string
  name: string
  description: string
  category: 'product' | 'service' | 'customer' | 'other'
  requiresApproval: boolean
  isActive: boolean
} 