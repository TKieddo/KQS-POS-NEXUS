import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { 
  Wrench, 
  Bug, 
  Database, 
  Shield, 
  Zap, 
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react"

export interface AdvancedSettings {
  debugMode: boolean
  maintenanceMode: boolean
  autoBackup: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
  logLevel: "error" | "warn" | "info" | "debug"
  sessionTimeout: number
  maxLoginAttempts: number
  enableAuditLog: boolean
  dataRetentionDays: number
  enablePerformanceMonitoring: boolean
  cacheEnabled: boolean
  cacheExpiry: number
}

export interface AdvancedSettingsFormProps {
  settings: AdvancedSettings
  onChange: (settings: AdvancedSettings) => void
  onClearCache: () => void
  onClearLogs: () => void
  onOptimizeDatabase: () => void
}

export const AdvancedSettingsForm = ({
  settings,
  onChange,
  onClearCache,
  onClearLogs,
  onOptimizeDatabase
}: AdvancedSettingsFormProps) => {
  const handleChange = (field: keyof AdvancedSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Advanced Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Debug & Maintenance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Debug & Maintenance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="debugMode"
                  checked={settings.debugMode}
                  onChange={(checked) => handleChange("debugMode", checked)}
                />
                <label htmlFor="debugMode" className="text-sm font-medium text-gray-700">
                  Debug Mode
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(checked) => handleChange("maintenanceMode", checked)}
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                <Select
                  value={settings.logLevel}
                  onChange={(e) => handleChange("logLevel", e.target.value)}
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-gray-900">Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
                  placeholder="5"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableAuditLog"
                  checked={settings.enableAuditLog}
                  onChange={(checked) => handleChange("enableAuditLog", checked)}
                />
                <label htmlFor="enableAuditLog" className="text-sm font-medium text-gray-700">
                  Enable Audit Log
                </label>
              </div>
            </div>
          </div>

          {/* Database & Backup */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Database & Backup</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onChange={(checked) => handleChange("autoBackup", checked)}
                />
                <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700">
                  Auto Backup
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <Select
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange("backupFrequency", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                <Input
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => handleChange("dataRetentionDays", parseInt(e.target.value))}
                  placeholder="90"
                />
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-gray-900">Performance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enablePerformanceMonitoring"
                  checked={settings.enablePerformanceMonitoring}
                  onChange={(checked) => handleChange("enablePerformanceMonitoring", checked)}
                />
                <label htmlFor="enablePerformanceMonitoring" className="text-sm font-medium text-gray-700">
                  Performance Monitoring
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cacheEnabled"
                  checked={settings.cacheEnabled}
                  onChange={(checked) => handleChange("cacheEnabled", checked)}
                />
                <label htmlFor="cacheEnabled" className="text-sm font-medium text-gray-700">
                  Enable Caching
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cache Expiry (minutes)</label>
                <Input
                  type="number"
                  value={settings.cacheExpiry}
                  onChange={(e) => handleChange("cacheExpiry", parseInt(e.target.value))}
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* System Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">System Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={onClearCache}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              <Button 
                variant="outline" 
                onClick={onClearLogs}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
              <Button 
                variant="outline" 
                onClick={onOptimizeDatabase}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <Database className="h-4 w-4 mr-2" />
                Optimize Database
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 