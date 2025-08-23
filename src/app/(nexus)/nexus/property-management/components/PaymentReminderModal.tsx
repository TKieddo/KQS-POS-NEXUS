"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, AlertCircle, Clock, DollarSign } from 'lucide-react'
import type { Tenant } from '../types/property'

const reminderFormSchema = z.object({
  reminder_type: z.enum(['email', 'sms', 'both']),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  due_date: z.string().min(1, 'Due date is required'),
  selected_tenants: z.array(z.string()).min(1, 'Select at least one tenant'),
  include_overdue: z.boolean(),
  include_upcoming: z.boolean(),
})

type ReminderFormData = z.infer<typeof reminderFormSchema>

interface TenantWithBuilding extends Tenant {
  building_name: string
}

interface PaymentReminderModalProps {
  tenants: TenantWithBuilding[]
  onSend: (data: ReminderFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  tenants,
  onSend,
  onCancel,
  isLoading = false
}) => {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [includeOverdue, setIncludeOverdue] = useState(true)
  const [includeUpcoming, setIncludeUpcoming] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      reminder_type: 'email',
      subject: 'Rent Payment Reminder',
      message: 'Dear {tenant_name},\n\nThis is a friendly reminder that your rent payment of ${amount} for {building_name} is due on {due_date}.\n\nPlease ensure timely payment to avoid any late fees.\n\nThank you,\nProperty Management Team',
      due_date: new Date().toISOString().split('T')[0],
      selected_tenants: [],
      include_overdue: true,
      include_upcoming: true,
    }
  })

  const reminderType = watch('reminder_type')

  const overdueTenants = tenants.filter(tenant => tenant.payment_status === 'overdue')
  const upcomingTenants = tenants.filter(tenant => tenant.payment_status === 'paid')

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

  const onSubmit = async (data: ReminderFormData) => {
    data.selected_tenants = selectedTenants
    data.include_overdue = includeOverdue
    data.include_upcoming = includeUpcoming
    await onSend(data)
  }

  const selectedCount = selectedTenants.length
  const overdueCount = overdueTenants.length
  const upcomingCount = upcomingTenants.length

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <Mail className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Send Payment Reminders</h3>
        <p className="text-sm text-gray-600 mt-1">
          Send reminders to tenants about their rent payments
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Reminder Details */}
          <div className="space-y-3">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Reminder Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Reminder Type */}
                <div className="space-y-2">
                  <Label htmlFor="reminder_type">Reminder Type</Label>
                  <Select onValueChange={(value) => setValue('reminder_type', value as 'email' | 'sms' | 'both')}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-md">
                      <SelectValue placeholder="Select reminder type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="both">Email & SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    {...register('subject')}
                    className="bg-white border-gray-300 rounded-md"
                    placeholder="Enter email subject"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message Template</Label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    className="bg-white border-gray-300 rounded-md min-h-[100px]"
                    placeholder="Enter your message template"
                  />
                  <div className="text-xs text-gray-500">
                    Available variables: {'{tenant_name}'}, {'{amount}'}, {'{building_name}'}, {'{due_date}'}
                  </div>
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...register('due_date')}
                    className="bg-white border-gray-300 rounded-md"
                  />
                  {errors.due_date && (
                    <p className="text-sm text-red-600">{errors.due_date.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4 sticky bottom-0 bg-white p-2 -mx-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-white border-gray-300 hover:bg-gray-50 rounded-md h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedCount === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md h-9"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span>Send Reminders ({selectedCount})</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Tenant Selection */}
          <div className="space-y-3">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Select Tenants</CardTitle>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedCount} selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Bulk Selection Options */}
                <div className="flex flex-wrap gap-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_overdue"
                      checked={includeOverdue}
                      onCheckedChange={(checked) => {
                        setIncludeOverdue(checked as boolean)
                        if (checked) {
                          handleBulkSelection(overdueTenants.map(t => t.id), true)
                        } else {
                          handleBulkSelection(overdueTenants.map(t => t.id), false)
                        }
                      }}
                    />
                    <Label htmlFor="include_overdue" className="text-sm">
                      Include Overdue ({overdueCount})
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_upcoming"
                      checked={includeUpcoming}
                      onCheckedChange={(checked) => {
                        setIncludeUpcoming(checked as boolean)
                        if (checked) {
                          handleBulkSelection(upcomingTenants.map(t => t.id), true)
                        } else {
                          handleBulkSelection(upcomingTenants.map(t => t.id), false)
                        }
                      }}
                    />
                    <Label htmlFor="include_upcoming" className="text-sm">
                      Include Upcoming ({upcomingCount})
                    </Label>
                  </div>
                </div>

                {/* Tenant List */}
                <div className="max-h-[calc(100vh-32rem)] overflow-y-auto space-y-2">
                  {tenants.map((tenant) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PaymentReminderModal