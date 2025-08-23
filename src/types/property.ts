import { Database } from '@/lib/supabase'

// Property Management Types
export type PropertyBuilding = Database['public']['Tables']['property_buildings']['Row']
export type PropertyRoom = Database['public']['Tables']['property_rooms']['Row']
export type PropertyTenant = Database['public']['Tables']['property_tenants']['Row']
export type PropertyPayment = Database['public']['Tables']['property_payments']['Row']
export type PropertyReceipt = Database['public']['Tables']['property_receipts']['Row']
export type PropertyDocument = Database['public']['Tables']['property_documents']['Row']
export type PropertyInventoryItem = Database['public']['Tables']['property_inventory_items']['Row']
export type PropertyMaintenanceRecord = Database['public']['Tables']['property_maintenance_records']['Row']
export type PropertyCommunication = Database['public']['Tables']['property_communications']['Row']

// Form Data Types
export interface BuildingFormData {
  name: string
  address: string
  city: string
  postal_code?: string
  total_units: number
  amenities: string[]
  description?: string
}

export interface RoomFormData {
  building_id: string
  room_number: string
  floor: string
  type: string
  size?: number
  rent_amount: number
  amenities: string[]
  description?: string
}

export interface TenantFormData {
  building_id: string
  room_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  lease_start_date: string
  lease_end_date: string
  monthly_rent: number
  security_deposit: number
  payment_due_date: string
  notes?: string
}

export interface TenantWithDetails extends PropertyTenant {
  building?: PropertyBuilding
  room?: PropertyRoom
  payments?: PropertyPayment[]
  documents?: PropertyDocument[]
  communications?: PropertyCommunication[]
}

export interface PaymentFormData {
  tenant_id: string
  building_id: string
  amount: number
  payment_date: string
  payment_method: string
  receipt_number?: string
  notes?: string
}

export interface ReceiptFormData {
  receipt_number: string
  date: string
  due_date?: string
  tenant_id: string
  building_id: string
  items: {
    name: string
    quantity: number
    price: number
    description?: string
  }[]
  payment_method: string
  notes?: string
}

export interface DocumentFormData {
  building_id?: string
  tenant_id?: string
  room_id?: string
  name: string
  type: string
  url: string
  size?: number
  notes?: string
}

export interface MaintenanceFormData {
  building_id: string
  room_id?: string
  type: string
  description: string
  cost?: number
  scheduled_date?: string
  completion_date?: string
  assigned_to?: string
  notes?: string
}

export interface CommunicationFormData {
  tenant_id: string
  type: string
  subject: string
  content: string
  notes?: string
}

// Response Types
export interface BuildingWithDetails extends PropertyBuilding {
  rooms?: PropertyRoom[]
  tenants?: PropertyTenant[]
  documents?: PropertyDocument[]
}

export interface TenantWithDetails extends PropertyTenant {
  building?: PropertyBuilding
  room?: PropertyRoom
  payments?: PropertyPayment[]
  documents?: PropertyDocument[]
  communications?: PropertyCommunication[]
}

export interface PaymentWithDetails extends PropertyPayment {
  tenant?: PropertyTenant
  building?: PropertyBuilding
  receipt?: PropertyReceipt
}

export interface ReceiptWithDetails extends PropertyReceipt {
  tenant?: PropertyTenant
  building?: PropertyBuilding
  payment?: PropertyPayment
}

export interface RoomWithDetails extends PropertyRoom {
  building?: PropertyBuilding
  tenant?: PropertyTenant
  inventory?: PropertyInventoryItem[]
  maintenance?: PropertyMaintenanceRecord[]
  documents?: PropertyDocument[]
}

// Utility Types
export type PaymentMethod = 'cash' | 'eft' | 'credit_card' | 'debit_card' | 'check' | 'other'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type TenantStatus = 'active' | 'inactive' | 'pending' | 'evicted'
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved'
export type MaintenanceType = 'repair' | 'cleaning' | 'inspection' | 'renovation' | 'other'
export type MaintenanceStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type DocumentType = 'lease' | 'id' | 'proof_of_income' | 'proof_of_residence' | 'other'
export type CommunicationType = 'email' | 'sms' | 'letter' | 'notice' | 'other'
