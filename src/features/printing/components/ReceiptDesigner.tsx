import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, MoveUp, MoveDown, Settings, Eye } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { ReceiptTemplate, ReceiptElement, ReceiptLayout } from '@/lib/printing-service'

export interface ReceiptDesignerProps {
  template?: ReceiptTemplate | null
  onSave: (template: ReceiptTemplate) => Promise<void>
  onClose: () => void
}

const elementTypes = [
  { id: 'text', label: 'Text', icon: 'T' },
  { id: 'logo', label: 'Logo', icon: '🖼️' },
  { id: 'barcode', label: 'Barcode', icon: '📊' },
  { id: 'qr_code', label: 'QR Code', icon: '📱' },
  { id: 'divider', label: 'Divider', icon: '➖' },
  { id: 'table', label: 'Table', icon: '📋' },
  { id: 'total', label: 'Total', icon: '💰' },
  { id: 'tax_breakdown', label: 'Tax Breakdown', icon: '🧾' }
]

const fontSizes = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' }
]

const alignments = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' }
]

export const createLuxuryBoutiqueTemplate = (): ReceiptTemplate => {
  return {
    id: 'luxury-boutique-kqs',
    name: 'KQS Luxury Boutique',
    description: 'Premium boutique receipt with category icons and luxury styling',
    template_type: 'custom',
    layout: {
      header: [
        {
          id: 'logo_section',
          type: 'text',
          content: 'KQS',
          alignment: 'center',
          font_size: 'large',
          font_weight: 'bold',
          position: 1
        },
        {
          id: 'tagline',
          type: 'text',
          content: 'LUXURY BOUTIQUE',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 2
        },
        {
          id: 'divider_luxury',
          type: 'divider',
          content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 3
        },
        {
          id: 'business_info',
          type: 'text',
          content: '{{business_address}}',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 4
        },
        {
          id: 'contact_info',
          type: 'text',
          content: '{{business_phone}} • {{business_email}}',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 5
        },
        {
          id: 'divider_thin',
          type: 'divider',
          content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 6
        }
      ],
      body: [
        {
          id: 'receipt_header',
          type: 'text',
          content: 'PURCHASE RECEIPT',
          alignment: 'center',
          font_size: 'medium',
          font_weight: 'bold',
          position: 1
        },
        {
          id: 'receipt_number',
          type: 'text',
          content: 'Receipt #{{receipt_number}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 2
        },
        {
          id: 'date_time',
          type: 'text',
          content: '{{date}} • {{time}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 3
        },
        {
          id: 'cashier_info',
          type: 'text',
          content: 'Stylist: {{cashier_name}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 4
        },
        {
          id: 'customer_info',
          type: 'text',
          content: 'Client: {{customer_name}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 5
        },
        {
          id: 'divider_items',
          type: 'divider',
          content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 6
        },
        {
          id: 'items_header',
          type: 'text',
          content: 'ITEMS PURCHASED',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'bold',
          position: 7
        },
        {
          id: 'items_table',
          type: 'table',
          content: '{{items_table}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 8
        },
        {
          id: 'divider_total',
          type: 'divider',
          content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 9
        },
        {
          id: 'subtotal',
          type: 'total',
          content: 'Subtotal: {{subtotal}}',
          alignment: 'right',
          font_size: 'medium',
          font_weight: 'normal',
          position: 10
        },
        {
          id: 'tax_breakdown',
          type: 'tax_breakdown',
          content: 'Tax ({{tax_rate}}%): {{tax_amount}}',
          alignment: 'right',
          font_size: 'small',
          font_weight: 'normal',
          position: 11
        },
        {
          id: 'discount',
          type: 'text',
          content: 'Discount: {{discount}}',
          alignment: 'right',
          font_size: 'small',
          font_weight: 'normal',
          position: 12
        },
        {
          id: 'total_luxury',
          type: 'total',
          content: 'TOTAL: {{total}}',
          alignment: 'right',
          font_size: 'large',
          font_weight: 'bold',
          position: 13
        },
        {
          id: 'payment_method',
          type: 'text',
          content: 'Payment: {{payment_method}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 14
        },
        {
          id: 'change_amount',
          type: 'text',
          content: 'Change: {{change}}',
          alignment: 'left',
          font_size: 'small',
          font_weight: 'normal',
          position: 15
        }
      ],
      footer: [
        {
          id: 'divider_footer',
          type: 'divider',
          content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 1
        },
        {
          id: 'return_policy',
          type: 'text',
          content: 'RETURN POLICY: 14 days with original receipt',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 2
        },
        {
          id: 'exchange_policy',
          type: 'text',
          content: 'Exchanges available within 30 days',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 3
        },
        {
          id: 'loyalty_info',
          type: 'text',
          content: 'Earn points on every purchase • Join our VIP program',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 4
        },
        {
          id: 'social_media',
          type: 'text',
          content: 'Follow us: @KQSBoutique',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 5
        },
        {
          id: 'website',
          type: 'text',
          content: 'www.kqs-boutique.com',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 6
        },
        {
          id: 'divider_bottom',
          type: 'divider',
          content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 7
        },
        {
          id: 'thank_you',
          type: 'text',
          content: 'THANK YOU FOR CHOOSING KQS',
          alignment: 'center',
          font_size: 'medium',
          font_weight: 'bold',
          position: 8
        },
        {
          id: 'come_back',
          type: 'text',
          content: 'We look forward to styling you again!',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 9
        },
        {
          id: 'qr_code',
          type: 'qr_code',
          content: '{{receipt_url}}',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 10
        },
        {
          id: 'barcode',
          type: 'barcode',
          content: '{{receipt_number}}',
          alignment: 'center',
          font_size: 'small',
          font_weight: 'normal',
          position: 11
        }
      ],
      styling: {
        font_family: 'monospace',
        line_height: 1.3,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        colors: { 
          primary: '#000000', 
          secondary: '#666666', 
          accent: '#E5FF29' 
        }
      }
    },
    is_active: true
  }
}

const ReceiptDesigner: React.FC<ReceiptDesignerProps> = ({ template, onSave, onClose }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [templateType, setTemplateType] = useState<'standard' | 'compact' | 'detailed' | 'custom'>('standard')
  const [layout, setLayout] = useState<ReceiptLayout>({
    header: [],
    body: [],
    footer: [],
    styling: {
      font_family: 'monospace',
      line_height: 1.2,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      colors: { primary: '#000000', secondary: '#666666', accent: '#000000' }
    }
  })
  const [selectedSection, setSelectedSection] = useState<'header' | 'body' | 'footer'>('header')
  const [selectedElement, setSelectedElement] = useState<ReceiptElement | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description)
      setTemplateType(template.template_type)
      setLayout(template.layout)
    } else {
      // Default layout for new template
      setLayout({
        header: [
          {
            id: 'business_name',
            type: 'text',
            content: '{{business_name}}',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1
          }
        ],
        body: [
          {
            id: 'receipt_number',
            type: 'text',
            content: 'Receipt #: {{receipt_number}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          }
        ],
        footer: [
          {
            id: 'footer_text',
            type: 'text',
            content: '{{receipt_footer}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          }
        ],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { primary: '#000000', secondary: '#666666', accent: '#000000' }
        }
      })
    }
  }, [template])

  const addElement = (type: string) => {
    const newElement: ReceiptElement = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      content: type === 'text' ? 'New text element' : '',
      alignment: 'left',
      font_size: 'small',
      font_weight: 'normal',
      position: layout[selectedSection].length + 1
    }

    setLayout(prev => ({
      ...prev,
      [selectedSection]: [...prev[selectedSection], newElement]
    }))
    setSelectedElement(newElement)
  }

  const updateElement = (elementId: string, updates: Partial<ReceiptElement>) => {
    setLayout(prev => ({
      ...prev,
      [selectedSection]: prev[selectedSection].map(element =>
        element.id === elementId ? { ...element, ...updates } : element
      )
    }))
  }

  const removeElement = (elementId: string) => {
    setLayout(prev => ({
      ...prev,
      [selectedSection]: prev[selectedSection].filter(element => element.id !== elementId)
    }))
    setSelectedElement(null)
  }

  const moveElement = (elementId: string, direction: 'up' | 'down') => {
    setLayout(prev => {
      const section = prev[selectedSection]
      const index = section.findIndex(element => element.id === elementId)
      
      if (direction === 'up' && index > 0) {
        const newSection = [...section]
        ;[newSection[index], newSection[index - 1]] = [newSection[index - 1], newSection[index]]
        return { ...prev, [selectedSection]: newSection }
      } else if (direction === 'down' && index < section.length - 1) {
        const newSection = [...section]
        ;[newSection[index], newSection[index + 1]] = [newSection[index + 1], newSection[index]]
        return { ...prev, [selectedSection]: newSection }
      }
      
      return prev
    })
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a template name')
      return
    }

    try {
      setIsSaving(true)
      const newTemplate: ReceiptTemplate = {
        id: template?.id || '',
        name: name.trim(),
        description: description.trim(),
        template_type: templateType,
        layout,
        is_active: true,
        branch_id: template?.branch_id
      }

      await onSave(newTemplate)
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderElement = (element: ReceiptElement) => {
    const isSelected = selectedElement?.id === element.id

  return (
      <div
        key={element.id}
        className={`p-3 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-[#E5FF29] bg-[#E5FF29]/10' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedElement(element)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {elementTypes.find(t => t.id === element.type)?.label}
            </span>
            <span className="text-xs text-gray-500">#{element.position}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveElement(element.id, 'up')
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoveUp className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                moveElement(element.id, 'down')
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoveDown className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeElement(element.id)
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {element.content || `[${element.type}]`}
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>{element.alignment}</span>
          <span>•</span>
          <span>{element.font_size}</span>
          <span>•</span>
          <span>{element.font_weight}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {template ? 'Edit Receipt Template' : 'Create Receipt Template'}
            </h2>
            <p className="text-sm text-gray-600">Design your receipt layout</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Template Info & Element Types */}
          <div className="w-80 border-r bg-gray-50 p-4 space-y-6">
            {/* Template Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Template Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <PremiumInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter template description"
                  className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value as any)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="compact">Compact</option>
                  <option value="detailed">Detailed</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* Section Tabs */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Sections</h3>
              <div className="space-y-2">
                {(['header', 'body', 'footer'] as const).map(section => (
                  <button
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      selectedSection === section
                        ? 'bg-[#E5FF29] text-black'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                    <span className="ml-2 text-xs text-gray-500">
                      ({layout[section].length} elements)
                    </span>
                  </button>
            ))}
          </div>
            </div>

            {/* Element Types */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Add Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                {elementTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => addElement(type.id)}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-[#E5FF29] hover:bg-[#E5FF29]/5 text-sm"
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel - Layout Editor */}
          <div className="flex-1 flex flex-col">
            {/* Section Header */}
            <div className="p-4 border-b bg-white">
              <h3 className="font-medium text-gray-900 capitalize">
                {selectedSection} Elements ({layout[selectedSection].length})
              </h3>
            </div>

            {/* Elements List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {layout[selectedSection].length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No elements in {selectedSection}</p>
                  <p className="text-sm">Add elements from the left panel</p>
                </div>
              ) : (
                layout[selectedSection].map(element => renderElement(element))
              )}
            </div>
          </div>

          {/* Right Panel - Element Properties */}
          <div className="w-80 border-l bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Element Properties</h3>
            
            {selectedElement ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none resize-none"
                    placeholder="Enter content or template variables like {{business_name}}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
                  <select
                    value={selectedElement.alignment}
                    onChange={(e) => updateElement(selectedElement.id, { alignment: e.target.value as any })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                  >
                    {alignments.map(alignment => (
                      <option key={alignment.id} value={alignment.id}>
                        {alignment.label}
                      </option>
                    ))}
                  </select>
                </div>

                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <select 
                    value={selectedElement.font_size}
                    onChange={(e) => updateElement(selectedElement.id, { font_size: e.target.value as any })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                  >
                    {fontSizes.map(size => (
                      <option key={size.id} value={size.id}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
                  <select
                    value={selectedElement.font_weight}
                    onChange={(e) => updateElement(selectedElement.id, { font_weight: e.target.value as any })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
            </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Template Variables</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• {{business_name}} - Business name</div>
                    <div>• {{receipt_number}} - Receipt number</div>
                    <div>• {{date}} - Current date</div>
                    <div>• {{time}} - Current time</div>
                    <div>• {{cashier_name}} - Cashier name</div>
                    <div>• {{customer_name}} - Customer name</div>
                    <div>• {{total}} - Total amount</div>
                    <div>• {{receipt_footer}} - Footer text</div>
          </div>
        </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Select an element to edit its properties</p>
                  </div>
                )}
              </div>
            </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <PremiumButton
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </PremiumButton>
          <PremiumButton
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </PremiumButton>
        </div>
          </div>
    </div>
  )
} 

export default ReceiptDesigner 