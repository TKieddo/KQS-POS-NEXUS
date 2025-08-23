'use client'

import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface CashUpSummaryProps {
  startingAmount: number
  cashSales: number
  refunds: number
  expectedCash: number
  actualCash: number
  difference: number
}

export const CashUpSummary: React.FC<CashUpSummaryProps> = ({
  startingAmount,
  cashSales,
  refunds,
  expectedCash,
  actualCash,
  difference
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Cash Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Starting Amount:</span>
          <span className="font-medium">{formatCurrency(startingAmount)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cash Sales:</span>
          <span className="font-medium">{formatCurrency(cashSales)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Refunds:</span>
          <span className="font-medium text-red-600">-{formatCurrency(refunds)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-medium">
            <span>Expected Cash:</span>
            <span>{formatCurrency(expectedCash)}</span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Actual Cash:</span>
          <span className="font-medium">{formatCurrency(actualCash)}</span>
        </div>
        
        <div className={`border-t border-gray-200 pt-2 ${difference !== 0 ? 'bg-red-50 rounded-lg p-2' : 'bg-green-50 rounded-lg p-2'}`}>
          <div className="flex justify-between font-bold">
            <span>Difference:</span>
            <span className={difference !== 0 ? 'text-red-600' : 'text-green-600'}>
              {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 