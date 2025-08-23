import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Card } from '@/components/ui/card'

const cashDropSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason too long')
})

type CashDropFormData = z.infer<typeof cashDropSchema>

interface CashDropModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number, reason: string) => Promise<void>
  currentTillAmount: number
  loading?: boolean
}

export const CashDropModal: React.FC<CashDropModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentTillAmount,
  loading = false
}) => {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<CashDropFormData>({
    mode: 'onChange'
  })

  const amount = watch('amount') || 0
  const remainingAmount = currentTillAmount - amount

  const onSubmit = async (data: CashDropFormData) => {
    if (data.amount > currentTillAmount) {
      setError('Cash drop amount cannot exceed current till amount')
      return
    }

    setError(null)
    try {
      await onConfirm(data.amount, data.reason)
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform cash drop')
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cash Drop">
      <div className="w-full max-w-md mx-auto">
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Perform Cash Drop</h3>
                <p className="text-sm text-gray-500">Remove cash from the till</p>
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

          {/* Current Till Amount */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Current Till Amount:</span>
              <span className="text-lg font-semibold text-gray-900">
                R {currentTillAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Cash Drop Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={currentTillAmount}
                  placeholder="0.00"
                  className="pl-8"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Remaining Amount Display */}
            {amount > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Remaining Amount:</span>
                  <span className={`text-sm font-semibold ${remainingAmount < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                    R {remainingAmount.toFixed(2)}
                  </span>
                </div>
                {remainingAmount < 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    Amount exceeds current till balance
                  </p>
                )}
              </div>
            )}

            {/* Reason Input */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cash Drop
              </label>
              <Input
                id="reason"
                placeholder="e.g., Bank deposit, Petty cash, etc."
                {...register('reason')}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
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
                disabled={!isValid || loading || amount > currentTillAmount}
              >
                {loading ? 'Processing...' : 'Confirm Cash Drop'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Modal>
  )
} 