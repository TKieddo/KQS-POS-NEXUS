'use client'

import React, { useState } from 'react'
import { 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  CreditCard, 
  User,
  Receipt,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { CartItem, Customer } from '../types'
import { CustomerSelectionModal } from './CustomerSelectionModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'

interface CartAndPaymentProps {
  cart: CartItem[]
  customer: Customer | null
  total: number
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onPaymentComplete: () => void
}

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500' },
  { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },
  { id: 'transfer', name: 'Transfer', icon: CreditCard, color: 'bg-indigo-500' },
  { id: 'mpesa', name: 'Mpesa', icon: CreditCard, color: 'bg-green-600' },
  { id: 'ecocash', name: 'Ecocash', icon: CreditCard, color: 'bg-emerald-600' },
  { id: 'account', name: 'Account', icon: User, color: 'bg-black' },
  { id: 'laybye', name: 'Lay-bye', icon: Receipt, color: 'bg-orange-500' }
]

interface AccountCustomer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_balance: number
  credit_limit: number
  status: string
}

export const CartAndPayment: React.FC<CartAndPaymentProps> = ({
  cart,
  customer,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onPaymentComplete
}) => {
  const { user } = useAuth()
  const { selectedBranch } = useBranch()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [accountCustomer, setAccountCustomer] = useState<AccountCustomer | null>(null)
  const [error, setError] = useState('')

  const taxRate = 0.15 // 15% tax rate
  const taxAmount = total * taxRate
  const finalTotal = total + taxAmount
  const change = parseFloat(amountPaid) - finalTotal

  const handlePayment = async () => {
    if (cart.length === 0) return
    
    // Validate account payment
    if (selectedPaymentMethod === 'account' && !accountCustomer) {
      setError('Please select a customer for account payment')
      return
    }

    if (selectedPaymentMethod === 'account' && accountCustomer) {
      if (accountCustomer.current_balance < finalTotal) {
        setError(`Insufficient balance. Customer has ${formatCurrency(accountCustomer.current_balance)} available.`)
        return
      }
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          transaction_number: `SALE-${Date.now()}`,
          customer_id: accountCustomer?.id || customer?.id,
          cashier_id: user?.id,
          subtotal: total,
          tax_amount: taxAmount,
          discount_amount: 0,
          total_amount: finalTotal,
          payment_method: selectedPaymentMethod,
          payment_status: 'completed',
          sale_type: selectedPaymentMethod === 'account' ? 'credit' : 'regular',
          branch_id: selectedBranch?.id
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        variant_id: item.variant?.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Update customer balance for account payments
      if (selectedPaymentMethod === 'account' && accountCustomer) {
        const { error: balanceError } = await supabase
          .from('customers')
          .update({ 
            current_balance: supabase.raw(`current_balance - ${finalTotal}`)
          })
          .eq('id', accountCustomer.id)

        if (balanceError) throw balanceError
      }
      
      onPaymentComplete()
      setAmountPaid('')
      setAccountCustomer(null)
    } catch (error) {
      console.error('Payment failed:', error)
      setError('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method)
    setError('')
    
    if (method === 'account') {
      setShowCustomerSelect(true)
    } else {
      setAccountCustomer(null)
    }
  }

  const handleCustomerSelect = (selectedCustomer: AccountCustomer) => {
    setAccountCustomer(selectedCustomer)
    setShowCustomerSelect(false)
  }

  const canProcessPayment = cart.length > 0 && 
    (selectedPaymentMethod === 'cash' ? parseFloat(amountPaid) >= finalTotal : true) &&
    (selectedPaymentMethod === 'account' ? accountCustomer !== null : true)

  const getBalanceStatus = (customer: AccountCustomer) => {
    if (customer.current_balance === 0) {
      return { status: 'good', text: 'No balance', color: 'bg-green-100 text-green-800' }
    } else if (customer.current_balance > 0) {
      return { status: 'outstanding', text: 'Outstanding balance', color: 'bg-red-100 text-red-800' }
    } else {
      return { status: 'credit', text: 'Credit available', color: 'bg-blue-100 text-blue-800' }
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[hsl(var(--primary))] flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart ({cart.length} items)
          </h2>
          {cart.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Clear cart
                cart.forEach(item => onRemoveItem(item.id))
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Cart is empty</p>
            <p className="text-sm text-gray-400">Add products to get started</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={onRemoveItem}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (15%):</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <Button
                key={method.id}
                variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePaymentMethodChange(method.id)}
                className={
                  selectedPaymentMethod === method.id
                    ? method.id === 'account' 
                      ? 'bg-black text-white border-black hover:bg-gray-800'
                      : 'bg-[#E5FF29] text-black border-[#E5FF29] hover:bg-[#E5FF29]/90'
                    : 'border-gray-200 hover:bg-gray-50'
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {method.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Account Customer Selection */}
      {selectedPaymentMethod === 'account' && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Account Customer</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerSelect(true)}
              className="text-xs"
            >
              {accountCustomer ? 'Change' : 'Select Customer'}
            </Button>
          </div>
          
          {accountCustomer ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {accountCustomer.first_name} {accountCustomer.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{accountCustomer.email}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {accountCustomer.current_balance >= finalTotal ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant="secondary" className={getBalanceStatus(accountCustomer).color}>
                      {formatCurrency(accountCustomer.current_balance)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Limit: {formatCurrency(accountCustomer.credit_limit)}
                  </p>
                </div>
              </div>
              
              {accountCustomer.current_balance < finalTotal && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  Insufficient balance for this purchase
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No customer selected</p>
            </div>
          )}
        </div>
      )}

      {/* Amount Paid (for cash payments) */}
      {selectedPaymentMethod === 'cash' && (
        <div className="p-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="text-lg font-semibold"
          />
          {amountPaid && change >= 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Change: {formatCurrency(change)}
            </div>
          )}
        </div>
      )}

      {/* Customer Info */}
      {customer && selectedPaymentMethod !== 'account' && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
          <div className="text-sm">
            <p className="font-medium">{customer.name}</p>
            {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
            {customer.credit_limit && (
              <p className="text-gray-600">
                Credit Limit: {formatCurrency(customer.credit_limit)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border-t border-gray-200">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handlePayment}
          disabled={!canProcessPayment || isProcessing}
          className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 font-semibold h-12 text-lg"
        >
          {isProcessing ? (
            'Processing...'
          ) : (
            <>
              <DollarSign className="h-5 w-5 mr-2" />
              Pay {formatCurrency(finalTotal)}
            </>
          )}
        </Button>
      </div>

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        isOpen={showCustomerSelect}
        onClose={() => setShowCustomerSelect(false)}
        onCustomerSelect={handleCustomerSelect}
        totalAmount={finalTotal}
      />
    </div>
  )
}

interface CartItemCardProps {
  item: CartItem
  onRemove: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* Product Image */}
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-sm text-gray-500">
          {formatCurrency(item.unitPrice)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="text-sm font-medium w-8 text-center">
          {item.quantity}
        </span>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <p className="text-sm font-semibold text-[hsl(var(--primary))]">
          {formatCurrency(item.totalPrice)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(item.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
} 