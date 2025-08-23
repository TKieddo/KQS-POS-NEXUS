import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { NotificationRuleRow } from "./NotificationRuleRow"
import { NotificationRule, NotificationRuleFormData } from "../types"
import { useNotificationRules } from "../hooks/useNotifications"
import { AddNotificationRuleModal } from "./AddNotificationRuleModal"

export interface NotificationRulesTableProps {
  className?: string
}

export const NotificationRulesTable: React.FC<NotificationRulesTableProps> = ({ className }) => {
  const { rules, loading, error, addRule, updateRule, deleteRule, toggleRule } = useNotificationRules()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEditRule = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  const handleSaveRule = async (id: string, updates: Partial<NotificationRuleFormData>) => {
    try {
      await updateRule(id, updates)
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update rule:', error)
    }
  }

  const handleAddRule = async (rule: NotificationRuleFormData) => {
    try {
      await addRule(rule)
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add rule:', error)
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteRule(id)
    } catch (error) {
      console.error('Failed to delete rule:', error)
    }
  }

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await toggleRule(id, isActive)
    } catch (error) {
      console.error('Failed to toggle rule:', error)
    }
  }

  if (loading) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading notification rules...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error loading notification rules: {error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Notification Rules</CardTitle>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No notification rules configured yet.</p>
              <p className="text-sm mt-1">Click "Add Rule" to create your first notification rule.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <NotificationRuleRow
                  key={rule.id}
                  rule={rule}
                  onSave={(updates) => handleSaveRule(rule.id, updates)}
                  onEdit={() => handleEditRule(rule.id)}
                  onDelete={() => handleDeleteRule(rule.id)}
                  onToggleActive={(isActive) => handleToggleRule(rule.id, isActive)}
                  isEditing={editingId === rule.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddNotificationRuleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRule}
      />
    </>
  )
} 