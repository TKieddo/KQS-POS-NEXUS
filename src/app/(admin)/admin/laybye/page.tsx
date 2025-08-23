'use client'

import React from 'react'
import { LaybyeManagement } from '@/features/sales/components/LaybyeManagement'

export default function LaybyePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="p-8">
        <div className="mb-6">
              <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Lay-bye Management</h1>
          <p className="text-gray-600 mt-2">Manage customer lay-bye orders, payments, and schedules</p>
        </div>

        <LaybyeManagement />
      </div>
    </div>
  )
} 