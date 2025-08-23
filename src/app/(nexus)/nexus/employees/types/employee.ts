export interface Division {
  id: string
  name: string
  code: string
  description?: string
  managerId?: string
  location: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
  isPrimary: boolean
}

export interface EmployeeDocument {
  id: string
  type: 'id_document' | 'contract' | 'certificate' | 'medical' | 'other'
  name: string
  fileUrl: string
  expiryDate?: string
  isRequired: boolean
  uploadedAt: string
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  middleName?: string
  email: string
  phone: string
  alternativePhone?: string
  
  // Personal Information
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  nationality: string
  idNumber: string
  passportNumber?: string
  
  // Address Information
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  
  // Employment Information
  divisionId: string
  position: string
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship'
  status: 'active' | 'inactive' | 'on_leave' | 'terminated' | 'suspended'
  hireDate: string
  terminationDate?: string
  probationEndDate?: string
  
  // Salary and Benefits
  salary: number
  currency: string
  paymentMethod: 'bank_transfer' | 'cash' | 'check'
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountType: string
    branchCode: string
  }
  
  // Emergency Contacts
  emergencyContacts: EmergencyContact[]
  
  // Documents
  documents: EmployeeDocument[]
  
  // Additional Information
  skills: string[]
  languages: string[]
  education: {
    level: string
    institution: string
    field: string
    yearCompleted: string
  }[]
  workExperience: {
    company: string
    position: string
    startDate: string
    endDate?: string
    description: string
  }[]
  
  // System Fields
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmployeeFilters {
  division: string
  status: string
  employmentType: string
  location: string
}

export interface EmployeeStats {
  total: number
  active: number
  inactive: number
  onLeave: number
  terminated: number
  byDivision: Array<{
    division: Division
    count: number
  }>
  byEmploymentType: Array<{
    type: string
    label: string
    count: number
  }>
}

export interface EmployeeFormData {
  employeeId: string
  firstName: string
  lastName: string
  middleName?: string
  email: string
  phone: string
  alternativePhone?: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  nationality: string
  idNumber: string
  passportNumber?: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  divisionId: string
  position: string
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship'
  status: 'active' | 'inactive' | 'on_leave' | 'terminated' | 'suspended'
  hireDate: string
  terminationDate?: string
  probationEndDate?: string
  salary: number
  currency: string
  paymentMethod: 'bank_transfer' | 'cash' | 'check'
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountType: string
    branchCode: string
  }
  emergencyContacts: EmergencyContact[]
  skills: string[]
  languages: string[]
  education: {
    level: string
    institution: string
    field: string
    yearCompleted: string
  }[]
  workExperience: {
    company: string
    position: string
    startDate: string
    endDate?: string
    description: string
  }[]
}

export interface DivisionFormData {
  name: string
  code: string
  description?: string
  managerId?: string
  location: string
  isActive: boolean
}

// Employment types for dropdowns
export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' }
] as const

// Employee statuses for dropdowns
export const EMPLOYEE_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'on_leave', label: 'On Leave', color: 'yellow' },
  { value: 'terminated', label: 'Terminated', color: 'red' },
  { value: 'suspended', label: 'Suspended', color: 'orange' }
] as const

// Document types for dropdowns
export const DOCUMENT_TYPES = [
  { value: 'id_document', label: 'ID Document' },
  { value: 'contract', label: 'Employment Contract' },
  { value: 'certificate', label: 'Certificate/Qualification' },
  { value: 'medical', label: 'Medical Certificate' },
  { value: 'other', label: 'Other' }
] as const

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
] as const

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' }
] as const

// Currencies
export const CURRENCIES = [
  { value: 'ZAR', label: 'South African Rand (ZAR)' },
  { value: 'LSL', label: 'Lesotho Loti (LSL)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' }
] as const
