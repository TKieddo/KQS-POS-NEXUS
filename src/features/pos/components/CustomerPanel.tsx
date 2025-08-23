'use client'

import React, { useState } from 'react'
import { User, Search, Plus, X, Phone, Mail, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import type { Customer } from '../types'

interface CustomerPanelProps {
  customer: Customer | null
  onCustomerSelect: (customer: Customer) => void
  onCustomerClear: () => void
}

// Mock customers data - will be replaced with Supabase integration
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Johannesburg',
    credit_limit: 5000.00,
    current_balance: 1250.50,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Ave, Cape Town',
    credit_limit: 3000.00,
    current_balance: 0.00,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1 (555) 345-6789',
    address: '789 Pine Rd, Durban',
    credit_limit: 7500.00,
    current_balance: 2500.75,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const CustomerPanel: React.FC<CustomerPanelProps> = ({
  customer,
  onCustomerSelect,
  onCustomerClear
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomerList, setShowCustomerList] = useState(false)

  const filteredCustomers = mockCustomers.filter(cust =>
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.phone?.includes(searchQuery) ||
    cust.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    onCustomerSelect(selectedCustomer)
    setShowCustomerList(false)
    setSearchQuery('')
  }

  const handleClearCustomer = () => {
    onCustomerClear()
    setShowCustomerList(false)
    setSearchQuery('')
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--primary))] flex items-center">
            <User className="h-5 w-5 mr-2" />
            Customer
          </h2>
          {customer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCustomer}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Customer Selection */}
      <div className="p-4">
        {customer ? (
          // Selected Customer Info
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#E5FF29] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{customer.name}</h3>
                {customer.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {customer.phone}
                  </p>
                )}
              </div>
            </div>

            {customer.email && (
              <div className="text-sm text-gray-600 flex items-center">
                <Mail className="h-3 w-3 mr-2" />
                {customer.email}
              </div>
            )}

            {customer.credit_limit && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="font-medium">Credit Account</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Limit:</span>
                    <span className="ml-1 font-medium">{formatCurrency(customer.credit_limit)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Balance:</span>
                    <span className={`ml-1 font-medium ${
                      customer.current_balance && customer.current_balance > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(customer.current_balance || 0)}
                    </span>
                  </div>
                </div>
                {customer.current_balance && customer.current_balance > 0 && (
                  <div className="text-xs text-red-600">
                    Outstanding balance
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerList(true)}
              className="w-full border-gray-200 hover:bg-gray-50"
            >
              Change Customer
            </Button>
          </div>
        ) : (
          // No Customer Selected
          <div className="text-center py-4">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">No customer selected</p>
            <div className="space-y-2">
              <Button
                onClick={() => setShowCustomerList(true)}
                className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                <Search className="h-4 w-4 mr-2" />
                Select Customer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-200 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer List Modal */}
      {showCustomerList && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Select Customer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerList(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => (
                <CustomerListItem
                  key={cust.id}
                  customer={cust}
                  onSelect={handleCustomerSelect}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface CustomerListItemProps {
  customer: Customer
  onSelect: (customer: Customer) => void
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({ customer, onSelect }) => {
  return (
    <div
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSelect(customer)}
    >
      <div className="w-10 h-10 bg-[#E5FF29] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-black font-bold text-sm">
          {customer.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{customer.name}</h4>
        {customer.phone && (
          <p className="text-sm text-gray-600 truncate">{customer.phone}</p>
        )}
        {customer.credit_limit && (
          <p className="text-xs text-gray-500">
            Credit: {formatCurrency(customer.credit_limit)}
          </p>
        )}
      </div>
    </div>
  )
} 