'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, User, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useBranch } from '@/context/BranchContext'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_balance: number
  credit_limit: number
  status: string
}

interface CustomerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerSelect: (customer: Customer) => void
  totalAmount: number
}

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelect,
  totalAmount
}) => {
  const { selectedBranch } = useBranch()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && selectedBranch) {
      loadCustomers()
    }
  }, [isOpen, selectedBranch])

  const loadCustomers = async () => {
    if (!selectedBranch) return

    try {
      setIsLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          current_balance,
          credit_limit,
          status
        `)
        .eq('branch_id', selectedBranch.id)
        .eq('status', 'active')
        .order('first_name', { ascending: true })

      if (fetchError) throw fetchError

      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      setError('Failed to load customers')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  const handleCustomerSelect = (customer: Customer) => {
    // Check if customer has sufficient balance
    if (customer.current_balance < totalAmount) {
      setError(`Insufficient balance. Customer has ${formatCurrency(customer.current_balance)} available.`)
      return
    }

    onCustomerSelect(customer)
    onClose()
  }

  const getBalanceStatus = (customer: Customer) => {
    if (customer.current_balance === 0) {
      return { status: 'good', text: 'No balance', color: 'bg-green-100 text-green-800' }
    } else if (customer.current_balance > 0) {
      return { status: 'outstanding', text: 'Outstanding balance', color: 'bg-red-100 text-red-800' }
    } else {
      return { status: 'credit', text: 'Credit available', color: 'bg-blue-100 text-blue-800' }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Customer for Account Payment</h2>
            <p className="text-sm text-gray-600">Total: {formatCurrency(totalAmount)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-full">
          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <Button onClick={loadCustomers} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'No customers available for account payment'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((customer) => {
                  const balanceStatus = getBalanceStatus(customer)
                  const hasSufficientBalance = customer.current_balance >= totalAmount
                  
                  return (
                    <Card
                      key={customer.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                        hasSufficientBalance 
                          ? 'border-gray-200 hover:border-[#E5FF29]' 
                          : 'border-red-200 opacity-60'
                      }`}
                      onClick={() => hasSufficientBalance && handleCustomerSelect(customer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {customer.first_name} {customer.last_name}
                              </h3>
                              <Badge variant="secondary" className={balanceStatus.color}>
                                {balanceStatus.text}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>{customer.email}</p>
                              <p>{customer.phone}</p>
                            </div>

                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Current Balance:</span>
                                <span className={`font-medium ${
                                  customer.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {formatCurrency(customer.current_balance)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Credit Limit:</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(customer.credit_limit)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {hasSufficientBalance ? (
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Available</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Insufficient</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {!hasSufficientBalance && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600">
                              Insufficient balance for this purchase. 
                              Available: {formatCurrency(customer.current_balance)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
              </div>
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 