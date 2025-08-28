'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  UserPlus, 
  Search, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Building,
  Wallet,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useBranch } from '@/context/BranchContext'

interface AccountCustomer {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_balance: number
  credit_limit: number
  status: string
}

interface AccountCustomerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerSelect: (customer: AccountCustomer) => void
  totalAmount: number
}

interface NewCustomerData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_street: string
  address_city: string
  address_state: string
  address_zip_code: string
  address_country: string
}

export const AccountCustomerSelectionModal: React.FC<AccountCustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelect,
  totalAmount
}) => {
  console.log('🎯 AccountCustomerSelectionModal: isOpen =', isOpen)
  
  const { selectedBranch } = useBranch()
  const [customers, setCustomers] = useState<AccountCustomer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<AccountCustomer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState<NewCustomerData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip_code: '',
    address_country: 'South Africa'
  })
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadCustomers()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer =>
        customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.customer_number.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCustomers(filtered)
    }
  }, [searchQuery, customers])

  const loadCustomers = async () => {
    setLoading(true)
    setError('')

    try {
      // Get all active customers with their credit information
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          id,
          customer_number,
          first_name,
          last_name,
          email,
          phone,
          current_balance,
          credit_limit,
          status
        `)
        .eq('status', 'active')
        .order('first_name')

      if (customersError) throw customersError

      setCustomers(customersData || [])
      setFilteredCustomers(customersData || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      setError('Failed to load customers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.phone) {
      setError('Please fill in all required fields (Name and Phone)')
      return
    }

    setCreatingCustomer(true)
    setError('')

    try {
      // Generate customer number
      const customerNumber = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Create customer with initial credit settings
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          customer_number: customerNumber,
          first_name: newCustomer.first_name,
          last_name: newCustomer.last_name,
          email: newCustomer.email || null,
          phone: newCustomer.phone,
          address_street: newCustomer.address_street || null,
          address_city: newCustomer.address_city || null,
          address_state: newCustomer.address_state || null,
          address_zip_code: newCustomer.address_zip_code || null,
          address_country: newCustomer.address_country,
          status: 'active',
          customer_type: 'regular',
          current_balance: 0,
          credit_limit: 1000
        })
        .select()
        .single()

      if (customerError) throw customerError

      // Reload customers to include the new one
      await loadCustomers()
      
      // Select the new customer
      onCustomerSelect(customer)
      onClose()
    } catch (error) {
      console.error('Error creating customer:', error)
      setError('Failed to create customer. Please try again.')
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleCustomerSelect = (customer: AccountCustomer) => {
    onCustomerSelect(customer)
    onClose()
  }

  const resetForm = () => {
    setNewCustomer({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_street: '',
      address_city: '',
      address_state: '',
      address_zip_code: '',
      address_country: 'South Africa'
    })
    setError('')
    setShowAddCustomer(false)
  }

  const getCreditStatus = (customer: AccountCustomer) => {
    if (customer.status !== 'active') {
      return { status: 'inactive', text: 'Account inactive', color: 'bg-red-100 text-red-800' }
    }

    // Show current balance instead of available credit
    const currentBalance = customer.current_balance || 0
    
    // Always allow selection, but show different statuses
    if (currentBalance <= 0) {
      return { status: 'sufficient', text: 'No balance', color: 'bg-green-100 text-green-800' }
    } else if (currentBalance > 0) {
      return { status: 'partial', text: 'Has balance', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'insufficient', text: 'Balance required', color: 'bg-red-100 text-red-800' }
    }
  }

  const getAvailableCredit = (customer: AccountCustomer) => {
    if (customer.status !== 'active') return 0
    return Math.abs(customer.current_balance || 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-[#E5FF29]" />
              {showAddCustomer ? 'Add New Customer' : 'Select Customer for Account Payment'}
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {showAddCustomer 
              ? 'Create a new customer account with credit facility'
              : `Total amount: ${formatCurrency(totalAmount)}`
            }
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showAddCustomer ? (
            // Add Customer Form
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                    className="h-10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <Input
                  value={newCustomer.address_street}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address_street: e.target.value }))}
                  placeholder="Enter street address"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={newCustomer.address_city}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, address_city: e.target.value }))}
                    placeholder="Enter city"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <Input
                    value={newCustomer.address_state}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, address_state: e.target.value }))}
                    placeholder="Enter state"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <Input
                    value={newCustomer.address_zip_code}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, address_zip_code: e.target.value }))}
                    placeholder="Enter ZIP code"
                    className="h-10"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomer}
                  disabled={creatingCustomer || !newCustomer.first_name || !newCustomer.last_name || !newCustomer.phone}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  {creatingCustomer ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Customer
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Customer List
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers by name, email, or phone..."
                  className="pl-10 h-10"
                />
              </div>

              {/* Add Customer Button */}
              <Button
                onClick={() => setShowAddCustomer(true)}
                variant="outline"
                className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 h-12"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading customers...</span>
                </div>
              )}

              {/* Customer List */}
              {!loading && filteredCustomers.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No customers found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchQuery ? 'Try adjusting your search terms' : 'Add a new customer to get started'}
                  </p>
                </div>
              )}

              {!loading && filteredCustomers.length > 0 && (
                <div className="space-y-3">
                  {filteredCustomers.map((customer) => {
                    const creditStatus = getCreditStatus(customer)
                    const currentBalance = customer.current_balance || 0

                    return (
                      <Card
                        key={customer.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-black"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gray-100 p-2 rounded-full">
                                  <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {customer.first_name} {customer.last_name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {customer.email || customer.phone}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    #{customer.customer_number}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${creditStatus.color}`}>
                                <Wallet className="h-3 w-3 mr-1" />
                                {creditStatus.text}
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600">Current Balance:</span>
                                <span className={`font-medium ml-1 ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrency(Math.abs(currentBalance))}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                Credit Limit: {formatCurrency(customer.credit_limit || 0)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
