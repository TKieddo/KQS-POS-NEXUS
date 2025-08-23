import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Monitor,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Settings,
  Package,
  Target,
  Users
} from 'lucide-react'
import { 
  NotificationRuleFormData, 
  NOTIFICATION_TYPES, 
  NOTIFICATION_CONDITIONS, 
  NOTIFICATION_ACTIONS 
} from '../types'

interface AddNotificationRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (rule: NotificationRuleFormData) => void
}

const CONDITION_ICONS = {
  low_stock: Package,
  high_sales: TrendingUp,
  payment_due: CreditCard,
  system_alert: Settings,
  inventory_alert: AlertTriangle,
  sales_target: Target,
  customer_activity: Users
}

const TYPE_ICONS = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  'in-app': Monitor
}

export const AddNotificationRuleModal: React.FC<AddNotificationRuleModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState<NotificationRuleFormData>({
    name: '',
    type: 'email',
    condition: 'low_stock',
    action: 'immediate',
    recipients: [],
    message_template: '',
    is_active: true
  })
  const [recipientInput, setRecipientInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onAdd(formData)
      // Reset form
      setFormData({
        name: '',
        type: 'email',
        condition: 'low_stock',
        action: 'immediate',
        recipients: [],
        message_template: '',
        is_active: true
      })
      setRecipientInput('')
    }
  }

  const handleAddRecipient = () => {
    if (recipientInput.trim() && !formData.recipients.includes(recipientInput.trim())) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientInput.trim()]
      }))
      setRecipientInput('')
    }
  }

  const handleRemoveRecipient = (recipient: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== recipient)
    }))
  }

  const getConditionIcon = (condition: keyof typeof NOTIFICATION_CONDITIONS) => {
    const IconComponent = CONDITION_ICONS[condition]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Bell className="h-4 w-4" />
  }

  const getTypeIcon = (type: keyof typeof NOTIFICATION_TYPES) => {
    const IconComponent = TYPE_ICONS[type]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Bell className="h-4 w-4" />
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Notification Rule">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rule Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Low Stock Alert"
            required
          />
        </div>

        {/* Notification Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Type
          </label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
          >
            {Object.entries(NOTIFICATION_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Condition
          </label>
          <Select
            value={formData.condition}
            onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
          >
            {Object.entries(NOTIFICATION_CONDITIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Frequency
          </label>
          <Select
            value={formData.action}
            onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value as any }))}
          >
            {Object.entries(NOTIFICATION_ACTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              placeholder={formData.type === 'email' ? 'email@example.com' : '+1234567890'}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
            />
            <Button 
              type="button" 
              onClick={handleAddRecipient}
              variant="outline"
              className="whitespace-nowrap"
            >
              Add
            </Button>
          </div>
          {formData.recipients.length > 0 && (
            <div className="space-y-1">
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{recipient}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRecipient(recipient)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Template (Optional)
          </label>
          <Textarea
            value={formData.message_template}
            onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
            placeholder="Custom message template..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use default template. Use {'{variable}'} for dynamic content.
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white">
            Add Rule
          </Button>
        </div>
      </form>
    </Modal>
  )
} 