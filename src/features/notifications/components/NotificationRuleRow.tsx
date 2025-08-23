import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  MessageSquare,
  Smartphone,
  Monitor,
  Package,
  TrendingUp,
  CreditCard,
  Settings,
  Target,
  Users
} from "lucide-react"
import { 
  NotificationRule, 
  NotificationRuleFormData,
  NOTIFICATION_TYPES, 
  NOTIFICATION_CONDITIONS, 
  NOTIFICATION_ACTIONS 
} from "../types"

export interface NotificationRuleRowProps {
  rule: NotificationRule
  onSave: (updates: Partial<NotificationRuleFormData>) => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: (isActive: boolean) => void
  isEditing: boolean
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

export const NotificationRuleRow: React.FC<NotificationRuleRowProps> = ({
  rule,
  onSave,
  onEdit,
  onDelete,
  onToggleActive,
  isEditing
}) => {
  const [editData, setEditData] = useState<NotificationRuleFormData>({
    name: rule.name,
    type: rule.type,
    condition: rule.condition,
    action: rule.action,
    recipients: rule.recipients || [],
    message_template: rule.message_template || '',
    is_active: rule.is_active
  })

  const getTypeIcon = (type: keyof typeof NOTIFICATION_TYPES) => {
    const IconComponent = TYPE_ICONS[type]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Bell className="h-4 w-4" />
  }

  const getConditionIcon = (condition: keyof typeof NOTIFICATION_CONDITIONS) => {
    const IconComponent = CONDITION_ICONS[condition]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Bell className="h-4 w-4" />
  }

  const handleSave = () => {
    onSave(editData)
  }

  const handleCancel = () => {
    setEditData({
      name: rule.name,
      type: rule.type,
      condition: rule.condition,
      action: rule.action,
      recipients: rule.recipients || [],
      message_template: rule.message_template || '',
      is_active: rule.is_active
    })
    onEdit()
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-gray-400'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive'
  }

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 py-4 px-4 hover:bg-gray-50 transition-colors">
      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 w-full">
          <Input
            value={editData.name}
            onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Rule Name"
          />
          <Select
            value={editData.type}
            onChange={e => setEditData(prev => ({ ...prev, type: e.target.value as any }))}
          >
            {Object.entries(NOTIFICATION_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={editData.condition}
            onChange={e => setEditData(prev => ({ ...prev, condition: e.target.value as any }))}
          >
            {Object.entries(NOTIFICATION_CONDITIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={editData.action}
            onChange={e => setEditData(prev => ({ ...prev, action: e.target.value as any }))}
          >
            {Object.entries(NOTIFICATION_ACTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editData.is_active}
              onCheckedChange={(checked) => setEditData(prev => ({ ...prev, is_active: checked }))}
            />
            <span className="text-sm text-gray-600">
              {editData.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[hsl(var(--primary))] text-white" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 w-full items-center">
          <div className="flex items-center gap-2">
            {getTypeIcon(rule.type)}
            <span className="font-medium text-gray-900">{rule.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {getTypeIcon(rule.type)}
            <span className="text-sm text-gray-600">{NOTIFICATION_TYPES[rule.type]}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {getConditionIcon(rule.condition)}
            <span className="text-sm text-gray-600">{NOTIFICATION_CONDITIONS[rule.condition]}</span>
          </div>
          
          <div className="text-sm text-gray-600">
            {NOTIFICATION_ACTIONS[rule.action]}
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={rule.is_active}
              onCheckedChange={(checked) => onToggleActive(checked)}
            />
            <span className={`text-sm ${getStatusColor(rule.is_active)}`}>
              {getStatusText(rule.is_active)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 