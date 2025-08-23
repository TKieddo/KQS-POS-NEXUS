import React from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Save, X } from "lucide-react"

export interface ProductPricingRuleRowProps {
  name: string
  type: "markup" | "fixed" | "discount"
  value: number
  onChange: (field: string, value: any) => void
  onSave: () => void
  onEdit: () => void
  onDelete: () => void
  isEditing: boolean
}

export const ProductPricingRuleRow = ({
  name,
  type,
  value,
  onChange,
  onSave,
  onEdit,
  onDelete,
  isEditing
}: ProductPricingRuleRowProps) => {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      {isEditing ? (
        <>
          <Input
            value={name}
            onChange={e => onChange("name", e.target.value)}
            placeholder="Rule Name"
            className="min-w-[200px]"
          />
          <Select
            value={type}
            onChange={e => onChange("type", e.target.value)}
            className="min-w-[150px]"
          >
            <option value="markup">Markup %</option>
            <option value="fixed">Fixed Price</option>
            <option value="discount">Discount %</option>
          </Select>
          <Input
            type="number"
            value={value}
            onChange={e => onChange("value", e.target.value)}
            placeholder="Value"
            className="min-w-[120px]"
          />
          <Button size="sm" className="bg-[hsl(var(--primary))] text-white" onClick={onSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="font-medium min-w-[200px] text-left">{name}</span>
          <span className="min-w-[150px] capitalize text-left">{type}</span>
          <span className="min-w-[120px] text-left">{value}</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 