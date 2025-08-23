'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  ShoppingCart, 
  Users, 
  Calendar, 
  ClipboardList, 
  Receipt, 
  Package, 
  Home, 
  UserCheck, 
  BarChart3,
  ArrowRight,
  Crown,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface Branch {
  id: string
  name: string
  address: string | null
  is_active: boolean
}

export default function LandingPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, address, is_active')
          .eq('is_active', true)
          .order('name')

        if (error) {
          console.error('Error fetching branches:', error)
      } else {
          setBranches(data || [])
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  const handleSystemSelect = (system: any) => {
    // For systems that require authentication, redirect to login with the appropriate redirect parameter
    if (system.id === 'nexus' || system.id === 'admin') {
      router.push(`/login?redirect=${system.id}`)
    } else {
      // POS doesn't require authentication, go directly
      router.push(system.path)
    }
  }

  const handleBranchPOSSelect = (branchName: string) => {
    // Navigate to branch-specific POS
    router.push(`/pos/${encodeURIComponent(branchName)}`)
  }

  const systems = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Complete business management system',
      icon: Building2,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      features: [
        'User & Employee Management',
        'Sales & Analytics',
        'Settings & Configuration',
        'System Administration'
      ],
      path: '/admin'
    },
    {
      id: 'nexus',
      title: 'POS Nexus',
      description: 'Unified business management platform',
      icon: Crown,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      features: [
        'Employee Management & Absence Tracker',
        'Task Planner & Workflow',
        'Bookkeeping & Expense Tracker',
        'Stock & Inventory Management',
        'Property & Rent Management',
        'User Onboarding Module',
        'Advanced Reporting Dashboard'
      ],
      path: '/nexus'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KQS Business Systems</h1>
                <p className="text-sm text-gray-600">Choose your platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to KQS Business Systems
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the platform that best suits your needs. Each system is designed to handle specific aspects of your business operations.
          </p>
        </div>

        {/* System Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {systems.map((system) => {
            const IconComponent = system.icon
    return (
              <Card 
                key={system.id}
                className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-white rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => handleSystemSelect(system)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${system.color} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900">{system.title}</CardTitle>
                      <p className="text-gray-600">{system.description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {system.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full ${system.bgColor} flex items-center justify-center`}>
                          <div className={`w-2 h-2 rounded-full ${system.textColor}`}></div>
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full mt-6 bg-gradient-to-r ${system.color} hover:opacity-90 text-white font-medium rounded-xl h-12 group-hover:shadow-lg transition-all duration-200`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSystemSelect(system)
                    }}
                  >
                    Access {system.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Branch-Specific POS Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Point of Sale - Branch Access</h3>
            <p className="text-lg text-gray-600">
              Select your branch to access the POS system directly. Each branch has its own dedicated POS interface.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-gray-600">Loading branches...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card 
                  key={branch.id}
                  className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-green-300 bg-white rounded-3xl overflow-hidden cursor-pointer"
                  onClick={() => handleBranchPOSSelect(branch.name)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                        <Store className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900">{branch.name}</CardTitle>
                        <p className="text-gray-600">POS System</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-sm text-gray-700">Quick Sales Processing</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-sm text-gray-700">Branch-Specific Inventory</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                        <span className="text-sm text-gray-700">Customer Transactions</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white font-medium rounded-xl h-12 group-hover:shadow-lg transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBranchPOSSelect(branch.name)
                      }}
                    >
                      Access {branch.name} POS
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Comparison</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-blue-700 mb-3">Admin Dashboard</h4>
              <p className="text-sm text-gray-600">Perfect for business owners and managers who need comprehensive control over all aspects of their business operations.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-green-700 mb-3">Branch POS Systems</h4>
              <p className="text-sm text-gray-600">Dedicated POS interfaces for each branch location, optimized for fast transactions and branch-specific operations.</p>
            </div>
        <div className="text-center">
              <h4 className="font-semibold text-purple-700 mb-3">POS Nexus</h4>
              <p className="text-sm text-gray-600">The ultimate unified platform for businesses that need everything in one place - from HR to inventory to property management.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 KQS Business Systems. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    )
}
