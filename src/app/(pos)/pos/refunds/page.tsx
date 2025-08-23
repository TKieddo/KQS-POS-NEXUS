'use client'

import { RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { RefundManagement } from '@/features/pos/components/refunds/RefundManagement'

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader
        title="Refunds & Exchanges"
        description="Process returns and manage refunds"
        icon={<RefreshCw className="h-4 w-4 text-black" />}
      />

      <div className="max-w-7xl mx-auto p-4">
        <RefundManagement />
      </div>
    </div>
  )
} 