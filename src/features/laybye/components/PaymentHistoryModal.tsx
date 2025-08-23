'use client'

import React, { useState } from 'react'
import { DollarSign, Calendar, Receipt, Download, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LaybyeItem } from './LaybyeTable'
import { PaymentRecord } from './PaymentRecordingModal'
import { formatCurrency } from '@/lib/utils'

interface PaymentHistoryModalProps {
  laybye: LaybyeItem | null
  payments: PaymentRecord[]
  isOpen: boolean
  onClose: () => void
  onGenerateReceipt: (paymentId: string) => void
}

export function PaymentHistoryModal({ 
  laybye, 
  payments, 
  isOpen, 
  onClose, 
  onGenerateReceipt 
}: PaymentHistoryModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)

  if (!laybye || !isOpen) return null

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingBalance = laybye.totalValue - laybye.depositPaid - totalPaid

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <DollarSign className="h-4 w-4 text-green-600" />
      case 'card': return <DollarSign className="h-4 w-4 text-blue-600" />
      case 'bank_transfer': return <DollarSign className="h-4 w-4 text-purple-600" />
      default: return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatus = (payment: PaymentRecord) => {
    const paymentDate = new Date(payment.paymentDate)
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 0) return { status: 'recent', icon: CheckCircle, color: 'text-green-600' }
    if (daysDiff <= 7) return { status: 'recent', icon: CheckCircle, color: 'text-green-600' }
    return { status: 'older', icon: Clock, color: 'text-gray-600' }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white border-gray-200 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
              Payment History - {laybye.id}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Laybye Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer</p>
                <p className="text-sm text-[hsl(var(--primary))]">{laybye.customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(laybye.totalValue)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining Balance</p>
                <div className="text-lg font-semibold text-orange-600">
                  {formatCurrency(remainingBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(totalPaid)}
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Payments Made</p>
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                  {payments.length}
                </p>
              </div>
            </Card>
            
            <Card className="p-4 border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Deposit</p>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(laybye.depositPaid)}
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(((laybye.depositPaid + totalPaid) / laybye.totalValue) * 100)}%
                </p>
              </div>
            </Card>
          </div>

          {/* Payment History Table */}
          <div className="mb-6">
            <h4 className="font-medium text-[hsl(var(--primary))] mb-3">
              Payment History
            </h4>
            
            {payments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-500">No payments recorded yet</p>
                <p className="text-sm text-gray-400">Payments will appear here once recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => {
                      const status = getPaymentStatus(payment)
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {status.icon && <status.icon className={`h-4 w-4 ${status.color}`} />}
                              <span className="text-sm text-[hsl(var(--primary))]">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="text-sm text-gray-600 capitalize">
                                {payment.paymentMethod.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onGenerateReceipt(payment.id)}
                              className="border-gray-200 hover:bg-gray-50"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              Receipt
                            </Button>
                          </td>
                          
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {payment.notes || '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Export payment history to CSV/PDF
                console.log('Export payment history')
              }}
              className="border-gray-200 hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export History
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 