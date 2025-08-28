'use client'
import React, { useState, useEffect } from 'react'
import { Calculator } from 'lucide-react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { SalesTaxForm } from '@/features/settings/components/sales-tax/SalesTaxForm'
import { loadSalesTaxSettings, updateSalesTaxSettings, type SalesTaxData } from '@/lib/sales-tax-service'

const SalesTaxSettingsPage = () => {
  const [data, setData] = useState<SalesTaxData>({
    tax_enabled: false,
    default_tax_rate: '15.00',
    tax_name: 'VAT',
    tax_registration_number: '',
    show_tax_on_receipts: true,
    show_tax_breakdown: true,
    tax_inclusive_pricing: false,
    tax_exempt_categories: [],
    tax_exempt_customer_types: [],
    auto_calculate_tax: true,
    tax_rounding_method: 'round',
    tax_decimal_places: '2',
    tax_reporting_frequency: 'monthly',
    tax_reporting_email: '',
    tax_reporting_auto: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<SalesTaxData | null>(null)

  // Load sales tax settings on component mount
  useEffect(() => {
    loadSalesTaxData()
  }, [])

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const hasDataChanged = JSON.stringify(data) !== JSON.stringify(originalData)
      setHasChanges(hasDataChanged)
    }
  }, [data, originalData])

  const loadSalesTaxData = async () => {
    try {
      setIsLoading(true)
      const salesTaxSettings = await loadSalesTaxSettings()
      if (salesTaxSettings) {
        setData(salesTaxSettings)
        setOriginalData(salesTaxSettings)
      }
    } catch (error) {
      console.error('Error loading sales tax settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataChange = (newData: SalesTaxData) => {
    setData(newData)
    // Clear any previous errors when data changes
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate default tax rate
    if (data.tax_enabled && data.default_tax_rate) {
      const taxRate = parseFloat(data.default_tax_rate)
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        newErrors.default_tax_rate = 'Tax rate must be between 0 and 100'
      }
    }

    // Validate tax name
    if (data.tax_enabled && !data.tax_name.trim()) {
      newErrors.tax_name = 'Tax name is required when tax is enabled'
    }

    // Validate tax decimal places
    if (data.tax_decimal_places) {
      const decimalPlaces = parseInt(data.tax_decimal_places)
      if (isNaN(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 4) {
        newErrors.tax_decimal_places = 'Decimal places must be between 0 and 4'
      }
    }

    // Validate tax reporting email
    if (data.tax_reporting_auto && data.tax_reporting_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.tax_reporting_email)) {
        newErrors.tax_reporting_email = 'Please enter a valid email address'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before saving.')
      return
    }

    try {
      setIsSaving(true)
      
      const success = await updateSalesTaxSettings(data)
      
      if (success) {
        setOriginalData(data)
        setHasChanges(false)
        alert('Sales tax settings saved successfully!')
      } else {
        alert('Failed to save sales tax settings. Please try again.')
      }
    } catch (error) {
      console.error('Error saving sales tax settings:', error)
      alert('An error occurred while saving. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      if (originalData) {
        setData(originalData)
        setErrors({})
        setHasChanges(false)
      }
    }
  }

  if (isLoading) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales tax settings...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsPageLayout
      title="Sales Tax Configuration"
      description="Configure tax rates, exemptions, and compliance settings"
      icon={Calculator}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <SalesTaxForm
        data={data}
        onChange={handleDataChange}
        errors={errors}
        disabled={isSaving}
      />
    </SettingsPageLayout>
  )
}

export default SalesTaxSettingsPage 