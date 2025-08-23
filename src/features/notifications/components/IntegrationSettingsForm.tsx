import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  MessageSquare, 
  Globe, 
  TestTube, 
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { 
  IntegrationSettings, 
  IntegrationSettingsFormData,
  EMAIL_PROVIDERS,
  SMS_PROVIDERS,
  NOTIFICATION_FREQUENCIES
} from "../types"
import { useIntegrationSettings } from "../hooks/useNotifications"

export interface IntegrationSettingsFormProps {
  className?: string
}

export const IntegrationSettingsForm: React.FC<IntegrationSettingsFormProps> = ({ className }) => {
  const { 
    settings, 
    loading, 
    error, 
    saving, 
    saveSettings, 
    testEmail, 
    testSMS 
  } = useIntegrationSettings()

  const [formData, setFormData] = useState<IntegrationSettingsFormData>({
    email_provider: 'smtp',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    sms_provider: 'twilio',
    sms_api_key: '',
    sms_api_secret: '',
    sms_from_number: '',
    webhook_url: '',
    webhook_secret: '',
    enable_webhooks: false,
    enable_email_notifications: false,
    enable_sms_notifications: false,
    enable_push_notifications: false,
    notification_frequency: 'immediate',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  })

  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSMS, setTestingSMS] = useState(false)
  const [testResults, setTestResults] = useState<{
    email?: { success: boolean; message: string }
    sms?: { success: boolean; message: string }
  }>({})

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData({
        email_provider: settings.email_provider,
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port || '587',
        smtp_username: settings.smtp_username || '',
        smtp_password: settings.smtp_password || '',
        sms_provider: settings.sms_provider,
        sms_api_key: settings.sms_api_key || '',
        sms_api_secret: settings.sms_api_secret || '',
        sms_from_number: settings.sms_from_number || '',
        webhook_url: settings.webhook_url || '',
        webhook_secret: settings.webhook_secret || '',
        enable_webhooks: settings.enable_webhooks,
        enable_email_notifications: settings.enable_email_notifications,
        enable_sms_notifications: settings.enable_sms_notifications,
        enable_push_notifications: settings.enable_push_notifications,
        notification_frequency: settings.notification_frequency,
        quiet_hours_start: settings.quiet_hours_start || '22:00',
        quiet_hours_end: settings.quiet_hours_end || '08:00'
      })
    }
  }, [settings])

  const handleChange = (field: keyof IntegrationSettingsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await saveSettings(formData)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true)
      setTestResults(prev => ({ ...prev, email: undefined }))
      const result = await testEmail(formData)
      setTestResults(prev => ({ 
        ...prev, 
        email: { success: result, message: result ? 'Email test successful!' : 'Email test failed.' }
      }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        email: { success: false, message: error instanceof Error ? error.message : 'Email test failed.' }
      }))
    } finally {
      setTestingEmail(false)
    }
  }

  const handleTestSMS = async () => {
    try {
      setTestingSMS(true)
      setTestResults(prev => ({ ...prev, sms: undefined }))
      const result = await testSMS(formData)
      setTestResults(prev => ({ 
        ...prev, 
        sms: { success: result, message: result ? 'SMS test successful!' : 'SMS test failed.' }
      }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        sms: { success: false, message: error instanceof Error ? error.message : 'SMS test failed.' }
      }))
    } finally {
      setTestingSMS(false)
    }
  }

  if (loading) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading integration settings...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error loading integration settings: {error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Integration Settings</CardTitle>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
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
      <CardContent>
        <div className="space-y-8">
          {/* Email Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Email Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                <Select
                  value={formData.email_provider}
                  onChange={(e) => handleChange("email_provider", e.target.value)}
                >
                  {Object.entries(EMAIL_PROVIDERS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={handleTestEmail}
                  disabled={testingEmail || !formData.enable_email_notifications}
                  className="bg-white border-gray-200 hover:bg-gray-50"
                >
                  {testingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Email
                    </>
                  )}
                </Button>
              </div>
            </div>

            {testResults.email && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                testResults.email.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResults.email.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="text-sm">{testResults.email.message}</span>
              </div>
            )}

            {formData.email_provider === 'smtp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <Input
                    value={formData.smtp_host}
                    onChange={(e) => handleChange("smtp_host", e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <Input
                    value={formData.smtp_port}
                    onChange={(e) => handleChange("smtp_port", e.target.value)}
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <Input
                    value={formData.smtp_username}
                    onChange={(e) => handleChange("smtp_username", e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input
                    type="password"
                    value={formData.smtp_password}
                    onChange={(e) => handleChange("smtp_password", e.target.value)}
                    placeholder="Your password or app password"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SMS Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-900">SMS Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                <Select
                  value={formData.sms_provider}
                  onChange={(e) => handleChange("sms_provider", e.target.value)}
                >
                  {Object.entries(SMS_PROVIDERS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={handleTestSMS}
                  disabled={testingSMS || !formData.enable_sms_notifications}
                  className="bg-white border-gray-200 hover:bg-gray-50"
                >
                  {testingSMS ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test SMS
                    </>
                  )}
                </Button>
              </div>
            </div>

            {testResults.sms && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                testResults.sms.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResults.sms.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="text-sm">{testResults.sms.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <Input
                  type="password"
                  value={formData.sms_api_key}
                  onChange={(e) => handleChange("sms_api_key", e.target.value)}
                  placeholder="Your SMS API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                <Input
                  type="password"
                  value={formData.sms_api_secret}
                  onChange={(e) => handleChange("sms_api_secret", e.target.value)}
                  placeholder="Your SMS API secret"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Number</label>
                <Input
                  value={formData.sms_from_number}
                  onChange={(e) => handleChange("sms_from_number", e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">Webhook Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.enable_webhooks}
                  onCheckedChange={(checked) => handleChange("enable_webhooks", checked)}
                />
                <span className="text-sm font-medium text-gray-700">Enable Webhooks</span>
              </div>
              
              {formData.enable_webhooks && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <Input
                      value={formData.webhook_url}
                      onChange={(e) => handleChange("webhook_url", e.target.value)}
                      placeholder="https://your-api.com/webhooks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                    <Input
                      type="password"
                      value={formData.webhook_secret}
                      onChange={(e) => handleChange("webhook_secret", e.target.value)}
                      placeholder="Your webhook secret"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Notification Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.enable_email_notifications}
                    onCheckedChange={(checked) => handleChange("enable_email_notifications", checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.enable_sms_notifications}
                    onCheckedChange={(checked) => handleChange("enable_sms_notifications", checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Enable SMS Notifications</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.enable_push_notifications}
                    onCheckedChange={(checked) => handleChange("enable_push_notifications", checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Push Notifications</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                  <Select
                    value={formData.notification_frequency}
                    onChange={(e) => handleChange("notification_frequency", e.target.value)}
                  >
                    {Object.entries(NOTIFICATION_FREQUENCIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours Start</label>
                    <Input
                      type="time"
                      value={formData.quiet_hours_start}
                      onChange={(e) => handleChange("quiet_hours_start", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours End</label>
                    <Input
                      type="time"
                      value={formData.quiet_hours_end}
                      onChange={(e) => handleChange("quiet_hours_end", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 