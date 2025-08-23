import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import type { Task } from '../types'

interface DeleteTaskDialogProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onDelete: (taskId: string) => Promise<void>
}

export function DeleteTaskDialog({ task, isOpen, onClose, onDelete }: DeleteTaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(task.id)
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Delete Task
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-slate-700 mb-4">
            Are you sure you want to delete the task <strong>"{task.title}"</strong>?
          </p>
          
          {task.recurring && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a recurring task. Deleting it will not affect future recurring instances.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="bg-white/50 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
