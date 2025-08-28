'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LaybyeFinalPaymentReceiptPreview from '@/components/ui/laybye-final-payment-receipt-preview'

const LaybyeFinalPaymentPreviewPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/settings/branch-receipts" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Branch Receipts
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Final Laybye Payment Receipt Template
          </h1>
          <p className="text-gray-600">
            Preview of the final laybye payment receipt showing completion status and collection ready notice
          </p>
        </div>

        <LaybyeFinalPaymentReceiptPreview />
      </div>
    </div>
  )
}

export default LaybyeFinalPaymentPreviewPage
