// Fresh Customer Management Types
// Clean, production-ready type definitions

export interface Customer {
  id: string
  customerNumber: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  
  // Address
  address: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country: string
  }
  
  // Business fields
  status: 'active' | 'inactive' | 'suspended'
  customerType: 'regular' | 'vip' | 'wholesale'
  notes?: string
  tags: string[]
  
  // Financial tracking
  totalPurchases: number
  totalSpent: number
  lastPurchaseDate?: string
  
  // Branch assignment
  branchId?: string
  
  // Related accounts
  creditAccount?: CreditAccount
  loyaltyAccount?: LoyaltyAccount
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface CreditAccount {
  id: string
  customerId: string
  isActive: boolean
  creditLimit: number
  currentBalance: number
  availableCredit: number
  paymentTerms: number
  lastPaymentDate?: string
  lastPaymentAmount?: number
  overdueAmount: number
  creditScore: 'excellent' | 'good' | 'fair' | 'poor'
  creditHistory: CreditTransaction[]
}

export interface LoyaltyAccount {
  id: string
  customerId: string
  cardNumber: string
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

export interface CreditTransaction {
  id: string
  customerId: string
  creditAccountId: string
  type: 'purchase' | 'payment' | 'adjustment' | 'refund'
  amount: number
  description?: string
  reference?: string
  balanceAfter: number
  createdBy?: string
  date: string
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  loyaltyAccountId: string
  type: 'earned' | 'redeemed' | 'expired' | 'adjustment'
  points: number
  description?: string
  orderId?: string
  balanceAfter: number
  date: string
}

export interface CustomerFilter {
  search: string
  status: 'all' | 'active' | 'inactive' | 'suspended'
  customerType: 'all' | 'regular' | 'vip' | 'wholesale'
  creditStatus: 'all' | 'active' | 'overdue' | 'none'
  loyaltyTier: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum'
  dateRange: {
    start: string
    end: string
  }
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
  recentActivity: any[]
}

export interface CreateCustomerData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  address: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country: string
  }
  status: 'active' | 'inactive' | 'suspended'
  customerType: 'regular' | 'vip' | 'wholesale'
  notes?: string
  tags: string[]
  branchId?: string
  
  // Optional account creation
  createCreditAccount?: {
    isActive: boolean
    creditLimit: number
    paymentTerms: number
  }
  createLoyaltyAccount?: {
    cardNumber?: string
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  }
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  creditAccount?: {
    isActive: boolean
    creditLimit: number
    paymentTerms: number
  }
  loyaltyAccount?: {
    cardNumber?: string
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  }
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface CustomerApiResponse extends ApiResponse<Customer> {}
export interface CustomersApiResponse extends ApiResponse<Customer[]> {}
export interface CustomerStatsApiResponse extends ApiResponse<CustomerStats> {}
export interface CreditTransactionsApiResponse extends ApiResponse<CreditTransaction[]> {}
export interface LoyaltyTransactionsApiResponse extends ApiResponse<LoyaltyTransaction[]> {} 