import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task, CreateTaskData, UpdateTaskData, TaskStats } from '../types'

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks from Supabase
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      const tasksData = data || []
      console.log('Loaded tasks:', tasksData)
      setTasks(tasksData)
      calculateStats(tasksData)
    } catch (error) {
      console.error('Error loading tasks:', error)
      // Set empty array if there's an error
      setTasks([])
      calculateStats([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Calculate task statistics
  const calculateStats = useCallback((tasksData: Task[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats: TaskStats = {
      total: tasksData.length,
      pending: tasksData.filter(task => !task.completed).length,
      completed: tasksData.filter(task => task.completed).length,
      overdue: tasksData.filter(task => !task.completed && new Date(task.due_date) < today).length,
      today: tasksData.filter(task => {
        const taskDate = new Date(task.due_date)
        return taskDate >= today && taskDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }).length,
      thisWeek: tasksData.filter(task => {
        const taskDate = new Date(task.due_date)
        return taskDate >= weekStart && taskDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      }).length,
      thisMonth: tasksData.filter(task => {
        const taskDate = new Date(task.due_date)
        return taskDate >= monthStart && taskDate < new Date(monthStart.getTime() + 32 * 24 * 60 * 60 * 1000)
      }).length
    }

    setStats(stats)
  }, [])

  // Create new task
  const createTask = useCallback(async (taskData: CreateTaskData) => {
    try {
      console.log('Creating task with data:', taskData)
      
      const newTask = {
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category,
        priority: taskData.priority,
        due_date: taskData.dueDate,
        completed: false,
        assigned_to: taskData.assignedTo || null,
        recurring: taskData.recurring || null,
        tags: taskData.tags || []
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating task:', error)
        throw error
      }

      console.log('Created task:', data)
      setTasks(prev => [data, ...prev])
      calculateStats([data, ...tasks])
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Update task
  const updateTask = useCallback(async (taskData: UpdateTaskData) => {
    try {
      console.log('Updating task with data:', taskData)
      
      const updateData: any = {}
      
      if (taskData.title !== undefined) updateData.title = taskData.title
      if (taskData.description !== undefined) updateData.description = taskData.description
      if (taskData.category !== undefined) updateData.category = taskData.category
      if (taskData.priority !== undefined) updateData.priority = taskData.priority
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate
      if (taskData.assignedTo !== undefined) updateData.assigned_to = taskData.assignedTo
      if (taskData.recurring !== undefined) updateData.recurring = taskData.recurring
      if (taskData.tags !== undefined) updateData.tags = taskData.tags
      if (taskData.completed !== undefined) updateData.completed = taskData.completed

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskData.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error updating task:', error)
        throw error
      }

      console.log('Updated task:', data)
      setTasks(prev => prev.map(task => task.id === taskData.id ? data : task))
      calculateStats(tasks.map(task => task.id === taskData.id ? data : task))
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      const updatedTasks = tasks.filter(task => task.id !== taskId)
      setTasks(updatedTasks)
      calculateStats(updatedTasks)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Complete task
  const completeTask = useCallback(async (taskId: string, completed: boolean = true) => {
    try {
      console.log('Completing task:', taskId, 'completed:', completed)
      
      const updateData = {
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Supabase error completing task:', error)
        throw error
      }

      console.log('Completed task:', data)
      setTasks(prev => prev.map(task => task.id === taskId ? data : task))
      calculateStats(tasks.map(task => task.id === taskId ? data : task))
      return data
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }, [tasks, calculateStats])

  // Generate recurring tasks
  const generateRecurringTasks = useCallback(async () => {
    try {
      const recurringTasks = tasks.filter(task => task.recurring && !task.completed)
      const now = new Date()
      const newTasks: CreateTaskData[] = []

      for (const task of recurringTasks) {
        if (!task.recurring) continue

                 const lastGenerated = task.recurring.lastGenerated 
           ? new Date(task.recurring.lastGenerated)
           : new Date(task.created_at)

        let shouldGenerate = false
        let nextDueDate = new Date(lastGenerated)

        switch (task.recurring.type) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + task.recurring.interval)
            shouldGenerate = nextDueDate <= now
            break
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + (task.recurring.interval * 7))
            shouldGenerate = nextDueDate <= now
            break
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + task.recurring.interval)
            shouldGenerate = nextDueDate <= now
            break
        }

        if (shouldGenerate && (!task.recurring.endDate || new Date(task.recurring.endDate) > now)) {
          newTasks.push({
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            dueDate: nextDueDate.toISOString(),
            assignedTo: task.assignedTo,
            recurring: task.recurring,
            tags: task.tags
          })

          // Update last generated date
          await supabase
            .from('tasks')
            .update({
              'recurring.lastGenerated': now.toISOString(),
              updatedAt: now.toISOString()
            })
            .eq('id', task.id)
        }
      }

      // Create new recurring tasks
      for (const newTask of newTasks) {
        await createTask(newTask)
      }
    } catch (error) {
      console.error('Error generating recurring tasks:', error)
    }
  }, [tasks, createTask])

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return {
    tasks,
    stats,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    generateRecurringTasks,
    loadTasks
  }
}
