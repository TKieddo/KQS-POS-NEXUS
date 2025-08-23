import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"

interface BulkDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
}

export const BulkDeleteModal = ({ isOpen, onClose, selectedCount }: BulkDeleteModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Products" maxWidth="lg">
      <div className="space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">Warning: This action cannot be undone!</p>
          </div>
          <p className="text-sm text-red-700">
            You are about to delete {selectedCount} product{selectedCount > 1 ? 's' : ''}.
            This will permanently remove them from your inventory.
          </p>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="deleteMode" defaultChecked className="rounded" />
            <span className="text-sm text-black">Delete products and keep sale history</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="deleteMode" className="rounded" />
            <span className="text-sm text-black">Delete products and all associated data</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Type "DELETE" to confirm:
          </label>
          <Input 
            placeholder="DELETE" 
            className="bg-white border-red-200 focus:border-red-400" 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-red-600 text-white border-red-600 hover:bg-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Products
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 