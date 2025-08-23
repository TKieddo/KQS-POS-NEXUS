'use client'

import { useState } from 'react'
import { Plus, Users, CreditCard, Gift, FileText, BarChart3, Search, Filter, Download, Upload, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Customer, CustomerStats, CustomerFilter } from '@/features/customers/types'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { EditCustomerModal } from '@/features/customers/components/EditCustomerModal'
import { AddCustomerModal } from '@/features/customers/modals/AddCustomerModal'
import { useBranch } from '@/context/BranchContext'

export default function CustomerListPage() {
  const { selectedBranch } = useBranch()
  
  const {
    customers,
    stats,
    loading,
    error,
    filter,
    updateFilter,
    deleteCustomer,
    createCustomer,
    refetch
  } = useCustomers()
  
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.id))
    }
  }

  const handleSelectCustomer = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(customerId => customerId !== id))
    } else {
      setSelectedCustomers([...selectedCustomers, id])
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowEditModal(true)
  }

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    // Refresh the customers list
    refetch()
    toast.success(`Customer ${updatedCustomer.firstName} ${updatedCustomer.lastName} updated successfully!`)
  }

  const handleCustomerCreated = (customerData: any) => {
    console.log('Customer data from modal:', customerData)
    
    // Add branch ID to customer data
    // If no branch is selected (central warehouse), set branch_id to null
    const customerWithBranch = {
      ...customerData,
      branchId: selectedBranch?.id || null
    }
    
    console.log('Customer data with branch:', customerWithBranch)
    
    // Create customer using the service
    createCustomer(customerWithBranch).then((result) => {
      console.log('Create customer result:', result)
      if (result.success) {
        refetch()
        setShowAddModal(false)
        toast.success(`Customer ${customerData.firstName} ${customerData.lastName} created successfully!`)
      } else {
        toast.error(result.error || 'Failed to create customer')
      }
    })
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }
    
    const result = await deleteCustomer(id)
    if (result.success) {
      toast.success('Customer deleted successfully')
      setSelectedCustomers(prev => prev.filter(customerId => customerId !== id))
    } else {
      toast.error(result.error || 'Failed to delete customer')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800'
      case 'gold': return 'bg-yellow-100 text-yellow-800'
      case 'silver': return 'bg-gray-100 text-gray-800'
      case 'bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !filter.search || 
                         customer.firstName.toLowerCase().includes(filter.search.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(filter.search.toLowerCase()) ||
                         customer.email.toLowerCase().includes(filter.search.toLowerCase()) ||
                         customer.customerNumber.toLowerCase().includes(filter.search.toLowerCase())
    
    const matchesStatus = filter.status === 'all' || customer.status === filter.status
    const matchesType = filter.customerType === 'all' || customer.customerType === filter.customerType
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
          <p className="text-gray-600">
            {selectedBranch ? `Customers for ${selectedBranch.name}` : 'All customers across all branches'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeCustomers || 0} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Accounts</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.loyaltyAccounts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active loyalty members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.creditAccounts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.customersWithOverdue || 0} overdue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newCustomersThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.totalCustomers ? ((stats.newCustomersThisMonth || 0) / stats.totalCustomers * 100).toFixed(1) : 0}% growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={filter.search}
                  onChange={(e) => updateFilter({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter.status}
                onChange={(e) => updateFilter({ status: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={filter.customerType}
                onChange={(e) => updateFilter({ customerType: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="regular">Regular</option>
                <option value="vip">VIP</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Customers ({filteredCustomers.length})
              {loading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={loading}
              >
                {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === customers.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Customer</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Contact</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Status</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Loyalty</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Credit</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Total Spent</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <div className="font-semibold text-sm">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {customer.customerNumber}
                          </div>
                          {customer.branchName && (
                            <div className="text-sm text-blue-600 font-medium">
                              {customer.branchName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <div className="text-sm font-medium">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      </td>
                                             <td className="py-2 px-3">
                         <Badge className={`${getStatusColor(customer.status)} text-sm px-2 py-1`}>
                           {customer.status}
                         </Badge>
                       </td>
                      <td className="py-2 px-3">
                        {customer.loyaltyAccount ? (
                          <div>
                            <div className="text-sm font-mono font-medium">{customer.loyaltyAccount.cardNumber}</div>
                            <Badge className={`${getTierColor(customer.loyaltyAccount.tier)} text-sm px-2 py-1`}>
                              {customer.loyaltyAccount.tier}
                            </Badge>
                            <div className="text-sm text-gray-500">
                              {customer.loyaltyAccount.currentPoints} pts
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No account</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {customer.creditAccount ? (
                          <div>
                            <div className="text-sm font-mono font-medium">${customer.creditAccount.creditLimit?.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">
                              ${customer.creditAccount.currentBalance?.toLocaleString()}
                            </div>
                            <Badge 
                              className={`text-xs px-1.5 py-0.5 font-medium ${
                                customer.creditAccount.isActive 
                                  ? 'bg-black text-[#E5FF29] border border-[#E5FF29]/20' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {customer.creditAccount.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No account</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-sm font-mono font-medium">
                          ${customer.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.totalPurchases} purchases
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingCustomer(null)
        }}
        customer={editingCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCustomerCreated}
      />
    </div>
  )
} 