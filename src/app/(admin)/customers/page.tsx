'use client'

import { useState } from 'react'
import { Plus, Users, CreditCard, Gift, FileText, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomerTable } from '@/features/customers/components/CustomerTable'
import { CustomerStatsCards } from '@/features/customers/components/CustomerStatsCards'
import { CustomerActionBar } from '@/features/customers/components/CustomerActionBar'
import { AddCustomerModal } from '@/features/customers/modals/AddCustomerModal'
import { CreditManagement } from '@/features/customers/components/CreditManagement'
import { LoyaltyProgram } from '@/features/customers/components/LoyaltyProgram'
import { StatementGenerator } from '@/features/customers/components/StatementGenerator'
import { CustomerAnalytics } from '@/features/customers/components/CustomerAnalytics'
import { CustomerTypeGuide } from '@/features/customers/components/CustomerTypeGuide'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { toast } from 'sonner'
import { Customer } from '@/types/customer'

const tabs = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'credit', label: 'Credit Management', icon: CreditCard },
  { id: 'loyalty', label: 'Loyalty Program', icon: Gift },
  { id: 'statements', label: 'Statements', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
]

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('customers')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [showCustomerTypeGuide, setShowCustomerTypeGuide] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedCustomerForActions, setSelectedCustomerForActions] = useState<string | null>(null)
  
  // Use real customer hook
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
    clearError,
    refetch
  } = useCustomers()

  // Selection handlers
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

  const handleClearSelection = () => {
    setSelectedCustomers([])
  }

  // Action handlers
  const handleEditCustomer = async (customer: Customer) => {
    setEditingCustomer(customer)
    setShowAddCustomerModal(true)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }
    
    try {
      const result = await deleteCustomer(id)
      if (result.success) {
        toast.success('Customer deleted successfully')
        setSelectedCustomers(prev => prev.filter(customerId => customerId !== id))
      } else {
        toast.error(result.error || 'Failed to delete customer')
      }
    } catch (error) {
      toast.error('Failed to delete customer')
    }
  }

  const handleAddCustomer = async (customerData: any) => {
    try {
      if (editingCustomer) {
        // Update existing customer with credit and loyalty data
        const updateData = {
          ...customerData,
          creditAccount: customerData.creditAccount,
          loyaltyAccount: customerData.loyaltyAccount
        }
        const result = await updateCustomer(editingCustomer.id, updateData)
        if (result.success) {
          toast.success('Customer updated successfully')
          setShowAddCustomerModal(false)
          setEditingCustomer(null)
          // Manually refetch to ensure data is updated
          setTimeout(() => refetch(), 500)
        } else {
          toast.error(result.error || 'Failed to update customer')
        }
      } else {
        // Create new customer
        const result = await createCustomer(customerData)
        if (result.success) {
          toast.success('Customer created successfully')
          setShowAddCustomerModal(false)
        } else {
          toast.error(result.error || 'Failed to create customer')
        }
      }
    } catch (error) {
      toast.error(editingCustomer ? 'Failed to update customer' : 'Failed to create customer')
    }
  }

  const handleViewStatement = (id: string) => {
    setSelectedCustomerForActions(id)
    setActiveTab('statements')
    toast.info('Navigate to statements tab to view customer statement')
  }

  const handleManageCredit = (id: string) => {
    setSelectedCustomerForActions(id)
    setActiveTab('credit')
    toast.info('Navigate to credit management tab to manage customer credit')
  }

  const handleManageLoyalty = (id: string) => {
    setSelectedCustomerForActions(id)
    setActiveTab('loyalty')
    toast.info('Navigate to loyalty program tab to manage customer loyalty')
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('No customers selected')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedCustomers.length} customers? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await deleteCustomers(selectedCustomers)
      if (result.success) {
        toast.success(`${selectedCustomers.length} customers deleted successfully`)
        setSelectedCustomers([])
      } else {
        toast.error(result.error || 'Failed to delete customers')
      }
    } catch (error) {
      toast.error('Failed to delete customers')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customers':
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={clearError}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                {stats && <CustomerStatsCards stats={stats} />}
                
                <CustomerActionBar 
                  onAddCustomer={() => setShowAddCustomerModal(true)}
                  onImportCustomers={() => console.log('Import customers')}
                  onExportCustomers={() => console.log('Export customers')}
                  onGenerateStatements={() => setActiveTab('statements')}
                  onSendBulkEmail={() => console.log('Send bulk email')}
                  onSendBulkSMS={() => console.log('Send bulk SMS')}
                  onManageCreditAccounts={() => setActiveTab('credit')}
                  onManageLoyaltyProgram={() => setActiveTab('loyalty')}
                  onViewReports={() => setActiveTab('analytics')}
                  onBulkDelete={handleBulkDelete}
                  selectedCount={selectedCustomers.length}
                />

                <CustomerTable 
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
                  onFilterChange={updateFilter}
                  loading={loading}
                />
              </>
            )}
          </div>
        )
      case 'credit':
        return <CreditManagement />
      case 'loyalty':
        return <LoyaltyProgram />
      case 'statements':
        return <StatementGenerator />
      case 'analytics':
        return <CustomerAnalytics />
      default:
        return null
    }
  }

  return (
    <div className="p-8 min-h-screen bg-[hsl(var(--background))] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Customers</h1>
          <p className="text-base text-muted-foreground mt-1">Manage customer relationships, credit accounts, and loyalty programs</p>
        </div>
        {activeTab === 'customers' && (
          <Button 
            onClick={() => setShowAddCustomerModal(true)}
            className="bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Customer
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-full font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-black text-[#E5FF29] shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>

      {/* Modals */}
              <AddCustomerModal 
          isOpen={showAddCustomerModal} 
          onClose={() => {
            setShowAddCustomerModal(false)
            setEditingCustomer(null)
          }}
          onSave={handleAddCustomer}
          editingCustomer={editingCustomer}
        />

      <CustomerTypeGuide 
        isOpen={showCustomerTypeGuide}
        onClose={() => setShowCustomerTypeGuide(false)}
      />
    </div>
  )
} 