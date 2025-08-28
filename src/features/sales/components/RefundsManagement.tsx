'use client'

import React, { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Package,
  DollarSign,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

import { RefundAdminService, AdminRefundItem } from '@/lib/refund-admin-service'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'

const refundStatusColors = {
  pending: 'text-orange-600 bg-orange-100',
  approved: 'text-blue-600 bg-blue-100',
  completed: 'text-green-600 bg-green-100',
  rejected: 'text-red-600 bg-red-100'
}

const refundMethodIcons = {
  original: DollarSign,
  store_credit: Package,
  exchange: RefreshCw
}

export function RefundsManagement() {
  const { selectedBranch } = useBranch()
  const [refunds, setRefunds] = useState<AdminRefundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRefund, setSelectedRefund] = useState<any>(null)
  const [showNewRefund, setShowNewRefund] = useState(false)

  useEffect(() => {
    loadRefunds()
  }, [selectedBranch])

  const loadRefunds = async () => {
    try {
      setLoading(true)
      const result = await RefundAdminService.getRefundHistory(selectedBranch?.id, 10)
      if (result.success && result.data) {
        setRefunds(result.data)
      } else {
        console.error('Failed to load refunds:', result.error)
        toast.error('Failed to load refunds')
      }
    } catch (error) {
      console.error('Error loading refunds:', error)
      toast.error('Error loading refunds')
    } finally {
      setLoading(false)
    }
  }
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.refund_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.original_sale_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || refund.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const totalRefunds = filteredRefunds.length
  const pendingRefunds = filteredRefunds.filter(r => r.status === 'pending').length
  const totalRefundAmount = filteredRefunds.reduce((sum, r) => sum + r.refund_amount, 0)
  const averageRefund = totalRefunds > 0 ? totalRefundAmount / totalRefunds : 0

  return (
    <div className="space-y-6 px-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {totalRefunds}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {pendingRefunds}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(totalRefundAmount)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Refund</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(averageRefund)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search refunds, customers, or transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
            <Button 
              className="bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
              onClick={() => setShowNewRefund(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Refund
            </Button>
          </div>
        </div>
      </Card>

      {/* Refunds Table */}
      <Card className="border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black rounded-t-lg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                  Refund
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Original Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRefunds.map((refund) => {
                const RefundMethodIcon = refundMethodIcons[refund.refund_method as keyof typeof refundMethodIcons] || DollarSign
                
                return (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--primary))]">
                          {refund.refund_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(refund.processed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--primary))]">
                          {refund.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {refund.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[hsl(var(--primary))]">
                        {refund.original_sale_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-purple-600">
                        {formatCurrency(refund.refund_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {refund.items_count} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RefundMethodIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium capitalize">
                          {refund.refund_method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${refundStatusColors[refund.status as keyof typeof refundStatusColors]}`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[hsl(var(--primary))]">
                        {new Date(refund.processed_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(refund.processed_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRefund(refund)}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {refund.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Refund Details Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl bg-white border-gray-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Refund Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRefund(null)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Refund Information */}
                <div className="lg:col-span-1">
                  <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Refund Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Refund ID</p>
                      <p className="text-sm text-[hsl(var(--primary))]">{selectedRefund.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Original Transaction</p>
                      <p className="text-sm text-[hsl(var(--primary))]">{selectedRefund.originalTransaction}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer</p>
                      <p className="text-sm text-[hsl(var(--primary))]">{selectedRefund.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${refundStatusColors[selectedRefund.status as keyof typeof refundStatusColors]}`}>
                        {selectedRefund.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Refund</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedRefund.totalRefund)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-2">Reason</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedRefund.reason}
                    </p>
                  </div>

                  {selectedRefund.notes && (
                    <div className="mt-6">
                      <h4 className="font-medium text-[hsl(var(--primary))] mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedRefund.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="lg:col-span-1">
                  <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Refunded Items</h4>
                  <div className="space-y-3">
                    {selectedRefund.items.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-[hsl(var(--primary))]">{item.name}</p>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.originalPrice)}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(item.refundAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity} | Reason: {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-1">
                  <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Timeline</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-600">Requested</p>
                      <p className="text-sm text-[hsl(var(--primary))]">
                        {new Date(selectedRefund.requestDate).toLocaleString()}
                      </p>
                    </div>
                    {selectedRefund.approvalDate && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-gray-600">Approved</p>
                        <p className="text-sm text-[hsl(var(--primary))]">
                          {new Date(selectedRefund.approvalDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRefund.processedDate && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-600">Processed</p>
                        <p className="text-sm text-[hsl(var(--primary))]">
                          {new Date(selectedRefund.processedDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedRefund.status === 'pending' && (
                  <Button className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Refund
                  </Button>
                )}
                <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Process Refund
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* New Refund Modal */}
      {showNewRefund && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white border-gray-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Create New Refund
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewRefund(false)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Transaction
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                    <option>Select transaction...</option>
                    <option>TXN-001 - John Smith</option>
                    <option>TXN-002 - Mike Wilson</option>
                    <option>TXN-003 - Sarah Johnson</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Method
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                    <option>Original payment method</option>
                    <option>Store credit</option>
                    <option>Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Refund
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                    <option>Select reason...</option>
                    <option>Wrong size</option>
                    <option>Defective product</option>
                    <option>Changed mind</option>
                    <option>Not as described</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    rows={3}
                    placeholder="Provide additional details about the refund..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90">
                  Create Refund
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={() => setShowNewRefund(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 