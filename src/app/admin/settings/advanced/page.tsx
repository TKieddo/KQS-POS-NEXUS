'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Database, 
  Shield, 
  Zap, 
  Activity,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { SystemConfigTable, SystemConfig } from '@/features/advanced/components/SystemConfigTable'
import { AdvancedSettingsForm, AdvancedSettings } from '@/features/advanced/components/AdvancedSettingsForm'
import { SystemHealthMonitor, SystemMetric } from '@/features/advanced/components/SystemHealthMonitor'

const AdvancedSettingsPage = () => {
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([
    {
      id: '1',
      name: 'Database Connection Pool',
      value: '10',
      type: 'number',
      category: 'database',
      description: 'Number of database connections in pool'
    },
    {
      id: '2',
      name: 'Session Encryption',
      value: 'true',
      type: 'boolean',
      category: 'security',
      description: 'Enable session data encryption'
    },
    {
      id: '3',
      name: 'Cache Strategy',
      value: 'high',
      type: 'select',
      category: 'performance',
      description: 'Caching strategy for data access'
    },
    {
      id: '4',
      name: 'API Rate Limit',
      value: '1000',
      type: 'number',
      category: 'security',
      description: 'Maximum API requests per minute'
    },
    {
      id: '5',
      name: 'Auto Logout',
      value: 'true',
      type: 'boolean',
      category: 'security',
      description: 'Automatically logout inactive users'
    }
  ])

  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    debugMode: false,
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableAuditLog: true,
    dataRetentionDays: 90,
    enablePerformanceMonitoring: true,
    cacheEnabled: true,
    cacheExpiry: 60
  })

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: <Activity className="h-4 w-4 text-blue-600" />
    },
    {
      name: 'Memory Usage',
      value: 78,
      max: 100,
      unit: '%',
      status: 'warning',
      icon: <Activity className="h-4 w-4 text-yellow-600" />
    },
    {
      name: 'Disk Space',
      value: 35,
      max: 100,
      unit: '%',
      status: 'healthy',
      icon: <Activity className="h-4 w-4 text-green-600" />
    },
    {
      name: 'Database Connections',
      value: 8,
      max: 20,
      unit: '',
      status: 'healthy',
      icon: <Database className="h-4 w-4 text-blue-600" />
    },
    {
      name: 'Network Latency',
      value: 150,
      max: 200,
      unit: 'ms',
      status: 'healthy',
      icon: <Activity className="h-4 w-4 text-green-600" />
    },
    {
      name: 'Active Sessions',
      value: 25,
      max: 50,
      unit: '',
      status: 'healthy',
      icon: <Activity className="h-4 w-4 text-blue-600" />
    }
  ])

  const [lastUpdated, setLastUpdated] = useState('Just now')
  const [isSaving, setIsSaving] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated('Just now')
      // Update metrics randomly
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(metric.max, metric.value + (Math.random() - 0.5) * 10))
      })))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleAddConfig = (config: Omit<SystemConfig, 'id'>) => {
    const newConfig: SystemConfig = {
      ...config,
      id: Date.now().toString()
    }
    setSystemConfigs(prev => [...prev, newConfig])
  }

  const handleUpdateConfig = (id: string, updates: Partial<SystemConfig>) => {
    setSystemConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, ...updates } : config
    ))
  }

  const handleDeleteConfig = (id: string) => {
    setSystemConfigs(prev => prev.filter(config => config.id !== id))
  }

  const handleAdvancedSettingsChange = (settings: AdvancedSettings) => {
    setAdvancedSettings(settings)
  }

  const handleClearCache = () => {
    // Simulate cache clearing
    console.log('Clearing cache...')
  }

  const handleClearLogs = () => {
    // Simulate log clearing
    console.log('Clearing logs...')
  }

  const handleOptimizeDatabase = () => {
    // Simulate database optimization
    console.log('Optimizing database...')
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Settings</h1>
          <p className="text-muted-foreground">System configuration and monitoring</p>
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving}
          className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {/* System Health Monitor */}
      <SystemHealthMonitor 
        metrics={systemMetrics}
        lastUpdated={lastUpdated}
      />

      {/* Advanced Settings Form */}
      <AdvancedSettingsForm
        settings={advancedSettings}
        onChange={handleAdvancedSettingsChange}
        onClearCache={handleClearCache}
        onClearLogs={handleClearLogs}
        onOptimizeDatabase={handleOptimizeDatabase}
      />

      {/* System Configuration Table */}
      <SystemConfigTable
        configs={systemConfigs}
        onAddConfig={handleAddConfig}
        onUpdateConfig={handleUpdateConfig}
        onDeleteConfig={handleDeleteConfig}
      />

      {/* Quick Actions */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={handleClearCache}
              className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
            >
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Clear Cache</span>
              <span className="text-xs text-gray-500">Free up memory</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClearLogs}
              className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
            >
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <span className="font-medium">Clear Logs</span>
              <span className="text-xs text-gray-500">Remove old logs</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleOptimizeDatabase}
              className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
            >
              <Database className="h-6 w-6 text-green-600" />
              <span className="font-medium">Optimize DB</span>
              <span className="text-xs text-gray-500">Improve performance</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
            >
              <RefreshCw className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Restart System</span>
              <span className="text-xs text-gray-500">Apply all changes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">System Online</p>
                <p className="text-sm text-green-700">All services running</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Database Connected</p>
                <p className="text-sm text-blue-700">Supabase active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Security Active</p>
                <p className="text-sm text-yellow-700">All protections enabled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedSettingsPage 