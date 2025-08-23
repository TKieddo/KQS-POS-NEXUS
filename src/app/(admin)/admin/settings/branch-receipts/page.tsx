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
import { loadReceiptTemplates, saveReceiptTemplate, type ReceiptTemplate } from '@/lib/receipt-template-service'
import { ArrowLeft, Save, RefreshCw, Building2 } from 'lucide-react'
import Link from 'next/link'

const BranchReceiptsPage = () => {
  const { selectedBranch } = useBranch()
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReceiptTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('business')

  // Load templates for the selected branch
  useEffect(() => {
    const loadTemplates = async () => {
      if (!selectedBranch) return
      
      try {
        setLoading(true)
        const loadedTemplates = await loadReceiptTemplates(selectedBranch.id)
        setTemplates(loadedTemplates)
        
        // Set the first template as selected
        if (loadedTemplates.length > 0) {
          setSelectedTemplate(loadedTemplates[0])
        }
      } catch (error) {
        console.error('Error loading templates:', error)
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
      const result = await saveReceiptTemplate(selectedTemplate, selectedBranch.id)
      
      if (result.success) {
        // Update the templates list with the saved template
        setTemplates(prev => 
          prev.map(t => 
            t.id === selectedTemplate.id ? result.template! : t
          )
        )
        setSelectedTemplate(result.template!)
        alert('Template saved successfully!')
      } else {
        alert(`Error saving template: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('An error occurred while saving the template')
    } finally {
      setSaving(false)
    }
  }

  // Handle template field changes
  const handleTemplateChange = (field: keyof ReceiptTemplate, value: any) => {
    if (!selectedTemplate) return
    
    setSelectedTemplate(prev => prev ? {
      ...prev,
      [field]: value
    } : null)
  }

  if (!selectedBranch) {
    return (
      <div className="p-6">
        <PremiumCard className="p-6">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Branch Selected</h2>
            <p className="text-gray-600 mb-4">
              Please select a branch from the sidebar to manage its receipt settings.
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
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Branch Receipt Settings</h1>
          <p className="text-gray-600">
            Manage receipt templates and business information for {selectedBranch.name}
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

      {loading ? (
        <PremiumCard className="p-6">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p>Loading receipt templates...</p>
          </div>
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <PremiumCard className="p-4">
              <h3 className="text-lg font-semibold mb-4">Receipt Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm opacity-75">
                      {template.is_default ? 'Default Template' : template.template_type}
                    </div>
                  </div>
                ))}
              </div>
              
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates found for this branch</p>
                </div>
              )}
            </PremiumCard>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <PremiumCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedTemplate.description || 'No description'}
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

                <div className="w-full">
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
                                  value={selectedTemplate.business_name}
                                  onChange={(e) => handleTemplateChange('business_name', e.target.value)}
                                  placeholder="Enter business name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_tagline">Business Tagline</Label>
                                <Input
                                  id="business_tagline"
                                  value={selectedTemplate.business_tagline}
                                  onChange={(e) => handleTemplateChange('business_tagline', e.target.value)}
                                  placeholder="Enter business tagline"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label htmlFor="business_address">Business Address</Label>
                                <Textarea
                                  id="business_address"
                                  value={selectedTemplate.business_address}
                                  onChange={(e) => handleTemplateChange('business_address', e.target.value)}
                                  placeholder="Enter business address"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_phone">Phone Number</Label>
                                <Input
                                  id="business_phone"
                                  value={selectedTemplate.business_phone}
                                  onChange={(e) => handleTemplateChange('business_phone', e.target.value)}
                                  placeholder="Enter phone number"
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_website">Website</Label>
                                <Input
                                  id="business_website"
                                  value={selectedTemplate.business_website}
                                  onChange={(e) => handleTemplateChange('business_website', e.target.value)}
                                  placeholder="Enter website URL"
                                />
                              </div>
                              <div>
                                <Label htmlFor="business_facebook">Facebook</Label>
                                <Input
                                  id="business_facebook"
                                  value={selectedTemplate.business_facebook}
                                  onChange={(e) => handleTemplateChange('business_facebook', e.target.value)}
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
                                value={selectedTemplate.return_policy_english}
                                onChange={(e) => handleTemplateChange('return_policy_english', e.target.value)}
                                placeholder="Enter return policy in English"
                                rows={4}
                              />
                            </div>
                            <div>
                              <Label htmlFor="return_policy_sesotho">Return Policy (Sesotho)</Label>
                              <Textarea
                                id="return_policy_sesotho"
                                value={selectedTemplate.return_policy_sesotho}
                                onChange={(e) => handleTemplateChange('return_policy_sesotho', e.target.value)}
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
                                value={selectedTemplate.thank_you_message}
                                onChange={(e) => handleTemplateChange('thank_you_message', e.target.value)}
                                placeholder="Enter thank you message"
                              />
                            </div>
                            <div>
                              <Label htmlFor="footer_text">Footer Text</Label>
                              <Input
                                id="footer_text"
                                value={selectedTemplate.footer_text}
                                onChange={(e) => handleTemplateChange('footer_text', e.target.value)}
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
                                  checked={selectedTemplate.show_qr_section}
                                  onCheckedChange={(checked) => handleTemplateChange('show_qr_section', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_policy_section">Show Policy Section</Label>
                                  <p className="text-sm text-gray-600">Display return and exchange policies</p>
                                </div>
                                <Switch
                                  id="show_policy_section"
                                  checked={selectedTemplate.show_policy_section}
                                  onCheckedChange={(checked) => handleTemplateChange('show_policy_section', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_points_section">Show Points Section</Label>
                                  <p className="text-sm text-gray-600">Display loyalty points information</p>
                                </div>
                                <Switch
                                  id="show_points_section"
                                  checked={selectedTemplate.show_points_section}
                                  onCheckedChange={(checked) => handleTemplateChange('show_points_section', checked)}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="show_tagline">Show Tagline</Label>
                                  <p className="text-sm text-gray-600">Display business tagline</p>
                                </div>
                                <Switch
                                  id="show_tagline"
                                  checked={selectedTemplate.show_tagline}
                                  onCheckedChange={(checked) => handleTemplateChange('show_tagline', checked)}
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
              </PremiumCard>
            ) : (
              <PremiumCard className="p-6">
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Template Selected</h3>
                  <p className="text-gray-600">
                    Select a template from the list to edit its settings.
                  </p>
                </div>
              </PremiumCard>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BranchReceiptsPage 