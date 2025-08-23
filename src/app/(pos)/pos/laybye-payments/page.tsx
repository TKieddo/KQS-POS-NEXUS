"use client"

import React, { useEffect, useState } from 'react'
import { LayByePaymentsPage } from '@/features/laybye/components/LayByePaymentsPage'
import { useBranch } from '@/context/BranchContext'
import { getLaybyeOrders, addLaybyePayment, cancelLaybyeOrder } from '@/lib/laybye-service'

interface LayByeContract {
  id: string
  contractNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address?: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  paymentSchedule?: 'weekly' | 'biweekly' | 'monthly'
  paymentAmount?: number
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

export default function LayByePaymentsPageContainer() {
  const { selectedBranch } = useBranch()
  const [contracts, setContracts] = useState<LayByeContract[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadContracts = async () => {
    setIsLoading(true)
    try {
      const branchId = selectedBranch?.id
      const { success, data } = await getLaybyeOrders({
        branch_id: branchId && branchId !== '00000000-0000-0000-0000-000000000001' ? branchId : undefined,
        limit: 200
      })
      if (success && data) {
        const transformed: LayByeContract[] = data.map((order: any) => ({
          id: order.id,
          contractNumber: order.order_number,
          customer: {
            id: order.customer_id || '',
            name: order.customers ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() || (order.customers.email || 'Unknown') : 'Unknown',
            email: order.customers?.email || '',
            phone: order.customers?.phone || '',
            address: ''
          },
          items: (order.laybye_items || []).map((it: any) => ({
            name: it.products?.name || 'Product',
            quantity: it.quantity,
            price: it.unit_price
          })),
          totalAmount: order.total_amount || 0,
          depositAmount: order.deposit_amount || 0,
          remainingAmount: order.remaining_amount ?? order.remaining_balance ?? Math.max(0, (order.total_amount || 0) - (order.deposit_amount || 0)),
          startDate: order.created_at,
          endDate: order.due_date,
          status: order.status,
          payments: (order.laybye_payments || []).map((p: any) => ({
            id: p.id,
            amount: p.amount,
            date: p.payment_date?.split('T')[0] || p.payment_date,
            method: (p.payment_method as 'cash' | 'card' | 'transfer') || 'cash',
            notes: p.notes || ''
          })),
          createdAt: order.created_at,
          updatedAt: order.updated_at
        }))
        setContracts(transformed)
      } else {
        setContracts([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContracts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch?.id])

  const handleProcessPayment = async (paymentData: { amount: number; method: 'cash' | 'card' | 'transfer'; notes?: string }) => {
    // The LayByePaymentsPage sets selectedContract internally; here we reload after modal submission handled inside
    // For simplicity, we cannot access selected id here; after addLaybyePayment in modal, we'll reload externally
    // This function is a passthrough to allow modal to trigger reload afterward
    await new Promise(resolve => setTimeout(resolve, 10))
    await loadContracts()
  }

  const handleProcessCancellation = async (contractId: string, reason: string) => {
    const { success } = await cancelLaybyeOrder(contractId)
    if (success) await loadContracts()
  }

  return (
    <LayByePaymentsPage
      contracts={contracts}
      isLoading={isLoading}
      onAddPayment={() => {}}
      onCancelContract={() => {}}
      onProcessPayment={async (paymentData) => {
        // Payment modal will call addLaybyePayment directly from inside; we just refresh list here
        await handleProcessPayment(paymentData)
      }}
      onProcessCancellation={handleProcessCancellation}
    />
  )
}