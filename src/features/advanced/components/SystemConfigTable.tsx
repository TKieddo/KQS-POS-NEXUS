import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SystemConfigRow } from "./SystemConfigRow"

export interface SystemConfig {
  id: string
  name: string
  value: string
  type: "string" | "number" | "boolean" | "select"
  category: "system" | "security" | "performance" | "database"
  description: string
}

export interface SystemConfigTableProps {
  configs: SystemConfig[]
  onAddConfig: (config: Omit<SystemConfig, "id">) => void
  onUpdateConfig: (id: string, config: Partial<SystemConfig>) => void
  onDeleteConfig: (id: string) => void
}

export const SystemConfigTable = ({
  configs,
  onAddConfig,
  onUpdateConfig,
  onDeleteConfig
}: SystemConfigTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEditConfig = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  const handleSaveConfig = (id: string) => {
    setEditingId(null)
  }

  const handleConfigChange = (id: string, field: string, value: any) => {
    onUpdateConfig(id, { [field]: value })
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">System Configuration</CardTitle>
          <Button 
            onClick={() => onAddConfig({
              name: "New Setting",
              value: "",
              type: "string",
              category: "system",
              description: "System configuration setting"
            })}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Setting
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {configs.map((config) => (
            <SystemConfigRow
              key={config.id}
              name={config.name}
              value={config.value}
              type={config.type}
              category={config.category}
              description={config.description}
              onChange={(field, value) => handleConfigChange(config.id, field, value)}
              onSave={() => handleSaveConfig(config.id)}
              onEdit={() => handleEditConfig(config.id)}
              onDelete={() => onDeleteConfig(config.id)}
              isEditing={editingId === config.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 