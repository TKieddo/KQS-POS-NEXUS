'use client'

import React, { useState, useEffect } from 'react'
import { X, DollarSign, CreditCard } from 'lucide-react'
import { ProductGrid } from './ProductGrid'
import { OrderDetails } from './OrderDetails'
import { POSHeader } from './POSHeader'
import { ProductDetailModal } from './ProductDetailModal'
import { AddOrderModal } from './AddOrderModal'
import { HeldOrdersModal } from './HeldOrdersModal'
import { LaybyePaymentModal } from './LaybyePaymentModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartContext } from '@/context/CartContext'
import { useProducts } from '../hooks/useProducts'
import { useHeldOrders } from '../hooks/useHeldOrders'
import { createSale } from '@/lib/sales-service'
import { createLaybyeOrder, addLaybyePayment } from '@/lib/laybye-service'
import { searchCustomers } from '@/lib/customers-service'
import { checkBranchAccess, getUserBranchPermissions } from '@/lib/branch-access-service'
import { getCurrentCashUpSession, createCashUpSession } from '@/lib/cashup-service'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import type { CartItem, Customer, Product } from '../types'

export const POSInterface: React.FC = () => {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()
  const { 
    cart, 
    customer, 
    discount, 
    discountType,
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    total,
    setCustomer,
    clearCustomer,
    setDiscount
  } = useCartContext()
  const { products, loading: productsLoading, searchProducts, getProductByBarcode } = useProducts()
  const { heldOrders, holdOrder, retrieveOrder, removeHeldOrder } = useHeldOrders()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showHeldOrders, setShowHeldOrders] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [processingLaybye, setProcessingLaybye] = useState(false)
  const [showLaybyePaymentModal, setShowLaybyePaymentModal] = useState(false)
  const [laybyePaymentData, setLaybyePaymentData] = useState<any>(null)
  const [showLaybyePaymentSuccess, setShowLaybyePaymentSuccess] = useState(false)
  const [laybyePaymentDetails, setLaybyePaymentDetails] = useState<{
    paymentMethod: string
    depositAmount: number
    amountPaid: number
    change: number
    transactionNumber?: string
  } | null>(null)

  // Handle product search
  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery)
    }
  }, [searchQuery, searchProducts])

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleAddToOrder = (product: Product, quantity: number = 1, options?: Record<string, any>) => {
    addToCart(product, quantity)
    setShowAddOrder(false)
    setShowProductDetail(false)
    setSelectedProduct(null)
  }

  const handlePaymentComplete = async (paymentMethod: string, paymentAmount: number) => {
    if (cart.length === 0) {
      toast.error('No items in cart')
      return
    }

    setProcessingPayment(true)

    try {
      // Check if there's an active cashup session, create one if not
      if (selectedBranch?.id) {
        const sessionResult = await getCurrentCashUpSession(selectedBranch.id)
        if (!sessionResult.success || !sessionResult.data) {
          // No active session, create one automatically
          const cashierName = user?.user_metadata?.full_name || user?.email || 'Cashier'
          const createSessionResult = await createCashUpSession({
            cashier_name: cashierName,
            branch_id: selectedBranch.id,
            opening_amount: 0, // Start with 0, can be updated later
            notes: 'Auto-created session from POS'
          })
          
          if (createSessionResult.success) {
            console.log('Auto-created cashup session:', createSessionResult.data)
          }
        }
      }

      // Calculate totals - VAT is already included in product prices
      const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
      const taxAmount = 0 // No additional tax since VAT is already included
      const finalTotal = subtotal - discount // Remove tax calculation

      // Create sale data
      const saleData = {
        customer_id: customer?.id,
        // cashier_id: 'current-user-id', // TODO: Get from auth context - temporarily removed
        branch_id: selectedBranch?.id || '00000000-0000-0000-0000-000000000001',
        items: cart,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discount,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        payment_status: 'completed' as const,
        sale_type: 'regular' as const,
        notes: `Payment method: ${paymentMethod}`
      }

      const result = await createSale(saleData)

      if (result.success) {
        toast.success('Sale completed successfully!')
        clearCart()
        clearCustomer()
        setDiscount(0, 'percentage')
      } else {
        toast.error(result.error || 'Failed to complete sale')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    } finally {
      setProcessingPayment(false)
    }
  }

 

  const handleLaybyeCreated = async (laybyeData: {
    depositAmount: number
    dueDate: string
    customerId: string
    notes?: string
  }) => {
    if (cart.length === 0) {
      toast.error('No items in cart')
      return
    }

    setProcessingLaybye(true)

    try {
      // Calculate totals - VAT is already included in product prices
      const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
      const taxAmount = 0 // No additional tax since VAT is already included
      const finalTotal = subtotal - discount // Remove tax calculation
      const remainingAmount = finalTotal - laybyeData.depositAmount

      // Create laybye data
      const laybyeOrderData = {
        customer_id: laybyeData.customerId,
        // cashier_id: 'current-user-id', // TODO: Get from auth context - temporarily removed
        branch_id: selectedBranch?.id || '00000000-0000-0000-0000-000000000001',
        items: cart,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discount,
        total_amount: finalTotal,
        deposit_amount: laybyeData.depositAmount,
        remaining_balance: remainingAmount, // Fixed: using remaining_balance instead of remaining_amount
        due_date: laybyeData.dueDate,
        notes: laybyeData.notes || `Laybye order with ${formatCurrency(laybyeData.depositAmount)} deposit`
      }

      const result = await createLaybyeOrder(laybyeOrderData)

      if (result.success) {
        // Store the laybye data for payment processing
        setLaybyePaymentData({
          laybyeOrder: result.data,
          depositAmount: laybyeData.depositAmount,
          total: finalTotal
        })
        setShowLaybyePaymentModal(true)
      } else {
        toast.error(result.error || 'Failed to create laybye order')
      }
    } catch (error) {
      console.error('Error creating laybye order:', error)
      toast.error('Failed to create laybye order')
    } finally {
      setProcessingLaybye(false)
    }
  }

 const handleLaybyePaymentComplete = async (paymentData: {
    amountReceived: number
    paymentMethod: string
  }) => {
    try {
      // Process the deposit payment
      const result = await addLaybyePayment({
        laybye_id: laybyePaymentData.laybyeOrder.id,
        amount: laybyePaymentData.depositAmount,
        payment_method: paymentData.paymentMethod,
        payment_date: new Date().toISOString(),
        notes: `Initial deposit payment via ${paymentData.paymentMethod}`
      })

      if (result.success) {
        // Generate transaction number
        const now = new Date()
        const transactionNumber = `TXN${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`
        
        // Calculate change
        const change = paymentData.amountReceived - laybyePaymentData.depositAmount
        
        // Set payment success details
        setLaybyePaymentDetails({
          paymentMethod: paymentData.paymentMethod,
          depositAmount: laybyePaymentData.depositAmount,
          amountPaid: paymentData.amountReceived,
          change: Math.max(0, change),
          transactionNumber
        })
        
        // Show payment success UI
        setShowLaybyePaymentSuccess(true)
        setShowLaybyePaymentModal(false)
        
        toast.success('Lay-bye order created and deposit paid successfully!')
        clearCart()
        clearCustomer()
        setDiscount(0, 'percentage')
        setLaybyePaymentData(null)
      } else {
        toast.error('Failed to record deposit payment')
      }
    } catch (error) {
      console.error('Error processing laybye payment:', error)
      toast.error('Failed to process payment')
    }
  }

  const handleResetOrder = () => {
    clearCart()
    clearCustomer()
    setDiscount(0, 'percentage')
  }

  const handleOrderDetails = () => {
    setShowOrderDetails(true)
  }

  const handleRefresh = async () => {
    // Refresh products data
    await searchProducts('')
    // Reset search query
    setSearchQuery('')
    // Reset category selection
    setSelectedCategory('all')
  }

  const handleDiscountApplied = (discountAmount: number, type: 'percentage' | 'fixed') => {
    setDiscount(discountAmount, type)
    console.log('Discount applied:', { amount: discountAmount, type })
  }

  const handleHoldOrder = () => {
    if (cart.length === 0) {
      toast.error('No items in cart to hold')
      return
    }

    const orderId = holdOrder(cart, customer, total, discount, discountType)
    console.log('Order held:', { orderId, cart, customer, total, discount })
    
    // Clear current cart after holding
    clearCart()
    clearCustomer()
    setDiscount(0, 'percentage')
    
    toast.success(`Order held successfully! Order ID: ${orderId}`)
  }

  const handleRetrieveHeldOrder = (heldOrder: any) => {
    // Clear current cart
    clearCart()
    clearCustomer()
    setDiscount(0, 'percentage')

    // Restore held order
    heldOrder.cart.forEach((item: CartItem) => {
      addToCart(item.product, item.quantity)
    })
    
    if (heldOrder.customer) {
      setCustomer(heldOrder.customer)
    }
    
    setDiscount(heldOrder.discount, heldOrder.discountType)
    
    console.log('Retrieved held order:', heldOrder)
  }

  const handleRemoveHeldOrder = (orderId: string) => {
    removeHeldOrder(orderId)
    console.log('Removed held order:', orderId)
  }

  const handleLaybyePaymentSuccessComplete = () => {
    setShowLaybyePaymentSuccess(false)
    setLaybyePaymentDetails(null)
  }



  const handleBarcodeScan = async (barcode: string) => {
    try {
      const product = await getProductByBarcode(barcode)
      if (product) {
        addToCart(product, 1)
        toast.success(`Added ${product.name} to cart`)
      } else {
        toast.error('Product not found')
      }
    } catch (error) {
      console.error('Error scanning barcode:', error)
      toast.error('Error scanning barcode')
    }
  }

  const categories = [
    { id: 'all', name: 'All', count: products.length },
    { id: '1', name: 'Clothing', count: products.filter(p => p.category_id === '1').length },
    { id: '2', name: 'Footwear', count: products.filter(p => p.category_id === '2').length },
    { id: '3', name: 'Accessories', count: products.filter(p => p.category_id === '3').length }
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <POSHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        cartItemCount={cart.length}
        categories={categories}
        onResetOrder={handleResetOrder}
        onOrderDetails={handleOrderDetails}
        onRefresh={handleRefresh}
        heldOrdersCount={heldOrders.length}
        onShowHeldOrders={() => setShowHeldOrders(true)}
        onBarcodeScan={handleBarcodeScan}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products (wider) */}
        <div className="w-[70%] flex flex-col">
          <ProductGrid 
            products={products}
            loading={productsLoading}
            selectedCategory={selectedCategory}
            onProductSelect={handleProductSelect}
            onAddToOrder={(product: Product) => {
              setSelectedProduct(product)
              setShowAddOrder(true)
            }}
          />
        </div>

        {/* Right Panel - Order Details (compact) */}
        <div className="w-[30%] flex flex-col border-l border-gray-200">
          <OrderDetails 
            cart={cart}
            customer={customer}
            total={total}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onPaymentComplete={handlePaymentComplete}
            onCustomerSelect={setCustomer}
            onCustomerClear={clearCustomer}
            onDiscountApplied={handleDiscountApplied}
            onLaybyeCreated={handleLaybyeCreated}
            onHoldOrder={handleHoldOrder}
            processingPayment={processingPayment}
            processingLaybye={processingLaybye}
            showLaybyePaymentSuccess={showLaybyePaymentSuccess}
            laybyePaymentDetails={laybyePaymentDetails}
            onLaybyePaymentComplete={handleLaybyePaymentSuccessComplete}
          />
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && showProductDetail && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => {
            setShowProductDetail(false)
            setSelectedProduct(null)
          }}
          onAddToOrder={() => {
            setShowProductDetail(false)
            setShowAddOrder(true)
          }}
        />
      )}

      {/* Add Order Modal */}
      {selectedProduct && showAddOrder && (
        <AddOrderModal
          product={selectedProduct}
          onClose={() => {
            setShowAddOrder(false)
            setSelectedProduct(null)
          }}
          onAddToOrder={handleAddToOrder}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <OrderDetailsModal
          cart={cart}
          customer={customer}
          total={total}
          discount={discount}
          onClose={() => setShowOrderDetails(false)}
        />
      )}

      {/* Held Orders Modal */}
      <HeldOrdersModal
        isOpen={showHeldOrders}
        onClose={() => setShowHeldOrders(false)}
        heldOrders={heldOrders}
        onRetrieveOrder={handleRetrieveHeldOrder}
        onRemoveOrder={handleRemoveHeldOrder}
      />

      {/* Laybye Payment Modal */}
      {showLaybyePaymentModal && laybyePaymentData && (
        <LaybyePaymentModal
          isOpen={showLaybyePaymentModal}
          onClose={() => {
            setShowLaybyePaymentModal(false)
            setLaybyePaymentData(null)
          }}
          onPaymentComplete={handleLaybyePaymentComplete}
          depositAmount={laybyePaymentData.depositAmount}
          total={laybyePaymentData.total}
        />
      )}
    </div>
  )
}

// Order Details Modal Component
interface OrderDetailsModalProps {
  cart: CartItem[]
  customer: Customer | null
  total: number
  discount: number
  onClose: () => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  cart,
  customer,
  total,
  discount,
  onClose
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const taxRate = 0.12
  const taxAmount = total * taxRate
  const finalTotal = total + taxAmount - discount

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Customer Info */}
          {customer && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
              <p className="text-sm text-gray-600">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Items ({cart.length})</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-900">{formatCurrency(item.unitPrice)}</p>
                    <p className="text-xs text-gray-500">Total: {formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (12%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Button
            className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-10 text-sm font-semibold"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
} 