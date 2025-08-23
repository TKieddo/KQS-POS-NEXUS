'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, Filter, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from './components/TaskList'
import { CreateTaskModal } from './components/CreateTaskModal'
import { TaskStats } from './components/TaskStats'
import { useTaskManager } from './hooks/useTaskManager'
import type { Task, TaskCategory, TaskPriority } from './types'

export default function TaskManagerPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  const {
    tasks,
    stats,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    generateRecurringTasks
  } = useTaskManager()

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && !task.completed) ||
                      (activeTab === 'completed' && task.completed) ||
                      (activeTab === 'overdue' && !task.completed && new Date(task.due_date) < new Date())

    return matchesSearch && matchesCategory && matchesPriority && matchesTab
  })

  const pendingTasks = filteredTasks.filter(task => !task.completed)
  const completedTasks = filteredTasks.filter(task => task.completed)
  const overdueTasks = filteredTasks.filter(task => !task.completed && new Date(task.due_date) < new Date())

  useEffect(() => {
    // Generate recurring tasks on component mount
    generateRecurringTasks()
  }, [generateRecurringTasks])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-black/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/10">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/10 rounded-2xl px-3 py-2 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Task Manager
              </h1>
              <p className="text-slate-300 text-sm mt-1">Never miss a task again</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Stats Cards */}
        <TaskStats stats={stats} />

                       {/* Filters and Search */}
               <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                 <CardContent className="p-6">
                   <div className="flex flex-col lg:flex-row gap-4 items-center">
                     <div className="relative flex-1">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <Input
                         placeholder="Search tasks..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="pl-10 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       />
                     </div>

                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                       <SelectTrigger className="w-full lg:w-44 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                         <SelectValue placeholder="All Categories" />
                       </SelectTrigger>
                       <SelectContent className="bg-white border-slate-200 rounded-2xl">
                         <SelectItem value="all">All Categories</SelectItem>
                         <SelectItem value="daily">Daily Tasks</SelectItem>
                         <SelectItem value="weekly">Weekly Tasks</SelectItem>
                         <SelectItem value="monthly">Monthly Tasks</SelectItem>
                         <SelectItem value="one-time">One-time Tasks</SelectItem>
                       </SelectContent>
                     </Select>

                     <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                       <SelectTrigger className="w-full lg:w-44 bg-white/80 border-slate-200 rounded-2xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                         <SelectValue placeholder="All Priorities" />
                       </SelectTrigger>
                       <SelectContent className="bg-white border-slate-200 rounded-2xl">
                         <SelectItem value="all">All Priorities</SelectItem>
                         <SelectItem value="low">Low</SelectItem>
                         <SelectItem value="medium">Medium</SelectItem>
                         <SelectItem value="high">High</SelectItem>
                         <SelectItem value="urgent">Urgent</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                 </CardContent>
               </Card>

        {/* Task Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-black/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl p-1">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-2xl transition-all duration-300">
              All Tasks ({filteredTasks.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-2xl transition-all duration-300">
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-2xl transition-all duration-300">
              Overdue ({overdueTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white rounded-2xl transition-all duration-300">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <TaskList 
              tasks={filteredTasks}
              onComplete={completeTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <TaskList 
              tasks={pendingTasks}
              onComplete={completeTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <TaskList 
              tasks={overdueTasks}
              onComplete={completeTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <TaskList 
              tasks={completedTasks}
              onComplete={completeTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              isLoading={isLoading}
              showCompleted={true}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={createTask}
      />
    </div>
  )
}
