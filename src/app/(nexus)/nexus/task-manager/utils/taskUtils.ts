import type { Task, TaskFilters } from '../types'

export const taskUtils = {
  // Filter tasks based on various criteria
  filterTasks: (tasks: Task[], filters: TaskFilters): Task[] => {
    return tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = task.title.toLowerCase().includes(searchLower) ||
                             task.description.toLowerCase().includes(searchLower) ||
                             task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        if (task.category !== filters.category) return false
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'all') {
        if (task.priority !== filters.priority) return false
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        switch (filters.status) {
          case 'pending':
            if (task.completed) return false
            break
          case 'completed':
            if (!task.completed) return false
            break
          case 'overdue':
            if (task.completed || new Date(task.dueDate) >= new Date()) return false
            break
        }
      }

      // Assigned to filter
      if (filters.assignedTo) {
        if (task.assignedTo !== filters.assignedTo) return false
      }

      // Date range filter
      if (filters.dueDateFrom) {
        if (new Date(task.dueDate) < new Date(filters.dueDateFrom)) return false
      }
      if (filters.dueDateTo) {
        if (new Date(task.dueDate) > new Date(filters.dueDateTo)) return false
      }

      return true
    })
  },

  // Sort tasks by various criteria
  sortTasks: (tasks: Task[], sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title', sortOrder: 'asc' | 'desc' = 'asc'): Task[] => {
    return [...tasks].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  },

  // Check if a task is overdue
  isOverdue: (task: Task): boolean => {
    return !task.completed && new Date(task.dueDate) < new Date()
  },

  // Check if a task is due today
  isDueToday: (task: Task): boolean => {
    const today = new Date()
    const taskDate = new Date(task.dueDate)
    return taskDate.toDateString() === today.toDateString()
  },

  // Check if a task is due this week
  isDueThisWeek: (task: Task): boolean => {
    const today = new Date()
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    const taskDate = new Date(task.dueDate)
    return taskDate >= weekStart && taskDate < weekEnd
  },

  // Format due date for display
  formatDueDate: (dueDate: string): string => {
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
  },

  // Get priority color classes
  getPriorityColor: (priority: string): string => {
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
  },

  // Get category color classes
  getCategoryColor: (category: string): string => {
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
  },

  // Generate recurring task due date
  generateNextDueDate: (currentDueDate: string, recurringType: 'daily' | 'weekly' | 'monthly', interval: number): string => {
    const date = new Date(currentDueDate)
    
    switch (recurringType) {
      case 'daily':
        date.setDate(date.getDate() + interval)
        break
      case 'weekly':
        date.setDate(date.getDate() + (interval * 7))
        break
      case 'monthly':
        date.setMonth(date.getMonth() + interval)
        break
    }
    
    return date.toISOString()
  },

  // Validate task data
  validateTask: (taskData: Partial<Task>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!taskData.title?.trim()) {
      errors.push('Task title is required')
    }

    if (!taskData.dueDate) {
      errors.push('Due date is required')
    } else if (new Date(taskData.dueDate) < new Date()) {
      errors.push('Due date cannot be in the past')
    }

    if (taskData.recurring) {
      if (taskData.recurring.interval < 1) {
        errors.push('Recurring interval must be at least 1')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
