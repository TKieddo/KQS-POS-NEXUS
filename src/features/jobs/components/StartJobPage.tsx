'use client'

import React, { useState } from 'react'
import { Briefcase, Plus, Calendar, User, DollarSign, FileText } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface Job {
  id: string
  jobNumber: string
  title: string
  description: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  estimatedHours: number
  hourlyRate: number
  estimatedTotal: number
  startDate: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

interface StartJobPageProps {
  onCreateJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void
  isLoading?: boolean
}

export const StartJobPage: React.FC<StartJobPageProps> = ({
  onCreateJob,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    estimatedHours: 0,
    hourlyRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required'
    if (formData.estimatedHours <= 0) newErrors.estimatedHours = 'Estimated hours must be greater than 0'
    if (formData.hourlyRate <= 0) newErrors.hourlyRate = 'Hourly rate must be greater than 0'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const jobData = {
      jobNumber: `JOB-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      customer: {
        id: `CUST-${Date.now()}`,
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone
      },
      estimatedHours: formData.estimatedHours,
      hourlyRate: formData.hourlyRate,
      estimatedTotal: formData.estimatedHours * formData.hourlyRate,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: 'pending' as const,
      priority: formData.priority
    }

    onCreateJob(jobData)
  }

  const estimatedTotal = formData.estimatedHours * formData.hourlyRate

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Start New Job" 
        icon={<Briefcase className="h-4 w-4 text-black" />}
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Job Information</h2>
            <p className="text-sm text-gray-600">Create a new job with customer details and project specifications</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter job title"
                  className={`h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full h-10 rounded-lg border border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the job requirements and scope..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none h-24 text-sm"
              />
            </div>

            {/* Customer Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    className={`h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.customerName ? 'border-red-500' : ''}`}
                  />
                  {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="Enter email address (optional)"
                    className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Project Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours *
                  </label>
                  <Input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.5"
                    className={`h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.estimatedHours ? 'border-red-500' : ''}`}
                  />
                  {errors.estimatedHours && <p className="text-xs text-red-600 mt-1">{errors.estimatedHours}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate *
                  </label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className={`h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.hourlyRate ? 'border-red-500' : ''}`}
                  />
                  {errors.hourlyRate && <p className="text-xs text-red-600 mt-1">{errors.hourlyRate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Total
                  </label>
                  <div className="h-10 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                    {formatCurrency(estimatedTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.startDate ? 'border-red-500' : ''}`}
                  />
                  {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`h-10 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 ${errors.dueDate ? 'border-red-500' : ''}`}
                  />
                  {errors.dueDate && <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-6 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 px-6 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 