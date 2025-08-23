import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

interface EmployeeImportProps {
  onImport: () => void
  onCancel: () => void
}

export function EmployeeImport({ onImport, onCancel }: EmployeeImportProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Employees
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600">
            Import employee data from CSV file. This feature will be implemented soon.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import (Coming Soon)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
