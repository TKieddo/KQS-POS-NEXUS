'use client'

import { useState, useEffect } from 'react'
import { User, CreditCard, Crown, MapPin, Save, Phone, Mail, Calendar, Building, Gift } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { PremiumCard } from '@/components/ui/premium-card'
import { Modal } from '@/components/ui/modal'
import { Customer } from '../types'
import { CustomersService } from '../services/customers-service'
import { toast } from 'sonner'
import React from 'react'

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onCustomerUpdated: (customer: Customer) => void
}

export const EditCustomerModal = ({ isOpen, onClose, customer, onCustomerUpdated }: EditCustomerModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    customerType: 'regular' as 'regular' | 'vip' | 'wholesale',
    notes: '',
    tags: [] as string[],
    creditAccount: {
      isActive: false,
      creditLimit: 0,
      paymentTerms: 30
    },
    loyaltyAccount: {
      cardNumber: '',
      tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when customer is provided
  React.useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || '',
        address: customer.address,
        customerType: customer.customerType,
        notes: customer.notes || '',
        tags: customer.tags,
        creditAccount: {
          isActive: customer.creditAccount?.isActive ?? false,
          creditLimit: customer.creditAccount?.creditLimit ?? 0,
          paymentTerms: customer.creditAccount?.paymentTerms ?? 30
        },
        loyaltyAccount: {
          cardNumber: customer.loyaltyAccount?.cardNumber || '',
          tier: customer.loyaltyAccount?.tier || 'bronze'
        }
      })
    }
  }, [customer, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    console.log('Form data:', formData)
    console.log('Credit account data:', formData.creditAccount)
    console.log('Loyalty account data:', formData.loyaltyAccount)

    const customerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      address: formData.address,
      status: 'active' as const,
      customerType: formData.customerType,
      notes: formData.notes,
      tags: formData.tags,
      totalPurchases: customer?.totalPurchases || 0,
      totalSpent: customer?.totalSpent || 0,
      creditAccount: formData.creditAccount.isActive ? {
        isActive: formData.creditAccount.isActive,
        creditLimit: formData.creditAccount.creditLimit,
        paymentTerms: formData.creditAccount.paymentTerms
      } : undefined,
      loyaltyAccount: {
        cardNumber: formData.loyaltyAccount.cardNumber || customer?.loyaltyAccount?.cardNumber,
        tier: formData.loyaltyAccount.tier,
        nextTierPoints: getNextTierPoints(formData.loyaltyAccount.tier),
        pointsToNextTier: getNextTierPoints(formData.loyaltyAccount.tier)
      }
    }

    try {
      // Call the real service to update the customer
      const { data: updatedCustomer, error } = await CustomersService.updateCustomer(customer!.id, customerData)
      
      if (error) {
        console.error('Failed to update customer:', error)
        toast.error(`Failed to update customer: ${error}`)
        return
      }

      if (updatedCustomer) {
        onCustomerUpdated(updatedCustomer)
        toast.success(`Customer ${updatedCustomer.firstName} ${updatedCustomer.lastName} updated successfully!`)
        onClose()
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('An unexpected error occurred while updating the customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNextTierPoints = (tier: string) => {
    switch (tier) {
      case 'bronze': return 1000
      case 'silver': return 5000
      case 'gold': return 15000
      case 'platinum': return 50000
      default: return 1000
    }
  }

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'wholesale': return <Building className="h-4 w-4 text-blue-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-pink-500'
      case 'gold': return 'from-yellow-500 to-orange-500'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'bronze': return 'from-orange-600 to-red-600'
      default: return 'from-orange-600 to-red-600'
    }
  }

  if (!customer) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Edit Customer - ${customer.firstName} ${customer.lastName}`}
      maxWidth="6xl"
      className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[90vh] overflow-hidden"
      headerButtons={
        <div className="flex gap-2">
          <PremiumButton variant="outline" onClick={onClose} size="sm" className="rounded-full px-4 py-2 text-sm font-semibold">
            Cancel
          </PremiumButton>
                     <PremiumButton 
             onClick={handleSubmit} 
             gradient="blue" 
             size="sm" 
             icon={Save} 
             className="rounded-full px-4 py-2 text-sm font-semibold"
             disabled={isSubmitting}
           >
             {isSubmitting ? 'Updating...' : 'Update Customer'}
           </PremiumButton>
        </div>
      }
    >
      <div className="px-6 py-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
        {/* Main Content - Optimized Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Customer Type & Loyalty */}
          <div className="lg:col-span-1 space-y-4">
            {/* Customer Type Selection */}
            <PremiumCard variant="default" className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
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
                    onClick={() => updateFormData('customerType', type.value)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                      formData.customerType === type.value
                        ? 'border-[#E5FF29] bg-[#E5FF29]/10 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-[#E5FF29]/30 hover:bg-[#E5FF29]/5'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      formData.customerType === type.value ? 'bg-[#E5FF29]' : 'bg-gray-100'
                    }`}>
                      {type.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      formData.customerType === type.value ? 'text-black' : 'text-gray-700'
                    }`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </PremiumCard>

            {/* Loyalty Program Setup */}
            <PremiumCard variant="default" className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <Gift className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Loyalty Program</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Tier</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'bronze', label: 'Bronze', color: 'from-orange-600 to-red-600' },
                      { value: 'silver', label: 'Silver', color: 'from-gray-400 to-gray-600' },
                      { value: 'gold', label: 'Gold', color: 'from-yellow-500 to-orange-500' },
                      { value: 'platinum', label: 'Platinum', color: 'from-purple-500 to-pink-500' }
                    ].map((tier) => (
                      <button
                        key={tier.value}
                        onClick={() => updateFormData('loyaltyAccount.tier', tier.value)}
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          formData.loyaltyAccount.tier === tier.value
                            ? 'border-[#E5FF29] bg-[#E5FF29]/10 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-[#E5FF29]/30 hover:bg-[#E5FF29]/5'
                        }`}
                      >
                        <div className={`w-full h-2 rounded-full bg-gradient-to-r ${tier.color} mb-1`}></div>
                        <span className={`text-xs font-medium ${
                          formData.loyaltyAccount.tier === tier.value ? 'text-black' : 'text-gray-700'
                        }`}>{tier.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <PremiumInput
                  label="Loyalty Card Number"
                  value={formData.loyaltyAccount.cardNumber}
                  onChange={(e) => updateFormData('loyaltyAccount.cardNumber', e.target.value)}
                  placeholder="Card number"
                  size="sm"
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
                />
              </div>
            </PremiumCard>

            {/* Credit Account Toggle */}
            <PremiumCard variant="default" className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Credit Account</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Enable Credit</span>
                  <button 
                    type="button" 
                    role="switch" 
                    aria-checked={formData.creditAccount.isActive} 
                    onClick={() => updateFormData('creditAccount.isActive', !formData.creditAccount.isActive)} 
                    className={`relative w-12 h-6 flex items-center px-1 rounded-full transition-colors duration-200 border border-[#E5FF29] focus:outline-none focus:ring-2 focus:ring-[#E5FF29]/20 ${
                      formData.creditAccount.isActive ? 'bg-[#E5FF29]' : 'bg-gray-100'
                    }`}
                  > 
                    <span className={`absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-transform duration-200 shadow ${
                      formData.creditAccount.isActive ? 'translate-x-6 bg-white' : 'translate-x-0 bg-white'
                    }`} /> 
                  </button>
                </div>
                
                {formData.creditAccount.isActive && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <PremiumInput
                      label="Credit Limit"
                      type="number"
                      value={formData.creditAccount.creditLimit}
                      onChange={(e) => updateFormData('creditAccount.creditLimit', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      size="sm"
                      className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
                    />
                    <PremiumInput
                      label="Payment Terms (days)"
                      type="number"
                      value={formData.creditAccount.paymentTerms}
                      onChange={(e) => updateFormData('creditAccount.paymentTerms', parseInt(e.target.value) || 30)}
                      placeholder="30"
                      size="sm"
                      className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]"
                    />
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>

          {/* Right Column: Customer Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal Information */}
            <PremiumCard variant="default" className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumInput 
                  label="First Name *" 
                  value={formData.firstName} 
                  onChange={(e) => updateFormData('firstName', e.target.value)} 
                  placeholder="Enter first name" 
                  size="sm" 
                  error={errors.firstName}
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="Last Name *" 
                  value={formData.lastName} 
                  onChange={(e) => updateFormData('lastName', e.target.value)} 
                  placeholder="Enter last name" 
                  size="sm" 
                  error={errors.lastName}
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="Email" 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => updateFormData('email', e.target.value)} 
                  placeholder="Enter email address" 
                  size="sm" 
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="Phone *" 
                  value={formData.phone} 
                  onChange={(e) => updateFormData('phone', e.target.value)} 
                  placeholder="Enter phone number" 
                  size="sm" 
                  error={errors.phone}
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="Date of Birth" 
                  type="date"
                  value={formData.dateOfBirth} 
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)} 
                  size="sm" 
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 focus:border-[#E5FF29] focus:ring-2 focus:ring-[#E5FF29]/20 rounded-xl transition-all duration-300 text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </PremiumCard>

            {/* Address Information */}
            <PremiumCard variant="default" className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <PremiumInput 
                    label="Street Address" 
                    value={formData.address.street} 
                    onChange={(e) => updateFormData('address.street', e.target.value)} 
                    placeholder="Enter street address" 
                    size="sm" 
                    className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                  />
                </div>
                <PremiumInput 
                  label="City" 
                  value={formData.address.city} 
                  onChange={(e) => updateFormData('address.city', e.target.value)} 
                  placeholder="Enter city" 
                  size="sm" 
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="State" 
                  value={formData.address.state} 
                  onChange={(e) => updateFormData('address.state', e.target.value)} 
                  placeholder="Enter state" 
                  size="sm" 
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="ZIP Code" 
                  value={formData.address.zipCode} 
                  onChange={(e) => updateFormData('address.zipCode', e.target.value)} 
                  placeholder="Enter ZIP code" 
                  size="sm" 
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
                <PremiumInput 
                  label="Country" 
                  value={formData.address.country} 
                  onChange={(e) => updateFormData('address.country', e.target.value)} 
                  placeholder="United States" 
                  size="sm" 
                  className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
                />
              </div>
            </PremiumCard>

            {/* Notes */}
            <PremiumCard variant="default" className="p-4 shadow-sm rounded-xl border border-gray-200/60 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-black" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Additional Notes</h3>
              </div>
              
              <PremiumInput 
                value={formData.notes} 
                onChange={(e) => updateFormData('notes', e.target.value)} 
                placeholder="Add any additional notes about the customer..." 
                as="textarea" 
                rows={3} 
                size="sm" 
                className="bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29]" 
              />
            </PremiumCard>
          </div>
        </div>
      </div>
    </Modal>
  )
} 