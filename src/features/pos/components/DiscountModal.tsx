'use client'

import React, { useState } from 'react'
import { X, Percent, DollarSign, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface DiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onDiscountApplied: (discountAmount: number, discountType: 'percentage' | 'fixed') => void
  currentTotal: number
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onDiscountApplied,
  currentTotal
}) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const calculateDiscountAmount = () => {
    const value = parseFloat(discountValue) || 0
    if (discountType === 'percentage') {
      return (currentTotal * value) / 100
    }
    return value
  }

  const calculateFinalTotal = () => {
    return currentTotal - calculateDiscountAmount()
  }

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue)
    
    if (!value || value <= 0) {
      setError('Please enter a valid discount value')
      return
    }

    if (discountType === 'percentage' && value > 100) {
      setError('Percentage discount cannot exceed 100%')
      return
    }

    if (discountType === 'fixed' && value > currentTotal) {
      setError('Fixed discount cannot exceed total amount')
      return
    }

    const discountAmount = calculateDiscountAmount()
    onDiscountApplied(discountAmount, discountType)
    handleClose()
  }

  const handleClose = () => {
    setDiscountValue('')
    setDiscountType('percentage')
    setError('')
    onClose()
  }

  const discountAmount = calculateDiscountAmount()
  const finalTotal = calculateFinalTotal()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Percent className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Add Discount
            </h2>
            <button
              onClick={handleClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Total */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Current Total</div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(currentTotal)}</div>
          </div>

          {/* Discount Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={discountType === 'percentage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDiscountType('percentage')}
                className={discountType === 'percentage' ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90' : ''}
              >
                <Percent className="h-4 w-4 mr-1" />
                Percentage
              </Button>
              <Button
                variant={discountType === 'fixed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDiscountType('fixed')}
                className={discountType === 'fixed' ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90' : ''}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Fixed Amount
              </Button>
            </div>
          </div>

          {/* Discount Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount {discountType === 'percentage' ? 'Percentage' : 'Amount'}
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder={discountType === 'percentage' ? '10' : '5.00'}
                value={discountValue}
                onChange={(e) => {
                  setDiscountValue(e.target.value)
                  setError('')
                }}
                className="pr-12"
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
                step={discountType === 'percentage' ? '1' : '0.01'}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {discountType === 'percentage' ? '%' : '$'}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Preview */}
          {discountValue && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Discount Amount:</span>
                <span className="font-medium text-green-700">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-gray-900">Final Total:</span>
                <span className="text-green-700">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          )}

          {/* Quick Discount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Discounts</label>
            <div className="grid grid-cols-3 gap-2">
              {discountType === 'percentage' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscountValue('5')}
                    className="text-xs"
                  >
                    5%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscountValue('10')}
                    className="text-xs"
                  >
                    10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscountValue('15')}
                    className="text-xs"
                  >
                    15%
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscountValue('5')}
                    className="text-xs"
                  >
                    $5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscountValue('10')}
                    className="text-xs"
                  >
                    $10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscountValue('20')}
                    className="text-xs"
                  >
                    $20
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyDiscount}
            disabled={!discountValue || !!error}
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            <Calculator className="h-4 w-4 mr-1" />
            Apply Discount
          </Button>
        </div>
      </div>
    </div>
  )
} 