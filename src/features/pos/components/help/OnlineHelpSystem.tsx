'use client'

import React, { useState } from 'react'
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  MessageCircle, 
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Play,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HelpCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  articles: HelpArticle[]
}

interface HelpArticle {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'pdf'
  duration?: string
  tags: string[]
  url?: string
}

interface OnlineHelpSystemProps {
  onClose?: () => void
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using KQS POS',
    icon: BookOpen,
    articles: [
      {
        id: '1',
        title: 'First Time Setup',
        description: 'Complete guide to setting up your POS system for the first time',
        type: 'article',
        tags: ['setup', 'beginner'],
        url: '/help/first-time-setup'
      },
      {
        id: '2',
        title: 'Quick Start Video',
        description: '5-minute video tutorial to get you up and running',
        type: 'video',
        duration: '5:30',
        tags: ['video', 'tutorial'],
        url: '/help/quick-start-video'
      },
      {
        id: '3',
        title: 'User Manual',
        description: 'Complete user manual in PDF format',
        type: 'pdf',
        tags: ['manual', 'pdf'],
        url: '/help/user-manual.pdf'
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Transactions',
    description: 'Everything about processing sales and transactions',
    icon: FileText,
    articles: [
      {
        id: '4',
        title: 'Processing a Sale',
        description: 'Step-by-step guide to processing customer transactions',
        type: 'article',
        tags: ['sales', 'transactions'],
        url: '/help/processing-sale'
      },
      {
        id: '5',
        title: 'Payment Methods',
        description: 'How to accept different payment types',
        type: 'article',
        tags: ['payments', 'methods'],
        url: '/help/payment-methods'
      },
      {
        id: '6',
        title: 'Refunds & Returns',
        description: 'Handling customer returns and refunds',
        type: 'video',
        duration: '8:15',
        tags: ['refunds', 'returns'],
        url: '/help/refunds-returns'
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Managing your product catalog and stock',
    icon: FileText,
    articles: [
      {
        id: '7',
        title: 'Adding Products',
        description: 'How to add new products to your inventory',
        type: 'article',
        tags: ['inventory', 'products'],
        url: '/help/adding-products'
      },
      {
        id: '8',
        title: 'Stock Management',
        description: 'Tracking and updating product quantities',
        type: 'article',
        tags: ['stock', 'quantities'],
        url: '/help/stock-management'
      },
      {
        id: '9',
        title: 'Barcode Scanning',
        description: 'Using barcode scanners for quick product lookup',
        type: 'video',
        duration: '3:45',
        tags: ['barcode', 'scanning'],
        url: '/help/barcode-scanning'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Understanding your business data and reports',
    icon: FileText,
    articles: [
      {
        id: '10',
        title: 'Sales Reports',
        description: 'How to read and interpret sales reports',
        type: 'article',
        tags: ['reports', 'analytics'],
        url: '/help/sales-reports'
      },
      {
        id: '11',
        title: 'Inventory Reports',
        description: 'Tracking product performance and stock levels',
        type: 'article',
        tags: ['inventory', 'reports'],
        url: '/help/inventory-reports'
      }
    ]
  }
]

const quickActions = [
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: MessageCircle,
    action: () => window.open('mailto:support@kqs.com', '_blank')
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    icon: Video,
    action: () => window.open('/help/videos', '_blank')
  },
  {
    title: 'Download Manual',
    description: 'Get the complete user manual',
    icon: Download,
    action: () => window.open('/help/user-manual.pdf', '_blank')
  }
]

export const OnlineHelpSystem: React.FC<OnlineHelpSystemProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleArticleClick = (article: HelpArticle) => {
    if (article.url) {
      window.open(article.url, '_blank')
    }
    setSelectedArticle(article)
  }

  const getArticleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#E5FF29] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">KQS</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Help Center</h1>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <action.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getArticleIcon(article.type)}
                            <h4 className="font-medium text-gray-900">{article.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {article.duration && (
                              <span className="text-xs text-gray-500">{article.duration}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Still Need Help?
                </h3>
                <p className="text-blue-700 mb-4">
                  Our support team is here to help you with any questions or issues.
                </p>
                <div className="flex items-center justify-center space-x-6">
                  <Button
                    variant="outline"
                    onClick={() => window.open('mailto:support@kqs.com', '_blank')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('tel:+1234567890', '_blank')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/help/chat', '_blank')}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 