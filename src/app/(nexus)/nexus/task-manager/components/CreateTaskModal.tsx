import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, Tag, User, X, Plus, AlertCircle } from 'lucide-react'
import type { CreateTaskData, TaskCategory, TaskPriority, RecurringConfig } from '../types'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (taskData: CreateTaskData) => Promise<void>
}

export function CreateTaskModal({ isOpen, onClose, onCreateTask }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    category: 'one-time',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    tags: []
  })
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
    type: 'daily',
    interval: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim()) {
      setError('Task title is required')
      return
    }

    if (!formData.dueDate) {
      setError('Due date is required')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const taskData: CreateTaskData = {
        ...formData,
        recurring: isRecurring ? recurringConfig : undefined
      }
      await onCreateTask(taskData)
      handleClose()
    } catch (error) {
      console.error('Error creating task:', error)
      setError('Failed to create task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'one-time',
      priority: 'medium',
      dueDate: '',
      assignedTo: '',
      tags: []
    })
    setIsRecurring(false)
    setRecurringConfig({ type: 'daily', interval: 1 })
    setTagInput('')
    setError('')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-purple-600" />
              Create New Task
            </h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Task Title *
                  </Label>
                                     <Input
                     id="title"
                     value={formData.title}
                     onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                     placeholder="Enter task title"
                     className="mt-2 bg-white border-gray-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     required
                   />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description (Optional)
                  </Label>
                                     <Textarea
                     id="description"
                     value={formData.description}
                     onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                     placeholder="Enter task description"
                     className="mt-2 bg-white border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     rows={4}
                   />
                </div>

                                 <div>
                   <Label className="text-sm font-medium text-gray-700 mb-3 block">
                     Category
                   </Label>
                                       <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: 'daily' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.category === 'daily'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        📅 Daily
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: 'weekly' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.category === 'weekly'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        📊 Weekly
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: 'monthly' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.category === 'monthly'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        📈 Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: 'one-time' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.category === 'one-time'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        ⭐ One-time
                      </button>
                    </div>
                 </div>

                 <div>
                   <Label className="text-sm font-medium text-gray-700 mb-3 block">
                     Priority
                   </Label>
                                       <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'low' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.priority === 'low'
                            ? 'border-gray-500 bg-gray-50 text-gray-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🟢 Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'medium' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.priority === 'medium'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🟡 Medium
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.priority === 'high'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🟠 High
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: 'urgent' }))}
                        className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium ${
                          formData.priority === 'urgent'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        🔴 Urgent
                      </button>
                    </div>
                 </div>
              </div>

              {/* Right Column - Due Date, Assignment, and Tags */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                      Due Date *
                    </Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                             <Input
                         id="dueDate"
                         type="date"
                         value={formData.dueDate}
                         onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                         className="pl-10 bg-white border-gray-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                         required
                       />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="assignedTo" className="text-sm font-medium text-gray-700">
                      Assigned To (Optional)
                    </Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                             <Input
                         id="assignedTo"
                         value={formData.assignedTo}
                         onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                         placeholder="Enter assignee name"
                         className="pl-10 bg-white border-gray-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Tags (Optional)
                  </Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                 <Input
                           value={tagInput}
                           onChange={(e) => setTagInput(e.target.value)}
                           placeholder="Add a tag"
                           className="pl-10 bg-white border-gray-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                         />
                      </div>
                                             <Button 
                         type="button" 
                         onClick={addTag}
                         variant="outline"
                         className="bg-white border-gray-200 rounded-2xl h-12 hover:bg-gray-50"
                       >
                         Add
                       </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-gray-400 hover:text-gray-600 rounded-full w-4 h-4 flex items-center justify-center hover:bg-gray-200"
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
                    <Label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                      Make this a recurring task
                    </Label>
                  </div>

                  {isRecurring && (
                                         <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Recurrence Type
                        </Label>
                        <Select 
                          value={recurringConfig.type} 
                          onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                            setRecurringConfig(prev => ({ ...prev, type: value }))
                          }
                        >
                                                     <SelectTrigger className="mt-2 bg-white border-gray-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-white border-gray-200 rounded-2xl">
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">
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
                             className="mt-2 bg-white border-gray-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                             <Button
                 type="button"
                 variant="outline"
                 onClick={handleClose}
                 className="bg-white border-gray-200 rounded-2xl px-8 py-3 hover:bg-gray-50"
               >
                 Cancel
               </Button>
               <Button
                 type="submit"
                 disabled={isSubmitting || !formData.title?.trim()}
                 className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
               >
                 {isSubmitting ? 'Creating...' : 'Create Task'}
               </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
