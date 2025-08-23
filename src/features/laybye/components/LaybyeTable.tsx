'use client'

import React, { useState, useEffect } from 'react'
import { Eye, Phone, Mail, MoreHorizontal, Calendar, AlertTriangle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export interface LaybyeItem {
  id: string
  customer: {
    name: string
    phone: string
    email: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  totalValue: number
  depositPaid: number
  balanceRemaining: number
  startDate: string
  dueDate: string
  nextPaymentDate: string
  status: 'active' | 'overdue' | 'completed' | 'cancelled'
  daysOverdue: number
  lastPaymentDate?: string
  notes?: string
}

interface LaybyeTableProps {
  laybyes: LaybyeItem[]
  onViewDetails: (laybye: LaybyeItem) => void
  onCallCustomer: (laybye: LaybyeItem) => void
  onSendReminder: (laybye: LaybyeItem) => void
  onRecordPayment: (laybye: LaybyeItem) => void
}

export function LaybyeTable({ 
  laybyes, 
  onViewDetails, 
  onCallCustomer, 
  onSendReminder,
  onRecordPayment 
}: LaybyeTableProps) {
  const getStatusBadge = (status: string, daysOverdue: number) => {
    if (daysOverdue > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Overdue
        </span>
      )
    }
    
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Lay-bye ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {laybyes.map((laybye) => (
              <tr key={laybye.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-[hsl(var(--primary))]">
                      {laybye.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Started {new Date(laybye.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-[hsl(var(--primary))]">
                      {laybye.customer.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {laybye.customer.phone}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[hsl(var(--primary))]">
                    {laybye.items.length} items
                  </div>
                  <div className="text-xs text-gray-500">
                    {laybye.items[0].name}
                    {laybye.items.length > 1 && ` +${laybye.items.length - 1} more`}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(laybye.totalValue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Deposit: {formatCurrency(laybye.depositPaid)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-orange-600">
                    {formatCurrency(laybye.balanceRemaining)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[hsl(var(--primary))]">
                    {new Date(laybye.dueDate).toLocaleDateString()}
                  </div>
                  {laybye.daysOverdue > 0 && (
                    <div className="text-xs text-red-600 font-medium">
                      {laybye.daysOverdue} days overdue
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(laybye.status, laybye.daysOverdue)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(laybye)}
                      className="border-gray-200 hover:bg-gray-50"
                      title="View Details"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCallCustomer(laybye)}
                      className="border-gray-200 hover:bg-gray-50"
                      title="Call Customer"
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSendReminder(laybye)}
                      className="border-gray-200 hover:bg-gray-50"
                      title="Send Reminder"
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecordPayment(laybye)}
                      className="border-gray-200 hover:bg-gray-50"
                      title="Record Payment"
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {laybyes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No lay-byes found</p>
            <p className="text-sm">Create your first lay-bye to get started</p>
          </div>
        </div>
      )}
    </Card>
  )
} 