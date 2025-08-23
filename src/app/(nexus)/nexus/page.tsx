 
 
 
 
 
 
 
 'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  ClipboardList,
  Receipt,
  Package,
  Home,
  UserCheck,
  BarChart3,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Building2,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import { NexusHeader } from '@/components/layout/NexusHeader'
import { useCurrency } from '@/hooks/useCurrency'

interface Module {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  href: string
  status: 'active' | 'coming-soon' | 'maintenance'
  color: string
}

interface Stat {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export default function NexusDashboard() {
  const { formatCurrency } = useCurrency()
  
  const modules: Module[] = [
    {
      id: 'employees',
      name: 'Employee Management',
      description: 'Manage staff, roles, and schedules',
      icon: <Users className="h-6 w-6" />,
      href: '/nexus/employees',
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      id: 'attendance-tracker',
      name: 'Attendance Tracker',
      description: 'Track employee attendance and leave',
      icon: <Calendar className="h-6 w-6" />,
      href: '/nexus/attendance-tracker',
      status: 'active',
      color: 'bg-green-500'
    },
    {
      id: 'tasks',
      name: 'Task Planner',
      description: 'Create and assign daily/weekly tasks with deadlines',
      icon: <ClipboardList className="h-6 w-6" />,
      href: '/nexus/task-manager',
      status: 'active',
      color: 'bg-purple-500'
    },
    {
      id: 'expenses',
      name: 'Expense Tracker',
      description: 'Record and categorize daily expenses with receipts',
      icon: <Receipt className="h-6 w-6" />,
      href: '/nexus/expenses',
      status: 'coming-soon',
      color: 'bg-orange-500'
    },
    {
      id: 'cash-analysis',
      name: 'Cash Analysis',
      description: 'Financial overview and reporting',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/nexus/cash-analysis',
      status: 'active',
      color: 'bg-purple-600'
    },
    {
      id: 'cashflow',
      name: 'Cashflow Management',
      description: 'Record expenses and income transactions',
      icon: <PiggyBank className="h-6 w-6" />,
      href: '/nexus/cashflow',
      status: 'active',
      color: 'bg-orange-600'
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Track stock levels, set alerts, and manage products',
      icon: <Package className="h-6 w-6" />,
      href: '/nexus/inventory',
      status: 'active',
      color: 'bg-indigo-500'
    },
    {
      id: 'property',
      name: 'Property Management',
      description: 'Manage tenants, rent collection, and property data',
      icon: <Home className="h-6 w-6" />,
      href: '/nexus/property-management',
      status: 'active',
      color: 'bg-teal-500'
    },
    {
      id: 'onboarding',
      name: 'User Onboarding',
      description: 'Track new hire progress and completion checklists',
      icon: <UserCheck className="h-6 w-6" />,
      href: '/nexus/onboarding',
      status: 'coming-soon',
      color: 'bg-pink-500'
    },
    {
      id: 'reports',
      name: 'Advanced Reports',
      description: 'Comprehensive business analytics and insights',
      icon: <TrendingUp className="h-6 w-6" />,
      href: '/nexus/reports',
      status: 'coming-soon',
      color: 'bg-gray-500'
    },
    {
      id: 'settings',
      name: 'System Settings',
      description: 'Configure Nexus preferences and system options',
      icon: <Settings className="h-6 w-6" />,
      href: '/nexus/settings',
      status: 'coming-soon',
      color: 'bg-gray-400'
    }
  ]

  const stats: Stat[] = [
    {
      label: 'Total Employees',
      value: '24',
      change: '+2 this month',
      trend: 'up'
    },
    {
      label: 'Active Tasks',
      value: '5',
      change: '+2 this week',
      trend: 'up'
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(12450),
      change: '+8.2% vs last month',
      trend: 'up'
    },
    {
      label: 'Properties',
      value: '8',
      change: '+1 this quarter',
      trend: 'up'
    }
  ]

  const recentActivity = [
    {
      id: '1',
      type: 'employee',
      message: 'New employee John Doe added',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'attendance',
      message: 'Sarah Wilson requested leave',
      time: '4 hours ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'cashflow',
      message: `Expense entry recorded: ${formatCurrency(1200)}`,
      time: '6 hours ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'task',
      message: 'Task "Inventory Check" completed',
      time: '1 day ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'system',
      message: 'System backup completed',
      time: '1 day ago',
      status: 'success'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Module['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'coming-soon':
        return <Badge variant="secondary">Coming Soon</Badge>
      case 'maintenance':
        return <Badge variant="destructive">Maintenance</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <NexusHeader 
        title="POS Nexus Dashboard"
        subtitle="Unified business management platform"
        showBack={false}
        showHome={false}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-2 border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  {index === 0 && <Users className="h-6 w-6 text-gray-600" />}
                  {index === 1 && <ClipboardList className="h-6 w-6 text-gray-600" />}
                  {index === 2 && <DollarSign className="h-6 w-6 text-gray-600" />}
                  {index === 3 && <Home className="h-6 w-6 text-gray-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Business Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Link key={module.id} href={module.status === 'active' ? module.href : '#'}>
              <Card 
                className={`group hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-white rounded-2xl overflow-hidden ${
                  module.status === 'coming-soon' ? 'opacity-75' : 'cursor-pointer hover:scale-105'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center shadow-lg`}>
                      <div className="text-white">
                        {module.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900">{module.name}</CardTitle>
                      {getStatusBadge(module.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{module.description}</p>
                  
                  <Button 
                    className={`w-full ${module.color} hover:opacity-90 text-white font-medium rounded-xl h-10 ${
                      module.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={module.status === 'coming-soon'}
                  >
                    {module.status === 'coming-soon' ? 'Coming Soon' : 'Access Module'}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/nexus/cashflow">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cashflow Entry
                </Button>
              </Link>
              <Link href="/nexus/employees">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Employee
                </Button>
              </Link>
              <Link href="/nexus/attendance-tracker">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Record Attendance
                </Button>
              </Link>
              <Link href="/nexus/cash-analysis">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Financial Report
                </Button>
              </Link>
              <Link href="/nexus/inventory">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
              </Link>
              <Link href="/nexus/task-manager">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database connected</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Backup system active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

