'use client'

import React, { useState } from 'react'
import { StartJobPage } from '@/features/jobs/components/StartJobPage'

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

export default function StartJobPageContainer() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      // TODO: Integrate with Supabase
      console.log('Creating job:', jobData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Add success notification
      console.log('Job created successfully')
    } catch (error) {
      console.error('Error creating job:', error)
      // TODO: Add error notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StartJobPage 
      onCreateJob={handleCreateJob}
      isLoading={isLoading}
    />
  )
} 