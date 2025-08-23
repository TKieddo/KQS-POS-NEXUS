'use client'

import { Receipt, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { ReprintSlipHistory } from '@/features/pos/components/reprints/ReprintSlipHistory'

export default function ReprintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader
        title="Receipts & Reprint"
        description="View and reprint past receipts"
        icon={<Receipt className="h-4 w-4 text-black" />}
      >
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print All
        </Button>
      </PageHeader>

      <div className="max-w-7xl mx-auto p-4">
        <ReprintSlipHistory />
      </div>
    </div>
  )
} 