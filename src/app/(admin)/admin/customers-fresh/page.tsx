'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFreshCustomers } from '@/features/customers/hooks/fresh-useCustomers'
import { FreshCustomerTable } from '@/features/customers/components/fresh-CustomerTable'
import type { Customer, CustomerFilter } from '@/features/customers/types/fresh-types'

export default function FreshCustomersPage() {
  const {
    customers,
    loading,
    error,
    stats,
    filter,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    deleteCustomers,
    updateFilter,
    clearError
  } = useFreshCustomers()

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Handle customer selection
  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.id))
    }
  }

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
  }

  // Handle customer actions
  const handleEditCustomer = (customer: Customer) => {
    console.log('Edit customer:', customer)
    // TODO: Open edit modal
  }

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const result = await deleteCustomer(id)
      if (result.success) {
        setSelectedCustomers(prev => prev.filter(c => c !== id))
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
      const result = await deleteCustomers(selectedCustomers)
      if (result.success) {
        setSelectedCustomers([])
      }
    }
  }

  const handleViewStatement = (id: string) => {
    console.log('View statement for customer:', id)
    // TODO: Navigate to statement page
  }

  const handleManageCredit = (id: string) => {
    console.log('Manage credit for customer:', id)
    // TODO: Open credit management modal
  }

  const handleManageLoyalty = (id: string) => {
    console.log('Manage loyalty for customer:', id)
    // TODO: Open loyalty management modal
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    updateFilter({ search: value })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-gray-600">
                {stats.activeCustomers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.creditAccounts}</div>
              <p className="text-xs text-gray-600">
                {formatCurrency(stats.totalCreditOutstanding)} outstanding
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.loyaltyAccounts}</div>
              <p className="text-xs text-gray-600">
                {stats.customersWithOverdue} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newCustomersThisMonth}</div>
              <p className="text-xs text-gray-600">
                +{stats.newCustomersThisMonth} from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {selectedCustomers.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedCustomers.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="text-red-600 font-medium">Error:</div>
              <div className="text-red-600">{error}</div>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Table */}
      <FreshCustomerTable
        customers={customers}
        selectedCustomers={selectedCustomers}
        onSelectAll={handleSelectAll}
        onSelectCustomer={handleSelectCustomer}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onViewStatement={handleViewStatement}
        onManageCredit={handleManageCredit}
        onManageLoyalty={handleManageLoyalty}
        filter={filter}
        loading={loading}
      />
    </div>
  )
} 