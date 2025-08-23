'use client'

import React, { useState, useEffect } from 'react'
import { SalespersonPage } from '@/features/sales/components/SalespersonPage'

// Mock data for development
const mockSalespeople = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@kqs.com',
    phone: '+1234567890',
    employeeId: 'EMP001',
    position: 'cashier' as const,
    hireDate: '2023-01-15',
    status: 'active' as const,
    commission: 5.0,
    totalSales: 156,
    totalRevenue: 23450.75,
    salesThisMonth: 23,
    revenueThisMonth: 3450.25,
    avatar: undefined,
    notes: 'Excellent customer service skills',
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Bob Davis',
    email: 'bob.davis@kqs.com',
    phone: '+1234567891',
    employeeId: 'EMP002',
    position: 'sales_associate' as const,
    hireDate: '2023-03-20',
    status: 'active' as const,
    commission: 7.5,
    totalSales: 234,
    totalRevenue: 45678.90,
    salesThisMonth: 34,
    revenueThisMonth: 6789.50,
    avatar: undefined,
    notes: 'Great at upselling and product knowledge',
    createdAt: '2023-03-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol.white@kqs.com',
    phone: '+1234567892',
    employeeId: 'EMP003',
    position: 'manager' as const,
    hireDate: '2022-11-10',
    status: 'active' as const,
    commission: 10.0,
    totalSales: 89,
    totalRevenue: 12345.67,
    salesThisMonth: 12,
    revenueThisMonth: 1890.75,
    avatar: undefined,
    notes: 'Team leader with strong management skills',
    createdAt: '2022-11-10T10:00:00Z'
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'david.brown@kqs.com',
    phone: '+1234567893',
    employeeId: 'EMP004',
    position: 'supervisor' as const,
    hireDate: '2023-06-05',
    status: 'inactive' as const,
    commission: 8.0,
    totalSales: 67,
    totalRevenue: 9876.54,
    salesThisMonth: 0,
    revenueThisMonth: 0,
    avatar: undefined,
    notes: 'On leave until further notice',
    createdAt: '2023-06-05T10:00:00Z'
  }
]

export default function SalespersonContainer() {
  const [salespeople, setSalespeople] = useState(mockSalespeople)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddSalesperson = (newSalesperson: any) => {
    const salesperson = {
      ...newSalesperson,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    setSalespeople(prev => [...prev, salesperson])
    // TODO: Save to Supabase
    console.log('Add salesperson:', salesperson)
  }

  const handleUpdateSalesperson = (id: string, updates: any) => {
    setSalespeople(prev => prev.map(sp => 
      sp.id === id ? { ...sp, ...updates } : sp
    ))
    // TODO: Update in Supabase
    console.log('Update salesperson:', id, updates)
  }

  const handleDeleteSalesperson = (id: string) => {
    setSalespeople(prev => prev.filter(sp => sp.id !== id))
    // TODO: Delete from Supabase
    console.log('Delete salesperson:', id)
  }

  return (
    <SalespersonPage
      salespeople={salespeople}
      isLoading={isLoading}
      onAddSalesperson={handleAddSalesperson}
      onUpdateSalesperson={handleUpdateSalesperson}
      onDeleteSalesperson={handleDeleteSalesperson}
    />
  )
} 