'use client'

import React, { useState, useEffect } from 'react'
import { User, DollarSign, CreditCard, X, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { AccountPaymentFormData } from '../types'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  balance: number
}

interface AccountPaymentFormProps {
  selectedCustomer?: Customer | null
  onSubmit: (data: AccountPaymentFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: DollarSign },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'transfer', label: 'Transfer', icon: CreditCard },
  { value: 'mpesa', label: 'Mpesa', icon: CreditCard },
  { value: 'ecocash', label: 'Ecocash', icon: CreditCard }
]

// Mock customers data
const mockCustomers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', balance: 1250.00 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', balance: 850.50 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', balance: 2100.75 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '+1234567893', balance: 450.25 }
]

export const AccountPaymentForm: React.FC<AccountPaymentFormProps> = ({
  selectedCustomer,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [customer, setCustomer] = useState<Customer | null>(selectedCustomer || null)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [showCustomerSearch, setShowCustomerSearch] = useState(!selectedCustomer)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')

  const filteredCustomers = mockCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone?.includes(customerSearchTerm)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customer || !amount || parseFloat(amount) <= 0) {
      return
    }

    const formData: AccountPaymentFormData = {
      customer_id: customer.id,
      amount: parseFloat(amount),
      payment_method: paymentMethod as any,
      notes: notes.trim() || undefined
    }

    await onSubmit(formData)
  }

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer)
    setShowCustomerSearch(false)
    setCustomerSearchTerm('')
  }

  const resetForm = () => {
    setCustomer(null)
    setAmount('')
    setPaymentMethod('cash')
    setNotes('')
    setShowCustomerSearch(true)
    setCustomerSearchTerm('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      {showCustomerSearch ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer-search">Search Customer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="customer-search"
                placeholder="Search by name, email, or phone..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {customerSearchTerm && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCustomerSelect(c)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.email} • {c.phone}
                        </p>
                      </div>
                      <Badge variant={c.balance > 0 ? 'destructive' : 'secondary'}>
                        {formatCurrency(c.balance)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Selected Customer</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomerSearch(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
          
          {customer && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email} • {customer.phone}
                    </p>
                  </div>
                  <Badge variant={customer.balance > 0 ? 'destructive' : 'secondary'}>
                    Balance: {formatCurrency(customer.balance)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment Details */}
      {customer && (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Process Payment
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  )
} 