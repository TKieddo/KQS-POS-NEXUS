'use client'

import React, { useState } from 'react'
import { DollarSign, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCashUpSession } from '@/lib/cashup-service'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface StartSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSessionStarted: (session: any) => void
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionStarted
}) => {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()
  const [openingAmount, setOpeningAmount] = useState('')
  const [cashierName, setCashierName] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStartSession = async () => {
    if (!openingAmount || !cashierName || !selectedBranch?.id) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createCashUpSession({
        cashier_name: cashierName,
        branch_id: selectedBranch.id,
        opening_amount: parseFloat(openingAmount),
        notes: notes
      })

      if (result.success && result.data) {
        toast.success('Session started successfully!')
        onSessionStarted(result.data)
        onClose()
        // Reset form
        setOpeningAmount('')
        setCashierName('')
        setNotes('')
      } else {
        toast.error(result.error || 'Failed to start session')
      }
    } catch (error) {
      console.error('Error starting session:', error)
      toast.error('Failed to start session')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Start New Cash Session</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>

        <div className="space-y-4">
          {/* Branch Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Branch</span>
            </div>
            <p className="text-sm text-gray-900">{selectedBranch?.name || 'Unknown Branch'}</p>
          </div>

          {/* Cashier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cashier Name *
            </label>
            <Input
              type="text"
              placeholder="Enter cashier name"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Opening Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Cash Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                placeholder="0.00"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full pl-10"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add any notes about this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Session Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Session Information</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Session will be created for: {selectedBranch?.name}</p>
              <p>• Status will be set to: Active</p>
              <p>• Sales will be tracked automatically</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={handleStartSession}
            disabled={isSubmitting || !openingAmount || !cashierName}
            className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 disabled:opacity-50"
          >
            {isSubmitting ? 'Starting...' : 'Start Session'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
