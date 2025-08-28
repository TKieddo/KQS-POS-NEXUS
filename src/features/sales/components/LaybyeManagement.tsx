
import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Phone,
  Mail,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { getLaybyeOrders, getLaybyeStats, addLaybyePayment, updateLaybyeStatus } from '@/lib/laybye-service'
import { useBranch } from '@/context/BranchContext'
import { toast } from 'sonner'



export function LaybyeManagement() {
  const { selectedBranch } = useBranch()
  const [selectedLaybye, setSelectedLaybye] = useState<any>(null)
  const [showNewLaybye, setShowNewLaybye] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [laybyeOrders, setLaybyeOrders] = useState<any[]>([])
  const [laybyeStats, setLaybyeStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [amountReceived, setAmountReceived] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Load laybye data
  useEffect(() => {
    loadLaybyeData()
  }, [selectedBranch?.id])

  const loadLaybyeData = async () => {
    try {
      setLoading(true)
      
      // Get laybye orders
      const ordersResult = await getLaybyeOrders({
        limit: 100,
        branch_id: selectedBranch?.id && selectedBranch.id !== '00000000-0000-0000-0000-000000000001' ? selectedBranch.id : undefined
      })
      
      if (ordersResult.success) {
        setLaybyeOrders(ordersResult.data || [])
      } else {
        console.error('Laybye orders error:', ordersResult.error)
        toast.error(`Failed to load laybye orders: ${ordersResult.error}`)
      }

      // Get laybye statistics
      const statsResult = await getLaybyeStats(selectedBranch?.id)
      if (statsResult.success) {
        setLaybyeStats(statsResult.data)
      } else {
        console.error('Laybye stats error:', statsResult.error)
        toast.error(`Failed to load laybye statistics: ${statsResult.error}`)
      }
    } catch (error) {
      console.error('Error loading laybye data:', error)
      toast.error('Failed to load laybye data')
    } finally {
      setLoading(false)
    }
  }

  const filteredLaybyes = laybyeOrders.filter(laybye => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return laybye.status === 'active'
    if (selectedFilter === 'completed') return laybye.status === 'completed'
    if (selectedFilter === 'overdue') {
      const dueDate = new Date(laybye.due_date)
      return laybye.status === 'active' && dueDate < new Date()
    }
    return true
  })

  const totalLaybyes = laybyeStats?.totalLaybyeOrders || 0
  const overdueLaybyes = laybyeStats?.overdueLaybyeOrders || 0
  const totalValue = laybyeStats?.totalLaybyeValue || 0
  const totalOutstanding = laybyeStats?.totalRemaining || 0

  const handleAddPayment = async () => {
    if (!selectedLaybye || !paymentAmount) {
      toast.error('Please enter payment amount')
      return
    }

    // For cash payments, show the cash payment modal
    if (paymentMethod === 'cash') {
      setShowCashPaymentModal(true)
      return
    }

    // For non-cash payments, process immediately
    await processPayment()
  }

  const processPayment = async () => {
    try {
      const result = await addLaybyePayment({
        laybye_id: selectedLaybye.id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        notes: `Payment via ${paymentMethod}`
      })

      if (result.success) {
        toast.success('Payment added successfully!')
        setShowPaymentModal(false)
        setShowCashPaymentModal(false)
        setPaymentAmount('')
        setAmountReceived('')
        loadLaybyeData() // Refresh data
        setSelectedLaybye(null)
      } else {
        toast.error('Failed to add payment')
      }
    } catch (error) {
      console.error('Error adding payment:', error)
      toast.error('Failed to add payment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCustomerName = (customer: any) => {
    if (!customer) return 'Unknown Customer'
    
    // If customer has first_name and last_name
    if (customer.first_name && customer.first_name.trim()) {
      if (customer.last_name && customer.last_name.trim()) {
        return `${customer.first_name} ${customer.last_name}`
      } else {
        return customer.first_name
      }
    }
    
    // If only last_name
    if (customer.last_name && customer.last_name.trim()) {
      return customer.last_name
    }
    
    // If email
    if (customer.email && customer.email.trim()) {
      return customer.email
    }
    
    // If phone
    if (customer.phone && customer.phone.trim()) {
      return `Customer (${customer.phone})`
    }
    
    return 'Unknown Customer'
  }

  const calculateRemainingBalance = (laybye: any) => {
    const totalAmount = laybye.total_amount || 0
    const depositAmount = laybye.deposit_amount || 0
    const totalPayments = (laybye.laybye_payments || []).reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
    
    // Calculate: Total - (Deposit + All Payments)
    const remainingBalance = Math.max(0, totalAmount - depositAmount - totalPayments)
    return remainingBalance
  }

  const isOverdue = (laybye: any) => {
    const dueDate = new Date(laybye.due_date)
    return laybye.status === 'active' && dueDate < new Date()
  }

  if (loading) {
    return (
      <div className="space-y-6 px-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading laybye data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Lay-byes</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {totalLaybyes}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {overdueLaybyes}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6 border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Lay-byes</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-gray-200 hover:bg-gray-50"
              onClick={loadLaybyeData}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              <Mail className="mr-2 h-4 w-4" />
              Send Reminders
            </Button>
          </div>
        </div>
      </Card>

      {/* Lay-byes Cards - Responsive Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Lay-bye Orders</h3>
          <div className="text-sm text-gray-500">
            {filteredLaybyes.length} orders
          </div>
        </div>
        
        {filteredLaybyes.length === 0 ? (
          <Card className="p-8 text-center border-gray-200">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lay-bye Orders</h3>
            <p className="text-gray-500">No lay-bye orders found for the selected filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLaybyes.map((laybye) => (
              <Card key={laybye.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-[hsl(var(--primary))]">
                        {laybye.order_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(laybye.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isOverdue(laybye) ? 'bg-red-100 text-red-800' : getStatusColor(laybye.status)
                      }`}>
                        {isOverdue(laybye) ? 'Overdue' : laybye.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {laybye.customer_display_name || getCustomerName(laybye.customers) || 'Unknown Customer'}
                      </span>
                    </div>
                    {(laybye.customers?.phone || laybye.customers?.email) && (
                      <div className="text-xs text-gray-500 ml-6">
                        {laybye.customers?.phone || laybye.customers?.email}
                      </div>
                    )}
                  </div>

                  {/* Items Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {laybye.laybye_items?.length || 0} items
                      </span>
                    </div>
                    {laybye.laybye_items?.[0]?.products?.name && (
                      <div className="text-xs text-gray-500 ml-6">
                        {laybye.laybye_items[0].products.name}
                        {(laybye.laybye_items?.length || 0) > 1 && ` +${(laybye.laybye_items?.length || 0) - 1} more`}
                      </div>
                    )}
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Total Value</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(laybye.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Deposit: {formatCurrency(laybye.deposit_amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Remaining</div>
                      <div className="text-sm font-semibold text-orange-600">
                        {formatCurrency(calculateRemainingBalance(laybye))}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {new Date(laybye.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Overdue Warning */}
                  {isOverdue(laybye) && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-800 font-medium">Payment Overdue</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLaybye(laybye)}
                      className="flex-1 border-gray-200 hover:bg-gray-50"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {laybye.customers?.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                        onClick={() => window.open(`tel:${laybye.customers.phone}`)}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                    {laybye.customers?.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 hover:bg-gray-50"
                        onClick={() => window.open(`mailto:${laybye.customers.email}`)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    )}
                    {laybye.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLaybye(laybye)
                          setShowPaymentModal(true)
                        }}
                        className="border-[#E5FF29] text-black hover:bg-[#E5FF29]/10"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lay-bye Details Modal */}
      {selectedLaybye && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl bg-white border-gray-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Lay-bye Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLaybye(null)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[hsl(var(--primary))]">Customer Information</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{getCustomerName(selectedLaybye.customers)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedLaybye.customers?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-sm text-[hsl(var(--primary))]">{selectedLaybye.customers?.email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Items</h4>
                    <div className="space-y-2">
                      {selectedLaybye.laybye_items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--primary))]">{item.products?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} @ {formatCurrency(item.unit_price)}</p>
                          </div>
                          <p className="text-sm font-bold text-[hsl(var(--primary))]">
                            {formatCurrency(item.total_price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[hsl(var(--primary))]">Payment Summary</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedLaybye.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deposit Paid</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(selectedLaybye.deposit_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Balance Remaining</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {formatCurrency(calculateRemainingBalance(selectedLaybye))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Due Date</p>
                        <p className="text-sm font-medium text-[hsl(var(--primary))]">
                          {new Date(selectedLaybye.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  <div>
                    <h4 className="font-medium text-[hsl(var(--primary))] mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {selectedLaybye.laybye_payments?.length > 0 ? (
                        selectedLaybye.laybye_payments.map((payment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-[hsl(var(--primary))]">
                                {new Date(payment.payment_date).toLocaleDateString()}
                            </p>
                              <p className="text-xs text-gray-500">{payment.payment_method} • {payment.notes}</p>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-green-600">
                              {formatCurrency(payment.amount)}
                            </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Paid
                            </span>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No payments recorded yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedLaybye.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-[hsl(var(--primary))] mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedLaybye.notes}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {selectedLaybye.status === 'active' && (
                  <Button 
                    className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
                    onClick={() => setShowPaymentModal(true)}
                  >
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
                )}
                {selectedLaybye.customers?.phone && (
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                    onClick={() => window.open(`tel:${selectedLaybye.customers.phone}`)}
                  >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
                )}
                {selectedLaybye.customers?.email && (
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-200 hover:bg-gray-50"
                    onClick={() => window.open(`mailto:${selectedLaybye.customers.email}`)}
                  >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reminder
                </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedLaybye && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                  Record Payment
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentAmount('')
                    setAmountReceived('')
                  }}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Outstanding Balance</div>
                  <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                    {formatCurrency(selectedLaybye.remaining_amount)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full"
                    min="0"
                    max={selectedLaybye.remaining_amount}
                    step="0.01"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="ecocash">EcoCash</option>
                  </select>
                </div>

                {parseFloat(paymentAmount) > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-800">
                      After this payment: {formatCurrency(selectedLaybye.remaining_amount - parseFloat(paymentAmount))} remaining
                    </div>
                    {parseFloat(paymentAmount) >= selectedLaybye.remaining_amount && (
                      <div className="text-sm font-semibold text-green-800 mt-1">
                        ✓ This will complete the laybye order
                      </div>
                    )}
                </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAddPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {paymentMethod === 'cash' ? 'Continue to Cash Payment' : 'Record Payment'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentAmount('')
                    setAmountReceived('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
                 </div>
       )}

       {/* Cash Payment Modal */}
       {showCashPaymentModal && selectedLaybye && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl">
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
                   Cash Payment
                 </h3>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setShowCashPaymentModal(false)
                     setAmountReceived('')
                   }}
                   className="border-gray-200 hover:bg-gray-50"
                 >
                   ×
                 </Button>
               </div>
               
               <div className="space-y-4">
                 {/* Payment Summary */}
                 <div className="p-4 bg-gray-50 rounded-lg">
                   <div className="text-sm text-gray-600 mb-1">Payment Amount</div>
                   <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                     {formatCurrency(parseFloat(paymentAmount))}
                   </div>
                 </div>

                 {/* Amount Received */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Amount Received *
                   </label>
                   <Input
                     type="number"
                     placeholder="0.00"
                     value={amountReceived}
                     onChange={(e) => setAmountReceived(e.target.value)}
                     className="w-full"
                     min="0"
                     step="0.01"
                     autoFocus
                   />
                 </div>

                 {/* Change Calculation */}
                 {parseFloat(amountReceived) > 0 && (
                   <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm text-blue-800">Change Due:</span>
                       <span className="text-xl font-bold text-blue-900">
                         {formatCurrency(Math.max(0, parseFloat(amountReceived) - parseFloat(paymentAmount)))}
                       </span>
                     </div>
                     {parseFloat(amountReceived) < parseFloat(paymentAmount) && (
                       <div className="text-sm text-red-600">
                         ⚠️ Amount received is less than payment amount
                       </div>
                     )}
                     {parseFloat(amountReceived) >= parseFloat(paymentAmount) && (
                       <div className="text-sm text-green-600">
                         ✓ Payment amount covered
                       </div>
                     )}
                   </div>
                 )}

                 {/* Payment Summary */}
                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                   <div className="text-sm text-green-800">
                     After this payment: {formatCurrency(selectedLaybye.remaining_amount - parseFloat(paymentAmount))} remaining
                   </div>
                   {parseFloat(paymentAmount) >= selectedLaybye.remaining_amount && (
                     <div className="text-sm font-semibold text-green-800 mt-1">
                       ✓ This will complete the laybye order
                     </div>
                   )}
                 </div>
               </div>

               <div className="flex gap-3 mt-6">
                 <Button
                   onClick={processPayment}
                   disabled={
                     !amountReceived || 
                     parseFloat(amountReceived) < parseFloat(paymentAmount)
                   }
                   className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
                 >
                   <DollarSign className="mr-2 h-4 w-4" />
                   Complete Payment
                 </Button>
                 <Button 
                   variant="outline" 
                   className="flex-1 border-gray-200 hover:bg-gray-50"
                   onClick={() => {
                     setShowCashPaymentModal(false)
                     setAmountReceived('')
                   }}
                 >
                   Cancel
                 </Button>
               </div>
             </div>
           </Card>
         </div>
       )}
     </div>
   )
 }
