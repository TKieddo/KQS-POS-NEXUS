import React from 'react'
import { Globe, Clock, Calendar, Languages, DollarSign, Bell } from 'lucide-react'
import { SettingsSection } from '../SettingsSection'
import { SettingsField } from '../SettingsField'
import { SettingsSelect } from '../SettingsSelect'
import { SettingsToggle } from '../SettingsToggle'
import { SettingsGrid } from '../SettingsGrid'

// Currency options
const CURRENCIES = [
  { value: 'ZAR', label: 'South African Rand (R)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'LSL', label: 'Lesotho Loti (L)' }
]

// Language options
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'st', label: 'Sesotho' },
  { value: 'zu', label: 'Zulu' },
  { value: 'xh', label: 'Xhosa' },
  { value: 'ts', label: 'Tsonga' },
  { value: 've', label: 'Venda' },
  { value: 'nr', label: 'Ndebele' }
]

// Timezone options
const TIMEZONES = [
  { value: 'Africa/Johannesburg', label: 'South Africa (SAST)' },
  { value: 'Africa/Maseru', label: 'Lesotho (SAST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'Europe/London', label: 'London (GMT)' }
]

// Date format options
const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' }
]

// Time format options
const TIME_FORMATS = [
  { value: '12', label: '12-hour (9:30 AM)' },
  { value: '24', label: '24-hour (09:30)' }
]

// Backup frequency options
const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

interface GeneralSettingsFormData {
  currency: string
  currency_symbol: string
  timezone: string
  language: string
  date_format: string
  time_format: string
  decimal_places: string
  tax_rate: string
  tax_name: string
  auto_backup: boolean
  backup_frequency: string
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
}

interface GeneralSettingsFormProps {
  data: GeneralSettingsFormData
  onChange: (data: GeneralSettingsFormData) => void
  errors: Record<string, string>
  disabled?: boolean
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  data,
  onChange,
  errors,
  disabled = false
}) => {
  const handleFieldChange = (key: keyof GeneralSettingsFormData, value: any) => {
    onChange({ ...data, [key]: value })
  }

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.value === currencyCode)
    onChange({
      ...data,
      currency: currencyCode,
      currency_symbol: currency?.value === 'ZAR' ? 'R' : 
                      currency?.value === 'USD' ? '$' : 
                      currency?.value === 'EUR' ? '€' : 
                      currency?.value === 'GBP' ? '£' : 
                      currency?.value === 'LSL' ? 'L' : 'R'
    })
  }

  return (
    <div className="space-y-6">
      {/* Currency & Localization */}
      <SettingsSection
        title="Currency & Localization"
        description="Configure currency, language, and regional settings"
        icon={Globe}
      >
        <SettingsGrid columns={2}>
          <SettingsSelect
            label="Currency"
            value={data.currency}
            onChange={handleCurrencyChange}
            options={CURRENCIES}
            error={errors.currency}
            required
            disabled={disabled}
            icon={DollarSign}
          />
          
          <SettingsSelect
            label="Language"
            value={data.language}
            onChange={(value) => handleFieldChange('language', value)}
            options={LANGUAGES}
            error={errors.language}
            required
            disabled={disabled}
            icon={Languages}
          />
          
          <SettingsSelect
            label="Timezone"
            value={data.timezone}
            onChange={(value) => handleFieldChange('timezone', value)}
            options={TIMEZONES}
            error={errors.timezone}
            required
            disabled={disabled}
            icon={Clock}
          />
          
          <SettingsField
            label="Currency Symbol"
            value={data.currency_symbol}
            onChange={(value) => handleFieldChange('currency_symbol', value)}
            placeholder="R"
            error={errors.currency_symbol}
            disabled={disabled}
            helpText="Symbol used for currency display"
          />
        </SettingsGrid>
      </SettingsSection>

      {/* Date & Time Format */}
      <SettingsSection
        title="Date & Time Format"
        description="Configure how dates and times are displayed"
        icon={Calendar}
      >
        <SettingsGrid columns={2}>
          <SettingsSelect
            label="Date Format"
            value={data.date_format}
            onChange={(value) => handleFieldChange('date_format', value)}
            options={DATE_FORMATS}
            disabled={disabled}
            icon={Calendar}
          />
          
          <SettingsSelect
            label="Time Format"
            value={data.time_format}
            onChange={(value) => handleFieldChange('time_format', value)}
            options={TIME_FORMATS}
            disabled={disabled}
            icon={Clock}
          />
          
          <SettingsField
            label="Decimal Places"
            value={data.decimal_places}
            onChange={(value) => handleFieldChange('decimal_places', value)}
            type="number"
            min={0}
            max={4}
            error={errors.decimal_places}
            disabled={disabled}
            helpText="Number of decimal places for currency"
          />
        </SettingsGrid>
      </SettingsSection>

      {/* Tax Settings */}
      <SettingsSection
        title="Tax Settings"
        description="Configure tax rates and tax display"
        icon={DollarSign}
      >
        <SettingsGrid columns={2}>
          <SettingsField
            label="Tax Rate (%)"
            value={data.tax_rate}
            onChange={(value) => handleFieldChange('tax_rate', value)}
            type="number"
            min={0}
            max={100}
            step={0.01}
            error={errors.tax_rate}
            disabled={disabled}
            suffix="%"
            helpText="Default tax rate for sales"
          />
          
          <SettingsField
            label="Tax Name"
            value={data.tax_name}
            onChange={(value) => handleFieldChange('tax_name', value)}
            placeholder="VAT"
            error={errors.tax_name}
            disabled={disabled}
            helpText="Name displayed for tax (e.g., VAT, GST)"
          />
        </SettingsGrid>
      </SettingsSection>

      {/* Backup & Notifications */}
      <SettingsSection
        title="Backup & Notifications"
        description="Configure automatic backups and notification preferences"
        icon={Bell}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Automatic Backup"
            description="Automatically backup your data"
            checked={data.auto_backup}
            onChange={(checked) => handleFieldChange('auto_backup', checked)}
            disabled={disabled}
            icon={Bell}
          />
          
          {data.auto_backup && (
            <SettingsSelect
              label="Backup Frequency"
              value={data.backup_frequency}
              onChange={(value) => handleFieldChange('backup_frequency', value)}
              options={BACKUP_FREQUENCIES}
              disabled={disabled}
            />
          )}
          
          <SettingsToggle
            label="Enable Notifications"
            description="Receive system notifications"
            checked={data.notifications_enabled}
            onChange={(checked) => handleFieldChange('notifications_enabled', checked)}
            disabled={disabled}
            icon={Bell}
          />
          
          {data.notifications_enabled && (
            <div className="ml-6 space-y-3">
              <SettingsToggle
                label="Email Notifications"
                description="Receive notifications via email"
                checked={data.email_notifications}
                onChange={(checked) => handleFieldChange('email_notifications', checked)}
                disabled={disabled}
              />
              
              <SettingsToggle
                label="SMS Notifications"
                description="Receive notifications via SMS"
                checked={data.sms_notifications}
                onChange={(checked) => handleFieldChange('sms_notifications', checked)}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </SettingsSection>
    </div>
  )
} 