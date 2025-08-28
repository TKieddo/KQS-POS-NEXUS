import React from 'react'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import Link from 'next/link'

interface SettingsPageLayoutProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onSave?: () => void
  onReset?: () => void
  isSaving?: boolean
  hasChanges?: boolean
  backHref?: string
  backLabel?: string
  showSaveButton?: boolean
  showResetButton?: boolean
  saveButtonText?: string
  resetButtonText?: string
}

export const SettingsPageLayout: React.FC<SettingsPageLayoutProps> = ({
  title,
  description,
  icon: Icon,
  children,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  backHref = '/settings',
  backLabel = 'Back to Settings',
  showSaveButton = true,
  showResetButton = true,
  saveButtonText = 'Save Changes',
  resetButtonText = 'Reset'
}) => {
  if (!backHref) {
    backHref = '/settings';
  }
  return (
    <div className="p-6 min-h-screen bg-[hsl(var(--background))] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref}>
              <PremiumButton variant="outline" size="sm" className="rounded-full px-3 py-1.5 text-xs">
                <ArrowLeft className="h-3 w-3 mr-1" />
                {backLabel}
              </PremiumButton>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[#E5FF29] flex items-center justify-center">
                <Icon className="h-5 w-5 text-black" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showResetButton && onReset && (
            <PremiumButton
              variant="outline"
              onClick={onReset}
              size="sm"
              className="rounded-full px-3 py-1.5 text-xs"
              disabled={isSaving}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {resetButtonText}
            </PremiumButton>
          )}
          
          {showSaveButton && onSave && (
            <PremiumButton
              onClick={onSave}
              gradient="green"
              size="sm"
              className="rounded-full px-3 py-1.5 text-xs"
              disabled={isSaving || !hasChanges}
            >
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? 'Saving...' : saveButtonText}
            </PremiumButton>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 