export interface Product {
  id: string
  name: string
  description?: string
  price: number
  cost_price: number
  stock_quantity: number
  category_id: string
  category_name: string
  barcode?: string
  sku?: string
  image_url?: string
  is_active?: boolean
  has_variants?: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
}

export interface Customer {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip_code?: string
  address_country?: string
  status: string
  customer_type: string
  account_balance: number // Money they have in their account
  credit_limit: number // Maximum they can go into debt
  branch_id?: string
  last_purchase_date?: string
  total_purchases?: number
  total_spent?: number
  created_at: string
  updated_at: string
  // For backward compatibility
  name?: string
  current_balance?: number // Legacy field
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'cash' | 'card' | 'credit' | 'laybye' | 'mpesa' | 'ecocash'
  icon: string
}

export interface Sale {
  id: string
  transaction_number: string
  customer_id?: string
  cashier_id: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  sale_type: 'regular' | 'credit' | 'laybye'
  items: CartItem[]
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at: string
}

export interface POSSettings {
  tax_rate: number
  currency: string
  receipt_template: string
  auto_print: boolean
  require_customer: boolean
  allow_credit_sales: boolean
  allow_laybye: boolean
}

export interface OnlineOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  order_date: string
  pickup_date?: string
  total_amount: number
  items: OnlineOrderItem[]
  notes?: string
  payment_status: 'pending' | 'paid' | 'failed'
  payment_method: 'card' | 'paypal' | 'cash_on_pickup'
  created_at: string
  updated_at: string
}

export interface OnlineOrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  options?: Record<string, any>
} 