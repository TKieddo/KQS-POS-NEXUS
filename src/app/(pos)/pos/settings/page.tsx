'use client'

import React from 'react'
import { ArrowLeft, Settings, Printer, CreditCard, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <PageHeader
        title="POS Settings"
        backButtonText="Back"
        icon={<Settings className="h-4 w-4 text-black" />}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-6">
          <div className="text-center py-8">
            <Settings className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">POS Settings</h3>
            <p className="text-xs text-gray-500 mb-4">Configure POS system settings</p>
            <p className="text-xs text-gray-400">POS settings functionality coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
} 