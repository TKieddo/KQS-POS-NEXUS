'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  Building2, 
  Smartphone, 
  ArrowLeftRight,
  User,
  Wallet,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { getEnabledPaymentMethods } from '@/lib/payment-options-service'

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentMethodSelect: (method: string) => void
  totalAmount: number
}

type UiMethod = {
  id: string
  name: string
  description: string
  color: string
  hoverColor: string
  icon: React.ReactNode
}

const UI_METHOD_CONFIG: Record<string, Omit<UiMethod, 'id' | 'name' | 'description'>> = {
  cash: {
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    icon: <DollarSign className="h-6 w-6" />
  },
  card: {
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    icon: <CreditCard className="h-6 w-6" />
  },
  transfer: {
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    icon: <Building2 className="h-6 w-6" />
  },
  mpesa: {
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    icon: <Smartphone className="h-6 w-6" />
  },
  ecocash: {
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    icon: <ArrowLeftRight className="h-6 w-6" />
  },
  airtel_money: {
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    icon: <Smartphone className="h-6 w-6" />
  },
  orange_money: {
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    icon: <Smartphone className="h-6 w-6" />
  },
  account: {
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
    icon: <User className="h-6 w-6" />
  }
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onPaymentMethodSelect,
  totalAmount
}) => {
  const [methods, setMethods] = useState<UiMethod[]>([])

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      const enabled = await getEnabledPaymentMethods()
      // Map admin keys to POS ids
      const uiIds: string[] = []
      if (enabled.includes('cash')) uiIds.push('cash')
      if (enabled.includes('card')) uiIds.push('card')
      if (enabled.includes('eft')) uiIds.push('transfer')
      if (enabled.includes('mpesa')) uiIds.push('mpesa')
      if (enabled.includes('ecocash')) uiIds.push('ecocash')
      if (enabled.includes('airtel_money')) uiIds.push('airtel_money')
      if (enabled.includes('orange_money')) uiIds.push('orange_money')
      if (enabled.includes('credit')) uiIds.push('account')

      const ui: UiMethod[] = uiIds.map((id) => {
        const base = UI_METHOD_CONFIG[id]
        const nameMap: Record<string, string> = {
          cash: 'Cash',
          card: 'Card',
          transfer: 'Bank Transfer',
          mpesa: 'M-Pesa',
          ecocash: 'EcoCash',
          airtel_money: 'Airtel Money',
          orange_money: 'Orange Money',
          account: 'Account Payment'
        }
        const descMap: Record<string, string> = {
          cash: 'Physical cash payment',
          card: 'Credit/Debit card payment',
          transfer: 'Direct bank transfer',
          mpesa: 'M-Pesa mobile money payment',
          ecocash: 'EcoCash mobile payment',
          airtel_money: 'Airtel Money mobile payment',
          orange_money: 'Orange Money mobile payment',
          account: 'Pay using customer account balance'
        }
        return {
          id,
          name: nameMap[id] || id,
          description: descMap[id] || '',
          color: base.color,
          hoverColor: base.hoverColor,
          icon: base.icon
        }
      })
      setMethods(ui)
    }
    load()
  }, [isOpen])

  if (!isOpen) return null

  const handleMethodSelect = (methodId: string) => {
    onPaymentMethodSelect(methodId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Payment Method</h2>
            <p className="text-sm text-gray-600">Total: {formatCurrency(totalAmount)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-gray-300 ${
                  method.id === 'account' ? 'border-black' : 'border-gray-200'
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.color} ${method.hoverColor}`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {methods.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment methods available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
