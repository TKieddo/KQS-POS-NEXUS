"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, DollarSign, Calendar, Building2, Users } from 'lucide-react'
import type { Tenant, Building } from '../types/property'

const bulkPaymentSchema = z.object({
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'check']),
  building_filter: z.string().optional(),
  selected_tenants: z.array(z.string()).min(1, 'Select at least one tenant'),
  bulk_amount: z.number().min(1, 'Amount must be greater than 0'),
  apply_to_all: z.boolean(),
})

type BulkPaymentData = z.infer<typeof bulkPaymentSchema>

interface TenantWithBuilding extends Tenant {
  building_name: string
  outstanding_amount: number
}

interface BulkPaymentModalProps {
  tenants: TenantWithBuilding[]
  buildings: Building[]
  onSave: (data: BulkPaymentData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const BulkPaymentModal: React.FC<BulkPaymentModalProps> = ({
  tenants,
  buildings,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [buildingFilter, setBuildingFilter] = useState<string>('all')
  const [bulkAmount, setBulkAmount] = useState<number>(0)
  const [applyToAll, setApplyToAll] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BulkPaymentData>({
    resolver: zodResolver(bulkPaymentSchema),
    defaultValues: {
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      building_filter: 'all',
      selected_tenants: [],
      bulk_amount: 0,
      apply_to_all: false,
    }
  })

  const paymentMethod = watch('payment_method')

  // Filter tenants based on building selection
  const filteredTenants = buildingFilter === 'all'
    ? tenants
    : tenants.filter(tenant => tenant.building_name === buildingFilter)

  const handleTenantSelection = (tenantId: string, checked: boolean) => {
    if (checked) {
      setSelectedTenants(prev => [...prev, tenantId])
      setValue('selected_tenants', [...selectedTenants, tenantId])
    } else {
      setSelectedTenants(prev => prev.filter(id => id !== tenantId))
      setValue('selected_tenants', selectedTenants.filter(id => id !== tenantId))
    }
  }

  const handleBulkSelection = (tenantIds: string[], checked: boolean) => {
    if (checked) {
      const newSelection = [...new Set([...selectedTenants, ...tenantIds])]
      setSelectedTenants(newSelection)
      setValue('selected_tenants', newSelection)
    } else {
      const newSelection = selectedTenants.filter(id => !tenantIds.includes(id))
      setSelectedTenants(newSelection)
      setValue('selected_tenants', newSelection)
    }
  }

  const handleApplyToAll = (checked: boolean) => {
    setApplyToAll(checked)
    if (checked) {
      const allTenantIds = filteredTenants.map(t => t.id)
      setSelectedTenants(allTenantIds)
      setValue('selected_tenants', allTenantIds)
    } else {
      setSelectedTenants([])
      setValue('selected_tenants', [])
    }
  }

  const onSubmit = async (data: BulkPaymentData) => {
    data.selected_tenants = selectedTenants
    data.building_filter = buildingFilter
    data.bulk_amount = bulkAmount
    data.apply_to_all = applyToAll
    await onSave(data)
  }

  const selectedCount = selectedTenants.length
  const totalAmount = selectedCount * bulkAmount
  const overdueTenants = filteredTenants.filter(t => t.payment_status === 'overdue')
  const paidTenants = filteredTenants.filter(t => t.payment_status === 'paid')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CreditCard className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Bulk Payment Entry</h3>
        <p className="text-sm text-gray-600 mt-1">
          Record multiple payments at once
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Payment Details */}
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Date */}
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    {...register('payment_date')}
                    className="bg-white border-gray-300 rounded-md"
                  />
                  {errors.payment_date && (
                    <p className="text-sm text-red-600">{errors.payment_date.message}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select onValueChange={(value) => setValue('payment_method', value as any)}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-md">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Building Filter */}
                <div className="space-y-2">
                  <Label htmlFor="building_filter">Filter by Building</Label>
                  <Select onValueChange={setBuildingFilter}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-md">
                      <SelectValue placeholder="All Buildings" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="all">All Buildings</SelectItem>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.name}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Amount */}
                <div className="space-y-2">
                  <Label htmlFor="bulk_amount">Amount per Tenant</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bulk_amount"
                      type="number"
                      value={bulkAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setBulkAmount(value)
                        setValue('bulk_amount', value)
                      }}
                      className="bg-white border-gray-300 rounded-md pl-10"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.bulk_amount && (
                    <p className="text-sm text-red-600">{errors.bulk_amount.message}</p>
                  )}
                </div>

                {/* Summary Card */}
                {selectedCount > 0 && bulkAmount > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-900">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Selected Tenants:</span>
                        <span className="font-medium">{selectedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount per Tenant:</span>
                        <span className="font-medium">${bulkAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold text-blue-900 pt-1 border-t border-blue-200">
                        <span>Total Amount:</span>
                        <span>${totalAmount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-white border-gray-300 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedCount === 0 || bulkAmount <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Record Payments ({selectedCount})</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Tenant Selection */}
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Select Tenants</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {selectedCount} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bulk Selection Options */}
                <div className="flex flex-wrap gap-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply_to_all"
                      checked={applyToAll}
                      onCheckedChange={handleApplyToAll}
                    />
                    <Label htmlFor="apply_to_all" className="text-sm">
                      Select All
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_overdue"
                      onCheckedChange={(checked) => {
                        handleBulkSelection(overdueTenants.map(t => t.id), checked as boolean)
                      }}
                    />
                    <Label htmlFor="include_overdue" className="text-sm">
                      Overdue ({overdueTenants.length})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_paid"
                      onCheckedChange={(checked) => {
                        handleBulkSelection(paidTenants.map(t => t.id), checked as boolean)
                      }}
                    />
                    <Label htmlFor="include_paid" className="text-sm">
                      Paid ({paidTenants.length})
                    </Label>
                  </div>
                </div>

                {/* Tenant List */}
                <div className="max-h-[calc(100vh-24rem)] overflow-y-auto space-y-2">
                  {filteredTenants.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No tenants found for selected building</p>
                    </div>
                  ) : (
                    filteredTenants.map((tenant) => (
                      <div key={tenant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={tenant.id}
                          checked={selectedTenants.includes(tenant.id)}
                          onCheckedChange={(checked) => handleTenantSelection(tenant.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{tenant.name}</p>
                              <p className="text-xs text-gray-500">{tenant.building_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">${tenant.rent_amount.toLocaleString()}</p>
                              <Badge
                                variant={tenant.payment_status === 'overdue' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {tenant.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BulkPaymentModal