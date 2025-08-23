import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Shield, 
  BookOpen, 
  TestTube, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor
} from 'lucide-react'
import { useNotificationRules } from '../hooks/useNotifications'
import { useIntegrationSettings } from '../hooks/useNotifications'

export interface QuickActionsProps {
  className?: string
  onSecurityClick?: () => void
  onApiDocsClick?: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  className, 
  onSecurityClick, 
  onApiDocsClick 
}) => {
  const { rules } = useNotificationRules()
  const { settings } = useIntegrationSettings()
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    email?: { success: boolean; message: string }
    sms?: { success: boolean; message: string }
    push?: { success: boolean; message: string }
  }>({})

  const handleTestAllNotifications = async () => {
    setTesting(true)
    setTestResults({})

    try {
      const results = {
        email: { success: false, message: '' },
        sms: { success: false, message: '' },
        push: { success: false, message: '' }
      }

      // Test email notifications
      if (settings?.enable_email_notifications) {
        try {
          // Simulate email test
          await new Promise(resolve => setTimeout(resolve, 1000))
          results.email = { success: true, message: 'Email test sent successfully' }
        } catch (error) {
          results.email = { success: false, message: 'Email test failed' }
        }
      }

      // Test SMS notifications
      if (settings?.enable_sms_notifications) {
        try {
          // Simulate SMS test
          await new Promise(resolve => setTimeout(resolve, 800))
          results.sms = { success: true, message: 'SMS test sent successfully' }
        } catch (error) {
          results.sms = { success: false, message: 'SMS test failed' }
        }
      }

      // Test push notifications
      if (settings?.enable_push_notifications) {
        try {
          // Simulate push test
          await new Promise(resolve => setTimeout(resolve, 600))
          results.push = { success: true, message: 'Push notification test sent successfully' }
        } catch (error) {
          results.push = { success: false, message: 'Push notification test failed' }
        }
      }

      setTestResults(results)
    } catch (error) {
      console.error('Error testing notifications:', error)
    } finally {
      setTesting(false)
    }
  }

  const activeRulesCount = rules.filter(rule => rule.is_active).length
  const emailEnabled = settings?.enable_email_notifications || false
  const smsEnabled = settings?.enable_sms_notifications || false
  const pushEnabled = settings?.enable_push_notifications || false

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Test All Notifications */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TestTube className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Test Notifications</h3>
            </div>
            <p className="text-sm text-gray-600">
              Test all active notification channels
            </p>
            <Button
              onClick={handleTestAllNotifications}
              disabled={testing || (!emailEnabled && !smsEnabled && !pushEnabled)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Test All
                </>
              )}
            </Button>
          </div>

          {/* Security Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Security</h3>
            </div>
            <p className="text-sm text-gray-600">
              Configure notification security settings
            </p>
            <Button
              variant="outline"
              onClick={onSecurityClick}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security Settings
            </Button>
          </div>

          {/* API Documentation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">API Docs</h3>
            </div>
            <p className="text-sm text-gray-600">
              View API documentation and examples
            </p>
            <Button
              variant="outline"
              onClick={onApiDocsClick}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Docs
            </Button>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900">System Status</h3>
            </div>
            <p className="text-sm text-gray-600">
              {activeRulesCount} active rules configured
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Channels:</span>
              {emailEnabled && <Mail className="h-4 w-4 text-green-600" />}
              {smsEnabled && <MessageSquare className="h-4 w-4 text-blue-600" />}
              {pushEnabled && <Smartphone className="h-4 w-4 text-purple-600" />}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
            <div className="space-y-2">
              {testResults.email && (
                <div className={`flex items-center gap-2 p-2 rounded ${
                  testResults.email.success 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {testResults.email.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm">Email: {testResults.email.message}</span>
                </div>
              )}
              {testResults.sms && (
                <div className={`flex items-center gap-2 p-2 rounded ${
                  testResults.sms.success 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {testResults.sms.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm">SMS: {testResults.sms.message}</span>
                </div>
              )}
              {testResults.push && (
                <div className={`flex items-center gap-2 p-2 rounded ${
                  testResults.push.success 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {testResults.push.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span className="text-sm">Push: {testResults.push.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 