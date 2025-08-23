'use client'

import React, { useState, useEffect } from 'react'
import { InvoiceJobPage } from '@/features/jobs/components/InvoiceJobPage'

interface Job {
  id: string
  jobNumber: string
  title: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  estimatedHours: number
  hourlyRate: number
  actualHours: number
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  startDate: string
  dueDate: string
  completedDate?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  jobId: string
  job: Job
  customer: Job['customer']
  items: Array<{
    description: string
    hours: number
    rate: number
    amount: number
  }>
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issueDate: string
  dueDate: string
  notes: string
  createdAt: string
}

export default function InvoiceJobPageContainer() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with Supabase integration
    const mockJobs: Job[] = [
      {
        id: '1',
        jobNumber: 'JOB-001',
        title: 'Website Development',
        customer: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        estimatedHours: 40,
        hourlyRate: 75,
        actualHours: 45,
        status: 'completed',
        startDate: '2024-01-01',
        dueDate: '2024-01-15',
        completedDate: '2024-01-14'
      },
      {
        id: '2',
        jobNumber: 'JOB-002',
        title: 'Mobile App Development',
        customer: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        },
        estimatedHours: 80,
        hourlyRate: 85,
        actualHours: 90,
        status: 'completed',
        startDate: '2024-01-10',
        dueDate: '2024-02-10',
        completedDate: '2024-02-08'
      }
    ]
    
    setJobs(mockJobs)
    setIsLoading(false)
  }, [])

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    try {
      // TODO: Integrate with Supabase
      console.log('Creating invoice:', invoiceData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Add success notification
      console.log('Invoice created successfully')
    } catch (error) {
      console.error('Error creating invoice:', error)
      // TODO: Add error notification
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <InvoiceJobPage 
      jobs={jobs}
      onCreateInvoice={handleCreateInvoice}
      isLoading={false}
    />
  )
} 