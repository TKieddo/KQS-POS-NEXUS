'use client'

import React, { useState } from 'react'
import { FileText, Plus, DollarSign, Calendar, User, Clock } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

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

interface InvoiceJobPageProps {
  jobs: Job[]
  onCreateInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => void
  isLoading?: boolean
}

export const InvoiceJobPage: React.FC<InvoiceJobPageProps> = ({
  jobs,
  onCreateInvoice,
  isLoading = false
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [invoiceData, setInvoiceData] = useState({
    items: [{ description: '', hours: 0, rate: 0, amount: 0 }],
    tax: 0,
    notes: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const completedJobs = jobs.filter(job => job.status === 'completed' && !job.completedDate)

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    setInvoiceData(prev => ({
      ...prev,
      items: [{
        description: job.title,
        hours: job.actualHours || job.estimatedHours,
        rate: job.hourlyRate,
        amount: (job.actualHours || job.estimatedHours) * job.hourlyRate
      }]
    }))
  }

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', hours: 0, rate: 0, amount: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItem = (index: number, field: 'description' | 'hours' | 'rate', value: string | number) => {
    setInvoiceData(prev => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        amount: field === 'hours' || field === 'rate' 
          ? (field === 'hours' ? Number(value) : newItems[index].hours) * (field === 'rate' ? Number(value) : newItems[index].rate)
          : newItems[index].amount
      }
      return { ...prev, items: newItems }
    })
  }

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = subtotal * (invoiceData.tax / 100)
  const total = subtotal + taxAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    const invoice: Omit<Invoice, 'id' | 'createdAt'> = {
      invoiceNumber: `INV-${Date.now()}`,
      jobId: selectedJob.id,
      job: selectedJob,
      customer: selectedJob.customer,
      items: invoiceData.items,
      subtotal,
      tax: invoiceData.tax,
      total,
      status: 'draft',
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      notes: invoiceData.notes
    }

    onCreateInvoice(invoice)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Create Job Invoice" 
        icon={<FileText className="h-4 w-4 text-black" />}
      />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Select Job
              </h3>
              
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedJob?.id === job.id
                        ? 'border-[#E5FF29] bg-[#E5FF29]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{job.jobNumber}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.customer.name}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{job.actualHours || job.estimatedHours}h</span>
                      <span>{formatCurrency(job.hourlyRate)}/h</span>
                    </div>
                  </div>
                ))}
                
                {completedJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No completed jobs available for invoicing</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6">
              {selectedJob ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Job:</span>
                          <p className="font-medium">{selectedJob.jobNumber} - {selectedJob.title}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Customer:</span>
                          <p className="font-medium">{selectedJob.customer.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Invoice Items</h4>
                        <Button
                          type="button"
                          onClick={addItem}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {invoiceData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-5">
                              <Input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                placeholder="Description"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={item.hours}
                                onChange={(e) => updateItem(index, 'hours', parseFloat(e.target.value) || 0)}
                                placeholder="Hours"
                                min="0"
                                step="0.5"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                placeholder="Rate"
                                min="0"
                                step="0.01"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <div className="h-8 flex items-center px-3 bg-gray-50 border border-gray-200 rounded text-xs font-medium">
                                {formatCurrency(item.amount)}
                              </div>
                            </div>
                            <div className="col-span-1">
                              {invoiceData.items.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Tax (%):</span>
                          <Input
                            type="number"
                            value={invoiceData.tax}
                            onChange={(e) => setInvoiceData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-20 h-8 text-xs"
                          />
                          <span className="font-medium">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dates and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date
                        </label>
                        <Input
                          type="date"
                          value={invoiceData.issueDate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <Input
                          type="date"
                          value={invoiceData.dueDate}
                          onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any additional notes..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] resize-none h-20 text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-6 rounded-lg"
                      >
                        Save Draft
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
                            <FileText className="h-4 w-4 mr-2" />
                            Create Invoice
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job</h3>
                  <p className="text-sm text-gray-600">Choose a completed job from the list to create an invoice</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 