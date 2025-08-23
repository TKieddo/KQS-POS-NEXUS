import React from 'react'
import { SettingsField } from '../SettingsField'
import { SettingsGrid } from '../SettingsGrid'
import { SettingsToggle } from '../SettingsToggle'
import { Calculator, TrendingUp, Package, AlertTriangle } from 'lucide-react'
import type { PricingSettings } from '@/lib/product-pricing-complete-service'

interface PricingSettingsFormProps {
  settings: PricingSettings | null
  onUpdate: (updates: Partial<PricingSettings>) => Promise<boolean>
  isLoading?: boolean
  disabled?: boolean
}

export const PricingSettingsForm: React.FC<PricingSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading = false,
  disabled = false
}) => {
  const handleFieldChange = async (field: keyof PricingSettings, value: any) => {
    if (!settings) {
      console.error('No settings available for update')
      return
    }
    
    console.log(`Updating field ${field} to value:`, value)
    console.log('Current settings:', settings)
    
    try {
      const success = await onUpdate({ [field]: value })
      if (success) {
        console.log(`Successfully updated ${field} to ${value}`)
      } else {
        console.error(`Failed to update ${field}`)
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
    }
  }

  const handleToggleChange = async (field: keyof PricingSettings, checked: boolean) => {
    console.log(`Toggle ${field} changed to:`, checked)
    await handleFieldChange(field, checked)
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pricing Configuration */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-[#E5FF29]" />
          Pricing Configuration
        </h4>
        <SettingsGrid columns={2}>
          <SettingsField
            label="Default Markup (%)"
            value={typeof settings.default_markup_percentage === 'number' ? settings.default_markup_percentage : parseFloat(settings.default_markup_percentage as string) || 0}
            onChange={(value) => handleFieldChange('default_markup_percentage', parseFloat(value) || 0)}
            placeholder="30"
            type="number"
            min="0"
            step="0.1"
            icon={TrendingUp}
            disabled={disabled || isLoading}
            helpText="Default markup percentage applied to products"
          />
          
          <SettingsField
            label="Min Profit Margin (%)"
            value={typeof settings.min_profit_margin === 'number' ? settings.min_profit_margin : parseFloat(settings.min_profit_margin as string) || 0}
            onChange={(value) => handleFieldChange('min_profit_margin', parseFloat(value) || 0)}
            placeholder="15"
            type="number"
            min="0"
            step="0.1"
            icon={Calculator}
            disabled={disabled || isLoading}
            helpText="Minimum profit margin allowed"
          />
        </SettingsGrid>
      </div>
      
      {/* Pricing Features */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Package className="h-4 w-4 text-[#E5FF29]" />
          Pricing Features
        </h4>
        <div className="space-y-3">
          <SettingsToggle
            label="Competitive Pricing"
            description="Enable competitive pricing analysis"
            checked={settings.competitive_pricing_enabled || false}
            onChange={(checked) => handleToggleChange('competitive_pricing_enabled', checked)}
            disabled={disabled || isLoading}
          />
          
          <SettingsToggle
            label="Auto Price Adjustment"
            description="Automatically adjust prices based on market conditions"
            checked={settings.auto_price_adjustment || false}
            onChange={(checked) => handleToggleChange('auto_price_adjustment', checked)}
            disabled={disabled || isLoading}
          />
          
          <SettingsToggle
            label="Bulk Update Enabled"
            description="Allow bulk price updates across multiple products"
            checked={settings.bulk_update_enabled || false}
            onChange={(checked) => handleToggleChange('bulk_update_enabled', checked)}
            disabled={disabled || isLoading}
          />
          
          <SettingsToggle
            label="Discount Management"
            description="Enable discount management features"
            checked={settings.discount_management_enabled || false}
            onChange={(checked) => handleToggleChange('discount_management_enabled', checked)}
            disabled={disabled || isLoading}
          />
          
          <SettingsToggle
            label="Price Optimization"
            description="Enable AI-powered price optimization"
            checked={settings.price_optimization_enabled || false}
            onChange={(checked) => handleToggleChange('price_optimization_enabled', checked)}
            disabled={disabled || isLoading}
          />
        </div>
      </div>
    </div>
  )
} 