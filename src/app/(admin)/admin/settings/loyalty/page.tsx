'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { LoyaltyForm } from '@/features/settings/components/loyalty/LoyaltyForm'

const LoyaltySettingsPage = () => {
  return (
    <SettingsPageLayout
      title="Loyalty Program"
      description="Build customer loyalty with points, rewards, and exclusive benefits."
      icon={Star}
    >
      <LoyaltyForm />
    </SettingsPageLayout>
  )
}

export default LoyaltySettingsPage 