'use client'

import React from 'react'
import { Calendar, Clock, RefreshCw, Package } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SalesList } from './SalesList'

interface Sale {
  id: string
  receiptNumber: string
  customerName: string
  date: string
  time: string
  total: number
  items: number
  status: 'completed' | 'refunded' | 'partially_refunded'
  paymentMethod: string
  refundedAmount?: number
  refundedItems?: number
}

interface RefundTabsProps {
  sales: Sale[]
  onRefundItem: (sale: Sale) => void
  onRefundSale: (sale: Sale) => void
  activeTab: string
  onTabChange: (value: string) => void
}

export const RefundTabs: React.FC<RefundTabsProps> = ({
  sales,
  onRefundItem,
  onRefundSale,
  activeTab,
  onTabChange
}) => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const todaySales = sales.filter(s => s.date === today)
  const recentSales = sales.filter(s => {
    const saleDate = new Date(s.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return saleDate >= weekAgo
  })
  const refundedSales = sales.filter(s => s.status === 'refunded' || s.status === 'partially_refunded')

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="today" className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Today</span>
        </TabsTrigger>
        <TabsTrigger value="recent" className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Recent</span>
        </TabsTrigger>
        <TabsTrigger value="refunded" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refunded</span>
        </TabsTrigger>
        <TabsTrigger value="all" className="flex items-center space-x-2">
          <Package className="h-4 w-4" />
          <span>All Sales</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="today" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesList 
              sales={todaySales}
              onRefundItem={onRefundItem}
              onRefundSale={onRefundSale}
              title="Today's Sales"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recent" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesList 
              sales={recentSales}
              onRefundItem={onRefundItem}
              onRefundSale={onRefundSale}
              title="Recent Sales"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="refunded" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Refunded Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesList 
              sales={refundedSales}
              onRefundItem={onRefundItem}
              onRefundSale={onRefundSale}
              title="Refunded Sales"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="all" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>All Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesList 
              sales={sales}
              onRefundItem={onRefundItem}
              onRefundSale={onRefundSale}
              title="All Sales"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 