'use client'

import React from 'react'
import { User, Calendar, DollarSign, Plus, XCircle, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface LayByeContract {
  id: string
  contractNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly'
  paymentAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
  payments: Array<{
    id: string
    amount: number
    date: string
    method: 'cash' | 'card' | 'transfer'
    notes?: string
  }>
  createdAt: string
  updatedAt: string
}

interface LayByeContractCardProps {
  contract: LayByeContract
  onAddPayment: () => void
  onCancelContract: () => void
  onViewDetails?: () => void
  onEditDetails?: () => void
  getProgressPercentage: (contract: LayByeContract) => number
}

export const LayByeContractCard: React.FC<LayByeContractCardProps> = ({
  contract,
  onAddPayment,
  onCancelContract,
  onViewDetails,
  onEditDetails,
  getProgressPercentage
}) => {
  const getStatusColor = (status: LayByeContract['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: LayByeContract['status']) => {
    switch (status) {
      case 'active': return <DollarSign className="h-4 w-4" />
      case 'completed': return <Calendar className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const getNextPaymentDate = (contract: LayByeContract) => {
    if (contract.status !== 'active') return null
    
    const lastPayment = contract.payments[contract.payments.length - 1]
    if (!lastPayment) return contract.startDate
    
    const lastPaymentDate = new Date(lastPayment.date)
    const nextDate = new Date(lastPaymentDate)
    
    switch (contract.paymentSchedule) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14)
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
    }
    
    return nextDate.toISOString().split('T')[0]
  }

  const progressPercentage = getProgressPercentage(contract)
  const nextPaymentDate = getNextPaymentDate(contract)

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-base">{contract.contractNumber}</h3>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-300 ${getStatusColor(contract.status)}`}>
            {getStatusIcon(contract.status)}
            <span className="ml-2 capitalize">{contract.status}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Due: {nextPaymentDate || 'N/A'}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/30 to-white/50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 text-base">{contract.customer.name}</h4>
        </div>
        <p className="text-sm text-gray-600 font-medium">{contract.customer.phone}</p>
      </div>

      {/* Progress */}
      <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-green-50/30 to-white/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-600">Total:</span>
            <span className="ml-1 font-semibold text-gray-900">{formatCurrency(contract.totalAmount)}</span>
          </div>
          <div>
            <span className="text-gray-600">Remaining:</span>
            <span className="ml-1 font-semibold text-gray-900">{formatCurrency(contract.remainingAmount)}</span>
          </div>
          <div>
            <span className="text-gray-600">Deposit:</span>
            <span className="ml-1 font-semibold text-gray-900">{formatCurrency(contract.depositAmount)}</span>
          </div>
          <div>
            <span className="text-gray-600">Payment:</span>
            <span className="ml-1 font-semibold text-gray-900">{formatCurrency(contract.paymentAmount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white/50">
        <div className="space-y-3">
          {contract.status === 'active' && (
            <Button
              onClick={onAddPayment}
              className="w-full h-12 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          )}
          
          {contract.status === 'active' && (
            <Button
              variant="outline"
              onClick={onCancelContract}
              className="w-full h-10 rounded-xl border-red-200 hover:bg-red-50 text-red-600 transition-all duration-300 text-sm font-medium"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Contract
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="h-10 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
            >
              View Details
            </Button>
            <Button
              variant="outline"
              onClick={onEditDetails}
              className="h-10 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 