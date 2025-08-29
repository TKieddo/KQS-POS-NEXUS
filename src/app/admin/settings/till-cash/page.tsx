'use client'

import React from 'react'
import { CreditCard, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { QuickActions } from '@/features/settings/components/till-cash/QuickActions'
import { TillCashSettings } from '@/features/settings/components/till-cash/TillCashSettings'

export default function TillCashPage() {
  return (
    <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Till & Cash</h1>
            <p className="text-base text-muted-foreground mt-1">Manage till operations and cash settings</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Settings */}
      <TillCashSettings />
    </div>
  )
}