'use client'

import React, { useState, useEffect } from 'react'
import { X, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface TillSession {
  id: string
  startTime: string
  endTime?: string
  startingAmount: number
  endingAmount: number
  totalSales: number
  totalRefunds: number
  cashSales: number
  cardSales: number
  otherPayments: number
  expectedCash: number
  actualCash: number
  difference: number
  status: 'active' | 'closed'
  notes: string
}

interface TillSessionModalProps {
  isOpen: boolean
  onClose: () => void
  currentSession: TillSession | null
}

export const TillSessionModal: React.FC<TillSessionModalProps> = ({
  isOpen,
  onClose,
  currentSession
}) => {
  const [sessions, setSessions] = useState<TillSession[]>([])

  useEffect(() => {
    if (isOpen) {
      // Mock session history data
      const mockSessions: TillSession[] = [
        {
          id: 'SESSION-001',
          startTime: '2024-01-25T08:00:00Z',
          endTime: '2024-01-25T17:00:00Z',
          startingAmount: 500.00,
          endingAmount: 1825.00,
          totalSales: 2847.50,
          totalRefunds: 125.00,
          cashSales: 1450.00,
          cardSales: 1397.50,
          otherPayments: 0,
          expectedCash: 1825.00,
          actualCash: 1825.00,
          difference: 0,
          status: 'closed',
          notes: 'Perfect cash count'
        },
        {
          id: 'SESSION-002',
          startTime: '2024-01-24T08:00:00Z',
          endTime: '2024-01-24T17:00:00Z',
          startingAmount: 500.00,
          endingAmount: 1650.00,
          totalSales: 2150.00,
          totalRefunds: 0,
          cashSales: 1150.00,
          cardSales: 1000.00,
          otherPayments: 0,
          expectedCash: 1650.00,
          actualCash: 1650.00,
          difference: 0,
          status: 'closed',
          notes: 'All transactions balanced'
        },
        {
          id: 'SESSION-003',
          startTime: '2024-01-23T08:00:00Z',
          endTime: '2024-01-23T17:00:00Z',
          startingAmount: 500.00,
          endingAmount: 1580.00,
          totalSales: 2080.00,
          totalRefunds: 0,
          cashSales: 1080.00,
          cardSales: 1000.00,
          otherPayments: 0,
          expectedCash: 1580.00,
          actualCash: 1580.00,
          difference: 0,
          status: 'closed',
          notes: 'Daily reconciliation complete'
        }
      ]

      setSessions(mockSessions)
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSessionDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'Active'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${diffHours}h ${diffMinutes}m`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Till Session History
            </h2>
            <button
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{session.id}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status === 'active' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Active
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Closed
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatDate(session.startTime)}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'Active'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-medium">{getSessionDuration(session.startTime, session.endTime)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Total Sales</p>
                    <p className="font-medium">{formatCurrency(session.totalSales)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Cash Sales</p>
                    <p className="font-medium">{formatCurrency(session.cashSales)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Card Sales</p>
                    <p className="font-medium">{formatCurrency(session.cardSales)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Starting Cash</p>
                    <p className="font-medium">{formatCurrency(session.startingAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Ending Cash</p>
                    <p className="font-medium">{formatCurrency(session.endingAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Difference</p>
                    <p className={`font-medium ${session.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {session.difference >= 0 ? '+' : ''}{formatCurrency(session.difference)}
                    </p>
                  </div>
                </div>

                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {session.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
} 