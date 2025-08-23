'use client'

import React from 'react'
import { ArrowLeft, BarChart3, TrendingUp, Download, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <PageHeader
        title="Sales Reports"
        backButtonText="Back"
        icon={<BarChart3 className="h-4 w-4 text-black" />}
      >
        <Button
          className="h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 text-xs"
        >
          <Download className="h-3 w-3 mr-2" />
          Export Report
        </Button>
      </PageHeader>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-6">
          <div className="text-center py-8">
            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">Sales Reports</h3>
            <p className="text-xs text-gray-500 mb-4">View sales analytics and reports</p>
            <p className="text-xs text-gray-400">Sales reports functionality coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
} 