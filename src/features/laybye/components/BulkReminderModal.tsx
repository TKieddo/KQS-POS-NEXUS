'use client'

import React, { useState } from 'react'
import { Mail, AlertTriangle, Users, Send, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LaybyeItem } from './LaybyeTable'
import { formatCurrency } from '@/lib/utils'

interface BulkReminderModalProps {
  laybyes: LaybyeItem[]
  isOpen: boolean
  onClose: () => void
  onSendReminders: (reminders: BulkReminder[]) => void
}

export interface BulkReminder {
  laybyeId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  amount: number
  daysOverdue: number
  message: string
  method: 'email' | 'sms' | 'both'
}

export function BulkReminderModal({ 
  laybyes, 
  isOpen, 
  onClose, 
  onSendReminders 
}: BulkReminderModalProps) {
  const [selectedLaybyes, setSelectedLaybyes] = useState<string[]>([])
  const [reminderData, setReminderData] = useState({
    subject: 'Payment Reminder - Your Lay-bye Account',
    message: '',
    method: 'email' as 'email' | 'sms' | 'both',
    includePaymentLink: true
  })

  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  const overdueLaybyes = laybyes.filter(laybye => laybye.daysOverdue > 0)
  const selectedLaybyeObjects = laybyes.filter(laybye => selectedLaybyes.includes(laybye.id))

  const handleSelectAll = () => {
    if (selectedLaybyes.length === overdueLaybyes.length) {
      setSelectedLaybyes([])
    } else {
      setSelectedLaybyes(overdueLaybyes.map(laybye => laybye.id))
    }
  }

  const handleSelectLaybye = (laybyeId: string) => {
    setSelectedLaybyes(prev => 
      prev.includes(laybyeId) 
        ? prev.filter(id => id !== laybyeId)
        : [...prev, laybyeId]
    )
  }

  const handleSendReminders = async () => {
    if (selectedLaybyes.length === 0) return

    setIsSending(true)

    const reminders: BulkReminder[] = selectedLaybyeObjects.map(laybye => ({
      laybyeId: laybye.id,
      customerName: laybye.customer.name,
      customerEmail: laybye.customer.email,
      customerPhone: laybye.customer.phone,
      amount: laybye.balanceRemaining,
      daysOverdue: laybye.daysOverdue,
      message: reminderData.message || getDefaultMessage(laybye),
      method: reminderData.method
    }))

    try {
      await onSendReminders(reminders)
      onClose()
      setSelectedLaybyes([])
    } catch (error) {
      console.error('Error sending reminders:', error)
    } finally {
      setIsSending(false)
    }
  }

  const getDefaultMessage = (laybye: LaybyeItem) => {
    return `Dear ${laybye.customer.name},\n\nThis is a friendly reminder that your lay-bye payment of ${formatCurrency(laybye.balanceRemaining)} is ${laybye.daysOverdue} days overdue.\n\nPlease visit our store or contact us to arrange payment.\n\nThank you for your business.`
  }

  const getTotalOutstanding = () => {
    return selectedLaybyeObjects.reduce((sum, laybye) => sum + laybye.balanceRemaining, 0)
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white border-gray-200 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
              Send Bulk Reminders
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Laybye Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-[hsl(var(--primary))]">
                  Select Overdue Lay-byes
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {selectedLaybyes.length === overdueLaybyes.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {overdueLaybyes.map((laybye) => (
                  <div
                    key={laybye.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedLaybyes.includes(laybye.id)
                        ? 'border-[#E5FF29] bg-[#E5FF29]/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectLaybye(laybye.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle 
                            className={`h-4 w-4 ${
                              selectedLaybyes.includes(laybye.id) 
                                ? 'text-[#E5FF29]' 
                                : 'text-gray-300'
                            }`} 
                          />
                          <span className="text-sm font-medium text-[hsl(var(--primary))]">
                            {laybye.customer.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {laybye.id} • {formatCurrency(laybye.balanceRemaining)} • {laybye.daysOverdue} days overdue
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedLaybyes.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedLaybyes.length} lay-byes selected
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Total outstanding: {formatCurrency(getTotalOutstanding())}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Reminder Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-[hsl(var(--primary))]">
                Reminder Settings
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line
                </label>
                <Input
                  value={reminderData.subject}
                  onChange={(e) => setReminderData(prev => ({ ...prev, subject: e.target.value }))}
                  className="border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template
                </label>
                <textarea
                  value={reminderData.message}
                  onChange={(e) => setReminderData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  placeholder="Enter your reminder message..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default template
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Method
                </label>
                <select
                  value={reminderData.method}
                  onChange={(e) => setReminderData(prev => ({ 
                    ...prev, 
                    method: e.target.value as 'email' | 'sms' | 'both' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="email">Email Only</option>
                  <option value="sms">SMS Only</option>
                  <option value="both">Email & SMS</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includePaymentLink"
                  checked={reminderData.includePaymentLink}
                  onChange={(e) => setReminderData(prev => ({ 
                    ...prev, 
                    includePaymentLink: e.target.checked 
                  }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="includePaymentLink" className="text-sm text-gray-700">
                  Include payment link in reminder
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSendReminders}
              disabled={selectedLaybyes.length === 0 || isSending}
              className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90 disabled:opacity-50"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? 'Sending...' : `Send to ${selectedLaybyes.length} Customers`}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 