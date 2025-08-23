import React from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Save, X, Settings, Database, Shield, Zap } from "lucide-react"

export interface SystemConfigRowProps {
  name: string
  value: string
  type: "string" | "number" | "boolean" | "select"
  category: "system" | "security" | "performance" | "database"
  description: string
  onChange: (field: string, value: any) => void
  onSave: () => void
  onEdit: () => void
  onDelete: () => void
  isEditing: boolean
}

export const SystemConfigRow = ({
  name,
  value,
  type,
  category,
  description,
  onChange,
  onSave,
  onEdit,
  onDelete,
  isEditing
}: SystemConfigRowProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Settings className="h-4 w-4 text-blue-500" />
      case 'security': return <Shield className="h-4 w-4 text-red-500" />
      case 'performance': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'database': return <Database className="h-4 w-4 text-green-500" />
      default: return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'system': return 'System'
      case 'security': return 'Security'
      case 'performance': return 'Performance'
      case 'database': return 'Database'
      default: return category
    }
  }

  const renderInput = () => {
    switch (type) {
      case 'boolean':
        return (
          <Select
            value={value}
            onChange={e => onChange("value", e.target.value)}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </Select>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e => onChange("value", e.target.value)}
            placeholder="Enter number"
          />
        )
      case 'select':
        return (
          <Select
            value={value}
            onChange={e => onChange("value", e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        )
      default:
        return (
          <Input
            value={value}
            onChange={e => onChange("value", e.target.value)}
            placeholder="Enter value"
          />
        )
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 py-3 px-4">
      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full">
          <Input
            value={name}
            onChange={e => onChange("name", e.target.value)}
            placeholder="Setting Name"
          />
          {renderInput()}
          <Select
            value={type}
            onChange={e => onChange("type", e.target.value)}
          >
            <option value="string">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="select">Select</option>
          </Select>
          <Select
            value={category}
            onChange={e => onChange("category", e.target.value)}
          >
            <option value="system">System</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
            <option value="database">Database</option>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[hsl(var(--primary))] text-white" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full items-center">
          <div className="flex items-center gap-2">
            {getCategoryIcon(category)}
            <div>
              <span className="font-medium truncate">{name}</span>
              <p className="text-xs text-gray-500 truncate">{description}</p>
            </div>
          </div>
          <span className="font-mono text-sm">{value}</span>
          <span className="capitalize">{type}</span>
          <span className="text-sm">{getCategoryLabel(category)}</span>
          <div className="flex items-center gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 