'use client'

import React, { useState, useEffect } from 'react'
import { Printer, Settings, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useQzTray } from '@/features/printers/hooks/useQzTray'
import { useBranch } from '@/context/BranchContext'
import { 
  getPrinterSettings, 
  savePrinterSettings, 
  setDefaultPrinter,
  type SimplePrinterSettings 
} from '@/lib/simple-printer-settings'

export const PrinterSettingsForm: React.FC = () => {
  const { selectedBranch } = useBranch()
  const { status: qzStatus, printers: qzPrinters, connect: connectQz, isConnecting: qzConnecting } = useQzTray()
  
  const [settings, setSettings] = useState<SimplePrinterSettings>({
    default_printer: '',
    qz_tray_enabled: true,
    auto_print_receipts: true
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    if (selectedBranch?.id) {
      loadSettings()
    }
  }, [selectedBranch?.id])

  const loadSettings = async () => {
    if (!selectedBranch?.id) return
    
    setIsLoading(true)
    try {
      const loadedSettings = await getPrinterSettings(selectedBranch.id)
      setSettings(loadedSettings)
      console.log('✅ Printer settings loaded:', loadedSettings)
    } catch (error) {
      console.error('Error loading printer settings:', error)
      toast.error('Failed to load printer settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedBranch?.id) {
      toast.error('No branch selected')
      return
    }

    setIsSaving(true)
    try {
      const success = await savePrinterSettings(selectedBranch.id, settings)
      if (success) {
        toast.success('Printer settings saved successfully!')
        console.log('✅ Printer settings saved:', settings)
      } else {
        toast.error('Failed to save printer settings')
      }
    } catch (error) {
      console.error('Error saving printer settings:', error)
      toast.error('Failed to save printer settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectQz = async () => {
    try {
      await connectQz()
      toast.success('Connected to QZ Tray successfully!')
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error)
      toast.error('Failed to connect to QZ Tray')
    }
  }

  const handleSetDefaultPrinter = async (printerName: string) => {
    if (!selectedBranch?.id) return
    
    try {
      const success = await setDefaultPrinter(selectedBranch.id, printerName)
      if (success) {
        setSettings(prev => ({ ...prev, default_printer: printerName }))
        toast.success(`Default printer set to: ${printerName}`)
      } else {
        toast.error('Failed to set default printer')
      }
    } catch (error) {
      console.error('Error setting default printer:', error)
      toast.error('Failed to set default printer')
    }
  }

  const getQzStatusColor = () => {
    switch (qzStatus) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getQzStatusIcon = () => {
    switch (qzStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'connecting': return <RefreshCw className="h-4 w-4 animate-spin text-yellow-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getQzStatusText = () => {
    switch (qzStatus) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Error'
      default: return 'Disconnected'
    }
  }

  return (
    <div className="space-y-6">
      {/* QZ Tray Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Printer className="h-5 w-5" />
            <span>QZ Tray Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status:</span>
            <div className="flex items-center space-x-2">
              {getQzStatusIcon()}
              <Badge className={getQzStatusColor()}>
                {getQzStatusText()}
              </Badge>
            </div>
          </div>

          {qzStatus === 'disconnected' && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleConnectQz}
                disabled={qzConnecting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {qzConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                {qzConnecting ? 'Connecting...' : 'Connect to QZ Tray'}
              </Button>
            </div>
          )}

          {qzStatus === 'connected' && (
            <div className="text-sm text-green-600">
              ✅ QZ Tray is connected and ready to print
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Printers */}
      {qzStatus === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Printers ({qzPrinters.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {qzPrinters.length === 0 ? (
              <p className="text-sm text-gray-600">
                No printers found. Make sure QZ Tray is running and printers are connected.
              </p>
            ) : (
              <div className="space-y-2">
                {qzPrinters
                  .filter(printer => printer && printer.trim() !== '') // Filter out empty or whitespace-only printer names
                  .map((printer, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-md transition-colors ${
                        settings.default_printer === printer
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Printer className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{printer}</span>
                          {settings.default_printer === printer && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        {settings.default_printer !== printer && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefaultPrinter(printer)}
                          >
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Printer Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Printer */}
          <div className="space-y-2">
            <Label htmlFor="default-printer">Default Printer</Label>
            <Select
              value={settings.default_printer || "none"}
              onValueChange={(value) => setSettings(prev => ({ ...prev, default_printer: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default printer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No default printer</SelectItem>
                {qzPrinters
                  .filter(printer => printer && printer.trim() !== '') // Filter out empty or whitespace-only printer names
                  .map((printer, index) => (
                    <SelectItem key={index} value={printer}>
                      {printer}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* QZ Tray Enabled */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable QZ Tray</Label>
              <p className="text-sm text-gray-500">
                Allow the system to use QZ Tray for thermal printing
              </p>
            </div>
            <Switch
              checked={settings.qz_tray_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, qz_tray_enabled: checked }))}
            />
          </div>

          {/* Auto Print Receipts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-print Receipts</Label>
              <p className="text-sm text-gray-500">
                Automatically print receipts after successful sales
              </p>
            </div>
            <Switch
              checked={settings.auto_print_receipts}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_print_receipts: checked }))}
            />
          </div>



          {/* Save Button */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
