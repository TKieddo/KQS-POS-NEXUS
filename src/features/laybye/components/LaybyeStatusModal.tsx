'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, X, AlertTriangle, Package, Save, User, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LaybyeItem } from './LaybyeTable'

interface LaybyeStatusModalProps {
  laybye: LaybyeItem | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (laybyeId: string, newStatus: string, notes?: string) => void
}

export function LaybyeStatusModal({ 
  laybye, 
  isOpen, 
  onClose, 
  onStatusChange 
}: LaybyeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!laybye || !isOpen) return null

  const handleStatusChange = async () => {
    if (!newStatus) return

    setIsProcessing(true)
    try {
      await onStatusChange(laybye.id, newStatus, notes || undefined)
      onClose()
      setNewStatus('')
      setNotes('')
    } catch (error) {
      console.error('Error changing status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusOptions = () => {
    const options = []
    
    if (laybye.status === 'active') {
      options.push(
        { value: 'completed', label: 'Mark as Completed', icon: CheckCircle, color: 'text-green-600' },
        { value: 'cancelled', label: 'Cancel Lay-bye', icon: X, color: 'text-red-600' }
      )
    }
    
    if (laybye.status === 'overdue') {
      options.push(
        { value: 'active', label: 'Mark as Active', icon: CheckCircle, color: 'text-green-600' },
        { value: 'completed', label: 'Mark as Completed', icon: CheckCircle, color: 'text-green-600' },
        { value: 'cancelled', label: 'Cancel Lay-bye', icon: X, color: 'text-red-600' }
      )
    }
    
    if (laybye.status === 'cancelled') {
      options.push(
        { value: 'active', label: 'Reactivate Lay-bye', icon: CheckCircle, color: 'text-green-600' }
      )
    }

    return options
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'completed': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'cancelled': return <X className="h-5 w-5 text-gray-600" />
      default: return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white border-gray-200 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
              Manage Lay-bye Status - {laybye.id}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Laybye Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                  <p className="text-sm text-[hsl(var(--primary))]">{laybye.customer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Balance</p>
                  <div className="text-lg font-semibold text-orange-600">
                    {formatCurrency(laybye.balanceRemaining)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Items</p>
                  <p className="text-sm text-[hsl(var(--primary))]">{laybye.items.length} items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusIcon(laybye.status)}
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(laybye.status)}`}>
                    {laybye.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Change Options */}
          <div className="mb-6">
            <h4 className="font-medium text-[hsl(var(--primary))] mb-3">
              Change Status To:
            </h4>
            <div className="space-y-2">
              {getStatusOptions().map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewStatus(option.value)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                    newStatus === option.value
                      ? 'border-[#E5FF29] bg-[#E5FF29]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <option.icon className={`h-5 w-5 ${option.color}`} />
                  <span className="text-sm font-medium text-[hsl(var(--primary))]">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this status change..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleStatusChange}
              disabled={!newStatus || isProcessing}
              className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {isProcessing ? 'Updating...' : 'Update Status'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 