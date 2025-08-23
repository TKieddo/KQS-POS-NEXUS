import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, Tag, User, X } from 'lucide-react'
import type { Task, UpdateTaskData, TaskCategory, TaskPriority, RecurringConfig } from '../types'

interface EditTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onUpdate: (taskData: UpdateTaskData) => Promise<void>
}

export function EditTaskModal({ task, isOpen, onClose, onUpdate }: EditTaskModalProps) {
           const [formData, setFormData] = useState<UpdateTaskData>({
           id: task.id,
           title: task.title,
           description: task.description,
           category: task.category,
           priority: task.priority,
           dueDate: task.due_date.split('T')[0],
           assignedTo: task.assigned_to || '',
           tags: task.tags || []
         })
  const [isRecurring, setIsRecurring] = useState(!!task.recurring)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>(
    task.recurring || { type: 'daily', interval: 1 }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

           useEffect(() => {
           if (task) {
             setFormData({
               id: task.id,
               title: task.title,
               description: task.description,
               category: task.category,
               priority: task.priority,
               dueDate: task.due_date.split('T')[0],
               assignedTo: task.assigned_to || '',
               tags: task.tags || []
             })
             setIsRecurring(!!task.recurring)
             setRecurringConfig(task.recurring || { type: 'daily', interval: 1 })
           }
         }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim()) return

    try {
      setIsSubmitting(true)
      const taskData: UpdateTaskData = {
        ...formData,
        recurring: isRecurring ? recurringConfig : undefined
      }
      await onUpdate(taskData)
      onClose()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTagInput('')
    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Edit Task
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-0 top-0 h-8 w-8 p-0 rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

                 <form onSubmit={handleSubmit} className="space-y-6">
           {/* Basic Information */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                   Task Title *
                 </Label>
                 <Input
                   id="title"
                   value={formData.title}
                   onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                   placeholder="Enter task title"
                   className="mt-1 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   required
                 />
               </div>

               <div>
                 <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                   Description (Optional)
                 </Label>
                 <Textarea
                   id="description"
                   value={formData.description}
                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                   placeholder="Enter task description"
                   className="mt-1 bg-white/80 border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   rows={4}
                 />
               </div>
             </div>
           </div>

           {/* Task Properties */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                 Category
               </Label>
               <Select 
                 value={formData.category} 
                 onValueChange={(value: TaskCategory) => setFormData(prev => ({ ...prev, category: value }))}
               >
                 <SelectTrigger className="mt-1 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-white border-slate-200 rounded-2xl">
                   <SelectItem value="daily">Daily</SelectItem>
                   <SelectItem value="weekly">Weekly</SelectItem>
                   <SelectItem value="monthly">Monthly</SelectItem>
                   <SelectItem value="one-time">One-time</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div>
               <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
                 Priority
               </Label>
               <Select 
                 value={formData.priority} 
                 onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
               >
                 <SelectTrigger className="mt-1 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-white border-slate-200 rounded-2xl">
                   <SelectItem value="low">Low</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="high">High</SelectItem>
                   <SelectItem value="urgent">Urgent</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>

                     {/* Due Date and Assignment */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <Label htmlFor="dueDate" className="text-sm font-medium text-slate-700">
                 Due Date
               </Label>
               <div className="relative mt-1">
                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input
                   id="dueDate"
                   type="date"
                   value={formData.dueDate}
                   onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                   className="pl-10 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   required
                 />
               </div>
             </div>

             <div>
               <Label htmlFor="assignedTo" className="text-sm font-medium text-slate-700">
                 Assigned To (Optional)
               </Label>
               <div className="relative mt-1">
                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input
                   id="assignedTo"
                   value={formData.assignedTo}
                   onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                   placeholder="Enter assignee name"
                   className="pl-10 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                 />
               </div>
             </div>
           </div>

                     {/* Tags */}
           <div>
             <Label className="text-sm font-medium text-slate-700">
               Tags (Optional)
             </Label>
             <div className="mt-1 space-y-2">
               <div className="flex space-x-2">
                 <div className="relative flex-1">
                   <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input
                     value={tagInput}
                     onChange={(e) => setTagInput(e.target.value)}
                     placeholder="Add a tag"
                     className="pl-10 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                   />
                 </div>
                 <Button 
                   type="button" 
                   onClick={addTag}
                   variant="outline"
                   className="bg-white/80 border-slate-200 rounded-2xl h-12 hover:bg-white/90"
                 >
                   Add
                 </Button>
               </div>
              {formData.tags && formData.tags.length > 0 && (
                                 <div className="flex flex-wrap gap-2">
                   {formData.tags.map((tag, index) => (
                     <span
                       key={index}
                       className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-sm"
                     >
                       {tag}
                       <button
                         type="button"
                         onClick={() => removeTag(tag)}
                         className="ml-1 text-slate-400 hover:text-slate-600 rounded-full w-4 h-4 flex items-center justify-center hover:bg-slate-300"
                       >
                         ×
                       </button>
                     </span>
                   ))}
                 </div>
              )}
            </div>
          </div>

          {/* Recurring Task Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="text-sm font-medium text-slate-700">
                Make this a recurring task
              </Label>
            </div>

                         {isRecurring && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                 <div>
                   <Label className="text-sm font-medium text-slate-700">
                     Recurrence Type
                   </Label>
                   <Select 
                     value={recurringConfig.type} 
                     onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                       setRecurringConfig(prev => ({ ...prev, type: value }))
                     }
                   >
                     <SelectTrigger className="mt-1 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-white border-slate-200 rounded-2xl">
                       <SelectItem value="daily">Daily</SelectItem>
                       <SelectItem value="weekly">Weekly</SelectItem>
                       <SelectItem value="monthly">Monthly</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div>
                   <Label className="text-sm font-medium text-slate-700">
                     Interval
                   </Label>
                   <Input
                     type="number"
                     min="1"
                     value={recurringConfig.interval}
                     onChange={(e) => setRecurringConfig(prev => ({ 
                       ...prev, 
                       interval: parseInt(e.target.value) || 1 
                     }))}
                     className="mt-1 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   />
                 </div>
               </div>
             )}
          </div>

                     {/* Actions */}
           <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
             <Button
               type="button"
               variant="outline"
               onClick={handleClose}
               className="bg-white/80 border-slate-200 rounded-2xl px-8 py-3 hover:bg-white/90"
             >
               Cancel
             </Button>
             <Button
               type="submit"
               disabled={isSubmitting || !formData.title?.trim()}
               className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
             >
               {isSubmitting ? 'Updating...' : 'Update Task'}
             </Button>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
