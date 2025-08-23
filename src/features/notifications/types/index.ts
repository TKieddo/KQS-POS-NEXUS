// ========================================
// NOTIFICATION & INTEGRATION TYPES
// ========================================

export interface NotificationRule {
  id: string
  branch_id?: string
  name: string
  type: 'email' | 'sms' | 'push' | 'in-app'
  condition: 'low_stock' | 'high_sales' | 'payment_due' | 'system_alert' | 'inventory_alert' | 'sales_target' | 'customer_activity'
  action: 'immediate' | 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  message_template?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IntegrationSettings {
  id: string
  branch_id?: string
  email_provider: 'smtp' | 'sendgrid' | 'mailgun'
  smtp_host?: string
  smtp_port?: string
  smtp_username?: string
  smtp_password?: string
  sms_provider: 'twilio' | 'africastalking' | 'messagebird'
  sms_api_key?: string
  sms_api_secret?: string
  sms_from_number?: string
  webhook_url?: string
  webhook_secret?: string
  enable_webhooks: boolean
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  enable_push_notifications: boolean
  notification_frequency: 'immediate' | 'hourly' | 'daily'
  quiet_hours_start?: string
  quiet_hours_end?: string
  created_at: string
  updated_at: string
}

export interface NotificationLog {
  id: string
  rule_id: string
  type: 'email' | 'sms' | 'push' | 'in-app'
  recipient: string
  subject?: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  sent_at?: string
  created_at: string
}

export interface NotificationRuleFormData {
  name: string
  type: 'email' | 'sms' | 'push' | 'in-app'
  condition: 'low_stock' | 'high_sales' | 'payment_due' | 'system_alert' | 'inventory_alert' | 'sales_target' | 'customer_activity'
  action: 'immediate' | 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  message_template?: string
  is_active: boolean
}

export interface IntegrationSettingsFormData {
  email_provider: 'smtp' | 'sendgrid' | 'mailgun'
  smtp_host?: string
  smtp_port?: string
  smtp_username?: string
  smtp_password?: string
  sms_provider: 'twilio' | 'africastalking' | 'messagebird'
  sms_api_key?: string
  sms_api_secret?: string
  sms_from_number?: string
  webhook_url?: string
  webhook_secret?: string
  enable_webhooks: boolean
  enable_email_notifications: boolean
  enable_sms_notifications: boolean
  enable_push_notifications: boolean
  notification_frequency: 'immediate' | 'hourly' | 'daily'
  quiet_hours_start?: string
  quiet_hours_end?: string
}

// ========================================
// CONDITION & ACTION OPTIONS
// ========================================

export const NOTIFICATION_CONDITIONS = {
  low_stock: 'Low Stock Alert',
  high_sales: 'High Sales Notification',
  payment_due: 'Payment Due Reminder',
  system_alert: 'System Maintenance',
  inventory_alert: 'Inventory Alert',
  sales_target: 'Sales Target Achievement',
  customer_activity: 'Customer Activity'
} as const

export const NOTIFICATION_ACTIONS = {
  immediate: 'Immediate',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
} as const

export const NOTIFICATION_TYPES = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push Notification',
  'in-app': 'In-App Notification'
} as const

export const EMAIL_PROVIDERS = {
  smtp: 'SMTP',
  sendgrid: 'SendGrid',
  mailgun: 'Mailgun'
} as const

export const SMS_PROVIDERS = {
  twilio: 'Twilio',
  africastalking: 'Africa\'s Talking',
  messagebird: 'MessageBird'
} as const

export const NOTIFICATION_FREQUENCIES = {
  immediate: 'Immediate',
  hourly: 'Hourly',
  daily: 'Daily'
} as const 