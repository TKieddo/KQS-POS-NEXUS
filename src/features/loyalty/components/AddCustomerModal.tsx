'use client'

import { useState } from 'react'
import { X, User, CreditCard, Gift, Plus, AlertCircle, Save, Crown, Building, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Customer } from '@/types/loyalty'
import { useCustomers } from '@/features/loyalty/hooks/useLoyalty'

// Form validation schema
const customerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  country: z.string().default('USA'),
  customerType: z.enum(['regular', 'vip', 'wholesale', 'laybye']),
  status: z.enum(['active', 'inactive', 'suspended']),
  notes: z.string().optional(),
  tags: z.string().optional(),
  // Loyalty account fields
  createLoyaltyAccount: z.boolean().default(false),
  loyaltyCardNumber: z.string().optional(),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).default('bronze'),
  initialPoints: z.number().min(0, 'Points cannot be negative').default(0),
  // Credit account fields
  createCreditAccount: z.boolean().default(false),
  creditAccountNumber: z.string().optional(),
  creditLimit: z.number().min(0, 'Credit limit cannot be negative').default(0),
  paymentTerms: z.number().min(1, 'Payment terms must be at least 1 day').default(30),
  creditScore: z.enum(['excellent', 'good', 'fair', 'poor']).default('fair')
})

type CustomerFormData = z.infer<typeof customerSchema>

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerAdded: (customer: Customer) => void
}

export const AddCustomerModal = ({ isOpen, onClose, onCustomerAdded }: AddCustomerModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the customers hook for data operations
  const { createCustomer, createLoyaltyAccount, createCreditAccount } = useCustomers()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CustomerFormData>({
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true)
    
    try {
      // First, check if database tables exist
      try {
        const dbCheckResponse = await fetch('/api/loyalty/check-db')
        const dbCheck = await dbCheckResponse.json()
        console.log('Database check result:', dbCheck)
        
        if (!dbCheck.success) {
          throw new Error('Database tables not found. Please run the loyalty_schema.sql in your Supabase database.')
        }
      } catch (dbError) {
        console.error('Database check failed:', dbError)
        // Continue anyway, the actual operation will show the real error
      }

      // Generate customer number
      const customerNumber = `CUST${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      
      // Prepare customer data
      const customerData = {
        customerNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country
        },
        status: data.status,
        customerType: data.customerType,
        notes: data.notes || '',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        totalPurchases: 0,
        totalSpent: 0
      }

      // Try using the hook first
      let customerResult = await createCustomer(customerData)
      
      console.log('Customer creation result:', customerResult)
      
      // If hook fails, try direct API call as fallback
      if (!customerResult.success || !customerResult.data) {
        console.log('Hook failed, trying direct API call...')
        
        const apiResponse = await fetch('/api/loyalty/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerData)
        })
        
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json()
          throw new Error(errorData.error || 'Failed to create customer via API')
        }
        
        const newCustomer = await apiResponse.json()
        customerResult = { success: true, data: newCustomer, error: null }
      }

      if (!customerResult.success || !customerResult.data) {
        console.error('Customer creation failed:', customerResult.error)
        throw new Error(customerResult.error || 'Failed to create customer')
      }

      const newCustomer = customerResult.data

      // Create loyalty account if requested
      if (data.createLoyaltyAccount) {
        const loyaltyData = {
          customerId: newCustomer.id,
          cardNumber: data.loyaltyCardNumber || `LOY-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
          ,
          tier: data.loyaltyTier,
          currentPoints: data.initialPoints,
          lifetimePoints: data.initialPoints,
          isActive: true
        }

        const loyaltyResult = await createLoyaltyAccount(newCustomer.id, loyaltyData)
        if (!loyaltyResult.success) {
          console.warn('Failed to create loyalty account:', loyaltyResult.error)
          toast.warning('Customer created but loyalty account creation failed')
        }
      }

      // Create credit account if requested
      if (data.createCreditAccount) {
        const creditData = {
          customerId: newCustomer.id,
          accountNumber: data.creditAccountNumber || `CRED-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
          ,
          creditLimit: data.creditLimit,
          currentBalance: 0,
          paymentTerms: data.paymentTerms,
          creditScore: data.creditScore,
          isActive: true
        }

        const creditResult = await createCreditAccount(newCustomer.id, creditData)
        if (!creditResult.success) {
          console.warn('Failed to create credit account:', creditResult.error)
          toast.warning('Customer created but credit account creation failed')
        }
      }

      toast.success('Customer created successfully!')
      onCustomerAdded(newCustomer)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create customer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setValue('firstName', '')
    setValue('lastName', '')
    setValue('email', '')
    setValue('phone', '')
    setValue('street', '')
    setValue('city', '')
    setValue('state', '')
    setValue('zipCode', '')
    setValue('country', 'USA')
    setValue('customerType', 'regular')
    setValue('status', 'active')
    setValue('notes', '')
    setValue('tags', '')
    setValue('createLoyaltyAccount', false)
    setValue('createCreditAccount', false)
    setValue('loyaltyTier', 'bronze')
    setValue('initialPoints', 0)
    setValue('creditLimit', 0)
    setValue('paymentTerms', 30)
    setValue('creditScore', 'fair')
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
    resetForm()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Add New Customer"
      maxWidth="6xl"
      className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[90vh] overflow-hidden"
      headerButtons={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClose} size="sm" className="rounded-full px-4 py-2 text-sm font-semibold" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} size="sm" className="rounded-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Create Customer</span>
              </div>
            )}
          </Button>
        </div>
      }
    >
      <div className="px-6 py-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
        {/* Main Content - Optimized Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Customer Type & Loyalty */}
          <div className="lg:col-span-1 space-y-4">
            {/* Customer Type Selection */}
            <Card className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Customer Type</h3>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'regular', label: 'Regular Customer', icon: <User className="h-4 w-4" /> },
                  { value: 'vip', label: 'VIP Customer', icon: <Crown className="h-4 w-4" /> },
                  { value: 'wholesale', label: 'Wholesale Customer', icon: <Building className="h-4 w-4" /> }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setValue('customerType', type.value as any)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                      watchedValues.customerType === type.value
                        ? 'border-[#E5FF29] bg-[#E5FF29]/10 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-[#E5FF29]/30 hover:bg-[#E5FF29]/5'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      watchedValues.customerType === type.value ? 'bg-[#E5FF29]' : 'bg-gray-100'
                    }`}>
                      {type.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      watchedValues.customerType === type.value ? 'text-black' : 'text-gray-700'
                    }`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Loyalty Program Setup */}
            <Card className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <Gift className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Loyalty Program</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createLoyaltyAccount"
                    {...register('createLoyaltyAccount')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="createLoyaltyAccount" className="text-sm">
                    Create Loyalty Account
                  </Label>
                </div>
                
                {watchedValues.createLoyaltyAccount && (
                  <>
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 mb-2">Starting Tier</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'bronze', label: 'Bronze', color: 'from-orange-600 to-red-600' },
                          { value: 'silver', label: 'Silver', color: 'from-gray-400 to-gray-600' },
                          { value: 'gold', label: 'Gold', color: 'from-yellow-500 to-orange-500' },
                          { value: 'platinum', label: 'Platinum', color: 'from-purple-500 to-pink-500' }
                        ].map((tier) => (
                          <button
                            key={tier.value}
                            onClick={() => setValue('loyaltyTier', tier.value as any)}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                              watchedValues.loyaltyTier === tier.value
                                ? 'border-[#E5FF29] bg-[#E5FF29]/10 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-[#E5FF29]/30 hover:bg-[#E5FF29]/5'
                            }`}
                          >
                            <div className={`w-full h-2 rounded-full bg-gradient-to-r ${tier.color} mb-1`}></div>
                            <span className={`text-xs font-medium ${
                              watchedValues.loyaltyTier === tier.value ? 'text-black' : 'text-gray-700'
                            }`}>{tier.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="initialPoints" className="text-xs font-medium text-gray-700">Initial Points</Label>
                      <Input
                        id="initialPoints"
                        type="number"
                        {...register('initialPoints', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Credit Account Setup */}
            <Card className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Credit Account</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createCreditAccount"
                    {...register('createCreditAccount')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="createCreditAccount" className="text-sm">
                    Create Credit Account
                  </Label>
                </div>
                
                {watchedValues.createCreditAccount && (
                  <>
                    <div>
                      <Label htmlFor="creditLimit" className="text-xs font-medium text-gray-700">Credit Limit ($)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        {...register('creditLimit', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentTerms" className="text-xs font-medium text-gray-700">Payment Terms (days)</Label>
                      <Input
                        id="paymentTerms"
                        type="number"
                        {...register('paymentTerms', { valueAsNumber: true })}
                        placeholder="30"
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="creditScore" className="text-xs font-medium text-gray-700">Credit Score</Label>
                      <select
                        id="creditScore"
                        {...register('creditScore')}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Customer Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <Card className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium text-gray-700">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="John"
                    className={`mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs font-medium text-gray-700">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Doe"
                    className={`mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john.doe@email.com"
                    className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-medium text-gray-700">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                    className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="status" className="text-xs font-medium text-gray-700">Status *</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Address Information */}
            <Card className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
              </div>
              
              <div>
                <Label htmlFor="street" className="text-xs font-medium text-gray-700">Street Address *</Label>
                <Input
                  id="street"
                  {...register('street')}
                  placeholder="123 Main St"
                  className={`mt-1 ${errors.street ? 'border-red-500' : ''}`}
                />
                {errors.street && (
                  <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="city" className="text-xs font-medium text-gray-700">City *</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="New York"
                    className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs font-medium text-gray-700">State *</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="NY"
                    className={`mt-1 ${errors.state ? 'border-red-500' : ''}`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-xs font-medium text-gray-700">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode')}
                    placeholder="10001"
                    className={`mt-1 ${errors.zipCode ? 'border-red-500' : ''}`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="country" className="text-xs font-medium text-gray-700">Country</Label>
                <Input
                  id="country"
                  {...register('country')}
                  placeholder="USA"
                  defaultValue="USA"
                  className="mt-1"
                />
              </div>
            </Card>

            {/* Additional Information */}
            <Card className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Additional Information</h3>
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-xs font-medium text-gray-700">Notes</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional notes about the customer..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md h-20 resize-none text-sm"
                />
              </div>
              
              <div className="mt-4">
                <Label htmlFor="tags" className="text-xs font-medium text-gray-700">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  {...register('tags')}
                  placeholder="vip, premium, wholesale"
                  className="mt-1"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  )
} 