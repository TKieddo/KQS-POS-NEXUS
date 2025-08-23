import React from 'react'
import { Building, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { SettingsSection } from '../SettingsSection'
import { SettingsField } from '../SettingsField'
import { SettingsGrid } from '../SettingsGrid'
import { BusinessHoursEditor } from '../BusinessHoursEditor'

interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

interface BusinessInfoFormData {
  business_name: string
  business_address: string
  business_phone: string
  business_email: string
  business_website: string
  logo_url: string
  business_hours: BusinessHours
}

interface BusinessInfoFormProps {
  data: BusinessInfoFormData
  onChange: (data: BusinessInfoFormData) => void
  errors: Record<string, string>
  disabled?: boolean
}

export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  data,
  onChange,
  errors,
  disabled = false
}) => {
  const handleFieldChange = (key: keyof BusinessInfoFormData, value: any) => {
    onChange({ ...data, [key]: value })
  }

  const handleBusinessHoursChange = (hours: BusinessHours) => {
    handleFieldChange('business_hours', hours)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <SettingsSection
        title="Basic Information"
        description="Your business name and contact details"
        icon={Building}
      >
        <SettingsGrid columns={2}>
          <SettingsField
            label="Business Name"
            value={data.business_name}
            onChange={(value) => handleFieldChange('business_name', value)}
            placeholder="Enter business name"
            error={errors.business_name}
            required
            disabled={disabled}
            icon={Building}
          />
          
          <SettingsField
            label="Business Phone"
            value={data.business_phone}
            onChange={(value) => handleFieldChange('business_phone', value)}
            placeholder="+27 12 345 6789"
            error={errors.business_phone}
            type="tel"
            disabled={disabled}
            icon={Phone}
          />
          
          <SettingsField
            label="Business Email"
            value={data.business_email}
            onChange={(value) => handleFieldChange('business_email', value)}
            placeholder="info@yourbusiness.com"
            error={errors.business_email}
            type="email"
            disabled={disabled}
            icon={Mail}
          />
          
          <SettingsField
            label="Business Website"
            value={data.business_website}
            onChange={(value) => handleFieldChange('business_website', value)}
            placeholder="https://yourbusiness.com"
            error={errors.business_website}
            type="url"
            disabled={disabled}
            icon={Globe}
          />
        </SettingsGrid>
        
        <SettingsField
          label="Business Address"
          value={data.business_address}
          onChange={(value) => handleFieldChange('business_address', value)}
          placeholder="Enter full business address"
          error={errors.business_address}
          disabled={disabled}
          icon={MapPin}
        />
      </SettingsSection>

      {/* Operating Hours */}
      <SettingsSection
        title="Operating Hours"
        description="Set your business operating hours for each day of the week"
        icon={Building}
      >
        <BusinessHoursEditor
          value={data.business_hours}
          onChange={handleBusinessHoursChange}
          disabled={disabled}
        />
      </SettingsSection>

      {/* Logo & Branding */}
      <SettingsSection
        title="Logo & Branding"
        description="Upload your business logo and manage branding"
        icon={Building}
      >
        <SettingsField
          label="Logo URL"
          value={data.logo_url}
          onChange={(value) => handleFieldChange('logo_url', value)}
          placeholder="https://example.com/logo.png"
          error={errors.logo_url}
          type="url"
          disabled={disabled}
          helpText="Enter the URL of your business logo"
        />
      </SettingsSection>
    </div>
  )
} 