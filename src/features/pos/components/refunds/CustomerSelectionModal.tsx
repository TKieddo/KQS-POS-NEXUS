'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  UserPlus, 
  Search, 
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useBranch } from '@/context/BranchContext'

interface Customer {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_balance?: number
  credit_limit?: number
}

interface CustomerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerSelect: (customer: Customer) => void
  refundAmount: number
}

interface NewCustomerData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip_code?: string
  address_country?: string
}

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelect,
  refundAmount
}) => {
  const { selectedBranch } = useBranch()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
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
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          customer_number,
          first_name,
          last_name,
          email,
          phone,
          branch_id,
          credit_accounts!inner(
            current_balance,
            credit_limit
          )
        `)
        .eq('status', 'active')
        .order('first_name')

      if (error) throw error

      const customersWithCredit = data?.map(customer => ({
        id: customer.id,
        customer_number: customer.customer_number,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        current_balance: customer.credit_accounts?.[0]?.current_balance || 0,
        credit_limit: customer.credit_accounts?.[0]?.credit_limit || 0,
        branch_id: customer.branch_id
      })) || []

      setCustomers(customersWithCredit)
      setFilteredCustomers(customersWithCredit)
    } catch (error) {
      console.error('Error loading customers:', error)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.first_name || !newCustomer.last_name || !newCustomer.email) {
      setError('Please fill in all required fields')
      return
    }

    setCreatingCustomer(true)
    setError('')

    try {
      // Generate customer number
      const customerNumber = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          customer_number: customerNumber,
          first_name: newCustomer.first_name,
          last_name: newCustomer.last_name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address_street: newCustomer.address_street,
          address_city: newCustomer.address_city,
          address_state: newCustomer.address_state,
          address_zip_code: newCustomer.address_zip_code,
          address_country: newCustomer.address_country,
          status: 'active',
          customer_type: 'regular',
          branch_id: selectedBranch?.id
        })
        .select()
        .single()

      if (customerError) throw customerError

      // Create credit account
      const { error: creditError } = await supabase
        .from('credit_accounts')
        .insert({
          customer_id: customer.id,
          current_balance: 0,
          credit_limit: 1000, // Default credit limit
          is_active: true
        })

      if (creditError) throw creditError

      // Reload customers and select the new one
      await loadCustomers()
      const newCustomerWithCredit = {
        ...customer,
        current_balance: 0,
        credit_limit: 1000
      }
      onCustomerSelect(newCustomerWithCredit)
      onClose()
    } catch (error) {
      console.error('Error creating customer:', error)
      setError('Failed to create customer. Please try again.')
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-6 w-6 mr-3 text-[#E5FF29]" />
              {showAddCustomer ? 'Add New Customer' : 'Select Customer for Account Credit'}
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
              ? 'Create a new customer account for the refund credit'
              : `Refund amount: ${formatCurrency(refundAmount)}`
            }
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showAddCustomer ? (
            /* Customer Selection View */
            <div className="space-y-6">
              {/* Search and Add Button */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search customers by name, email, phone, or customer number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setShowAddCustomer(true)}
                  className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </div>

              {/* Customer List */}
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Loading customers...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'No customers found matching your search' : 'No customers with credit accounts found'}
                  </p>
                  <Button
                    onClick={() => setShowAddCustomer(true)}
                    className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Customer
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#E5FF29]"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              #{customer.customer_number}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              <span className="text-gray-600">Balance:</span>
                              <span className={`ml-1 font-medium ${
                                customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {formatCurrency(customer.current_balance)}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Limit: {formatCurrency(customer.credit_limit)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Add Customer View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.address_street}
                    onChange={(e) => setNewCustomer({...newCustomer, address_street: e.target.value})}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.address_city}
                    onChange={(e) => setNewCustomer({...newCustomer, address_city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.address_state}
                    onChange={(e) => setNewCustomer({...newCustomer, address_state: e.target.value})}
                    placeholder="Enter state/province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.address_zip_code}
                    onChange={(e) => setNewCustomer({...newCustomer, address_zip_code: e.target.value})}
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    type="text"
                    value={newCustomer.address_country}
                    onChange={(e) => setNewCustomer({...newCustomer, address_country: e.target.value})}
                    placeholder="Enter country"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Account Credit Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Amount:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(refundAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Initial Credit Balance:</span>
                    <span className="font-medium text-green-600">{formatCurrency(refundAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="font-medium">{formatCurrency(1000)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          {showAddCustomer ? (
            <>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={creatingCustomer}
                className="flex-1"
              >
                Back to Selection
              </Button>
              <Button
                onClick={handleCreateCustomer}
                disabled={creatingCustomer || !newCustomer.first_name || !newCustomer.last_name || !newCustomer.email}
                className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
              >
                {creatingCustomer ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Customer & Credit Account
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
