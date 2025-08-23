import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

export interface SecuritySettingsProps {
  className?: string
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ className }) => {
  const [settings, setSettings] = useState({
    requireAuthentication: true,
    encryptNotifications: true,
    enableAuditLog: true,
    maxRetryAttempts: 3,
    webhookTimeout: 30,
    apiKeyExpiry: 90,
    enableRateLimiting: true,
    rateLimitPerMinute: 60,
    enableIpWhitelist: false,
    allowedIps: '',
    enableTwoFactor: false,
    notificationEncryptionKey: '',
    webhookSecret: ''
  })

  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus({ type: null, message: '' })

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveStatus({
        type: 'success',
        message: 'Security settings saved successfully'
      })
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to save security settings'
      })
    } finally {
      setSaving(false)
    }
  }

  const generateApiKey = () => {
    const key = 'kqs_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setSettings(prev => ({ ...prev, notificationEncryptionKey: key }))
  }

  const generateWebhookSecret = () => {
    const secret = 'wh_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setSettings(prev => ({ ...prev, webhookSecret: secret }))
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">Security Settings</CardTitle>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Authentication Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Authentication & Authorization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Require Authentication</p>
                  <p className="text-sm text-gray-600">All notifications require valid authentication</p>
                </div>
                <Switch
                  checked={settings.requireAuthentication}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireAuthentication: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Require 2FA for sensitive operations</p>
                </div>
                <Switch
                  checked={settings.enableTwoFactor}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Encryption Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Encryption & Privacy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Encrypt Notifications</p>
                  <p className="text-sm text-gray-600">Encrypt sensitive notification content</p>
                </div>
                <Switch
                  checked={settings.encryptNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, encryptNotifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Audit Logging</p>
                  <p className="text-sm text-gray-600">Log all notification activities</p>
                </div>
                <Switch
                  checked={settings.enableAuditLog}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAuditLog: checked }))}
                />
              </div>
            </div>
          </div>

          {/* API Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">API Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">API Key Expiry (days)</label>
                <Select
                  value={settings.apiKeyExpiry.toString()}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKeyExpiry: parseInt(e.target.value) }))}
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Max Retry Attempts</label>
                <Select
                  value={settings.maxRetryAttempts.toString()}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxRetryAttempts: parseInt(e.target.value) }))}
                >
                  <option value="1">1 attempt</option>
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="10">10 attempts</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Rate Limiting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable Rate Limiting</p>
                  <p className="text-sm text-gray-600">Prevent notification spam</p>
                </div>
                <Switch
                  checked={settings.enableRateLimiting}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableRateLimiting: checked }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Rate Limit (per minute)</label>
                <Select
                  value={settings.rateLimitPerMinute.toString()}
                  onChange={(e) => setSettings(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) }))}
                  disabled={!settings.enableRateLimiting}
                >
                  <option value="30">30 requests</option>
                  <option value="60">60 requests</option>
                  <option value="120">120 requests</option>
                  <option value="300">300 requests</option>
                </Select>
              </div>
            </div>
          </div>

          {/* IP Whitelist */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">IP Access Control</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">IP Whitelist</p>
                  <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
                </div>
                <Switch
                  checked={settings.enableIpWhitelist}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableIpWhitelist: checked }))}
                />
              </div>
              
              {settings.enableIpWhitelist && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Allowed IP Addresses</label>
                  <Input
                    value={settings.allowedIps}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowedIps: e.target.value }))}
                    placeholder="192.168.1.1, 10.0.0.0/24"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">Separate multiple IPs with commas. Supports CIDR notation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Secrets Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Secrets Management</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notification Encryption Key</label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.notificationEncryptionKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationEncryptionKey: e.target.value }))}
                    placeholder="Enter encryption key"
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={generateApiKey}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Webhook Secret</label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.webhookSecret}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    placeholder="Enter webhook secret"
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={generateWebhookSecret}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowSecrets(!showSecrets)}
                  variant="ghost"
                  size="sm"
                >
                  {showSecrets ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide Secrets
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Show Secrets
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus.type && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              saveStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {saveStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm">{saveStatus.message}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 