import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import type { Employee, Division } from '../types/employee'

interface EmployeeExportProps {
  employees: Employee[]
  divisions: Division[]
  onCancel: () => void
}

export function EmployeeExport({ employees, divisions, onCancel }: EmployeeExportProps) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Export Employees
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600">
            Export employee data to CSV file. This feature will be implemented soon.
          </p>
          
          <div className="text-sm text-gray-500">
            <p>• {employees.length} employees will be exported</p>
            <p>• {divisions.length} divisions included</p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button disabled>
              <Download className="h-4 w-4 mr-2" />
              Export (Coming Soon)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
