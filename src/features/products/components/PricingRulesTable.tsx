import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductPricingRuleRow } from "./ProductPricingRuleRow"

export interface PricingRule {
  id: string
  name: string
  type: "markup" | "fixed" | "discount"
  value: number
}

export interface PricingRulesTableProps {
  rules: PricingRule[]
  onAddRule: (rule: Omit<PricingRule, "id">) => void
  onUpdateRule: (id: string, rule: Partial<PricingRule>) => void
  onDeleteRule: (id: string) => void
}

export const PricingRulesTable = ({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule
}: PricingRulesTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRule, setNewRule] = useState<Omit<PricingRule, "id">>({
    name: "",
    type: "markup",
    value: 0
  })

  const handleAddRule = () => {
    if (newRule.name && newRule.value > 0) {
      onAddRule(newRule)
      setNewRule({ name: "", type: "markup", value: 0 })
    }
  }

  const handleEditRule = (id: string) => {
    setEditingId(editingId === id ? null : id)
  }

  const handleSaveRule = (id: string) => {
    setEditingId(null)
  }

  const handleDeleteRule = (id: string) => {
    onDeleteRule(id)
  }

  const handleRuleChange = (id: string, field: string, value: any) => {
    onUpdateRule(id, { [field]: value })
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Pricing Rules</CardTitle>
          <Button 
            onClick={handleAddRule}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {rules.map((rule) => (
            <ProductPricingRuleRow
              key={rule.id}
              name={rule.name}
              type={rule.type}
              value={rule.value}
              onChange={(field, value) => handleRuleChange(rule.id, field, value)}
              onSave={() => handleSaveRule(rule.id)}
              onEdit={() => handleEditRule(rule.id)}
              onDelete={() => handleDeleteRule(rule.id)}
              isEditing={editingId === rule.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 