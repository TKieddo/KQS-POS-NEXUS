import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Save, X, Phone, Mail, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { cn } from '@/lib/utils'
import type { TenantFormData, Tenant, Building } from '../types/property'

const tenantFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  building_id: z.string().min(1, 'Building is required'),
  unit_number: z.string().min(1, 'Unit number is required'),
  lease_start_date: z.string().min(1, 'Lease start date is required'),
  lease_end_date: z.string().min(1, 'Lease end date is required'),
  monthly_rent: z.number().min(0, 'Monthly rent must be positive'),
  security_deposit: z.number().min(0, 'Security deposit must be positive'),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional()
})

interface TenantFormProps {
  tenant?: Tenant
  buildings: Building[]
  onSave: (data: TenantFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const TenantForm: React.FC<TenantFormProps> = ({
  tenant,
  buildings,
  onSave,
  onCancel,
  isLoading = false
}) => {


  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      first_name: tenant?.first_name || '',
      last_name: tenant?.last_name || '',
      email: tenant?.email || '',
      phone: tenant?.phone || '',
      building_id: tenant?.building_id || '',
      unit_number: tenant?.unit_number || '',
      lease_start_date: tenant?.lease_start_date || '',
      lease_end_date: tenant?.lease_end_date || '',
      monthly_rent: tenant?.monthly_rent || 0,
      security_deposit: tenant?.security_deposit || 0,
      emergency_contact_name: tenant?.emergency_contact_name || '',
      emergency_contact_phone: tenant?.emergency_contact_phone || '',
      notes: tenant?.notes || ''
    }
  })

  const onSubmit = (data: TenantFormData) => {
    onSave(data)
  }

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              placeholder="Enter first name"
              {...form.register('first_name')}
            />
            {form.formState.errors.first_name && (
              <p className="text-sm text-red-600">{form.formState.errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              placeholder="Enter last name"
              {...form.register('last_name')}
            />
            {form.formState.errors.last_name && (
              <p className="text-sm text-red-600">{form.formState.errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="tenant@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="(555) 123-4567"
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>

                     <div className="space-y-2">
             <Label htmlFor="building_id">Building *</Label>
             <Select
               value={form.watch('building_id')}
               onValueChange={(value) => form.setValue('building_id', value)}
             >
               <SelectTrigger className="bg-white border border-gray-300 rounded-md">
                 <SelectValue placeholder="Select building" />
               </SelectTrigger>
               <SelectContent className="bg-white border border-gray-300 rounded-md">
                 {buildings.map((building) => (
                   <SelectItem key={building.id} value={building.id}>
                     {building.name} - {building.address}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
            {form.formState.errors.building_id && (
              <p className="text-sm text-red-600">{form.formState.errors.building_id.message}</p>
            )}
          </div>
        </div>

        {/* Lease Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="unit_number">Unit Number *</Label>
            <Input
              id="unit_number"
              placeholder="e.g., 101, A-5"
              {...form.register('unit_number')}
            />
            {form.formState.errors.unit_number && (
              <p className="text-sm text-red-600">{form.formState.errors.unit_number.message}</p>
            )}
          </div>

                                 <div className="space-y-2">
              <Label htmlFor="lease_start_date">Lease Start Date *</Label>
              <Input
                id="lease_start_date"
                type="date"
                {...form.register('lease_start_date')}
                min={new Date().toISOString().split('T')[0]}
              />
              {form.formState.errors.lease_start_date && (
                <p className="text-sm text-red-600">{form.formState.errors.lease_start_date.message}</p>
              )}
            </div>

                                 <div className="space-y-2">
              <Label htmlFor="lease_end_date">Lease End Date *</Label>
              <Input
                id="lease_end_date"
                type="date"
                {...form.register('lease_end_date')}
                min={form.watch('lease_start_date') || new Date().toISOString().split('T')[0]}
              />
              {form.formState.errors.lease_end_date && (
                <p className="text-sm text-red-600">{form.formState.errors.lease_end_date.message}</p>
              )}
            </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_rent">Monthly Rent *</Label>
            <Input
              id="monthly_rent"
              type="number"
              min="0"
              step="0.01"
              placeholder="1500.00"
              {...form.register('monthly_rent', { valueAsNumber: true })}
            />
            {form.formState.errors.monthly_rent && (
              <p className="text-sm text-red-600">{form.formState.errors.monthly_rent.message}</p>
            )}
          </div>
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="security_deposit">Security Deposit *</Label>
            <Input
              id="security_deposit"
              type="number"
              min="0"
              step="0.01"
              placeholder="1500.00"
              {...form.register('security_deposit', { valueAsNumber: true })}
            />
            {form.formState.errors.security_deposit && (
              <p className="text-sm text-red-600">{form.formState.errors.security_deposit.message}</p>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
            <Input
              id="emergency_contact_name"
              placeholder="Contact person's name"
              {...form.register('emergency_contact_name')}
            />
            {form.formState.errors.emergency_contact_name && (
              <p className="text-sm text-red-600">{form.formState.errors.emergency_contact_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              placeholder="(555) 987-6543"
              {...form.register('emergency_contact_phone')}
            />
            {form.formState.errors.emergency_contact_phone && (
              <p className="text-sm text-red-600">{form.formState.errors.emergency_contact_phone.message}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes about the tenant..."
            {...form.register('notes')}
            rows={3}
          />
          {form.formState.errors.notes && (
            <p className="text-sm text-red-600">{form.formState.errors.notes.message}</p>
          )}
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
            {isLoading ? 'Saving...' : (tenant ? 'Update Tenant' : 'Create Tenant')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TenantForm
