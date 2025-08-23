import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  BarChart3,
  Archive,
  HardDrive
} from 'lucide-react'
import { useExportSettings } from '../hooks/useReports'
import { REPORT_FORMATS, BACKUP_FREQUENCIES } from '../types'

export interface ExportSettingsFormProps {
  className?: string
}

export const ExportSettingsForm: React.FC<ExportSettingsFormProps> = ({ className }) => {
  const { settings, loading, error, saving, saveSettings } = useExportSettings()
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const [formData, setFormData] = useState({
    default_format: 'pdf' as const,
    include_charts: true,
    include_summaries: true,
    compression_enabled: false,
    auto_backup: true,
    backup_frequency: 'weekly' as const,
    retention_days: 30,
    storage_limit_gb: 10
  })

  // Initialize form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        default_format: settings.default_format,
        include_charts: settings.include_charts,
        include_summaries: settings.include_summaries,
        compression_enabled: settings.compression_enabled,
        auto_backup: settings.auto_backup,
        backup_frequency: settings.backup_frequency,
        retention_days: settings.retention_days,
        storage_limit_gb: settings.storage_limit_gb
      })
    }
  }, [settings])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await saveSettings(formData)
      setSaveStatus({
        type: 'success',
        message: 'Export settings saved successfully'
      })
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000)
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to save export settings'
      })
    }
  }

  if (loading) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading export settings...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">Export Settings</CardTitle>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
          {/* Format Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Format Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default Export Format</label>
                <Select
                  value={formData.default_format}
                  onChange={(e) => handleChange('default_format', e.target.value)}
                >
                  {Object.entries(REPORT_FORMATS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Storage Limit</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.storage_limit_gb}
                    onChange={(e) => handleChange('storage_limit_gb', parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Content Options</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Include Charts & Graphs</p>
                    <p className="text-sm text-gray-600">Add visual charts to reports</p>
                  </div>
                </div>
                <Switch
                  checked={formData.include_charts}
                  onCheckedChange={(checked) => handleChange('include_charts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Include Summaries</p>
                    <p className="text-sm text-gray-600">Add executive summaries to reports</p>
                  </div>
                </div>
                <Switch
                  checked={formData.include_summaries}
                  onCheckedChange={(checked) => handleChange('include_summaries', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Enable Compression</p>
                    <p className="text-sm text-gray-600">Compress files to save storage space</p>
                  </div>
                </div>
                <Switch
                  checked={formData.compression_enabled}
                  onCheckedChange={(checked) => handleChange('compression_enabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Backup Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Auto Backup</p>
                    <p className="text-sm text-gray-600">Automatically backup reports</p>
                  </div>
                </div>
                <Switch
                  checked={formData.auto_backup}
                  onCheckedChange={(checked) => handleChange('auto_backup', checked)}
                />
              </div>
              
              {formData.auto_backup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Backup Frequency</label>
                    <Select
                      value={formData.backup_frequency}
                      onChange={(e) => handleChange('backup_frequency', e.target.value)}
                    >
                      {Object.entries(BACKUP_FREQUENCIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Retention Period (days)</label>
                    <Input
                      type="number"
                      value={formData.retention_days}
                      onChange={(e) => handleChange('retention_days', parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              )}
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

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 