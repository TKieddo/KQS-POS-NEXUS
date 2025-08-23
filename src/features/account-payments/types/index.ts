// Account Payment Types
export interface AccountPayment {
  id: string
  customer_id: string
  customer_name: string
  amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'mpesa' | 'ecocash'
  reference_number: string
  notes?: string
  processed_by: string
  processed_at: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface CustomerStatement {
  id: string
  customer_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  statement_date: string
  opening_balance: number
  closing_balance: number
  total_charges: number
  total_payments: number
  transactions: StatementTransaction[]
  created_at: string
}

export interface StatementTransaction {
  id: string
  date: string
  description: string
  type: 'sale' | 'payment' | 'refund' | 'adjustment'
  amount: number
  balance: number
  reference?: string
}

export interface TillSessionReport {
  id: string
  session_number: string
  cashier_name: string
  branch_id: string
  opening_time: string
  closing_time?: string
  opening_amount: number
  closing_amount?: number
  total_sales: number
  total_refunds: number
  cash_sales: number
  card_sales: number
  transfer_sales: number
  mpesa_sales: number
  ecocash_sales: number
  credit_sales: number
  laybye_payments: number
  cash_drops: number
  cash_withdrawals: number
  expected_cash: number
  actual_cash?: number
  variance?: number
  status: 'open' | 'closed' | 'reconciled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CashDrop {
  id: string
  branch_id: string
  amount: number
  reason: string
  performed_by: string
  till_amount_before: number
  till_amount_after: number
  created_at: string
  updated_at: string
}

export interface CashWithdrawal {
  id: string
  branch_id: string
  amount: number
  reason: string
  category: 'petty_cash' | 'expense' | 'other'
  performed_by: string
  till_amount_before: number
  till_amount_after: number
  approved_by?: string
  receipt_number?: string
  created_at: string
  updated_at: string
}

export interface AccountPaymentFormData {
  customer_id: string
  amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'mpesa' | 'ecocash'
  notes?: string
}

export interface CustomerStatementFilters {
  customer_id?: string
  start_date?: string
  end_date?: string
  include_zero_balance?: boolean
}

export interface TillSessionFilters {
  cashier_id?: string
  start_date?: string
  end_date?: string
  status?: 'open' | 'closed' | 'reconciled'
}

export interface CashDropFormData {
  amount: number
  reason: string
}

export interface CashWithdrawalFormData {
  amount: number
  reason: string
  category: 'petty_cash' | 'expense' | 'other'
  receipt_number?: string
} 