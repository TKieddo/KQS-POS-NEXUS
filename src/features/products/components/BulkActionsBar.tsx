import { CheckSquare, DollarSign, Tag, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkActionsBarProps {
  selectedCount: number
  onBulkPrice: () => void
  onApplyPromotion: () => void
  onBulkDelete: () => void
  onClear: () => void
}

export const BulkActionsBar = ({
  selectedCount,
  onBulkPrice,
  onApplyPromotion,
  onBulkDelete,
  onClear
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E5FF29]/20">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-black">
          {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-black border-black/20 hover:bg-black/5"
          onClick={onBulkPrice}
        >
          <DollarSign className="mr-1 h-3 w-3" />
          Bulk Price
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-black border-black/20 hover:bg-black/5"
          onClick={onApplyPromotion}
        >
          <Tag className="mr-1 h-3 w-3" />
          Apply Promotion
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={onBulkDelete}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Delete
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onClear}
          className="text-black/60 hover:text-black"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
} 