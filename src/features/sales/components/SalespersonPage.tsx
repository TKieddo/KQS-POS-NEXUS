'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Users, Search, Plus, Edit, Trash2, User, Mail, Phone, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatsBar } from '@/components/ui/stats-bar'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface Salesperson {
  id: string
  name: string
  email: string
  phone: string
  employeeId: string
  position: 'cashier' | 'sales_associate' | 'manager' | 'supervisor'
  hireDate: string
  status: 'active' | 'inactive' | 'terminated'
  commission: number
  totalSales: number
  totalRevenue: number
  salesThisMonth: number
  revenueThisMonth: number
  avatar?: string
  notes: string
  createdAt: string
}

interface SalespersonPageProps {
  salespeople: Salesperson[]
  isLoading: boolean
  onAddSalesperson: (salesperson: Omit<Salesperson, 'id' | 'createdAt'>) => void
  onUpdateSalesperson: (id: string, salesperson: Partial<Salesperson>) => void
  onDeleteSalesperson: (id: string) => void
}

export const SalespersonPage: React.FC<SalespersonPageProps> = ({
  salespeople,
  isLoading,
  onAddSalesperson,
  onUpdateSalesperson,
  onDeleteSalesperson
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Salesperson['status']>('all')
  const [positionFilter, setPositionFilter] = useState<'all' | Salesperson['position']>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSalesperson, setSelectedSalesperson] = useState<Salesperson | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    position: 'cashier' as Salesperson['position'],
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active' as Salesperson['status'],
    commission: 0,
    notes: ''
  })

  const getPositionColor = (position: Salesperson['position']) => {
    switch (position) {
      case 'cashier': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sales_associate': return 'bg-green-100 text-green-800 border-green-200'
      case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'supervisor': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: Salesperson['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'terminated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActiveSalespeople = () => {
    return salespeople.filter(sp => sp.status === 'active')
  }

  const getTotalSales = () => {
    return salespeople.reduce((sum, sp) => sum + sp.totalSales, 0)
  }

  const getTotalRevenue = () => {
    return salespeople.reduce((sum, sp) => sum + sp.totalRevenue, 0)
  }

  const getTopPerformer = () => {
    return salespeople.reduce((top, sp) => 
      sp.revenueThisMonth > top.revenueThisMonth ? sp : top
    , salespeople[0] || null)
  }

  const filteredSalespeople = useMemo(() => {
    return salespeople.filter(salesperson => {
      const matchesSearch = salesperson.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salesperson.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salesperson.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || salesperson.status === statusFilter
      const matchesPosition = positionFilter === 'all' || salesperson.position === positionFilter
      
      return matchesSearch && matchesStatus && matchesPosition
    })
  }, [salespeople, searchQuery, statusFilter, positionFilter])

  const stats = useMemo(() => [
    {
      label: 'Total Staff',
      count: salespeople.length,
      color: 'bg-blue-500'
    },
    {
      label: 'Active',
      count: getActiveSalespeople().length,
      color: 'bg-green-500'
    },
    {
      label: 'Total Sales',
      count: getTotalSales(),
      color: 'bg-purple-500'
    },
    {
      label: 'Revenue',
      count: getTotalRevenue(),
      color: 'bg-yellow-500'
    }
  ], [salespeople])

  const handleAddSalesperson = () => {
    const newSalesperson: Omit<Salesperson, 'id' | 'createdAt'> = {
      ...formData,
      totalSales: 0,
      totalRevenue: 0,
      salesThisMonth: 0,
      revenueThisMonth: 0,
      avatar: undefined
    }
    onAddSalesperson(newSalesperson)
    setShowAddModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      position: 'cashier',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      commission: 0,
      notes: ''
    })
  }

  const handleEditSalesperson = () => {
    if (!selectedSalesperson) return
    onUpdateSalesperson(selectedSalesperson.id, formData)
    setShowEditModal(false)
    setSelectedSalesperson(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      position: 'cashier',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      commission: 0,
      notes: ''
    })
  }

  const handleEdit = (salesperson: Salesperson) => {
    setSelectedSalesperson(salesperson)
    setFormData({
      name: salesperson.name,
      email: salesperson.email,
      phone: salesperson.phone,
      employeeId: salesperson.employeeId,
      position: salesperson.position,
      hireDate: salesperson.hireDate,
      status: salesperson.status,
      commission: salesperson.commission,
      notes: salesperson.notes
    })
    setShowEditModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this salesperson?')) {
      onDeleteSalesperson(id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PageHeader 
        title="Salesperson Management" 
        icon={<Users className="h-4 w-4 text-black" />}
      />
      
      <StatsBar stats={stats} />
      
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search salespeople by name, email, or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
              
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
              >
                <option value="all">All Positions</option>
                <option value="cashier">Cashier</option>
                <option value="sales_associate">Sales Associate</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
              </select>
              
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <LoadingSpinner text="Loading salespeople..." />
        ) : filteredSalespeople.length === 0 ? (
          <EmptyState 
            icon={<Users className="h-8 w-8" />}
            title="No salespeople found"
            description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No salespeople have been added yet.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSalespeople.map((salesperson) => (
              <div key={salesperson.id} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{salesperson.name}</h3>
                        <p className="text-sm text-gray-600">{salesperson.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPositionColor(salesperson.position)}`}>
                        {salesperson.position.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(salesperson.status)}`}>
                        {salesperson.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{salesperson.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{salesperson.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Hired: {new Date(salesperson.hireDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Sales:</span>
                      <span className="font-medium">{salesperson.totalSales}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(salesperson.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-medium">{formatCurrency(salesperson.revenueThisMonth)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-medium">{salesperson.commission}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(salesperson)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(salesperson.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Salesperson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Add New Salesperson</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                <Input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="Enter employee ID"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
                >
                  <option value="cashier">Cashier</option>
                  <option value="sales_associate">Sales Associate</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                <Input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission: Number(e.target.value) }))}
                  placeholder="0"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddSalesperson}
                  className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
                >
                  Add Salesperson
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salesperson Modal */}
      {showEditModal && selectedSalesperson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Edit Salesperson</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 bg-white"
                >
                  <option value="cashier">Cashier</option>
                  <option value="sales_associate">Sales Associate</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                <Input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission: Number(e.target.value) }))}
                  placeholder="0"
                  className="border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleEditSalesperson}
                  className="flex-1 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80"
                >
                  Update Salesperson
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 