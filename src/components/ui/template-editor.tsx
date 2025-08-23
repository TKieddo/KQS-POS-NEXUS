import React from 'react'
import { PremiumCard } from './premium-card'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'
import { Switch } from './switch'
import { RotateCcw } from 'lucide-react'
import type { ReceiptTemplate } from '@/lib/receipt-template-service'

interface TemplateEditorProps {
  template: ReceiptTemplate
  onTemplateChange: (field: keyof ReceiptTemplate, value: string | boolean) => void
  onReset: () => void
  hasUnsavedChanges: boolean
  onSave: () => void
  saving: boolean
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onTemplateChange,
  onReset,
  hasUnsavedChanges,
  onSave,
  saving
}) => {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Template Settings</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          {hasUnsavedChanges && (
            <Button
              onClick={onSave}
              disabled={saving}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Business Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={template.business_name}
                onChange={(e) => onTemplateChange('business_name', e.target.value)}
                placeholder="Enter business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_tagline">Tagline</Label>
              <Input
                id="business_tagline"
                value={template.business_tagline}
                onChange={(e) => onTemplateChange('business_tagline', e.target.value)}
                placeholder="Enter business tagline"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_address">Address</Label>
            <Input
              id="business_address"
              value={template.business_address}
              onChange={(e) => onTemplateChange('business_address', e.target.value)}
              placeholder="Enter business address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Phone</Label>
              <Input
                id="business_phone"
                value={template.business_phone}
                onChange={(e) => onTemplateChange('business_phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_website">Website</Label>
              <Input
                id="business_website"
                value={template.business_website}
                onChange={(e) => onTemplateChange('business_website', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_facebook">Facebook/Social Media</Label>
            <Input
              id="business_facebook"
              value={template.business_facebook}
              onChange={(e) => onTemplateChange('business_facebook', e.target.value)}
              placeholder="Enter social media handle"
            />
          </div>
        </div>

        {/* Policy Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-medium text-sm text-gray-700">Return Policy</h4>
            <div className="flex items-center space-x-2">
              <Switch
                checked={template.show_policy_section}
                onCheckedChange={(checked) => onTemplateChange('show_policy_section', checked)}
              />
              <Label className="text-xs">Show Policy</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="return_policy_english">English Policy</Label>
              <Textarea
                id="return_policy_english"
                value={template.return_policy_english}
                onChange={(e) => onTemplateChange('return_policy_english', e.target.value)}
                placeholder="Enter return policy in English"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_policy_sesotho">Sesotho Policy</Label>
              <Textarea
                id="return_policy_sesotho"
                value={template.return_policy_sesotho}
                onChange={(e) => onTemplateChange('return_policy_sesotho', e.target.value)}
                placeholder="Enter return policy in Sesotho"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-medium text-sm text-gray-700">Footer & QR Section</h4>
            <div className="flex items-center space-x-2">
              <Switch
                checked={template.show_qr_section}
                onCheckedChange={(checked) => onTemplateChange('show_qr_section', checked)}
              />
              <Label className="text-xs">Show QR</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footer_text">Footer Text</Label>
              <Input
                id="footer_text"
                value={template.footer_text}
                onChange={(e) => onTemplateChange('footer_text', e.target.value)}
                placeholder="Enter footer text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thank_you_message">Thank You Message</Label>
              <Input
                id="thank_you_message"
                value={template.thank_you_message}
                onChange={(e) => onTemplateChange('thank_you_message', e.target.value)}
                placeholder="Enter thank you message"
              />
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-700 border-b pb-2">Display Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Tagline</Label>
              <Switch
                checked={template.show_tagline}
                onCheckedChange={(checked) => onTemplateChange('show_tagline', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Points Section</Label>
              <Switch
                checked={template.show_points_section}
                onCheckedChange={(checked) => onTemplateChange('show_points_section', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}

export { TemplateEditor } 