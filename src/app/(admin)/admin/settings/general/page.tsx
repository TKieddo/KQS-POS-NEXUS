'use client'

import React from 'react'
import { Settings } from 'lucide-react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { GeneralSettingsForm } from '@/features/settings/components/general/GeneralSettingsForm'
import { useSettings } from '@/features/settings/hooks/useSettings'

export default function GeneralSettingsPage() {
  const { 
    generalSettings,
    isLoading, 
    isSaving,
    hasChanges,
    updateGeneralSettings,
    saveSettings,
    resetSettings,
    validateGeneralSettings
  } = useSettings()

  const handleSave = async () => {
    const errors = validateGeneralSettings()
    if (Object.keys(errors).length > 0) {
      alert('Please fix the errors before saving.')
      return
    }

    const result = await saveSettings()
    if (result.success) {
      alert('General settings saved successfully!')
    } else {
      alert('Failed to save general settings. Please try again.')
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
          <p className="text-gray-600">Loading general settings...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsPageLayout
      title="General Settings"
      description="Configure currency, timezone, language, and other general preferences"
      icon={Settings}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <GeneralSettingsForm
        data={generalSettings}
        onChange={updateGeneralSettings}
        errors={{}}
        disabled={isSaving}
      />
    </SettingsPageLayout>
  )
} 