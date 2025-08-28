'use client'

import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail,
  MessageSquare,
  Globe,
  Settings,
  Activity,
  Zap,
  Shield,
  TestTube,
  Loader2
} from 'lucide-react'
import { NotificationRulesTable } from '@/features/notifications/components/NotificationRulesTable'
import { IntegrationSettingsForm } from '@/features/notifications/components/IntegrationSettingsForm'
import { NotificationLogs } from '@/features/notifications/components/NotificationLogs'
import { QuickActions } from '@/features/notifications/components/QuickActions'
import { SecuritySettings } from '@/features/notifications/components/SecuritySettings'
import { APIDocumentation } from '@/features/notifications/components/APIDocumentation'
import { useNotificationRules } from '@/features/notifications/hooks/useNotifications'
import { useIntegrationSettings } from '@/features/notifications/hooks/useNotifications'

const NotificationsIntegrationsSettings = () => {
  const { rules, loading: rulesLoading } = useNotificationRules()
  const { settings, loading: settingsLoading } = useIntegrationSettings()
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showApiDocsModal, setShowApiDocsModal] = useState(false)

  const activeRulesCount = rules.filter(rule => rule.is_active).length
  const emailEnabled = settings?.enable_email_notifications || false
  const smsEnabled = settings?.enable_sms_notifications || false
  const webhooksEnabled = settings?.enable_webhooks || false

  return (
    <SettingsPageLayout
      title="Notifications & Integrations"
      description="Configure automated notifications and third-party integrations"
      icon={Bell}
      showSaveButton={false}
      showResetButton={false}
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Rules</p>
                <p className="text-2xl font-bold text-blue-900">
                  {rulesLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    activeRulesCount
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Bell className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Email Notifications</p>
                <p className="text-2xl font-bold text-green-900">
                  {settingsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    emailEnabled ? 'Enabled' : 'Disabled'
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Mail className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">SMS Notifications</p>
                <p className="text-2xl font-bold text-purple-900">
                  {settingsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    smsEnabled ? 'Enabled' : 'Disabled'
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Webhooks</p>
                <p className="text-2xl font-bold text-orange-900">
                  {settingsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    webhooksEnabled ? 'Active' : 'Inactive'
                  )}
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Globe className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Rules Section */}
      <div className="mb-8">
        <NotificationRulesTable />
      </div>

      {/* Integration Settings Section */}
      <div className="mb-8">
        <IntegrationSettingsForm />
      </div>

      {/* Quick Actions Section */}
      <QuickActions 
        onSecurityClick={() => setShowSecurityModal(true)}
        onApiDocsClick={() => setShowApiDocsModal(true)}
        className="mb-8"
      />

      {/* Recent Notifications Section */}
      <div className="mb-8">
        <NotificationLogs limit={5} />
      </div>

      {/* Help Section */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Learn how to set up notifications and integrations for your business
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
                  View Documentation
                </Button>
                <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <SecuritySettings />
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowSecurityModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Documentation Modal */}
      {showApiDocsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <APIDocumentation />
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowApiDocsModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SettingsPageLayout>
  )
}

export default NotificationsIntegrationsSettings 