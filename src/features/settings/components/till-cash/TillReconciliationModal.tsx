import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X, Calculator, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'

const reconciliationSchema = z.object({
  opening_amount: z.number().min(0, 'Opening amount must be 0 or greater'),
  sales_total: z.number().min(0, 'Sales total must be 0 or greater'),
  refunds_total: z.number().min(0, 'Refunds total must be 0 or greater'),
  cash_payments: z.number().min(0, 'Cash payments must be 0 or greater'),
  actual_amount: z.number().min(0, 'Actual amount must be 0 or greater'),
  notes: z.string().optional()
})

type ReconciliationFormData = z.infer<typeof reconciliationSchema>

interface TillReconciliationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reconciliation: {
    opening_amount: number
    sales_total: number
    refunds_total: number
    cash_payments: number
    actual_amount: number
    notes?: string
  }) => Promise<void>
  loading?: boolean
}

export const TillReconciliationModal: React.FC<TillReconciliationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [error, setError] = useState<string | null>(null)
  const [expectedAmount, setExpectedAmount] = useState<number>(0)
  const [variance, setVariance] = useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<ReconciliationFormData>({
    mode: 'onChange'
  })

  const watchedValues = watch()

  // Calculate expected amount and variance when form values change
  useEffect(() => {
    const { opening_amount = 0, sales_total = 0, refunds_total = 0, cash_payments = 0, actual_amount = 0 } = watchedValues
    
    const expected = opening_amount + sales_total - refunds_total - cash_payments
    setExpectedAmount(expected)
    setVariance(actual_amount - expected)
  }, [watchedValues])

  const onSubmit = async (data: ReconciliationFormData) => {
    setError(null)
    try {
      await onConfirm({
        opening_amount: data.opening_amount,
        sales_total: data.sales_total,
        refunds_total: data.refunds_total,
        cash_payments: data.cash_payments,
        actual_amount: data.actual_amount,
        notes: data.notes
      })
      reset()
      setExpectedAmount(0)
      setVariance(0)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record till reconciliation')
    }
  }

  const handleClose = () => {
    reset()
    setExpectedAmount(0)
    setVariance(0)
    setError(null)
    onClose()
  }

  const isVarianceSignificant = Math.abs(variance) > 1 // More than R1 variance

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Till Reconciliation">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calculator className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reconcile Till</h3>
                <p className="text-sm text-gray-500">Compare expected vs actual till amount</p>
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
            {/* Opening Amount */}
            <div>
              <label htmlFor="opening_amount" className="block text-sm font-medium text-gray-700 mb-2">
                Opening Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R
                </span>
                <Input
                  id="opening_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  {...register('opening_amount', { valueAsNumber: true })}
                />
              </div>
              {errors.opening_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.opening_amount.message}</p>
              )}
            </div>

            {/* Sales and Refunds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sales_total" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Sales Total</span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R
                  </span>
                  <Input
                    id="sales_total"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('sales_total', { valueAsNumber: true })}
                  />
                </div>
                {errors.sales_total && (
                  <p className="mt-1 text-sm text-red-600">{errors.sales_total.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="refunds_total" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span>Refunds Total</span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R
                  </span>
                  <Input
                    id="refunds_total"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('refunds_total', { valueAsNumber: true })}
                  />
                </div>
                {errors.refunds_total && (
                  <p className="mt-1 text-sm text-red-600">{errors.refunds_total.message}</p>
                )}
              </div>
            </div>

            {/* Cash Payments */}
            <div>
              <label htmlFor="cash_payments" className="block text-sm font-medium text-gray-700 mb-2">
                Cash Payments Received
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R
                </span>
                <Input
                  id="cash_payments"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  {...register('cash_payments', { valueAsNumber: true })}
                />
              </div>
              {errors.cash_payments && (
                <p className="mt-1 text-sm text-red-600">{errors.cash_payments.message}</p>
              )}
            </div>

            {/* Actual Amount */}
            <div>
              <label htmlFor="actual_amount" className="block text-sm font-medium text-gray-700 mb-2">
                Actual Amount in Till
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R
                </span>
                <Input
                  id="actual_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  {...register('actual_amount', { valueAsNumber: true })}
                />
              </div>
              {errors.actual_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.actual_amount.message}</p>
              )}
            </div>

            {/* Reconciliation Summary */}
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
                  R {(watchedValues.actual_amount || 0).toFixed(2)}
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
                    ? 'Perfect reconciliation! No variance detected.'
                    : variance > 0 
                    ? `Over by R ${variance.toFixed(2)} - investigate excess cash`
                    : `Short by R ${Math.abs(variance).toFixed(2)} - investigate missing cash`
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
                placeholder="Any additional notes about the reconciliation..."
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
                disabled={!isValid || loading}
              >
                {loading ? 'Recording...' : 'Record Reconciliation'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Modal>
  )
} 