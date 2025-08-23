import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, CreditCard, Mail, Printer, Save, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

import { cn } from '@/lib/utils'
import type { PaymentFormData, Tenant } from '../types/property'

const paymentFormSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant is required'),
  building_id: z.string().min(1, 'Building is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'check', 'other']),
  payment_type: z.enum(['rent', 'deposit', 'late_fee', 'utility', 'other']),
  receipt_sent: z.boolean(),
  receipt_sent_method: z.enum(['email', 'printed', 'both']).optional(),
  notes: z.string().optional()
})

interface PaymentFormProps {
  tenant?: Tenant
  onSave: (data: PaymentFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  tenant,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [receiptSent, setReceiptSent] = useState(false)
  const [receiptMethod, setReceiptMethod] = useState<'email' | 'printed' | 'both'>('email')

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      tenant_id: tenant?.id || '',
      building_id: tenant?.building_id || '',
      amount: tenant?.rent_amount || 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      payment_type: 'rent',
      receipt_sent: false,
      notes: ''
    }
  })

  const onSubmit = (data: PaymentFormData) => {
    const formData = {
      ...data,
      receipt_sent: receiptSent,
      receipt_sent_method: receiptSent ? receiptMethod : undefined
    }
    onSave(formData)
  }

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' }
  ]

  const paymentTypes = [
    { value: 'rent', label: 'Rent' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'late_fee', label: 'Late Fee' },
    { value: 'utility', label: 'Utility' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Record Payment
        </CardTitle>
        <CardDescription>
          Record a new payment for {tenant?.name || 'tenant'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tenant Information */}
          {tenant && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Tenant Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-medium">{tenant.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Unit:</span>
                  <p className="font-medium">{tenant.unit_number}</p>
                </div>
                <div>
                  <span className="text-gray-500">Monthly Rent:</span>
                  <p className="font-medium">${tenant.rent_amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{new Date(tenant.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register('amount', { valueAsNumber: true })}
              className="text-lg font-semibold"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              {...form.register('payment_date')}
              max={new Date().toISOString().split('T')[0]}
            />
            {form.formState.errors.payment_date && (
              <p className="text-sm text-red-600">{form.formState.errors.payment_date.message}</p>
            )}
          </div>

          {/* Payment Method and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={form.watch('payment_method')}
                onValueChange={(value) => form.setValue('payment_method', value as any)}
              >
                <SelectTrigger className="bg-white border-gray-300 rounded-md">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_type">Payment Type *</Label>
              <Select
                value={form.watch('payment_type')}
                onValueChange={(value) => form.setValue('payment_type', value as any)}
              >
                <SelectTrigger className="bg-white border-gray-300 rounded-md">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {paymentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Receipt Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="receipt_sent"
                checked={receiptSent}
                onCheckedChange={(checked) => setReceiptSent(checked as boolean)}
              />
              <Label htmlFor="receipt_sent">Send/Print Receipt</Label>
            </div>

            {receiptSent && (
              <div className="space-y-2 ml-6">
                <Label>Receipt Method</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="email"
                      name="receipt_method"
                      value="email"
                      checked={receiptMethod === 'email'}
                      onChange={(e) => setReceiptMethod(e.target.value as any)}
                    />
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="printed"
                      name="receipt_method"
                      value="printed"
                      checked={receiptMethod === 'printed'}
                      onChange={(e) => setReceiptMethod(e.target.value as any)}
                    />
                    <Label htmlFor="printed" className="flex items-center gap-1">
                      <Printer className="h-4 w-4" />
                      Print
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="both"
                      name="receipt_method"
                      value="both"
                      checked={receiptMethod === 'both'}
                      onChange={(e) => setReceiptMethod(e.target.value as any)}
                    />
                    <Label htmlFor="both" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <Printer className="h-4 w-4" />
                      Both
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this payment..."
              {...form.register('notes')}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PaymentForm
