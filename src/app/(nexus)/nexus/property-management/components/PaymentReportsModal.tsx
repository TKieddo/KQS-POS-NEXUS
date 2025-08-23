"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Building2,
  DollarSign,
  FileText,
  PieChart,
  AlertCircle
} from 'lucide-react'
import type { Payment, Tenant, Building } from '../types/property'

const reportFormSchema = z.object({
  report_type: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  building_filter: z.string().optional(),
  include_details: z.boolean(),
})

type ReportFormData = z.infer<typeof reportFormSchema>

interface PaymentWithNames extends Payment {
  tenant_name: string
  building_name: string
}

interface TenantWithBuilding extends Tenant {
  building_name: string
}

interface PaymentReportsModalProps {
  payments: PaymentWithNames[]
  tenants: TenantWithBuilding[]
  buildings: Building[]
  onGenerate: (data: ReportFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PaymentReportsModal: React.FC<PaymentReportsModalProps> = ({
  payments,
  tenants,
  buildings,
  onGenerate,
  onCancel,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('summary')
  const [buildingFilter, setBuildingFilter] = useState<string>('all')
  const [monthRange, setMonthRange] = useState<number>(6)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      report_type: 'monthly',
      start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      building_filter: 'all',
      include_details: true,
    }
  })

  const reportType = watch('report_type')

  // Calculate statistics
  const totalPayments = payments.length
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const overdueTenants = tenants.filter(t => t.payment_status === 'overdue').length
  const paidTenants = tenants.filter(t => t.payment_status === 'paid').length
  const collectionRate = totalAmount / (buildings.reduce((sum, b) => sum + b.total_rent, 0)) * 100

  // Payment methods breakdown
  const paymentMethods = payments.reduce((acc, payment) => {
    acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Monthly trends (based on slider)
  const monthlyTrends = Array.from({ length: monthRange }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const monthPayments = payments.filter(p => {
      const paymentDate = new Date(p.payment_date)
      return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear()
    })
    return {
      month: monthYear,
      amount: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      count: monthPayments.length
    }
  }).reverse()

  const onSubmit = async (data: ReportFormData) => {
    data.building_filter = buildingFilter
    await onGenerate(data)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Payment Reports & Analytics</h3>
        <p className="text-sm text-gray-600 mt-1">
          Generate comprehensive payment reports and insights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-16rem)] flex flex-col">
        <TabsList className="flex-none grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-gray-200 rounded-2xl p-1 shadow-lg">
          <TabsTrigger value="summary" className="rounded-xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">
            Summary
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-[#E5FF29] data-[state=active]:text-black data-[state=active]:shadow-lg transition-all duration-300">
            Generate
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="flex-1 overflow-y-auto space-y-3 p-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Payments */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Total Payments</span>
                <DollarSign className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div className="mt-1">
                <div className="text-xl font-bold text-gray-900">{totalPayments}</div>
                <p className="text-xs text-gray-600">This period</p>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div className="mt-1">
                <div className="text-xl font-bold text-gray-900">${totalAmount.toLocaleString()}</div>
                <p className="text-xs text-gray-600">Collected</p>
              </div>
            </div>

            {/* Collection Rate */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                <PieChart className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div className="mt-1">
                <div className="text-xl font-bold text-gray-900">{collectionRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Success rate</p>
              </div>
            </div>

            {/* Overdue Count */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Overdue</span>
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              </div>
              <div className="mt-1">
                <div className="text-xl font-bold text-red-600">{overdueTenants}</div>
                <p className="text-xs text-gray-600">Requires attention</p>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Methods</span>
              <Badge variant="outline" className="text-xs font-normal">
                Distribution
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(paymentMethods).map(([method, count]) => (
                <div key={method} className="text-center p-2 bg-gray-50/80 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-base font-semibold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">{method.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="flex-1 overflow-hidden flex flex-col">
          {/* Time Range Slider - Full Width */}
          <div className="flex-none mb-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Time Range</span>
              <span className="text-sm font-medium text-[#E5FF29] bg-black/90 px-2 py-0.5 rounded">
                {monthRange} months
              </span>
            </div>
            <div className="px-1">
              <Slider
                value={[monthRange]}
                onValueChange={(value: number[]) => setMonthRange(value[0])}
                min={3}
                max={12}
                step={1}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:border-2"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>3 months</span>
                <span>12 months</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout - Scrollable */}
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 overflow-y-auto pb-4">
            {/* Left Column - Monthly Trends */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Monthly Payment Trends</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Last {monthRange} months
                </Badge>
              </div>
              <div className="space-y-3">
                {monthlyTrends.map((trend, index) => {
                  const maxAmount = Math.max(...monthlyTrends.map(t => t.amount));
                  const percentage = (trend.amount / maxAmount) * 100;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50/80 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-none w-24">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span className="font-medium text-sm text-gray-900">{trend.month}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">{trend.count} payments</div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className="relative h-6 bg-gray-100 rounded">
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#E5FF29] rounded transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 transform translate-x-full ml-2 text-sm font-semibold">
                              ${trend.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Building Performance */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Building Performance</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Collection Rate
                </Badge>
              </div>
              <div className="space-y-3">
                {buildings.map((building) => {
                  const buildingRate = (building.collected_rent / building.total_rent) * 100;
                  const maxRent = Math.max(...buildings.map(b => b.total_rent));
                  const collectedPercentage = (building.collected_rent / maxRent) * 100;
                  const totalPercentage = (building.total_rent / maxRent) * 100;
                  
                  return (
                    <div key={building.id} className="flex flex-col p-2 bg-gray-50/80 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-3.5 w-3.5 text-gray-500" />
                          <span className="font-medium text-sm text-gray-900">{building.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          buildingRate >= 90 ? 'text-green-600' : 
                          buildingRate >= 70 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {buildingRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="relative h-4 bg-gray-100 rounded overflow-hidden">
                          {/* Total Expected Bar */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-gray-200 transition-all duration-500"
                            style={{ width: `${totalPercentage}%` }}
                          />
                          {/* Collected Bar */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#E5FF29] transition-all duration-500"
                            style={{ width: `${collectedPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Collected</span>
                          <span className="text-xs">
                            <span className="font-medium">${building.collected_rent.toLocaleString()}</span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-gray-600">${building.total_rent.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="flex-1 overflow-y-auto space-y-3 p-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Report Configuration */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Report Configuration</span>
                <Badge variant="outline" className="text-xs font-normal">
                  Generate Report
                </Badge>
              </div>
              <div className="space-y-3">
                {/* Report Type */}
                <div className="space-y-2">
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select onValueChange={(value) => setValue('report_type', value as any)}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-md">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="quarterly">Quarterly Report</SelectItem>
                      <SelectItem value="yearly">Yearly Report</SelectItem>
                      <SelectItem value="custom">Custom Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...register('start_date')}
                      className="bg-white border-gray-300 rounded-md"
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-600">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...register('end_date')}
                      className="bg-white border-gray-300 rounded-md"
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-600">{errors.end_date.message}</p>
                    )}
                  </div>
                </div>

                {/* Building Filter */}
                <div className="space-y-2">
                  <Label htmlFor="building_filter">Building Filter</Label>
                  <Select onValueChange={setBuildingFilter}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-md">
                      <SelectValue placeholder="All Buildings" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="all">All Buildings</SelectItem>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.name}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-white border-gray-300 hover:bg-gray-50 rounded-md h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md h-9"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3" />
                    <span>Generate Report</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PaymentReportsModal