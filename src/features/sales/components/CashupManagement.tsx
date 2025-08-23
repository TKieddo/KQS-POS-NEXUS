'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useBranch } from '@/context/BranchContext'
import { getCashUpSessions, type CashUpSession } from '@/lib/cashup-service'
import { Clock, DollarSign, TrendingUp, AlertTriangle, Eye, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface CashupManagementProps {
  className?: string
}

export function CashupManagement({ className }: CashupManagementProps) {
  const { selectedBranch } = useBranch()
  const [sessions, setSessions] = useState<CashUpSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<CashUpSession | null>(null)

  useEffect(() => {
    loadSessions()
  }, [selectedBranch?.id])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const branchId = selectedBranch?.id
      const result = await getCashUpSessions(branchId)
      
      if (result.success && result.data) {
        setSessions(result.data)
      } else {
        console.error('Failed to load cashup sessions:', result.error)
        toast.error('Failed to load cashup sessions')
      }
    } catch (error) {
      console.error('Error loading cashup sessions:', error)
      toast.error('Error loading cashup sessions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (session: CashUpSession) => {
    if (session.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    } else if (session.status === 'active') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>
    }
  }

  const getDifferenceColor = (difference: number) => {
    if (difference === 0) return 'text-green-600'
    return difference > 0 ? 'text-blue-600' : 'text-red-600'
  }

  const getDifferenceIcon = (difference: number) => {
    if (difference === 0) return '✓'
    return difference > 0 ? '↗' : '↘'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">Cash Up Sessions</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage register closing sessions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSessions}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
          <span className="ml-2 text-gray-600">Loading sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sessions Found</h3>
            <p className="text-gray-500">No cash up sessions have been created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Session #{session.session_number}
                  </CardTitle>
                  {getStatusBadge(session)}
                </div>
                <CardDescription className="text-xs">
                  {new Date(session.created_at).toLocaleDateString()} • {session.cashier_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Opening</p>
                    <p className="font-semibold text-[hsl(var(--primary))]">
                      {formatCurrency(session.opening_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Closing</p>
                    <p className="font-semibold text-[hsl(var(--primary))]">
                      {session.closing_amount ? formatCurrency(session.closing_amount) : '-'}
                    </p>
                  </div>
                </div>
                
                {session.difference !== undefined && session.difference !== null && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Difference</span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${getDifferenceColor(session.difference)}`}>
                      <span>{getDifferenceIcon(session.difference)}</span>
                      {formatCurrency(Math.abs(session.difference))}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-7"
                  onClick={() => setSelectedSession(session)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Session Details Modal - Compact */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl bg-white border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Session Details - {selectedSession.session_number}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                  className="border-gray-200 hover:bg-gray-50 h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Session Info & Cash Summary */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-2 text-sm">Session Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(selectedSession.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cashier:</span>
                        <span className="font-medium">{selectedSession.cashier_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedSession)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-2 text-sm">Cash Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opening Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedSession.opening_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Closing Amount:</span>
                        <span className="font-medium">
                          {selectedSession.closing_amount ? formatCurrency(selectedSession.closing_amount) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Cash:</span>
                        <span className="font-medium">{formatCurrency(selectedSession.expected_amount || 0)}</span>
                      </div>
                      {selectedSession.difference !== undefined && selectedSession.difference !== null && (
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Difference:</span>
                          <span className={`font-semibold ${getDifferenceColor(selectedSession.difference)}`}>
                            {formatCurrency(selectedSession.difference)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sales Summary */}
                <div className="space-y-4">
                  <div className="bg-black rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2 text-sm">💰 Sales Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Sales:</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(selectedSession.sales?.total || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">💵 Cash Sales:</span>
                        <span className="font-medium text-[#E5FF29]">
                          {formatCurrency(selectedSession.sales?.cash || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">💳 Card Sales:</span>
                        <span className="font-medium text-[#E5FF29]">
                          {formatCurrency(selectedSession.sales?.card || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">🏦 Transfer Sales:</span>
                        <span className="font-medium text-[#E5FF29]">
                          {formatCurrency(selectedSession.sales?.transfer || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">📱 M-Pesa Sales:</span>
                        <span className="font-medium text-[#E5FF29]">
                          {formatCurrency(selectedSession.sales?.mpesa || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">💰 EcoCash Sales:</span>
                        <span className="font-medium text-[#E5FF29]">
                          {formatCurrency(selectedSession.sales?.ecocash || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                <Button className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)} className="border-gray-200 hover:bg-gray-50">
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
