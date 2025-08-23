'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  CheckCircle, 
  Clock, 
  User,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { getVariances, getVarianceStats, updateVariance, getVarianceCategories } from '@/lib/variance-service'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export function VarianceDashboard() {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()
  const [variances, setVariances] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedVariance, setSelectedVariance] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  const categories = getVarianceCategories()

  // Load variance data
  useEffect(() => {
    const loadVarianceData = async () => {
      if (!selectedBranch?.id) return

      setIsLoading(true)
      try {
        // Load variances
        const variancesResult = await getVariances(selectedBranch.id, {
          ...filters,
          limit: 50
        })
        
        if (variancesResult.success) {
          setVariances(variancesResult.data || [])
        }

        // Load statistics
        const statsResult = await getVarianceStats(
          selectedBranch.id,
          filters.startDate || undefined,
          filters.endDate || undefined
        )
        
        if (statsResult.success) {
          setStats(statsResult.data)
        }
      } catch (error) {
        console.error('Error loading variance data:', error)
        toast.error('Failed to load variance data')
      } finally {
        setIsLoading(false)
      }
    }

    loadVarianceData()
  }, [selectedBranch?.id, filters])

  const handleStatusUpdate = async (varianceId: string, newStatus: string) => {
    try {
      const result = await updateVariance(varianceId, {
        resolution_status: newStatus,
        investigated_by: user?.user_metadata?.full_name || user?.email || 'Manager',
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : undefined
      })

      if (result.success) {
        toast.success('Variance status updated')
        // Refresh data
        const variancesResult = await getVariances(selectedBranch!.id, { ...filters, limit: 50 })
        if (variancesResult.success) {
          setVariances(variancesResult.data || [])
        }
      } else {
        toast.error(result.error || 'Failed to update variance')
      }
    } catch (error) {
      console.error('Error updating variance:', error)
      toast.error('Failed to update variance')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'manager_approved': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'unresolved': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVarianceTypeIcon = (type: string) => {
    return type === 'overage' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading variance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Variances</p>
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                  {stats.totalVariances}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shortage</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalShortage)}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Overage</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalOverage)}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Variance</p>
                <p className={`text-2xl font-bold ${
                  stats.netVariance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.netVariance >= 0 ? '+' : ''}{formatCurrency(stats.netVariance)}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
            Cash Variance Management
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="unresolved">Unresolved</option>
            <option value="manager_approved">Manager Approved</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="shortage">Shortage</option>
            <option value="overage">Overage</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="text-sm"
            placeholder="Start Date"
          />

          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="text-sm"
            placeholder="End Date"
          />
        </div>
      </Card>

      {/* Variances Table */}
      <Card className="border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black rounded-t-lg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                  Date & Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Type & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variances.map((variance) => (
                <tr key={variance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--primary))]">
                        {new Date(variance.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Session: {variance.cashup_session_id.slice(-8)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getVarianceTypeIcon(variance.variance_type)}
                      <div>
                        <div className={`text-sm font-medium ${
                          variance.variance_type === 'overage' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(variance.amount)}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {variance.variance_type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[hsl(var(--primary))]">
                      {categories.find(c => c.value === variance.category)?.label || variance.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-[hsl(var(--primary))]">
                        {variance.reported_by}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(variance.resolution_status)}`}>
                      {variance.resolution_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVariance(variance)
                          setShowDetailModal(true)
                        }}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {variance.resolution_status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(variance.id, 'investigating')}
                          className="border-blue-200 hover:bg-blue-50 text-blue-600"
                        >
                          Investigate
                        </Button>
                      )}
                      
                      {variance.resolution_status === 'investigating' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(variance.id, 'resolved')}
                          className="border-green-200 hover:bg-green-50 text-green-600"
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Variance Detail Modal */}
      {showDetailModal && selectedVariance && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white border-gray-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Variance Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className={`text-lg font-bold ${
                      selectedVariance.variance_type === 'overage' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(selectedVariance.amount)} ({selectedVariance.variance_type})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-[hsl(var(--primary))]">
                      {categories.find(c => c.value === selectedVariance.category)?.label}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reported By</label>
                    <p className="text-[hsl(var(--primary))]">{selectedVariance.reported_by}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <p className="text-[hsl(var(--primary))]">
                      {new Date(selectedVariance.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedVariance.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-[hsl(var(--primary))] bg-gray-50 p-3 rounded-lg">
                      {selectedVariance.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
                    onClick={() => handleStatusUpdate(selectedVariance.id, 'manager_approved')}
                    disabled={selectedVariance.resolution_status === 'manager_approved'}
                  >
                    {selectedVariance.resolution_status === 'manager_approved' ? 'Approved' : 'Approve Variance'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
