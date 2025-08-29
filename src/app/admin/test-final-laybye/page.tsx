'use client'

import React from 'react'
import LaybyeFinalPaymentReceiptPreview from '@/components/ui/laybye-final-payment-receipt-preview'

const TestFinalLaybyePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test: Final Laybye Payment Receipt
          </h1>
          <p className="text-gray-600">
            Testing the new final laybye payment receipt template
          </p>
        </div>

        <LaybyeFinalPaymentReceiptPreview />
      </div>
    </div>
  )
}

export default TestFinalLaybyePage
