// Settings System Types and Interfaces
// This file defines all types related to the settings system

// ========================================
// CORE SETTINGS TYPES
// ========================================

export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'date'
export type SettingCategory = 'business' | 'general' | 'tax' | 'payment' | 'user' | 'system' | 'till' | 'printing' | 'loyalty' | 'receipt' | 'notifications' | 'data' | 'advanced'

// Base setting interface
export interface BaseSetting {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: SettingType
  category: SettingCategory
  display_name: string
  description: string | null
  is_required: boolean
  is_sensitive: boolean
  validation_rules: Record<string, any> | null
  default_value: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Global settings interface
export interface GlobalSetting extends BaseSetting {}

// Branch settings interface
export interface BranchSetting {
  id: string
  branch_id: string
  setting_key: string
  setting_value: string | null
  is_override: boolean
  created_at: string
  updated_at: string
}

// Settings category interface
export interface SettingsCategory {
  id: string
  name: string
  display_name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

// Effective setting (what the UI actually uses)
export interface EffectiveSetting {
  setting_key: string
  setting_value: string | null
  setting_type: SettingType
  category: SettingCategory
  display_name: string
  description: string | null
  is_override: boolean
  is_required: boolean
  is_sensitive: boolean
  default_value: string | null
  sort_order: number
}

// ========================================
// BUSINESS HOURS TYPES
// ========================================

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: string
  close: string
  closed: boolean
}

// ========================================
// PAYMENT METHODS TYPES
// ========================================

export type PaymentMethod = 'cash' | 'card' | 'eft' | 'credit' | 'laybye'

export interface PaymentMethodConfig {
  method: PaymentMethod
  enabled: boolean
  processing_fee?: number
  requires_reference?: boolean
  display_name: string
  icon: string
}

// ========================================
// TAX SETTINGS TYPES
// ========================================

export interface TaxConfig {
  rate: number
  inclusive: boolean
  exempt_categories: string[]
  registration_number?: string
}

// ========================================
// LOYALTY SETTINGS TYPES
// ========================================

export interface LoyaltyConfig {
  enabled: boolean
  points_per_rand: number
  redemption_rate: number
  minimum_redemption: number
  tiers?: LoyaltyTier[]
}

export interface LoyaltyTier {
  name: string
  min_points: number
  discount_percentage: number
  benefits: string[]
}

// ========================================
// RECEIPT SETTINGS TYPES
// ========================================

export interface ReceiptConfig {
  header: string
  footer: string
  show_logo: boolean
  show_tax_breakdown: boolean
  paper_width: number
  custom_fields?: ReceiptCustomField[]
}

export interface ReceiptCustomField {
  key: string
  label: string
  value: string
  position: 'header' | 'footer'
}

// ========================================
// USER MANAGEMENT TYPES
// ========================================

export type UserRole = 'admin' | 'manager' | 'cashier' | 'viewer'

export interface UserConfig {
  default_role: UserRole
  password_min_length: number
  session_timeout: number
  max_login_attempts: number
  roles: UserRoleConfig[]
}

export interface UserRoleConfig {
  role: UserRole
  display_name: string
  permissions: string[]
  description: string
}

// ========================================
// TILL & CASH TYPES
// ========================================

export interface TillConfig {
  default_float_amount: number
  cash_drop_threshold: number
  auto_cash_drop: boolean
  cash_counting_required: boolean
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export interface NotificationConfig {
  email_enabled: boolean
  sms_enabled: boolean
  low_stock_alerts: boolean
  daily_sales_report: boolean
  email_settings?: EmailSettings
  sms_settings?: SMSSettings
}

export interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string
  from_email: string
  from_name: string
}

export interface SMSSettings {
  provider: string
  api_key: string
  api_secret: string
  from_number: string
}

// ========================================
// DATA MANAGEMENT TYPES
// ========================================

export interface DataConfig {
  auto_backup: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  data_retention_days: number
  export_format: 'csv' | 'excel' | 'json'
}

// ========================================
// ADVANCED SETTINGS TYPES
// ========================================

export interface AdvancedConfig {
  debug_mode: boolean
  api_rate_limit: number
  cache_ttl: number
  maintenance_mode: boolean
}

// ========================================
// SETTINGS FORM TYPES
// ========================================

export interface SettingsFormData {
  [key: string]: string | number | boolean | object
}

export interface SettingsValidationError {
  field: string
  message: string
}

// ========================================
// SETTINGS API TYPES
// ========================================

export interface SettingsApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface UpdateGlobalSettingRequest {
  setting_key: string
  setting_value: string
}

export interface UpdateBranchSettingRequest {
  branch_id: string
  setting_key: string
  setting_value: string
  is_override: boolean
}

export interface GetSettingsRequest {
  category?: SettingCategory
  branch_id?: string
  include_inactive?: boolean
}

// ========================================
// SETTINGS UTILITY TYPES
// ========================================

export type SettingsMap = Record<string, string | number | boolean | object>

export interface SettingsDiff {
  added: string[]
  modified: string[]
  removed: string[]
}

export interface SettingsBackup {
  version: string
  created_at: string
  global_settings: GlobalSetting[]
  branch_settings: BranchSetting[]
  categories: SettingsCategory[]
}

// ========================================
// SETTINGS VALIDATION TYPES
// ========================================

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom'
  value?: any
  message: string
}

export interface SettingValidation {
  setting_key: string
  rules: ValidationRule[]
}

// ========================================
// SETTINGS UI TYPES
// ========================================

export interface SettingsTab {
  id: SettingCategory
  label: string
  icon: string
  description: string
  component: React.ComponentType<any>
}

export interface SettingsFieldProps {
  setting: EffectiveSetting
  value: string | number | boolean | object
  onChange: (value: string | number | boolean | object) => void
  error?: string
  disabled?: boolean
}

export interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

// ========================================
// SETTINGS CONTEXT TYPES
// ========================================

export interface SettingsContextValue {
  // Global settings
  globalSettings: GlobalSetting[]
  updateGlobalSetting: (key: string, value: string) => Promise<boolean>
  
  // Branch settings
  branchSettings: BranchSetting[]
  updateBranchSetting: (branchId: string, key: string, value: string, isOverride: boolean) => Promise<boolean>
  
  // Effective settings (what UI uses)
  effectiveSettings: EffectiveSetting[]
  getEffectiveSetting: (key: string, branchId?: string) => string | null
  getEffectiveSettingsByCategory: (category: SettingCategory, branchId?: string) => EffectiveSetting[]
  
  // Categories
  categories: SettingsCategory[]
  
  // Loading states
  isLoading: boolean
  isUpdating: boolean
  
  // Error handling
  error: string | null
  clearError: () => void
  
  // Refresh
  refreshSettings: () => Promise<void>
}

// ========================================
// SETTINGS HOOK TYPES
// ========================================

export interface UseSettingsOptions {
  branchId?: string
  category?: SettingCategory
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseGlobalSettingsOptions {
  category?: SettingCategory
  includeInactive?: boolean
}

export interface UseBranchSettingsOptions {
  branchId: string
  category?: SettingCategory
  includeInactive?: boolean
} 