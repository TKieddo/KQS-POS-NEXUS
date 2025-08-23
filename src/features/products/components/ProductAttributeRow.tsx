import React from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Save, X } from "lucide-react"

export interface ProductAttributeRowProps {
  barcode: string
  sku: string
  unit: string
  onChange: (field: string, value: any) => void
  onSave: () => void
  onEdit: () => void
  onDelete: () => void
  isEditing: boolean
}

export const ProductAttributeRow = ({
  barcode,
  sku,
  unit,
  onChange,
  onSave,
  onEdit,
  onDelete,
  isEditing
}: ProductAttributeRowProps) => {
  return (
    <div className="flex items-center gap-3 py-2">
      {isEditing ? (
        <>
          <Input
            value={barcode}
            onChange={e => onChange("barcode", e.target.value)}
            placeholder="Barcode"
            className="max-w-xs"
          />
          <Input
            value={sku}
            onChange={e => onChange("sku", e.target.value)}
            placeholder="SKU"
            className="max-w-xs"
          />
          <Select
            value={unit}
            onChange={e => onChange("unit", e.target.value)}
            className="max-w-xs"
          >
            <option value="unit">Unit</option>
            <option value="kg">Kg</option>
            <option value="litre">Litre</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </Select>
          <Button size="sm" className="bg-[hsl(var(--primary))] text-white" onClick={onSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="font-medium w-32 truncate">{barcode}</span>
          <span className="w-32 truncate">{sku}</span>
          <span className="w-24 capitalize">{unit}</span>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </>
      )}
    </div>
  )
} 