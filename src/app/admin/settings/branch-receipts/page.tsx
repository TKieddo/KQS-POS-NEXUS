'use client'

import React, { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PremiumTabs } from '@/components/ui/premium-tabs'
import { useBranch } from '@/context/BranchContext'
import { BranchSelector } from '@/components/layout/BranchSelector'
import { ArrowLeft, Save, RefreshCw, Building2, Plus, Edit3, Eye, Settings, Receipt, FileText, CreditCard, Package, Truck, RotateCcw, DollarSign, ClipboardList, Calculator, UserCheck, ShoppingBag, Archive, Users, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CreateTemplatesButton from '@/components/CreateTemplatesButton'

// Template definitions with icons and descriptions - updated for report_templates table
const TEMPLATE_DEFINITIONS = [
  {
    id: 'retail-receipt',
    name: 'KQS Retail Receipt',
    description: 'Standard retail receipt template with business information and policies',
    icon: Receipt,
    category: 'sales',
    template_type: 'standard',
    is_default: true
  },
  {
    id: 'luxury-receipt',
    name: 'KQS Luxury Receipt',
    description: 'Enhanced luxury receipt design with premium styling and QR code',
    icon: FileText,
    category: 'sales',
    template_type: 'detailed',
    is_default: false
  },
  {
    id: 'laybye-payment',
    name: 'KQS Laybye Payment Receipt',
    description: 'Laybye payment receipt with balance tracking and progress display',
    icon: CreditCard,
    category: 'sales',
    template_type: 'detailed',
    is_default: false
  },
  {
    id: 'laybye-reserve',
    name: 'KQS Laybye Reserve Slip',
    description: 'Laybye reserve slip template for initial deposits',
    icon: ShoppingBag,
    category: 'sales',
    template_type: 'compact',
    is_default: false
  },
  {
    id: 'laybye-cancellation',
    name: 'KQS Laybye Cancellation Receipt',
    description: 'Laybye cancellation receipt template for refunds',
    icon: RotateCcw,
    category: 'sales',
    template_type: 'standard',
    is_default: false
  },
  {
    id: 'refund-slip',
    name: 'KQS Refund Slip',
    description: 'Refund slip template for returns and exchanges',
    icon: RotateCcw,
    category: 'sales',
    template_type: 'compact',
    is_default: false
  },
  {
    id: 'returns-exchange',
    name: 'KQS Returns & Exchange Slip',
    description: 'Returns and exchange slip template for customer service',
    icon: Package,
    category: 'sales',
    template_type: 'compact',
    is_default: false
  },
  {
    id: 'quotation-slip',
    name: 'KQS Quotation Slip',
    description: 'Quotation slip template for price estimates and proposals',
    icon: FileText,
    category: 'sales',
    template_type: 'compact',
    is_default: false
  },
  {
    id: 'delivery-slip',
    name: 'KQS Delivery Slip',
    description: 'Delivery slip template for order fulfillment and tracking',
    icon: Truck,
    category: 'sales',
    template_type: 'compact',
    is_default: false
  },
  {
    id: 'order-slip',
    name: 'KQS Order Slip',
    description: 'Order slip template for pending orders and reservations',
    icon: ClipboardList,
    category: 'sales',
    template_type: 'compact',
    is_default: false
  },
  {
    id: 'cash-up-report',
    name: 'KQS Cash Up Report',
    description: 'Cash up report template for end-of-day reconciliation',
    icon: Calculator,
    category: 'financial',
    template_type: 'detailed',
    is_default: false
  },
  {
    id: 'till-session-report',
    name: 'KQS Till Session Report',
    description: 'Till session report template for shift summaries',
    icon: FileSpreadsheet,
    category: 'financial',
    template_type: 'detailed',
    is_default: false
  },
  {
    id: 'cash-drop-receipt',
    name: 'KQS Cash Drop Receipt',
    description: 'Cash drop receipt template for till management',
    icon: DollarSign,
    category: 'financial',
    template_type: 'standard',
    is_default: false
  },
  {
    id: 'account-payment',
    name: 'KQS Account Payment Receipt',
    description: 'Account payment receipt template for credit customers',
    icon: UserCheck,
    category: 'customers',
    template_type: 'detailed',
    is_default: false
  },
  {
    id: 'intermediate-bill',
    name: 'KQS Intermediate Bill',
    description: 'Intermediate bill template for partial payments',
    icon: FileText,
    category: 'sales',
    template_type: 'standard',
    is_default: false
  },
  {
    id: 'customer-statement',
    name: 'KQS Customer Statement',
    description: 'Customer statement template for account summaries',
    icon: Users,
    category: 'customers',
    template_type: 'detailed',
    is_default: false
  },
  {
    id: 'laybye-final-payment',
    name: 'KQS Final Laybye Payment Receipt',
    description: 'Final laybye payment receipt showing completion and collection ready status',
    icon: CheckCircle2,
    category: 'sales',
    template_type: 'detailed',
    is_default: false
  }
]

// Interface for report template
interface ReportTemplate {
  id?: string
  branch_id?: string
  name: string
  description?: string
  category: 'sales' | 'inventory' | 'financial' | 'customers' | 'analytics'
  template_data: {
    business_name?: string
    business_address?: string
    business_phone?: string
    business_website?: string
    business_facebook?: string
    business_tagline?: string
    return_policy_english?: string
    return_policy_sesotho?: string
    thank_you_message?: string
    footer_text?: string
    show_qr_section?: boolean
    show_policy_section?: boolean
    show_points_section?: boolean
    show_tagline?: boolean
    template_type?: string
  }
  is_default?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

const BranchReceiptsPage = () => {
  const { selectedBranch, branches } = useBranch()
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('business')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  // Load templates for the selected branch
  useEffect(() => {
    const loadTemplates = async () => {
      if (!selectedBranch) {
        setTemplates([])
        setSelectedTemplate(null)
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('report_templates')
          .select('*')
          .eq('branch_id', selectedBranch.id)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error loading templates:', error)
          setTemplates([])
        } else {
          setTemplates(data || [])
        }
      } catch (error) {
        console.error('Error loading templates:', error)
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [selectedBranch])

  // Save template changes
  const handleSaveTemplate = async () => {
    if (!selectedTemplate || !selectedBranch) return

    try {
      setSaving(true)
      
      let result
      if (selectedTemplate.id) {
        // Update existing template
        const { data, error } = await supabase
          .from('report_templates')
          .update({
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            category: selectedTemplate.category,
            template_data: selectedTemplate.template_data,
            is_default: selectedTemplate.is_default,
            is_active: selectedTemplate.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTemplate.id)
          .select()
          .single()

        if (error) throw error
        result = { success: true, template: data }
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('report_templates')
          .insert({
            branch_id: selectedBranch.id,
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            category: selectedTemplate.category,
            template_data: selectedTemplate.template_data,
            is_default: selectedTemplate.is_default,
            is_active: selectedTemplate.is_active
          })
          .select()
          .single()

        if (error) throw error
        result = { success: true, template: data }
      }
      
      if (result.success) {
        // Update the templates list with the saved template
        setTemplates(prev => {
          const existingIndex = prev.findIndex(t => t.id === selectedTemplate.id)
          if (existingIndex >= 0) {
            // Update existing template
            const updated = [...prev]
            updated[existingIndex] = result.template!
            return updated
          } else {
            // Add new template
            return [...prev, result.template!]
          }
        })
        setSelectedTemplate(result.template!)
        
        // Show success message
        const successMessage = document.createElement('div')
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        successMessage.textContent = '✅ Template saved successfully!'
        document.body.appendChild(successMessage)
        
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Error saving template:', error)
      
      const errorMessage = document.createElement('div')
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      errorMessage.textContent = '❌ An error occurred while saving the template'
      document.body.appendChild(errorMessage)
      
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage)
        }
      }, 5000)
    } finally {
      setSaving(false)
    }
  }

  // Handle template field changes
  const handleTemplateChange = (field: string, value: any) => {
    if (!selectedTemplate) return
    
    if (field.startsWith('template_data.')) {
      // Handle template_data fields
      const dataField = field.replace('template_data.', '')
      setSelectedTemplate(prev => prev ? {
        ...prev,
        template_data: {
          ...prev.template_data,
          [dataField]: value
        }
      } : null)
    } else {
      // Handle direct template fields
    setSelectedTemplate(prev => prev ? {
      ...prev,
      [field]: value
    } : null)
    }
  }

  // Open template editor
  const handleEditTemplate = (templateDef: any) => {
    // Find existing template or create new one
    const existingTemplate = templates.find(t => 
      t.name === templateDef.name || 
      t.template_data?.template_type === templateDef.template_type
    )

    if (existingTemplate) {
      // Use the actual template data from database
      setSelectedTemplate(existingTemplate)
    } else {
      // Create new template based on definition with proper defaults
      const newTemplate: ReportTemplate = {
        name: templateDef.name,
        description: templateDef.description,
        category: templateDef.category,
        template_data: {
          business_name: selectedBranch?.name || 'KQS',
          business_address: selectedBranch?.address || 'Maseru, Husteds opposite Queen II',
          business_phone: selectedBranch?.phone || '2700 7795',
          business_website: 'www.kqsfootware.com',
          business_facebook: 'KQSFOOTWARE',
          business_tagline: 'Finest footware',
          return_policy_english: 'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
          return_policy_sesotho: 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
          thank_you_message: 'Thank You for shopping with Us',
          footer_text: 'SHOP ONLINE - Stand a chance to win',
          show_qr_section: true,
          show_policy_section: true,
          show_points_section: true,
          show_tagline: true,
          template_type: templateDef.template_type
        },
        is_active: true,
        is_default: templateDef.is_default
      }
      setSelectedTemplate(newTemplate)
    }
    
    setShowTemplateEditor(true)
    setActiveTab('business')
  }

  // Close template editor
  const handleCloseEditor = () => {
    setShowTemplateEditor(false)
    setSelectedTemplate(null)
  }

  // Get template definition by name
  const getTemplateDefinition = (templateName: string) => {
    return TEMPLATE_DEFINITIONS.find(def => 
      def.name === templateName || 
      templateName.includes(def.name.replace('KQS ', ''))
    ) || TEMPLATE_DEFINITIONS[0]
  }

  // Check if template exists in database
  const getTemplateStatus = (templateDef: any) => {
    const existingTemplate = templates.find(t => 
      t.name === templateDef.name || 
      t.template_data?.template_type === templateDef.template_type
    )
    
    return {
      exists: !!existingTemplate,
      template: existingTemplate,
      isActive: existingTemplate?.is_active ?? false,
      isDefault: existingTemplate?.is_default ?? templateDef.is_default
    }
  }

  if (branches.length === 0) {
    return (
      <div className="p-6">
        <PremiumCard className="p-6">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Branches Available</h2>
            <p className="text-gray-600 mb-4">
              No branches are available. Please create branches first.
            </p>
            <Link href="/admin/settings">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
        </PremiumCard>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Branch Receipt Templates</h1>
          <p className="text-gray-600">
            Manage all receipt templates and customize business information for each template type
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Branch Selector */}
      <PremiumCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Select Branch</h3>
            <p className="text-sm text-gray-600">
              Choose a branch to manage its receipt templates
            </p>
          </div>
          <BranchSelector variant="admin" />
        </div>
      </PremiumCard>

      {/* Create Templates Section */}
      {selectedBranch && (
        <CreateTemplatesButton />
      )}

      {!selectedBranch ? (
        <PremiumCard className="p-6">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Branch Selected</h2>
            <p className="text-gray-600 mb-4">
              Please select a branch from the dropdown above to manage its receipt templates.
            </p>
          </div>
        </PremiumCard>
      ) : loading ? (
        <PremiumCard className="p-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p>Loading receipt templates...</p>
          </div>
        </PremiumCard>
      ) : showTemplateEditor && selectedTemplate ? (
        // Template Editor Modal
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-6 border-b">
                  <div>
                <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-600">
                  Customize template settings for {selectedBranch.name}
                    </p>
                  </div>
              <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                <Button
                  onClick={handleCloseEditor}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
                </div>

            {/* Editor Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <PremiumTabs
                    tabs={[
                      {
                        id: 'business',
                        label: 'Business Info',
                        content: (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="business_name">Business Name</Label>
                                <Input
                                  id="business_name"
                              value={selectedTemplate.template_data?.business_name || ''}
                              onChange={(e) => handleTemplateChange('template_data.business_name', e.target.value)}
                                  placeholder="Enter business name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_tagline">Business Tagline</Label>
                                <Input
                                  id="business_tagline"
                              value={selectedTemplate.template_data?.business_tagline || ''}
                              onChange={(e) => handleTemplateChange('template_data.business_tagline', e.target.value)}
                                  placeholder="Enter business tagline"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label htmlFor="business_address">Business Address</Label>
                                <Textarea
                                  id="business_address"
                              value={selectedTemplate.template_data?.business_address || ''}
                              onChange={(e) => handleTemplateChange('template_data.business_address', e.target.value)}
                                  placeholder="Enter business address"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_phone">Phone Number</Label>
                                <Input
                                  id="business_phone"
                              value={selectedTemplate.template_data?.business_phone || ''}
                              onChange={(e) => handleTemplateChange('template_data.business_phone', e.target.value)}
                                  placeholder="Enter phone number"
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_website">Website</Label>
                                <Input
                                  id="business_website"
                              value={selectedTemplate.template_data?.business_website || ''}
                              onChange={(e) => handleTemplateChange('template_data.business_website', e.target.value)}
                                  placeholder="Enter website URL"
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_facebook">Facebook</Label>
                                <Input
                                  id="business_facebook"
                              value={selectedTemplate.template_data?.business_facebook || ''}
                              onChange={(e) => handleTemplateChange('template_data.business_facebook', e.target.value)}
                                  placeholder="Enter Facebook handle"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        id: 'policies',
                        label: 'Policies',
                        content: (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="return_policy_english">Return Policy (English)</Label>
                              <Textarea
                                id="return_policy_english"
                            value={selectedTemplate.template_data?.return_policy_english || ''}
                            onChange={(e) => handleTemplateChange('template_data.return_policy_english', e.target.value)}
                                placeholder="Enter return policy in English"
                                rows={4}
                              />
                            </div>
                            <div>
                              <Label htmlFor="return_policy_sesotho">Return Policy (Sesotho)</Label>
                              <Textarea
                                id="return_policy_sesotho"
                            value={selectedTemplate.template_data?.return_policy_sesotho || ''}
                            onChange={(e) => handleTemplateChange('template_data.return_policy_sesotho', e.target.value)}
                                placeholder="Enter return policy in Sesotho"
                                rows={4}
                              />
                            </div>
                          </div>
                        )
                      },
                      {
                        id: 'messages',
                        label: 'Messages',
                        content: (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="thank_you_message">Thank You Message</Label>
                              <Input
                                id="thank_you_message"
                            value={selectedTemplate.template_data?.thank_you_message || ''}
                            onChange={(e) => handleTemplateChange('template_data.thank_you_message', e.target.value)}
                                placeholder="Enter thank you message"
                              />
                            </div>
                            <div>
                              <Label htmlFor="footer_text">Footer Text</Label>
                              <Input
                                id="footer_text"
                            value={selectedTemplate.template_data?.footer_text || ''}
                            onChange={(e) => handleTemplateChange('template_data.footer_text', e.target.value)}
                                placeholder="Enter footer text"
                              />
                            </div>
                          </div>
                        )
                      },
                      {
                        id: 'display',
                        label: 'Display',
                        content: (
                          <div className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_qr_section">Show QR Section</Label>
                                  <p className="text-sm text-gray-600">Display QR code and contact information</p>
                                </div>
                                <Switch
                                  id="show_qr_section"
                              checked={selectedTemplate.template_data?.show_qr_section || false}
                              onCheckedChange={(checked) => handleTemplateChange('template_data.show_qr_section', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_policy_section">Show Policy Section</Label>
                                  <p className="text-sm text-gray-600">Display return and exchange policies</p>
                                </div>
                                <Switch
                                  id="show_policy_section"
                              checked={selectedTemplate.template_data?.show_policy_section || false}
                              onCheckedChange={(checked) => handleTemplateChange('template_data.show_policy_section', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_points_section">Show Points Section</Label>
                                  <p className="text-sm text-gray-600">Display loyalty points information</p>
                                </div>
                                <Switch
                                  id="show_points_section"
                              checked={selectedTemplate.template_data?.show_points_section || false}
                              onCheckedChange={(checked) => handleTemplateChange('template_data.show_points_section', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_tagline">Show Tagline</Label>
                                  <p className="text-sm text-gray-600">Display business tagline</p>
                                </div>
                                <Switch
                                  id="show_tagline"
                              checked={selectedTemplate.template_data?.show_tagline || false}
                              onCheckedChange={(checked) => handleTemplateChange('template_data.show_tagline', checked)}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      }
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    className="w-full"
                  />
                </div>
          </div>
        </div>
      ) : (
        // Template Cards Grid
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Receipt Templates</h2>
            <div className="text-sm text-gray-600">
              {TEMPLATE_DEFINITIONS.length} templates available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TEMPLATE_DEFINITIONS.map((templateDef) => {
              const IconComponent = templateDef.icon
              const { exists, template, isActive, isDefault } = getTemplateStatus(templateDef)
              
              return (
                <PremiumCard 
                  key={templateDef.id} 
                  className="p-4 hover:shadow-lg transition-shadow group"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleEditTemplate(templateDef)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{templateDef.name}</h3>
                          <p className="text-xs text-gray-500">{templateDef.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Default
                          </span>
                        )}
                        {exists && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Saved
                          </span>
                        )}
                        <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {templateDef.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Type: {templateDef.template_type}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        exists 
                          ? (isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {exists ? (isActive ? 'Active' : 'Inactive') : 'Not Saved'}
                      </span>
                    </div>
                </div>
              </PremiumCard>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchReceiptsPage 