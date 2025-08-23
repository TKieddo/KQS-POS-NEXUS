import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Trash2, 
  MoreVertical,
  Tag,
  User
} from 'lucide-react'
import { TaskItem } from './TaskItem'
import { EditTaskModal } from './EditTaskModal'
import { DeleteTaskDialog } from './DeleteTaskDialog'
import type { Task } from '../types'

interface TaskListProps {
  tasks: Task[]
  onComplete: (taskId: string, completed: boolean) => Promise<void>
  onUpdate: (taskData: any) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  isLoading?: boolean
  showCompleted?: boolean
}

export function TaskList({ 
  tasks, 
  onComplete, 
  onUpdate, 
  onDelete, 
  isLoading = false,
  showCompleted = false 
}: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'weekly':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'monthly':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'one-time':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {showCompleted ? 'No completed tasks' : 'No tasks found'}
          </h3>
          <p className="text-slate-600">
            {showCompleted 
              ? 'Complete some tasks to see them here'
              : 'Create your first task to get started'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl group hover:scale-[1.02] ${
            task.completed ? 'opacity-75' : ''
                     } ${isOverdue(task.due_date) && !task.completed ? 'border-l-4 border-l-red-500 shadow-red-100' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => onComplete(task.id, checked as boolean)}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-semibold text-slate-900 mb-1 ${
                      task.completed ? 'line-through' : ''
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className={`text-sm text-slate-600 mb-2 line-clamp-2 ${
                        task.completed ? 'line-through' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <Badge className={`${getPriorityColor(task.priority)} rounded-full text-xs px-2 py-0.5`}>
                        {task.priority}
                      </Badge>
                      <Badge className={`${getCategoryColor(task.category)} rounded-full text-xs px-2 py-0.5`}>
                        {task.category}
                      </Badge>
                      {task.recurring && (
                        <Badge className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full text-xs px-2 py-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                                                 <span className={isOverdue(task.due_date) && !task.completed ? 'text-red-600 font-medium' : ''}>
                           {formatDueDate(task.due_date)}
                         </span>
                         {isOverdue(task.due_date) && !task.completed && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      
                                             {task.assigned_to && (
                         <div className="flex items-center space-x-1">
                           <User className="h-3 w-3" />
                           <span>{task.assigned_to}</span>
                         </div>
                       )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                      className="h-7 w-7 p-0 rounded-xl hover:bg-slate-100"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingTask(task)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* Delete Task Dialog */}
      {deletingTask && (
        <DeleteTaskDialog
          task={deletingTask}
          isOpen={!!deletingTask}
          onClose={() => setDeletingTask(null)}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}
