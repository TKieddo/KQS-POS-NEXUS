import React from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Save, X, Clock, FileText } from "lucide-react"

export interface ReportScheduleRowProps {
  name: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  format: "pdf" | "excel" | "csv" | "json"
  recipients: string
  isActive: boolean
  onChange: (field: string, value: any) => void
  onSave: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  isEditing: boolean
}

export const ReportScheduleRow = ({
  name,
  frequency,
  format,
  recipients,
  isActive,
  onChange,
  onSave,
  onEdit,
  onDelete,
  onToggleActive,
  isEditing
}: ReportScheduleRowProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 py-3 px-4">
      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full">
          <Input
            value={name}
            onChange={e => onChange("name", e.target.value)}
            placeholder="Report Name"
          />
          <Select
            value={frequency}
            onChange={e => onChange("frequency", e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <Select
            value={format}
            onChange={e => onChange("format", e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </Select>
          <Input
            value={recipients}
            onChange={e => onChange("recipients", e.target.value)}
            placeholder="Email addresses"
          />
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
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-medium truncate">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="capitalize">{frequency}</span>
          </div>
          <span className="uppercase font-mono">{format}</span>
          <span className="text-sm text-gray-600 truncate">{recipients}</span>
          <div className="flex items-center gap-2 justify-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            <Button size="sm" variant="ghost" onClick={onToggleActive}>
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
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