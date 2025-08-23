export interface Task {
  id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  due_date: string
  completed: boolean
  completed_at?: string
  assigned_to?: string
  recurring?: RecurringConfig
  tags?: string[]
  created_at: string
  updated_at: string
}

export type TaskCategory = 'daily' | 'weekly' | 'monthly' | 'one-time'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface RecurringConfig {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number // Every X days/weeks/months
  endDate?: string // Optional end date for recurring tasks
  lastGenerated?: string // Last time a recurring task was generated
}

export interface TaskStats {
  total: number
  pending: number
  completed: number
  overdue: number
  today: number
  thisWeek: number
  thisMonth: number
}

export interface CreateTaskData {
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  dueDate: string
  assignedTo?: string
  recurring?: RecurringConfig
  tags?: string[]
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
  completed?: boolean
}

export interface TaskFilters {
  search?: string
  category?: TaskCategory
  priority?: TaskPriority
  status?: 'all' | 'pending' | 'completed' | 'overdue'
  assignedTo?: string
  dueDateFrom?: string
  dueDateTo?: string
}
