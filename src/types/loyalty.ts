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
  status: 'active' | 'inactive' | 'suspended'
  customerType: 'regular' | 'vip' | 'wholesale' | 'laybye'
  loyaltyAccount?: LoyaltyAccount
  creditAccount?: CreditAccount
  notes: string
  tags: string[]
  branchId?: string
  createdAt: string
  updatedAt: string
  lastPurchaseDate?: string
  totalPurchases: number
  totalSpent: number
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
  createdAt: string
  updatedAt: string
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  loyaltyAccountId: string
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment'
  points: number
  description: string
  orderId?: string
  date: string
  balanceAfter: number
  createdBy: string
  createdAt: string
}

export interface CreditAccount {
  id: string
  customerId: string
  accountNumber: string
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
  createdAt: string
  updatedAt: string
}

export interface CreditTransaction {
  id: string
  customerId: string
  creditAccountId: string
  type: 'purchase' | 'payment' | 'adjustment' | 'refund' | 'credit_limit_change'
  amount: number
  description: string
  reference: string
  date: string
  balanceAfter: number
  createdBy: string
  createdAt: string
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  loyaltyAccounts: number
  creditAccounts: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  averagePointsPerCustomer: number
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
  customerType: 'all' | 'regular' | 'vip' | 'wholesale' | 'laybye'
  creditStatus: 'all' | 'good' | 'overdue' | 'at_limit'
  loyaltyTier: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum'
  dateRange: {
    start: string
    end: string
  }
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface CustomerApiResponse extends ApiResponse<Customer> {
  // Customer-specific API response
}

export interface CustomersApiResponse extends ApiResponse<Customer[]> {
  // Customers list API response
}

export interface CustomerStatsApiResponse extends ApiResponse<CustomerStats> {
  // Customer stats API response
} 