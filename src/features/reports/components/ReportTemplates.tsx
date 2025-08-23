import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Zap, 
  DollarSign, 
  Calendar,
  Users,
  PieChart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react'

export interface ReportTemplatesProps {
  className?: string
}

export const ReportTemplates: React.FC<ReportTemplatesProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const reportTemplates = {
    sales: [
      {
        id: '1',
        name: 'Daily Sales Summary',
        description: 'Comprehensive daily sales report with revenue analysis',
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        id: '2',
        name: 'Sales Performance',
        description: 'Sales performance metrics and trends analysis',
        icon: BarChart3,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        id: '3',
        name: 'Revenue Analysis',
        description: 'Detailed revenue breakdown and growth analysis',
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    ],
    inventory: [
      {
        id: '4',
        name: 'Stock Levels',
        description: 'Current inventory levels and stock status',
        icon: Package,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        id: '5',
        name: 'Low Stock Alerts',
        description: 'Products with low stock levels requiring attention',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      {
        id: '6',
        name: 'Movement History',
        description: 'Inventory movement and transaction history',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
    ],
    financial: [
      {
        id: '7',
        name: 'Profit & Loss',
        description: 'Comprehensive profit and loss statement',
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      },
      {
        id: '8',
        name: 'Cash Flow',
        description: 'Cash flow analysis and projections',
        icon: BarChart3,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      },
      {
        id: '9',
        name: 'Tax Summary',
        description: 'Tax calculations and compliance summary',
        icon: Calendar,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200'
      }
    ],
    customers: [
      {
        id: '10',
        name: 'Customer Analytics',
        description: 'Customer behavior and purchasing patterns',
        icon: Users,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200'
      },
      {
        id: '11',
        name: 'Loyalty Report',
        description: 'Customer loyalty program performance',
        icon: PieChart,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200'
      }
    ],
    analytics: [
      {
        id: '12',
        name: 'Business Intelligence',
        description: 'Comprehensive business analytics dashboard',
        icon: BarChart3,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200'
      }
    ]
  }

  const categories = [
    { key: 'all', label: 'All Reports', icon: FileText },
    { key: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { key: 'inventory', label: 'Inventory Reports', icon: Package },
    { key: 'financial', label: 'Financial Reports', icon: DollarSign },
    { key: 'customers', label: 'Customer Reports', icon: Users },
    { key: 'analytics', label: 'Analytics Reports', icon: BarChart3 }
  ]

  const getFilteredTemplates = () => {
    if (selectedCategory === 'all') {
      return Object.values(reportTemplates).flat()
    }
    return reportTemplates[selectedCategory as keyof typeof reportTemplates] || []
  }

  const handleGenerateReport = (templateId: string) => {
    console.log('Generating report for template:', templateId)
    // TODO: Implement report generation
  }

  const handlePreviewReport = (templateId: string) => {
    console.log('Previewing report for template:', templateId)
    // TODO: Implement report preview
  }

  const handleEditTemplate = (templateId: string) => {
    console.log('Editing template:', templateId)
    // TODO: Implement template editing
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">Report Templates</CardTitle>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className={selectedCategory === category.key 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              )
            })}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredTemplates().map((template) => {
              const Icon = template.icon
              return (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg ${template.bgColor} ${template.borderColor} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${template.bgColor}`}>
                      <Icon className={`h-6 w-6 ${template.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreviewReport(template.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTemplate(template.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(template.id)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {getFilteredTemplates().length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {selectedCategory === 'all' 
                  ? 'No report templates available. Create your first template to get started.'
                  : `No ${categories.find(c => c.key === selectedCategory)?.label.toLowerCase()} available.`
                }
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 