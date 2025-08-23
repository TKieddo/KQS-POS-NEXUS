'use client'

import React, { useEffect, useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface CashTenderModalProps {
  isOpen: boolean
  amountDue: number
  onClose: () => void
  onConfirm: (amountReceived: number) => void
}

export const CashTenderModal: React.FC<CashTenderModalProps> = ({ isOpen, amountDue, onClose, onConfirm }) => {
  const [amountReceived, setAmountReceived] = useState<string>('')

  useEffect(() => {
    if (!isOpen) return
    setAmountReceived('')
  }, [isOpen])

  if (!isOpen) return null

  const received = parseFloat(amountReceived || '0')
  const change = Math.max(0, received - (amountDue || 0))
  const canConfirm = received >= (amountDue || 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-black" />
            <h3 className="text-lg font-semibold text-gray-900">Cash Received</h3>
          </div>
          <button onClick={onClose} className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500">Amount Due</div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(amountDue || 0)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500">Change</div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(change)}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received</label>
            <Input
              type="number"
              inputMode="decimal"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              min="0"
              step="0.01"
              className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-10 rounded-lg" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1 h-10 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 rounded-lg"
              disabled={!canConfirm}
              onClick={() => onConfirm(parseFloat(amountReceived))}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


