export interface Building {
  id: string
  name: string
  address: string
  total_units: number
  occupied_units: number
  property_type: 'apartment' | 'house' | 'commercial' | 'mixed'
  year_built: number
  amenities: string[]
  manager_id: string
  total_rent: number
  collected_rent: number
  overdue_payments: number
  branch_id: string
  created_at: string
  updated_at: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface Tenant {
  id: string
  building_id: string
  first_name: string
  last_name: string
  name: string // Computed property: first_name + last_name
  email: string
  phone: string
  unit_number: string
  lease_start_date: string
  lease_end_date: string
  monthly_rent: number
  rent_amount: number // Alias for monthly_rent
  security_deposit: number
  emergency_contact?: EmergencyContact
  payment_status: 'paid' | 'pending' | 'overdue'
  due_date: string
  documents: string[] // Array of document IDs
  notes?: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  tenant_id: string
  building_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check'
  receipt_number: string
  payment_type: 'rent' | 'deposit' | 'fee' | 'other'
  status: 'pending' | 'completed' | 'failed'
  receipt_sent: boolean
  receipt_sent_date?: string
  receipt_sent_method?: 'email' | 'printed' | 'both'
  notes?: string
  recorded_by: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface BuildingFormData {
  name: string
  address: string
  total_units: number
  property_type: 'apartment' | 'house' | 'commercial' | 'mixed'
  year_built: number
  amenities: string[]
  manager_id: string
}

export interface TenantFormData {
  building_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  unit_number: string
  lease_start_date: string
  lease_end_date: string
  monthly_rent: number
  security_deposit: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
}

export interface PaymentFormData {
  tenant_id: string
  building_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check'
  payment_type: 'rent' | 'deposit' | 'fee' | 'other'
  notes?: string
}

export interface PropertyDocument {
  id: string
  tenant_id?: string
  building_id?: string
  document_type: 'lease' | 'contract' | 'invoice' | 'receipt' | 'other'
  file_name: string
  file_url: string
  uploaded_by: string
  branch_id: string
  created_at: string
  updated_at: string
}