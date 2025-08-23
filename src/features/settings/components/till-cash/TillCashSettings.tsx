import React from 'react'
import { Settings, CreditCard, Shield, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBranch } from '@/context/BranchContext'
import { useTillSettings } from '@/features/settings/hooks/useTillSettings'
import type { TillSettings } from '@/lib/till-settings-service'

export const TillCashSettings: React.FC = () => {
  const { selectedBranch } = useBranch()
  const { settings, loading, saving, error, updateSetting } = useTillSettings(selectedBranch?.id)

  const tillSettings = [
    {
      id: 'till_cash_management_enabled',
      title: 'Till Cash Management',
      description: 'Enable automated till cash tracking and management',
      icon: CreditCard
    },
    {
      id: 'auto_cash_drops_enabled',
      title: 'Auto Cash Drops',
      description: 'Automatically suggest cash drops when till exceeds limit',
      icon: Shield
    },
    {
      id: 'till_count_reminders_enabled',
      title: 'Till Count Reminders',
      description: 'Send reminders for regular till counts',
      icon: Clock
    },
    {
      id: 'variance_alerts_enabled',
      title: 'Variance Alerts',
      description: 'Alert when till variance exceeds threshold',
      icon: Shield
    }
  ]

  const tillLimits = [
    {
      id: 'max_till_amount',
      title: 'Maximum Till Amount',
      description: 'Maximum amount allowed in till before cash drop is required'
    },
    {
      id: 'min_till_amount',
      title: 'Minimum Till Amount',
      description: 'Minimum amount to keep in till for change'
    },
    {
      id: 'variance_threshold',
      title: 'Variance Threshold',
      description: 'Amount variance that triggers alerts'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Till Management Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Till Management</h3>
            <p className="text-sm text-gray-500">Configure till cash management settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {!settings && !loading && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">Please select a branch to configure till settings.</p>
            </div>
          )}
          {settings && tillSettings.map((setting) => {
            const Icon = setting.icon
            const settingKey = setting.id as keyof TillSettings
            const isEnabled = settings[settingKey] as boolean
            return (
              <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{setting.title}</div>
                    <div className="text-sm text-gray-500">{setting.description}</div>
                  </div>
                </div>
                <Button
                  variant={isEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting(settingKey, !isEnabled)}
                  disabled={loading || saving}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Till Limits */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Till Limits</h3>
            <p className="text-sm text-gray-500">Set cash limits and thresholds</p>
          </div>
        </div>

        <div className="space-y-4">
          {!settings && !loading && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">Please select a branch to configure till limits.</p>
            </div>
          )}
          {settings && tillLimits.map((setting) => {
            const settingKey = setting.id as keyof TillSettings
            const value = settings[settingKey] as number
            return (
            <div key={setting.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {setting.title}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                    value={typeof value === 'number' ? value : ''}
                    onChange={(e) => {
                      const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value)
                      if (!isNaN(newValue)) {
                        updateSetting(settingKey, newValue)
                      }
                    }}
                  disabled={loading || saving}
                />
              </div>
              <p className="text-sm text-gray-500">{setting.description}</p>
            </div>
            )
          })}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
} 