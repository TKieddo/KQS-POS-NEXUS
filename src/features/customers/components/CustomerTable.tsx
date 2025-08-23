import React, { useState } from 'react'
import { 
  Edit, 
  Trash2, 
  CreditCard, 
  Crown, 
  Eye, 
  Download, 
  Phone, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { Customer, CustomerFilter } from '../types'

interface CustomerRowProps {
  customer: Customer
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
  onViewStatement: (id: string) => void
  onManageCredit: (id: string) => void
  onManageLoyalty: (id: string) => void
}

const CustomerRow = ({
  customer,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewStatement,
  onManageCredit,
  onManageLoyalty
}: CustomerRowProps) => {
  const [showActions, setShowActions] = useState(false)

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showActions && !target.closest('.actions-menu')) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showActions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getCreditStatusColor = () => {
    if (!customer.creditAccount) return 'text-gray-600'
    if (customer.creditAccount.overdueAmount > 0) return 'text-red-600'
    if (customer.creditAccount.currentBalance >= customer.creditAccount.creditLimit * 0.9) return 'text-orange-600'
    return 'text-green-600'
  }

  const getCreditStatusIcon = () => {
    if (!customer.creditAccount) return <Clock className="h-4 w-4 text-gray-600" />
    if (customer.creditAccount.overdueAmount > 0) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (customer.creditAccount.currentBalance >= customer.creditAccount.creditLimit * 0.9) return <Clock className="h-4 w-4 text-orange-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'text-purple-600 bg-purple-100'
      case 'gold': return 'text-yellow-600 bg-yellow-100'
      case 'silver': return 'text-gray-600 bg-gray-100'
      case 'bronze': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(customer.id)}
        />
        
        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {customer.firstName} {customer.lastName}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  customer.status === 'active' ? 'bg-green-100 text-green-800' :
                  customer.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status}
                </span>
                {customer.customerType === 'vip' && (
                  <Crown className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{customer.email}</span>
                </span>
                <span>#{customer.customerNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Account */}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="flex items-center space-x-1">
              {getCreditStatusIcon()}
              <span className={`text-sm font-medium ${getCreditStatusColor()}`}>
                {customer.creditAccount ? formatCurrency(customer.creditAccount.currentBalance) : 'No credit account'}
              </span>
            </div>
            {customer.creditAccount && (
              <p className="text-xs text-gray-500">
                Limit: {formatCurrency(customer.creditAccount.creditLimit)}
              </p>
            )}
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">
              {customer.loyaltyAccount ? customer.loyaltyAccount.currentPoints.toLocaleString() : 'No loyalty account'}
            </span>
          </div>
          {customer.loyaltyAccount && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLoyaltyTierColor(customer.loyaltyAccount.tier)}`}>
              {customer.loyaltyAccount.tier}
            </span>
          )}
        </div>

        {/* Total Spent */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(customer.totalSpent)}
          </p>
          <p className="text-xs text-gray-500">
            {customer.totalPurchases} purchases
          </p>
        </div>

        {/* Actions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 actions-menu">
              <button
                onClick={() => {
                  setShowActions(false)
                  onEdit(customer)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Customer</span>
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  onViewStatement(customer.id)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Statement</span>
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  onManageCredit(customer.id)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Manage Credit</span>
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  onManageLoyalty(customer.id)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Crown className="h-4 w-4" />
                <span>Manage Loyalty</span>
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  onDelete(customer.id)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Customer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CustomerTableProps {
  customers: Customer[]
  selectedCustomers: string[]
  onSelectAll: () => void
  onSelectCustomer: (id: string) => void
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (id: string) => void
  onViewStatement: (id: string) => void
  onManageCredit: (id: string) => void
  onManageLoyalty: (id: string) => void
  filter: CustomerFilter
  onFilterChange?: (filter: Partial<CustomerFilter>) => void
  loading?: boolean
}

export const CustomerTable = ({
  customers,
  selectedCustomers,
  onSelectAll,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewStatement,
  onManageCredit,
  onManageLoyalty,
  filter,
  onFilterChange,
  loading = false
}: CustomerTableProps) => {
  const isAllSelected = customers.length > 0 && selectedCustomers.length === customers.length
  const isIndeterminate = selectedCustomers.length > 0 && selectedCustomers.length < customers.length

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isAllSelected}
              onChange={onSelectAll}
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedCustomers.length} of {customers.length} selected
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Showing {customers.length} customers
          </div>
        </div>
      </div>

      {/* Customer Rows */}
      <div className="space-y-3">
        {customers.map((customer) => (
          <CustomerRow
            key={customer.id}
            customer={customer}
            isSelected={selectedCustomers.includes(customer.id)}
            onSelect={onSelectCustomer}
            onEdit={onEditCustomer}
            onDelete={onDeleteCustomer}
            onViewStatement={onViewStatement}
            onManageCredit={onManageCredit}
            onManageLoyalty={onManageLoyalty}
          />
        ))}
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {filter.search ? 'Try adjusting your search criteria.' : 'Get started by adding your first customer.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
} 