'use client'

import React, { useState, useEffect } from 'react'
import { X, CreditCard, Calendar, DollarSign, User, Package, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { usePOSSettingsHook } from '@/hooks/usePOSSettings'
import { formatDueDate, getLaybyeDurationText } from '@/lib/pos-settings-service'
import type { CartItem, Customer } from '../types'

interface LaybyeModalProps {
  isOpen: boolean
  onClose: () => void
  onLaybyeCreated: (laybyeData: any) => void
  cart: CartItem[]
  customer: Customer | null
  total: number
}

export const LaybyeModal: React.FC<LaybyeModalProps> = ({
  isOpen,
  onClose,
  onLaybyeCreated,
  cart,
  customer,
  total
}) => {
  const { settings: posSettings, loading: loadingSettings } = usePOSSettingsHook()
  const [depositAmount, setDepositAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [dueDateManuallyChanged, setDueDateManuallyChanged] = useState(false)

  // Auto-set due date when settings are loaded (only if not manually changed)
  useEffect(() => {
    if (posSettings && !dueDateManuallyChanged && isOpen) {
      const autoDueDate = formatDueDate(posSettings)
      setDueDate(autoDueDate)
    }
  }, [posSettings, dueDateManuallyChanged, isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDepositAmount('')
      setDueDate('')
      setNotes('')
      setError('')
      setDueDateManuallyChanged(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const depositPercentage = depositAmount ? (parseFloat(depositAmount) / total) * 100 : 0
  const remainingBalance = total - (parseFloat(depositAmount) || 0)

  const handleCreateLaybye = async () => {
    // Check if customer is required based on settings
    if (posSettings?.require_customer_for_laybye && !customer) {
      setError('Please select a customer first')
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount')
      return
    }

    if (parseFloat(depositAmount) >= total) {
      setError('Deposit amount cannot be greater than or equal to total amount')
      return
    }

    // Check minimum deposit percentage
    if (posSettings?.min_laybye_deposit_percentage) {
      const minDepositAmount = (total * posSettings.min_laybye_deposit_percentage) / 100
      if (parseFloat(depositAmount) < minDepositAmount) {
        setError(`Minimum deposit is ${posSettings.min_laybye_deposit_percentage}% (${formatCurrency(minDepositAmount)})`)
        return
      }
    }

    if (!dueDate) {
      setError('Please select a due date')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Create the laybye data for the service
      const laybyeData = {
        customerId: customer?.id || '',
        depositAmount: parseFloat(depositAmount),
        dueDate: dueDate,
        notes: notes.trim() || undefined
      }

      // Call the parent handler which will use the real service
      onLaybyeCreated(laybyeData)
      handleClose()
    } catch (error) {
      console.error('Error creating laybye order:', error)
      setError('Failed to create laybye order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setDepositAmount('')
    setDueDate('')
    setNotes('')
    setError('')
    onClose()
  }

  const getMinDueDate = () => {
    const today = new Date()
    const minDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    return minDate.toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Create Lay-bye Order
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Error Message - Full Width */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Customer & Order Info */}
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Customer Information</span>
                  </div>
                  {customer ? (
                    <div>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">⚠️ No customer selected</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Order Summary</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-semibold">{cart.length} items</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="font-medium text-gray-700">Total Amount:</span>
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Deposit Amount */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-[#E5FF29]" />
                    Deposit Amount *
                  </label>
                  
                  {posSettings?.min_laybye_deposit_percentage && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Minimum required:</strong> {posSettings.min_laybye_deposit_percentage}% 
                        ({formatCurrency((total * posSettings.min_laybye_deposit_percentage) / 100)})
                      </p>
                    </div>
                  )}
                  
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value)
                        setError('')
                      }}
                      className="pl-10 text-lg font-semibold"
                      min="0"
                      max={total - 0.01}
                      step="0.01"
                    />
                  </div>
                  
                  {depositAmount && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-center">
                      <p className="text-sm text-gray-600">Deposit: {formatCurrency(parseFloat(depositAmount) || 0)}</p>
                      <p className="text-xs text-gray-500">({depositPercentage.toFixed(1)}% of total)</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        Remaining: {formatCurrency(remainingBalance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Due Date & Details */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#E5FF29]" />
                      Due Date *
                    </label>
                    {posSettings && !dueDateManuallyChanged && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Settings className="h-3 w-3" />
                        <span>Auto: {getLaybyeDurationText(posSettings)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value)
                        setDueDateManuallyChanged(true)
                        setError('')
                      }}
                      className="pl-10"
                      min={getMinDueDate()}
                      disabled={loadingSettings}
                    />
                  </div>
                  
                  {posSettings && !dueDateManuallyChanged ? (
                    <div className="text-xs text-gray-500 mt-2">
                      Due date automatically set based on store policy. You can change it if needed.
                    </div>
                  ) : dueDateManuallyChanged ? (
                    <div className="text-xs text-blue-600 mt-2">
                      Due date manually adjusted from store default.
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      Minimum 7 days from today
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions or notes..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Summary Section - Full Width */}
            {depositAmount && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-[#E5FF29]" />
                  Lay-bye Order Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg text-gray-900">{formatCurrency(total)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Deposit ({depositPercentage.toFixed(1)}%)</p>
                    <p className="font-bold text-lg text-green-600">{formatCurrency(parseFloat(depositAmount) || 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Remaining Balance</p>
                    <p className="font-bold text-lg text-orange-600">{formatCurrency(remainingBalance)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Due Date *
              </label>
              {posSettings && !dueDateManuallyChanged && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Settings className="h-3 w-3" />
                  <span>Auto: {getLaybyeDurationText(posSettings)}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  setDueDateManuallyChanged(true)
                  setError('')
                }}
                className="pl-10"
                min={getMinDueDate()}
                disabled={loadingSettings}
              />
            </div>
            {posSettings && !dueDateManuallyChanged ? (
              <div className="text-xs text-gray-500 mt-1">
                Due date automatically set based on store policy. You can change it if needed.
              </div>
            ) : dueDateManuallyChanged ? (
              <div className="text-xs text-blue-600 mt-1">
                Due date manually adjusted from store default.
              </div>
            ) : (
              <div className="mt-1 text-xs text-gray-500">
                Minimum 7 days from today
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateLaybye}
            disabled={isProcessing || !customer || !depositAmount || !dueDate || parseFloat(depositAmount) >= total}
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-1" />
                Create Lay-bye
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 