'use client'

import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { OnlineHelpSystem } from '@/features/pos/components/help/OnlineHelpSystem'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader
        title="Help Center"
        description="Get help and support for KQS POS"
        icon={<BookOpen className="h-4 w-4 text-black" />}
      />

      <div className="max-w-7xl mx-auto p-4">
        <OnlineHelpSystem />
      </div>
    </div>
  )
} 