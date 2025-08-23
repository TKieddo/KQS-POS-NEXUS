'use client'

import React from 'react'
import { ArrowLeft, Users, Search, Filter, UserPlus, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <PageHeader
        title="Customer Management"
        backButtonText="Back"
        icon={<Users className="h-4 w-4 text-black" />}
      >
        <Button
          className="h-10 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 text-xs"
        >
          <UserPlus className="h-3 w-3 mr-2" />
          Add Customer
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  className="pl-8 h-8 rounded-lg border-gray-200 focus:border-[#E5FF29] focus:ring-[#E5FF29]/20 transition-all duration-200 text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-3 w-3 text-gray-400" />
              <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E5FF29]/20 focus:border-[#E5FF29] h-8">
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="credit">Credit Accounts</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100/50 shadow-lg p-6">
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">Customer Management</h3>
            <p className="text-xs text-gray-500 mb-4">Manage customer accounts and information</p>
            <p className="text-xs text-gray-400">Customer management functionality coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
} 