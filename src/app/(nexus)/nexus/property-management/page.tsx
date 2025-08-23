'use client'

import React, { useState } from 'react'
import { Building2, Users, CreditCard, FileText, Home, Plus, Search, Filter, Mail, Phone, Eye, Edit, Receipt } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { NexusHeader } from './components/NexusHeader'

// Import custom hooks
import { useProperties } from './hooks/useProperties'
import { useTenants } from './hooks/useTenants'
import { usePayments } from './hooks/usePayments'
import { useReceipts } from './hooks/useReceipts'

// Import receipt components
import ReceiptGeneratorModal from './components/receipts/ReceiptGeneratorModal'

// Import components
import BuildingCard from './components/BuildingCard'
import TenantCard from './components/TenantCard'
import PaymentForm from './components/PaymentForm'
import BuildingForm from './components/BuildingForm'
import TenantForm from './components/TenantForm'
import DocumentUploader from './components/DocumentUploader'
import PaymentReminderModal from './components/PaymentReminderModal'
import BulkPaymentModal from './components/BulkPaymentModal'
import PaymentReportsModal from './components/PaymentReportsModal'
import ReceiptsTab from './components/receipts/ReceiptsTab'

const PropertyManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [showBuildingForm, setShowBuildingForm] = useState(false)
  const [showTenantForm, setShowTenantForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)
  const [showReceiptGenerator, setShowReceiptGenerator] = useState(false)
  const [selectedTenantForReceipt, setSelectedTenantForReceipt] = useState<any>(null)

  // Custom hooks
  const { buildings, loading: buildingsLoading, addBuilding } = useProperties()
  const { tenants, loading: tenantsLoading, getTenantsByBuilding, addTenant } = useTenants()
  const { payments, loading: paymentsLoading, addPayment } = usePayments()
  const { addReceipt } = useReceipts()

  // Calculate statistics
  const totalBuildings = buildings.length
  const totalTenants = tenants.length
  const totalRent = buildings.reduce((sum, building) => sum + building.total_rent, 0)
  const collectedRent = buildings.reduce((sum, building) => sum + building.collected_rent, 0)
  const overdueCount = tenants.filter(tenant => tenant.payment_status === 'overdue').length

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.building_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || tenant.payment_status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Event handlers
  const handleAddBuilding = async (data: any) => {
    try {
      await addBuilding(data)
      setShowBuildingForm(false)
    } catch (error) {
      console.error('Failed to add building:', error)
    }
  }

  const handleAddTenant = async (data: any) => {
    try {
      await addTenant(data)
      setShowTenantForm(false)
    } catch (error) {
      console.error('Failed to add tenant:', error)
    }
  }

  const handleAddPayment = async (data: any) => {
    try {
      await addPayment(data)
      setShowPaymentForm(false)
      setSelectedTenant(null)
    } catch (error) {
      console.error('Failed to add payment:', error)
    }
  }

  const handleViewBuildingDetails = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId)
    setSelectedBuilding(building)
  }

  const handleViewTenantDetails = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    setSelectedTenant(tenant)
  }

  const handleRecordPayment = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    setSelectedTenant(tenant)
    setShowPaymentForm(true)
  }

  const handleGenerateReceipts = (tenant?: any) => {
    if (tenant) {
      setSelectedTenantForReceipt(tenant)
    } else {
      setSelectedTenantForReceipt(null)
    }
    setShowReceiptGenerator(true)
  }

  const handleReceiptGenerated = async (receiptData: any) => {
    try {
      await addReceipt({
        ...receiptData,
        tenantId: selectedTenantForReceipt?.id || receiptData.tenantInfo.id,
        buildingId: selectedTenantForReceipt?.building_id || receiptData.tenantInfo.building_id,
      })
      setShowReceiptGenerator(false)
      setSelectedTenantForReceipt(null)
    } catch (error) {
      console.error('Failed to generate receipt:', error)
    }
  }

  const handleSendReminders = async (data: any) => {
    try {
      console.log('Sending reminders:', data)
      // TODO: Implement reminder sending logic
      setShowReminderModal(false)
    } catch (error) {
      console.error('Failed to send reminders:', error)
    }
  }

  const handleBulkPayment = async (data: any) => {
    try {
      console.log('Processing bulk payments:', data)
      // TODO: Implement bulk payment logic
      setShowBulkPaymentModal(false)
    } catch (error) {
      console.error('Failed to process bulk payments:', error)
    }
  }

  const handleGenerateReport = async (data: any) => {
    try {
      console.log('Generating report:', data)
      // TODO: Implement report generation logic
      setShowReportsModal(false)
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nexus Header with Branch Switching */}
        <NexusHeader 
          title="Property Management" 
          subtitle="Manage buildings, tenants, and payments"
          showBack={true}
          backUrl="/nexus"
          showHome={true}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white rounded-2xl px-6 py-3 shadow-lg"
            onClick={() => setShowBuildingForm(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Building</span>
          </Button>
          <Button 
            className="flex items-center space-x-2 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 rounded-2xl px-6 py-3 shadow-lg font-medium"
            onClick={() => setShowTenantForm(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Tenant</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white rounded-2xl px-6 py-3 shadow-lg"
            onClick={() => handleGenerateReceipts(null)}
          >
            <Receipt className="h-4 w-4" />
            <span>Generate Receipts</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Buildings</CardTitle>
              <Building2 className="h-5 w-5 text-[#E5FF29]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalBuildings}</div>
              <p className="text-xs text-gray-600">Active properties</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Tenants</CardTitle>
              <Users className="h-5 w-5 text-[#E5FF29]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTenants}</div>
              <p className="text-xs text-gray-600">Active tenants</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Monthly Rent</CardTitle>
              <CreditCard className="h-5 w-5 text-[#E5FF29]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalRent.toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                ${collectedRent.toLocaleString()} collected
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Overdue Payments</CardTitle>
              <FileText className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-xs text-gray-600">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="overview" className="rounded-2xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">Overview</TabsTrigger>
            <TabsTrigger value="buildings" className="rounded-2xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">Buildings</TabsTrigger>
            <TabsTrigger value="tenants" className="rounded-2xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">Tenants</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-2xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">Payments</TabsTrigger>
            <TabsTrigger value="receipts" className="rounded-2xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">Receipts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buildings Overview */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-900">
                    <Building2 className="h-5 w-5 text-[#E5FF29]" />
                    <span>Buildings Overview</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">Recent buildings and occupancy status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {buildingsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : buildings.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No buildings found</p>
                    </div>
                  ) : (
                                         buildings.slice(0, 3).map((building) => (
                       <div key={building.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white/80 transition-all duration-300">
                         <div>
                           <h4 className="font-medium text-gray-900">{building.name}</h4>
                           <p className="text-sm text-gray-600">{building.address}</p>
                           <p className="text-sm text-gray-500">
                             {building.occupied_units}/{building.total_units} units occupied
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="font-medium text-gray-900">${building.total_rent.toLocaleString()}</p>
                           <Badge variant={building.overdue_payments > 0 ? "destructive" : "secondary"} className="rounded-full">
                             {building.overdue_payments} overdue
                           </Badge>
                         </div>
                       </div>
                     ))
                  )}
                </CardContent>
              </Card>

                             {/* Recent Payments */}
               <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
                 <CardHeader>
                   <CardTitle className="flex items-center space-x-2 text-gray-900">
                     <CreditCard className="h-5 w-5 text-[#E5FF29]" />
                     <span>Recent Payments</span>
                   </CardTitle>
                   <CardDescription className="text-gray-600">Latest payment activities</CardDescription>
                 </CardHeader>
                <CardContent className="space-y-4">
                  {paymentsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No payments found</p>
                    </div>
                  ) : (
                                         payments.slice(0, 5).map((payment) => {
                       const tenant = tenants.find(t => t.id === payment.tenant_id)
                       return (
                         <div key={payment.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white/80 transition-all duration-300">
                           <div>
                             <h4 className="font-medium text-gray-900">{tenant?.name || 'Unknown Tenant'}</h4>
                             <p className="text-sm text-gray-600">Receipt: {payment.receipt_number}</p>
                           </div>
                           <div className="text-right">
                             <p className="font-medium text-gray-900">${payment.amount.toLocaleString()}</p>
                             <Badge variant={payment.status === 'completed' ? "default" : "secondary"} className="rounded-full">
                               {payment.status}
                             </Badge>
                           </div>
                         </div>
                       )
                     })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

                     {/* Buildings Tab */}
           <TabsContent value="buildings" className="space-y-6">
             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
               <CardHeader>
                 <CardTitle className="text-gray-900">All Buildings</CardTitle>
                 <CardDescription className="text-gray-600">Manage your property portfolio</CardDescription>
               </CardHeader>
              <CardContent>
                {buildingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading buildings...</p>
                  </div>
                ) : buildings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No buildings found</p>
                    <p className="text-sm">Click "Add Building" to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buildings.map((building) => (
                      <BuildingCard
                        key={building.id}
                        building={building}
                        onViewDetails={handleViewBuildingDetails}
                        onEdit={(id) => console.log('Edit building:', id)}
                        onViewTenants={(id) => console.log('View tenants for building:', id)}
                        onViewPayments={(id) => console.log('View payments for building:', id)}
                        onViewRooms={(id) => console.log('View rooms for building:', id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

                     {/* Tenants Tab */}
           <TabsContent value="tenants" className="space-y-6">
             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <div>
                     <CardTitle className="text-gray-900">All Tenants</CardTitle>
                     <CardDescription className="text-gray-600">Manage tenant information and payments</CardDescription>
                   </div>
                                     <div className="flex space-x-2">
                     <Input
                       placeholder="Search tenants..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-64 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
                     />
                     <Select value={filterStatus} onValueChange={setFilterStatus}>
                       <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent">
                         <SelectValue />
                       </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tenantsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading tenants...</p>
                  </div>
                ) : filteredTenants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tenants found</p>
                    <p className="text-sm">Add tenants to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant) => (
                      <TenantCard
                        key={tenant.id}
                        tenant={tenant}
                        onViewDetails={handleViewTenantDetails}
                        onEdit={(id) => console.log('Edit tenant:', id)}
                        onSendEmail={(id) => console.log('Send email to tenant:', id)}
                        onCall={(id) => console.log('Call tenant:', id)}
                        onRecordPayment={handleRecordPayment}
                        onViewDocuments={(id) => console.log('View documents for tenant:', id)}
                        onViewPayments={(id) => console.log('View payments for tenant:', id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

                     {/* Payments Tab */}
           <TabsContent value="payments" className="space-y-6">
             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
               <CardHeader>
                 <CardTitle className="text-gray-900">Payment Management</CardTitle>
                 <CardDescription className="text-gray-600">Track and manage all rent payments</CardDescription>
               </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {/* Payment Summary */}
                   <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
                     <CardHeader>
                       <CardTitle className="text-gray-900">Payment Summary</CardTitle>
                     </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Expected:</span>
                        <span className="font-medium">${totalRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collected:</span>
                        <span className="font-medium text-green-600">${collectedRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outstanding:</span>
                        <span className="font-medium text-red-600">${(totalRent - collectedRent).toLocaleString()}</span>
                      </div>
                                             <div className="pt-4">
                         <Button className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 rounded-2xl font-medium shadow-lg">Record Payment</Button>
                       </div>
                    </CardContent>
                  </Card>

                                                           {/* Quick Actions */}
                      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 rounded-3xl shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200 hover:bg-white/80 rounded-2xl transition-all duration-300"
                            onClick={() => setShowReminderModal(true)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Payment Reminders
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200 hover:bg-white/80 rounded-2xl transition-all duration-300"
                            onClick={() => setShowBulkPaymentModal(true)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Bulk Payment Entry
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start bg-white/60 backdrop-blur-sm border-gray-200 hover:bg-white/80 rounded-2xl transition-all duration-300"
                            onClick={() => setShowReportsModal(true)}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Payment Reports
                          </Button>
                        </CardContent>
                      </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">
            <ReceiptsTab
              receipts={payments.map(payment => ({
                id: payment.id,
                receipt_number: payment.receipt_number || `REC-${payment.id.slice(0, 8)}`,
                tenant_id: payment.tenant_id,
                tenant_name: tenants.find(t => t.id === payment.tenant_id)?.name || 'Unknown Tenant',
                building_id: payment.building_id,
                building_name: buildings.find(b => b.id === payment.building_id)?.name || 'Unknown Building',
                date: payment.payment_date,
                total: payment.amount,
                payment_method: payment.payment_method,
                notes: payment.notes
              }))}
              tenants={tenants}
              buildings={buildings}
              onViewReceipt={(receipt) => handleGenerateReceipts(tenants.find(t => t.id === receipt.tenant_id))}
              onDownloadReceipt={(receipt) => handleGenerateReceipts(tenants.find(t => t.id === receipt.tenant_id))}
              isLoading={paymentsLoading || tenantsLoading || buildingsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Building Form Modal */}
      <Modal
        isOpen={showBuildingForm}
        onClose={() => setShowBuildingForm(false)}
        title="Add New Building"
        maxWidth="7xl"
        className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      >
        <BuildingForm
          onSave={handleAddBuilding}
          onCancel={() => setShowBuildingForm(false)}
          isLoading={buildingsLoading}
        />
      </Modal>

      {/* Tenant Form Modal */}
      <Modal
        isOpen={showTenantForm}
        onClose={() => setShowTenantForm(false)}
        title="Add New Tenant"
        maxWidth="7xl"
        className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      >
        <TenantForm
          buildings={buildings}
          onSave={handleAddTenant}
          onCancel={() => setShowTenantForm(false)}
          isLoading={tenantsLoading}
        />
      </Modal>

      {/* Payment Form Modal */}
      <Modal
        isOpen={showPaymentForm}
        onClose={() => {
          setShowPaymentForm(false)
          setSelectedTenant(null)
        }}
        title="Record Payment"
        maxWidth="4xl"
        className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      >
        <PaymentForm
          tenant={selectedTenant}
          onSave={handleAddPayment}
          onCancel={() => {
            setShowPaymentForm(false)
            setSelectedTenant(null)
          }}
          isLoading={paymentsLoading}
        />
      </Modal>

      {/* Payment Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="Send Payment Reminders"
        maxWidth="6xl"
        className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      >
        <PaymentReminderModal
          tenants={tenants.map(tenant => ({
            ...tenant,
            building_name: buildings.find(b => b.id === tenant.building_id)?.name || 'Unknown Building'
          }))}
          onSend={handleSendReminders}
          onCancel={() => setShowReminderModal(false)}
          isLoading={false}
        />
      </Modal>

      {/* Bulk Payment Modal */}
      <Modal
        isOpen={showBulkPaymentModal}
        onClose={() => setShowBulkPaymentModal(false)}
        title="Bulk Payment Entry"
        maxWidth="4xl"
        className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      >
        <BulkPaymentModal
          tenants={tenants.map(tenant => ({
            ...tenant,
            building_name: buildings.find(b => b.id === tenant.building_id)?.name || 'Unknown Building',
            outstanding_amount: tenant.rent_amount // Simplified calculation
          }))}
          buildings={buildings}
          onSave={handleBulkPayment}
          onCancel={() => setShowBulkPaymentModal(false)}
          isLoading={false}
        />
      </Modal>

      {/* Payment Reports Modal */}
      <Modal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        title="Payment Reports & Analytics"
        maxWidth="6xl"
        className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      >
        <PaymentReportsModal
          payments={payments.map(payment => ({
            ...payment,
            tenant_name: tenants.find(t => t.id === payment.tenant_id)?.name || 'Unknown Tenant',
            building_name: buildings.find(b => b.id === payment.building_id)?.name || 'Unknown Building'
          }))}
          tenants={tenants.map(tenant => ({
            ...tenant,
            building_name: buildings.find(b => b.id === tenant.building_id)?.name || 'Unknown Building'
          }))}
          buildings={buildings}
          onGenerate={handleGenerateReport}
          onCancel={() => setShowReportsModal(false)}
          isLoading={false}
        />
      </Modal>

      {/* Receipt Generator Modal */}
      <ReceiptGeneratorModal
        isOpen={showReceiptGenerator}
        onClose={() => {
          setShowReceiptGenerator(false)
          setSelectedTenantForReceipt(null)
        }}
        tenant={selectedTenantForReceipt}
        onGenerate={handleReceiptGenerated}
      />
    </div>
  )
}

export default PropertyManagementPage
