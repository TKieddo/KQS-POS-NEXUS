import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X, Calculator, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'

const denominationValues = {
  'R200': 200, 'R100': 100, 'R50': 50, 'R20': 20, 'R10': 10, 'R5': 5,
  'R2': 2, 'R1': 1, '50c': 0.5, '20c': 0.2, '10c': 0.1, '5c': 0.05
}

const denominations = Object.keys(denominationValues) as (keyof typeof denominationValues)[]

const tillCountSchema = z.object({
  expected_amount: z.number().min(0, 'Expected amount must be 0 or greater'),
  notes: z.string().optional()
})

type TillCountFormData = z.infer<typeof tillCountSchema>

interface TillCountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (expectedAmount: number, denominationCounts: Record<string, number>, notes?: string) => Promise<void>
  loading?: boolean
}

export const TillCountModal: React.FC<TillCountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [error, setError] = useState<string | null>(null)
  const [denominationCounts, setDenominationCounts] = useState<Record<string, number>>({})
  const [actualAmount, setActualAmount] = useState<number>(0)
  const [variance, setVariance] = useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<TillCountFormData>({
    mode: 'onChange'
  })

  const expectedAmount = watch('expected_amount') || 0

  // Calculate actual amount and variance when denomination counts change
  useEffect(() => {
    const total = Object.entries(denominationCounts).reduce((sum, [denom, count]) => {
      return sum + (count * denominationValues[denom as keyof typeof denominationValues])
    }, 0)
    
    setActualAmount(total)
    setVariance(total - expectedAmount)
  }, [denominationCounts, expectedAmount])

  const handleDenominationChange = (denomination: string, count: number) => {
    setDenominationCounts(prev => ({
      ...prev,
      [denomination]: Math.max(0, count)
    }))
  }

  const onSubmit = async (data: TillCountFormData) => {
    if (Object.keys(denominationCounts).length === 0) {
      setError('Please count at least one denomination')
      return
    }

    setError(null)
    try {
      await onConfirm(data.expected_amount, denominationCounts, data.notes)
      reset()
      setDenominationCounts({})
      setActualAmount(0)
      setVariance(0)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record till count')
    }
  }

  const handleClose = () => {
    reset()
    setDenominationCounts({})
    setActualAmount(0)
    setVariance(0)
    setError(null)
    onClose()
  }

  const isVarianceSignificant = Math.abs(variance) > 1 // More than R1 variance

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Till Count">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calculator className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Count Till</h3>
                <p className="text-sm text-gray-500">Record actual cash in till</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Expected Amount */}
            <div>
              <label htmlFor="expected_amount" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R
                </span>
                <Input
                  id="expected_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  {...register('expected_amount', { valueAsNumber: true })}
                />
              </div>
              {errors.expected_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.expected_amount.message}</p>
              )}
            </div>

            {/* Denomination Counts */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Count Each Denomination</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {denominations.map((denom) => (
                  <div key={denom} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      {denom}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={denominationCounts[denom] || ''}
                      onChange={(e) => handleDenominationChange(denom, parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      R {(denominationValues[denom] * (denominationCounts[denom] || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Expected</div>
                <div className="text-lg font-semibold text-gray-900">
                  R {expectedAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Actual</div>
                <div className="text-lg font-semibold text-gray-900">
                  R {actualAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Variance</div>
                <div className={`text-lg font-semibold ${variance === 0 ? 'text-green-600' : variance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R {variance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Variance Alert */}
            {isVarianceSignificant && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                variance === 0 ? 'bg-green-50' : variance > 0 ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                {variance === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <p className={`text-sm ${
                  variance === 0 ? 'text-green-700' : variance > 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {variance === 0 
                    ? 'Perfect count! No variance detected.'
                    : variance > 0 
                    ? `Over by R ${variance.toFixed(2)}`
                    : `Short by R ${Math.abs(variance).toFixed(2)}`
                  }
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <Input
                id="notes"
                placeholder="Any additional notes about the count..."
                {...register('notes')}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!isValid || loading || Object.keys(denominationCounts).length === 0}
              >
                {loading ? 'Recording...' : 'Record Till Count'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Modal>
  )
} 