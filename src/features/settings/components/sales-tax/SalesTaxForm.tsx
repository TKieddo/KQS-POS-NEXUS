import React from 'react'
import { Calculator, Percent, Shield, FileText, Globe, AlertTriangle } from 'lucide-react'
import { SettingsSection } from '../SettingsSection'
import { SettingsToggle } from '../SettingsToggle'
import { SettingsField } from '../SettingsField'
import { SettingsGrid } from '../SettingsGrid'
import { SettingsSelect } from '../SettingsSelect'

interface SalesTaxData {
  // Tax Configuration
  tax_enabled: boolean
  default_tax_rate: string
  tax_name: string
  tax_registration_number: string
  
  // Tax Display
  show_tax_on_receipts: boolean
  show_tax_breakdown: boolean
  tax_inclusive_pricing: boolean
  
  // Tax Exemptions
  tax_exempt_categories: string[]
  tax_exempt_customer_types: string[]
  
  // Compliance
  auto_calculate_tax: boolean
  tax_rounding_method: string
  tax_decimal_places: string
  
  // Reporting
  tax_reporting_frequency: string
  tax_reporting_email: string
  tax_reporting_auto: boolean
}

interface SalesTaxFormProps {
  data: SalesTaxData
  onChange: (data: SalesTaxData) => void
  errors: Record<string, string>
  disabled?: boolean
}

export const SalesTaxForm: React.FC<SalesTaxFormProps> = ({
  data,
  onChange,
  errors,
  disabled = false
}) => {
  const handleFieldChange = (key: keyof SalesTaxData, value: any) => {
    onChange({ ...data, [key]: value })
  }

  const handleArrayFieldChange = (key: keyof SalesTaxData, value: string, action: 'add' | 'remove') => {
    const currentArray = data[key] as string[]
    let newArray: string[]
    
    if (action === 'add') {
      newArray = [...currentArray, value]
    } else {
      newArray = currentArray.filter(item => item !== value)
    }
    
    onChange({ ...data, [key]: newArray })
  }

  return (
    <div className="space-y-6">
      {/* Tax Configuration */}
      <SettingsSection
        title="Tax Configuration"
        description="Configure basic tax settings and rates"
        icon={Calculator}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable Tax Calculation"
            description="Enable automatic tax calculation on sales"
            checked={data.tax_enabled}
            onChange={(checked) => handleFieldChange('tax_enabled', checked)}
            disabled={disabled}
            icon={Calculator}
          />
          
          {data.tax_enabled && (
            <SettingsGrid columns={2}>
              <SettingsField
                label="Default Tax Rate"
                value={data.default_tax_rate}
                onChange={(value) => handleFieldChange('default_tax_rate', value)}
                type="number"
                min={0}
                max={100}
                step={0.01}
                error={errors.default_tax_rate}
                disabled={disabled}
                suffix="%"
                helpText="Default tax rate applied to products"
              />
              
              <SettingsField
                label="Tax Name"
                value={data.tax_name}
                onChange={(value) => handleFieldChange('tax_name', value)}
                placeholder="e.g., VAT, GST, Sales Tax"
                error={errors.tax_name}
                disabled={disabled}
                helpText="Name of the tax (appears on receipts)"
              />
              
              <SettingsField
                label="Tax Registration Number"
                value={data.tax_registration_number}
                onChange={(value) => handleFieldChange('tax_registration_number', value)}
                placeholder="e.g., 123456789"
                error={errors.tax_registration_number}
                disabled={disabled}
                helpText="Your business tax registration number"
              />
            </SettingsGrid>
          )}
        </div>
      </SettingsSection>

      {/* Tax Display */}
      <SettingsSection
        title="Tax Display"
        description="Configure how tax information is displayed"
        icon={Percent}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Show Tax on Receipts"
            description="Display tax amount on customer receipts"
            checked={data.show_tax_on_receipts}
            onChange={(checked) => handleFieldChange('show_tax_on_receipts', checked)}
            disabled={disabled}
            icon={Percent}
          />
          
          <SettingsToggle
            label="Show Tax Breakdown"
            description="Show detailed tax breakdown on receipts"
            checked={data.show_tax_breakdown}
            onChange={(checked) => handleFieldChange('show_tax_breakdown', checked)}
            disabled={disabled}
            icon={FileText}
          />
          
          <SettingsToggle
            label="Tax Inclusive Pricing"
            description="Product prices include tax (vs. tax added separately)"
            checked={data.tax_inclusive_pricing}
            onChange={(checked) => handleFieldChange('tax_inclusive_pricing', checked)}
            disabled={disabled}
            icon={Calculator}
          />
        </div>
      </SettingsSection>

      {/* Tax Exemptions */}
      <SettingsSection
        title="Tax Exemptions"
        description="Configure tax exemptions and special rates"
        icon={Shield}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tax Exempt Categories
            </label>
            <div className="space-y-2">
              {['Food & Beverages', 'Books & Educational', 'Medical Supplies', 'Export Goods'].map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`exempt-${category}`}
                    checked={data.tax_exempt_categories.includes(category)}
                    onChange={(e) => handleArrayFieldChange(
                      'tax_exempt_categories', 
                      category, 
                      e.target.checked ? 'add' : 'remove'
                    )}
                    disabled={disabled}
                    className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                  />
                  <label htmlFor={`exempt-${category}`} className="ml-2 text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select product categories that are exempt from tax
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tax Exempt Customer Types
            </label>
            <div className="space-y-2">
              {['Diplomatic', 'Charitable Organizations', 'Government', 'Export Customers'].map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`exempt-customer-${type}`}
                    checked={data.tax_exempt_customer_types.includes(type)}
                    onChange={(e) => handleArrayFieldChange(
                      'tax_exempt_customer_types', 
                      type, 
                      e.target.checked ? 'add' : 'remove'
                    )}
                    disabled={disabled}
                    className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                  />
                  <label htmlFor={`exempt-customer-${type}`} className="ml-2 text-sm text-gray-700">
                    {type}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select customer types that are exempt from tax
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Tax Calculation */}
      <SettingsSection
        title="Tax Calculation"
        description="Configure tax calculation methods and precision"
        icon={Calculator}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Auto Calculate Tax"
            description="Automatically calculate tax on all transactions"
            checked={data.auto_calculate_tax}
            onChange={(checked) => handleFieldChange('auto_calculate_tax', checked)}
            disabled={disabled}
            icon={Calculator}
          />
          
          <SettingsSelect
            label="Tax Rounding Method"
            value={data.tax_rounding_method}
            onChange={(value) => handleFieldChange('tax_rounding_method', value)}
            options={[
              { value: 'round', label: 'Round to nearest cent' },
              { value: 'floor', label: 'Round down' },
              { value: 'ceil', label: 'Round up' }
            ]}
            error={errors.tax_rounding_method}
            disabled={disabled}
            helpText="Method for rounding tax calculations"
          />
          
          <SettingsField
            label="Tax Decimal Places"
            value={data.tax_decimal_places}
            onChange={(value) => handleFieldChange('tax_decimal_places', value)}
            type="number"
            min={0}
            max={4}
            error={errors.tax_decimal_places}
            disabled={disabled}
            helpText="Number of decimal places for tax amounts"
          />
        </div>
      </SettingsSection>

      {/* Tax Reporting */}
      <SettingsSection
        title="Tax Reporting"
        description="Configure tax reporting and compliance settings"
        icon={FileText}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Auto Tax Reporting"
            description="Automatically generate and send tax reports"
            checked={data.tax_reporting_auto}
            onChange={(checked) => handleFieldChange('tax_reporting_auto', checked)}
            disabled={disabled}
            icon={FileText}
          />
          
          {data.tax_reporting_auto && (
            <SettingsGrid columns={2}>
              <SettingsSelect
                label="Reporting Frequency"
                value={data.tax_reporting_frequency}
                onChange={(value) => handleFieldChange('tax_reporting_frequency', value)}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'annually', label: 'Annually' }
                ]}
                error={errors.tax_reporting_frequency}
                disabled={disabled}
                helpText="How often to generate tax reports"
              />
              
              <SettingsField
                label="Reporting Email"
                value={data.tax_reporting_email}
                onChange={(value) => handleFieldChange('tax_reporting_email', value)}
                type="email"
                placeholder="tax@yourbusiness.com"
                error={errors.tax_reporting_email}
                disabled={disabled}
                helpText="Email address for tax reports"
              />
            </SettingsGrid>
          )}
        </div>
      </SettingsSection>
    </div>
  )
} 