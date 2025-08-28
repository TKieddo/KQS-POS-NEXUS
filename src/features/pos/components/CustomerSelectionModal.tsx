'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Search, User, Phone, Mail, MapPin, CreditCard, X, Check, AlertCircle, Plus, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Customer } from '../types'
import { AddCustomerModal } from "@/features/customers/modals/AddCustomerModal"
import { toast } from "sonner"

interface CustomerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerSelect: (customer: Customer) => void
  selectedCustomer?: Customer | null
}

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelect,
  selectedCustomer
}) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'vip' | 'wholesale'>('all')
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)

  // Fetch customers from secure API route
  const fetchCustomers = async () => {
    setLoading(true)
    try {
      console.log('CustomerSelectionModal: Fetching customers via API...')
      
      // Use secure API route that uses service role key server-side
      const response = await fetch('/api/customers')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch customers')
      }

      const { data } = await response.json()
      console.log('Fetched customers:', data)
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  // Filter customers based on search term and filter
  useEffect(() => {
    let filtered = customers

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(customer =>
        customer.first_name.toLowerCase().includes(searchLower) ||
        customer.last_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.customer_number.toLowerCase().includes(searchLower)
      )
    }

    // Apply status/type filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'active') {
        filtered = filtered.filter(customer => customer.status === 'active')
      } else {
        filtered = filtered.filter(customer => customer.customer_type === selectedFilter)
      }
    }

    console.log('CustomerSelectionModal: Filtered customers:', filtered.length)
    setFilteredCustomers(filtered)
  }, [customers, searchTerm, selectedFilter])

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('CustomerSelectionModal: Modal opened, fetching customers...')
      setError(null) // Clear any previous errors
      fetchCustomers()
    }
  }, [isOpen])

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer)
    onClose()
  }

  const handleAddCustomer = async (customerData: any) => {
    try {
      console.log('CustomerSelectionModal: Received customer data:', customerData)
      
      // Transform the customer data to match the database schema
      const transformedCustomer = {
        customer_number: `CUST${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        address_street: customerData.address?.street || null,
        address_city: customerData.address?.city || null,
        address_state: customerData.address?.state || null,
        address_zip_code: customerData.address?.zipCode || null,
        address_country: customerData.address?.country || 'USA',
        status: customerData.status || 'active',
        customer_type: customerData.customerType || 'regular',
        notes: customerData.notes || null,
        tags: customerData.tags || [],
        account_balance: 0,
        credit_limit: customerData.creditAccount?.creditLimit || 1000,
        total_purchases: 0,
        total_spent: 0
      }

      console.log('CustomerSelectionModal: Transformed customer data:', transformedCustomer)

      // Create the customer using the API route
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedCustomer),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create customer')
      }

      const { data: newCustomer } = await response.json()
      console.log('CustomerSelectionModal: Created customer:', newCustomer)

      // Refresh the customers list and clear search
      await fetchCustomers()
      setSearchTerm("") // Clear the search term
      setShowAddCustomerModal(false)
      
      // Show success message
      toast.success(`Customer ${newCustomer.first_name} ${newCustomer.last_name} created successfully!`)
      
      // Optionally select the newly created customer
      if (newCustomer) {
        onCustomerSelect(newCustomer)
        onClose()
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      setError(error instanceof Error ? error.message : 'Failed to create customer')
    }
  }

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'wholesale': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Select Customer</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a customer for transaction
                </p>
              </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAddCustomerModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
                <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, or customer number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', icon: Filter },
                { key: 'active', label: 'Active', icon: User },
                { key: 'vip', label: 'VIP', icon: CreditCard },
                { key: 'wholesale', label: 'Wholesale', icon: User }
              ].map((filter) => {
                const Icon = filter.icon
                return (
                <Button
                    key={filter.key}
                    variant={selectedFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={`text-xs rounded-xl transition-all duration-200 ${
                      selectedFilter === filter.key 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {filter.label}
                </Button>
                )
              })}
            </div>
          </div>
              </div>

              {/* Error Display */}
        {error && (
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

              {/* Customer List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
                {loading ? (
              <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading customers...</p>
                    </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No customers found</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'No customers available'}
                  </p>
                    </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                     {filteredCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-lg border-2 rounded-xl overflow-hidden",
                      selectedCustomer?.id === customer.id
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    )}
                         onClick={() => handleCustomerSelect(customer)}
                    >
                      <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {getInitials(customer.first_name, customer.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {customer.first_name} {customer.last_name}
                              </h3>
                              {selectedCustomer?.id === customer.id && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{customer.phone}</span>
                            </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <span className="font-mono text-xs">#{customer.customer_number}</span>
                              </div>
                            </div>

                            {customer.address_city && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {customer.address_city}
                                  {customer.address_state && `, ${customer.address_state}`}
                                </span>
                              </div>
                                 )}
                            </div>
                          </div>

                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getCustomerTypeColor(customer.customer_type)}
                            >
                              {customer.customer_type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(customer.status)}
                            >
                              {customer.status}
                            </Badge>
                                   </div>
                          
                                                    <div className="text-right">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <CreditCard className="h-3 w-3" />
                              <span>Balance: {formatCurrency(customer.account_balance || 0)}</span>
                                   </div>
                                   <div className="text-xs text-gray-500">
                                     Limit: {formatCurrency(customer.credit_limit || 0)}
                                   </div>
                              </div>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                              </div>
                            )}
          </ScrollArea>
                        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="text-sm text-gray-600 font-medium">
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            {selectedCustomer && (
              <Button 
                onClick={() => handleCustomerSelect(selectedCustomer)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
              >
                <Check className="h-4 w-4 mr-2" />
                Select {selectedCustomer.first_name} {selectedCustomer.last_name}
            </Button>
          )}
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onSave={handleAddCustomer}
        editingCustomer={null}
      />
    </div>
  )
} 