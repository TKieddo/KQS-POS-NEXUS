'use client'

import React, { useEffect, useState } from 'react'
import { X, DollarSign, CreditCard, Building2, Smartphone, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { getEnabledPaymentMethods } from '@/lib/payment-options-service'

type UiMethod = {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  hoverColor: string
}

const UI_METHOD_CONFIG: Record<string, Omit<UiMethod, 'id' | 'name'>> = {
  cash: { icon: <DollarSign className="h-6 w-6" />, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  card: { icon: <CreditCard className="h-6 w-6" />, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  transfer: { icon: <Building2 className="h-6 w-6" />, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
  mpesa: { icon: <Smartphone className="h-6 w-6" />, color: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
  ecocash: { icon: <ArrowLeftRight className="h-6 w-6" />, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
  airtel_money: { icon: <Smartphone className="h-6 w-6" />, color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600' },
  orange_money: { icon: <Smartphone className="h-6 w-6" />, color: 'bg-pink-500', hoverColor: 'hover:bg-pink-600' }
}

interface LaybyePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentData: { amountReceived: number; paymentMethod: string }) => void
  depositAmount: number
  total: number
}

export const LaybyePaymentModal: React.FC<LaybyePaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  depositAmount,
  total
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [methods, setMethods] = useState<UiMethod[]>([])

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      const enabled = await getEnabledPaymentMethods()
      const uiIds: string[] = []
      if (enabled.includes('cash')) uiIds.push('cash')
      if (enabled.includes('card')) uiIds.push('card')
      if (enabled.includes('eft')) uiIds.push('transfer')
      if (enabled.includes('mpesa')) uiIds.push('mpesa')
      if (enabled.includes('ecocash')) uiIds.push('ecocash')
      if (enabled.includes('airtel_money')) uiIds.push('airtel_money')
      if (enabled.includes('orange_money')) uiIds.push('orange_money')

      const nameMap: Record<string, string> = {
        cash: 'Cash', 
        card: 'Card', 
        transfer: 'Bank Transfer', 
        mpesa: 'M-Pesa', 
        ecocash: 'EcoCash',
        airtel_money: 'Airtel Money',
        orange_money: 'Orange Money'
      }

      const ui: UiMethod[] = uiIds.map((id) => {
        const base = UI_METHOD_CONFIG[id]
        return { id, name: nameMap[id] || id, icon: base.icon, color: base.color, hoverColor: base.hoverColor }
      })
      setMethods(ui)
    }
    load()
  }, [isOpen])

  if (!isOpen) return null

  const handlePaymentComplete = async () => {
    if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < depositAmount)) {
      return
    }

    setIsProcessing(true)
    
    try {
      await onPaymentComplete({
        amountReceived: paymentMethod === 'cash' ? parseFloat(amountReceived) : depositAmount,
        paymentMethod
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setAmountReceived('')
    setPaymentMethod('cash')
    onClose()
  }

  const changeAmount = paymentMethod === 'cash' && amountReceived 
    ? Math.max(0, parseFloat(amountReceived) - depositAmount)
    : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div className="bg-white rounded-xl max-w-4xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Pay Deposit
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
		<div className="p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left column: Summary + Cash input */}
				<div className="space-y-6">
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="text-sm text-gray-600 mb-1">Deposit Amount</div>
						<div className="text-2xl font-bold text-[hsl(var(--primary))]">
							{formatCurrency(depositAmount)}
						</div>
						<div className="text-xs text-gray-500 mt-1">
							Total order value: {formatCurrency(total)}
						</div>
					</div>

					{paymentMethod === 'cash' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Amount Received *
							</label>
							<div className="relative">
								<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									type="number"
									placeholder="0.00"
									value={amountReceived}
									onChange={(e) => setAmountReceived(e.target.value)}
									className="pl-10 text-lg font-semibold"
									min="0"
									step="0.01"
									autoFocus
								/>
							</div>
						</div>
					)}

					{paymentMethod === 'cash' && parseFloat(amountReceived) > 0 && (
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-blue-800">Change Due:</span>
								<span className="text-xl font-bold text-blue-900">
									{formatCurrency(changeAmount)}
								</span>
							</div>
							{parseFloat(amountReceived) < depositAmount && (
								<div className="text-sm text-red-600">⚠️ Amount received is less than deposit amount</div>
							)}
							{parseFloat(amountReceived) >= depositAmount && (
								<div className="text-sm text-green-600">✓ Deposit amount covered</div>
							)}
						</div>
					)}

					<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
						<div className="text-sm text-green-800">
							After this payment: {formatCurrency(total - depositAmount)} remaining
						</div>
						<div className="text-xs text-green-600 mt-1">
							Lay-bye order will be created with {formatCurrency(depositAmount)} deposit
						</div>
					</div>
				</div>

				{/* Right column: Methods */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
					<div className="grid grid-cols-1 gap-3">
						{methods.map((method) => (
							<button
								key={method.id}
								type="button"
								onClick={() => setPaymentMethod(method.id)}
								className={`p-3 border rounded-lg flex items-center justify-center space-x-3 transition-colors ${
									paymentMethod === method.id ? 'border-[#E5FF29] bg-[#E5FF29]/10 text-black' : 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<div className={`${method.color} text-white rounded-lg p-2`}>{method.icon}</div>
								<span className="text-sm font-medium">{method.name}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentComplete}
            disabled={
              isProcessing ||
              (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < depositAmount))
            }
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-1" />
                Complete Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
