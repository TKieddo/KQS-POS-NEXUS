'use client'

import { Lock } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { CashDrawerControl } from '@/features/pos/components/cash-drawer/CashDrawerControl'

export default function CashDrawerPage() {
  const handleDrawerOpen = () => {
    console.log('Cash drawer opened')
  }

  const handleDrawerClose = () => {
    console.log('Cash drawer closed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader
        title="Cash Drawer Control"
        backButtonText="Back"
        icon={<Lock className="h-4 w-4 text-black" />}
      />

      <div className="max-w-7xl mx-auto p-4">
        <CashDrawerControl 
          onDrawerOpen={handleDrawerOpen}
          onDrawerClose={handleDrawerClose}
        />
      </div>
    </div>
  )
} 