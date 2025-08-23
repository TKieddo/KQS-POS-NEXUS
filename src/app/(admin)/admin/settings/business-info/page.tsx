'use client'

import React from 'react'
import { Building } from 'lucide-react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { BusinessInfoForm } from '@/features/settings/components/business-info/BusinessInfoForm'
import { useSettings } from '@/features/settings/hooks/useSettings'

export default function BusinessInfoPage() {
  const { 
    businessInfo,
    isLoading, 
    isSaving,
    hasChanges,
    updateBusinessInfo,
    saveSettings,
    resetSettings,
    validateBusinessInfo
  } = useSettings()

  const handleSave = async () => {
    const errors = validateBusinessInfo()
    if (Object.keys(errors).length > 0) {
      alert('Please fix the errors before saving.')
      return
      }
      
    const result = await saveSettings()
    if (result.success) {
      alert('Business information saved successfully!')
    } else {
      alert('Failed to save business information. Please try again.')
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      resetSettings()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsPageLayout
      title="Business Information"
      description="Manage your business details, contact information, and operating hours"
      icon={Building}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <BusinessInfoForm
        data={businessInfo}
        onChange={updateBusinessInfo}
        errors={{}}
        disabled={isSaving}
          />
    </SettingsPageLayout>
  )
} 