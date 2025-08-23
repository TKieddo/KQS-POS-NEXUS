export interface Customer {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  status: 'active' | 'inactive' | 'suspended'
  customerType: 'regular' | 'vip' | 'wholesale'
  creditAccount?: CreditAccount
  loyaltyAccount?: LoyaltyAccount
  notes: string
  tags: string[]
  branchId?: string
  branchName?: string
  createdAt: string
  updatedAt: string
  lastPurchaseDate?: string
  totalPurchases: number
  totalSpent: number
}

export interface CreditAccount {
  id: string
  customerId: string
  isActive: boolean
  creditLimit: number
  currentBalance: number
  availableCredit: number
  paymentTerms: number // days
  lastPaymentDate?: string
  lastPaymentAmount?: number
  overdueAmount: number
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
  creditHistory: CreditTransaction[]
}

export interface CreditTransaction {
  id: string
  customerId: string
  creditAccountId: string
  type: 'purchase' | 'payment' | 'adjustment' | 'refund'
  amount: number
  description: string
  reference: string
  date: string
  balanceAfter: number
  createdBy: string
}

export interface LoyaltyAccount {
  id: string
  customerId: string
  cardNumber: string
  isActive: boolean
  currentPoints: number
  lifetimePoints: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tierPoints: number
  nextTierPoints: number
  pointsToNextTier: number
  lastEarnedDate?: string
  lastRedeemedDate?: string
  transactions: LoyaltyTransaction[]
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  loyaltyAccountId: string
  type: 'earned' | 'redeemed' | 'expired' | 'bonus'
  points: number
  description: string
  orderId?: string
  date: string
  balanceAfter: number
}

export interface CustomerStatement {
  id: string
  customerId: string
  period: {
    start: string
    end: string
  }
  openingBalance: number
  closingBalance: number
  transactions: StatementTransaction[]
  summary: {
    totalPurchases: number
    totalPayments: number
    totalAdjustments: number
    averageDailyBalance: number
  }
}

export interface StatementTransaction {
  id: string
  date: string
  description: string
  reference: string
  debit: number
  credit: number
  balance: number
  type: 'purchase' | 'payment' | 'adjustment' | 'refund'
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  creditAccounts: number
  loyaltyAccounts: number
  totalCreditOutstanding: number
  averageCreditBalance: number
  customersWithOverdue: number
  newCustomersThisMonth: number
  topSpenders: Customer[]
  recentActivity: CustomerActivity[]
}

export interface CustomerActivity {
  id: string
  customerId: string
  customerName: string
  type: 'purchase' | 'payment' | 'credit_adjustment' | 'loyalty_earned' | 'loyalty_redeemed'
  amount?: number
  description: string
  date: string
}

export interface CustomerFilter {
  search: string
  status: 'all' | 'active' | 'inactive' | 'suspended'
  customerType: 'all' | 'regular' | 'vip' | 'wholesale'
  creditStatus: 'all' | 'good' | 'overdue' | 'at_limit'
  loyaltyTier: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum'
  dateRange: {
    start: string
    end: string
  }
} 